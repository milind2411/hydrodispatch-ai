import sys, os
sys.path.insert(0, os.path.join(os.getcwd(), "backend"))
import traceback
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app, raise_server_exceptions=False)

payload = {
    "peak_solar_kw": 500.0,
    "mean_wind_kw": 200.0,
    "cloud_cover": 0.2,
    "wind_variance": 0.3,
    "peak_price": 9.5,
    "offpeak_price": 3.2,
    "re_lcoe": 2.4,
    "ely_type": "PEM",
    "ely_capacity_kw": 600.0,
    "daily_h2_target_kg": 140.0,
    "storage_capacity_kg": 60.0,
    "bess_capacity_kwh": 0.0,
    "bess_power_kw": 0.0,
    "o2_price_rs_kg": 0.0
}

try:
    resp = client.post("/dispatch/run", json=payload)
    print("Status:", resp.status_code)
    if resp.status_code != 200:
        print("Response content:", resp.text)
except Exception as e:
    traceback.print_exc()
