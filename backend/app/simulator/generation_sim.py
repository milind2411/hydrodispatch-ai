import numpy as np
import pandas as pd

def build_scenario(
    peak_solar_kw: float = 500.0,
    mean_wind_kw: float = 200.0,
    cloud_cover: float = 0.2,
    wind_variance: float = 0.3,
    peak_price: float = 9.5,
    offpeak_price: float = 3.2,
    re_lcoe: float = 2.4,
    steps: int = 96,
    seed: int | None = 42
) -> pd.DataFrame:
    """
    Simulates 24-hour horizon (96 x 15-minute intervals) for:
    - Solar PV generation with diurnal curve and stochastic cloud cover
    - Wind turbine power with continuous variations
    - Time-of-Use (TOU) Grid Electricity Tariffs (Morning/Evening Peaks vs Solar/Night Off-Peak)
    """
    if seed is not None:
        np.random.seed(seed)

    time_index = pd.date_range("2026-01-01 00:00", periods=steps, freq="15min")
    hours = np.linspace(0, 24, steps, endpoint=False)

    # 1. Solar Profile: Bell curve between 06:00 and 18:00
    solar_base = np.maximum(0, np.sin((hours - 6) * np.pi / 12))
    solar_base = np.where((hours >= 6) & (hours <= 18), solar_base, 0.0)
    
    # Stochastic cloud cover dips (especially in mid-day)
    cloud_dip = 1.0 - (cloud_cover * np.random.uniform(0.3, 1.0, steps))
    solar_kw = peak_solar_kw * (solar_base ** 1.4) * np.clip(cloud_dip, 0.05, 1.0)
    solar_kw = np.where(solar_base <= 0, 0.0, solar_kw)

    # 2. Wind Profile: Base generation with gusts and fluctuations
    # Diurnal wind tendency (often higher in evening/night)
    diurnal_wind = 1.0 + 0.25 * np.cos((hours - 20) * np.pi / 12)
    wind_noise = np.random.normal(0, wind_variance, steps)
    wind_kw = np.clip(mean_wind_kw * diurnal_wind * (1.0 + wind_noise), 0.0, mean_wind_kw * 2.8)

    # 3. Grid TOU Tariff Structure (Rs/kWh)
    # Morning Peak (06:00 - 09:30), Evening Peak (18:00 - 22:00)
    tariffs = np.full(steps, offpeak_price)
    morning_peak = (hours >= 6.0) & (hours < 9.5)
    evening_peak = (hours >= 18.0) & (hours < 22.0)
    solar_sponge = (hours >= 11.0) & (hours < 15.0) & (cloud_cover < 0.3)
    
    tariffs[morning_peak] = peak_price * 0.9
    tariffs[evening_peak] = peak_price
    # During high solar availability, grid may offer discounted green corridor tariff
    tariffs[solar_sponge] = np.maximum(2.0, offpeak_price * 0.85)

    tariff_tier = np.full(steps, "Off-Peak", dtype=object)
    tariff_tier[morning_peak] = "Morning Peak"
    tariff_tier[evening_peak] = "Evening Peak"
    tariff_tier[solar_sponge] = "Solar Corridor"

    total_re = solar_kw + wind_kw

    return pd.DataFrame({
        "timestamp": time_index.strftime("%H:%M"),
        "interval": np.arange(steps),
        "hour": np.round(hours, 2),
        "solar_kw": np.round(solar_kw, 2),
        "wind_kw": np.round(wind_kw, 2),
        "total_re_kw": np.round(total_re, 2),
        "tariff_rs_kwh": np.round(tariffs, 2),
        "re_lcoe_rs_kwh": np.full(steps, re_lcoe),
        "tariff_tier": tariff_tier,
    })
