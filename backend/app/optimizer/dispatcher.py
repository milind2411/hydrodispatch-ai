import pyomo.environ as pyo
import numpy as np
import pandas as pd

TECH_PRESETS = {
    "PEM": {
        "min_turndown": 0.10,
        "max_ramp_pct": 0.25,
        "kwh_per_kg_h2": 52.0,
        "capex_per_kg": 90.0,
        "ramp_wear_penalty": 0.80,
    },
    "Alkaline": {
        "min_turndown": 0.25,
        "max_ramp_pct": 0.10,
        "kwh_per_kg_h2": 56.0,
        "capex_per_kg": 65.0,
        "ramp_wear_penalty": 1.40,
    },
    "SOEC": {
        "min_turndown": 0.40,
        "max_ramp_pct": 0.05,
        "kwh_per_kg_h2": 42.0,
        "capex_per_kg": 120.0,
        "ramp_wear_penalty": 2.50,
    }
}

def get_tech_params(ely_type: str = "PEM", electrolyzer_max_kw: float = 600.0):
    preset = TECH_PRESETS.get(ely_type, TECH_PRESETS["PEM"])
    return {
        "min_turndown": preset["min_turndown"],
        "max_ramp_kw": preset["max_ramp_pct"] * electrolyzer_max_kw,
        "kwh_per_kg_h2": preset["kwh_per_kg_h2"],
        "capex_per_kg": preset["capex_per_kg"],
        "ramp_wear_penalty": preset["ramp_wear_penalty"],
    }

def solve_dispatch(
    scenario_df: pd.DataFrame,
    electrolyzer_max_kw: float = 600.0,
    ely_type: str = "PEM",
    daily_h2_target_kg: float | None = None,
    storage_capacity_kg: float = 50.0,
    custom_params: dict | None = None,
):
    """
    Solves a physics-informed Mixed-Integer Linear Programming (MILP) dispatch problem
    to minimize Total Levelized Cost of Hydrogen (LCOH), grid import during peak TOU tariffs,
    and electrolyzer ramping degradation while meeting daily H2 quota.
    """
    params = get_tech_params(ely_type, electrolyzer_max_kw)
    if custom_params:
        params.update(custom_params)

    min_turndown = params["min_turndown"]
    max_ramp_kw = params["max_ramp_kw"]
    kwh_per_kg_h2 = params["kwh_per_kg_h2"]
    capex_per_kg = params["capex_per_kg"]
    ramp_wear_penalty = params["ramp_wear_penalty"]

    T = len(scenario_df)
    dt = 0.25  # 15 minutes = 0.25 hours

    # Default daily H2 target if not specified: ~55% plant capacity factor
    if daily_h2_target_kg is None or daily_h2_target_kg <= 0:
        daily_h2_target_kg = (electrolyzer_max_kw * 24 * 0.55) / kwh_per_kg_h2

    model = pyo.ConcreteModel(name="HydroDispatch_MILP")
    model.T = pyo.Set(initialize=range(T))

    # Decision variables
    model.p_ely = pyo.Var(model.T, bounds=(0, electrolyzer_max_kw))
    model.p_re_used = pyo.Var(model.T, within=pyo.NonNegativeReals)
    model.p_curtail = pyo.Var(model.T, within=pyo.NonNegativeReals)
    model.p_grid = pyo.Var(model.T, within=pyo.NonNegativeReals)
    model.u_on = pyo.Var(model.T, within=pyo.Binary)
    model.ramp = pyo.Var(model.T, within=pyo.NonNegativeReals)
    model.soc_tank = pyo.Var(model.T, bounds=(0, max(10.0, storage_capacity_kg)))
    model.s_deficit = pyo.Var(within=pyo.NonNegativeReals)  # Elastic slack for feasibility

    # 1. Minimum Turndown & Maximum Operating Limits
    def min_load_rule(m, t):
        return m.p_ely[t] >= m.u_on[t] * (min_turndown * electrolyzer_max_kw)
    model.min_load_con = pyo.Constraint(model.T, rule=min_load_rule)

    def max_load_rule(m, t):
        return m.p_ely[t] <= m.u_on[t] * electrolyzer_max_kw
    model.max_load_con = pyo.Constraint(model.T, rule=max_load_rule)

    # 2. Power Balance & RE Allocation
    def power_balance_rule(m, t):
        return m.p_ely[t] == m.p_re_used[t] + m.p_grid[t]
    model.power_balance_con = pyo.Constraint(model.T, rule=power_balance_rule)

    def re_avail_rule(m, t):
        re_avail = float(scenario_df.loc[t, "total_re_kw"])
        return m.p_re_used[t] + m.p_curtail[t] == re_avail
    model.re_avail_con = pyo.Constraint(model.T, rule=re_avail_rule)

    # 3. Ramping Physics Constraints
    def ramp_up_rule(m, t):
        if t == 0:
            return pyo.Constraint.Skip
        return m.p_ely[t] - m.p_ely[t-1] <= m.ramp[t]
    model.ramp_up_con = pyo.Constraint(model.T, rule=ramp_up_rule)

    def ramp_down_rule(m, t):
        if t == 0:
            return pyo.Constraint.Skip
        return m.p_ely[t-1] - m.p_ely[t] <= m.ramp[t]
    model.ramp_down_con = pyo.Constraint(model.T, rule=ramp_down_rule)

    def ramp_limit_rule(m, t):
        return m.ramp[t] <= max_ramp_kw
    model.ramp_limit_con = pyo.Constraint(model.T, rule=ramp_limit_rule)

    # 4. Daily Hydrogen Target Constraint
    def target_h2_rule(m):
        total_prod = sum(m.p_ely[t] * dt / kwh_per_kg_h2 for t in m.T)
        return total_prod + m.s_deficit >= daily_h2_target_kg
    model.target_h2_con = pyo.Constraint(rule=target_h2_rule)

    # 5. H2 Storage Tank Dynamic Mass Balance
    offtake_per_step = daily_h2_target_kg / T
    initial_soc = storage_capacity_kg * 0.3

    def storage_rule(m, t):
        h2_step = m.p_ely[t] * dt / kwh_per_kg_h2
        if t == 0:
            return m.soc_tank[t] == initial_soc + h2_step - offtake_per_step
        return m.soc_tank[t] == m.soc_tank[t-1] + h2_step - offtake_per_step
    model.storage_con = pyo.Constraint(model.T, rule=storage_rule)

    def storage_end_rule(m):
        return m.soc_tank[T-1] >= initial_soc * 0.8
    model.storage_end_con = pyo.Constraint(rule=storage_end_rule)

    # 6. Objective Function: Minimize Grid Energy Cost + RE Cost + Ramp Degradation + Curtailment
    def objective_rule(m):
        cost_grid = sum(m.p_grid[t] * dt * float(scenario_df.loc[t, "tariff_rs_kwh"]) for t in m.T)
        cost_re = sum(m.p_re_used[t] * dt * float(scenario_df.loc[t, "re_lcoe_rs_kwh"]) for t in m.T)
        cost_ramp = sum(m.ramp[t] * ramp_wear_penalty for t in m.T)
        cost_curtail = sum(m.p_curtail[t] * 0.05 for t in m.T)
        penalty_deficit = m.s_deficit * 2000.0  # heavy penalty if quota missed
        return cost_grid + cost_re + cost_ramp + cost_curtail + penalty_deficit
    model.obj = pyo.Objective(rule=objective_rule, sense=pyo.minimize)

    # Solve with HiGHS
    solver = pyo.SolverFactory("appsi_highs")
    solver.solve(model, tee=False)

    # Extract Results
    p_ely_opt = np.array([pyo.value(model.p_ely[t]) for t in model.T])
    p_grid_opt = np.array([pyo.value(model.p_grid[t]) for t in model.T])
    p_re_opt = np.array([pyo.value(model.p_re_used[t]) for t in model.T])
    p_curtail_opt = np.array([pyo.value(model.p_curtail[t]) for t in model.T])
    ramp_opt = np.array([pyo.value(model.ramp[t]) for t in model.T])
    soc_opt = np.array([pyo.value(model.soc_tank[t]) for t in model.T])

    h2_produced_kg = p_ely_opt * dt / kwh_per_kg_h2
    total_h2_kg = float(np.sum(h2_produced_kg))

    # Financial & Carbon Calculations
    grid_cost_rs = float(np.sum(p_grid_opt * dt * scenario_df["tariff_rs_kwh"].to_numpy()))
    re_cost_rs = float(np.sum(p_re_opt * dt * scenario_df["re_lcoe_rs_kwh"].to_numpy()))
    ramp_cost_rs = float(np.sum(ramp_opt * ramp_wear_penalty))
    water_om_cost_rs = total_h2_kg * 2.50  # Rs 2.50/kg for demineralized water + consumables
    capex_rs = total_h2_kg * capex_per_kg
    total_cost_rs = capex_rs + grid_cost_rs + re_cost_rs + water_om_cost_rs + ramp_cost_rs

    lcoh_opt = (total_cost_rs / total_h2_kg) if total_h2_kg > 0 else 0.0

    # LCOH Waterfall Breakdown (Rs/kg)
    lcoh_breakdown = {
        "capex_rs_kg": round(capex_per_kg, 2),
        "re_electricity_rs_kg": round(re_cost_rs / total_h2_kg, 2) if total_h2_kg > 0 else 0,
        "grid_electricity_rs_kg": round(grid_cost_rs / total_h2_kg, 2) if total_h2_kg > 0 else 0,
        "water_om_rs_kg": round(water_om_cost_rs / total_h2_kg, 2) if total_h2_kg > 0 else 0,
        "degradation_rs_kg": round(ramp_cost_rs / total_h2_kg, 2) if total_h2_kg > 0 else 0,
        "total_lcoh_rs_kg": round(lcoh_opt, 2),
    }

    # Green Purity & Sustainability Metrics
    total_ely_kwh = np.sum(p_ely_opt * dt)
    total_re_used_kwh = np.sum(p_re_opt * dt)
    green_purity_pct = 100.0 * total_re_used_kwh / (total_ely_kwh + 1e-6)
    
    grid_emissions_kg = np.sum(p_grid_opt * dt) * 0.70  # ~0.70 kg CO2/kWh from Indian grid
    co2_avoided_kg = max(0.0, (total_h2_kg * 10.0) - grid_emissions_kg)
    co2_avoided_tonnes_yr = (co2_avoided_kg * 365.0) / 1000.0

    opt_df = pd.DataFrame({
        "timestamp": scenario_df["timestamp"],
        "interval": scenario_df["interval"],
        "ely_power_kw": np.round(p_ely_opt, 2),
        "re_used_kw": np.round(p_re_opt, 2),
        "grid_power_kw": np.round(p_grid_opt, 2),
        "curtail_kw": np.round(p_curtail_opt, 2),
        "ramp_kw": np.round(ramp_opt, 2),
        "h2_kg": np.round(h2_produced_kg, 3),
        "storage_soc_kg": np.round(soc_opt, 2),
        "storage_soc_pct": np.round(100.0 * soc_opt / max(1.0, storage_capacity_kg), 1),
        "offtake_flow_kg": np.round(np.full(T, offtake_per_step), 3),
    })

    summary = {
        "total_h2_kg": round(total_h2_kg, 2),
        "total_cost_rs": round(total_cost_rs, 2),
        "grid_cost_rs": round(grid_cost_rs, 2),
        "re_cost_rs": round(re_cost_rs, 2),
        "lcoh_rs_kg": round(lcoh_opt, 2),
        "lcoh_breakdown": lcoh_breakdown,
        "green_purity_pct": round(green_purity_pct, 1),
        "co2_avoided_tonnes_yr": round(co2_avoided_tonnes_yr, 1),
        "avg_ramp_kw": round(float(np.mean(ramp_opt)), 2),
    }

    return opt_df, summary

def naive_baseline(
    scenario_df: pd.DataFrame,
    electrolyzer_max_kw: float = 600.0,
    ely_type: str = "PEM",
    daily_h2_target_kg: float | None = None,
    storage_capacity_kg: float = 50.0,
):
    """
    Simulates standard uncoordinated dispatch heuristic:
    - Electrolyzer directly follows available renewable power without foresight.
    - If RE < min turndown, imports emergency grid power (even during expensive peak hours).
    - Unbuffered ramping creates heavy membrane degradation.
    """
    params = get_tech_params(ely_type, electrolyzer_max_kw)
    min_turndown = params["min_turndown"]
    kwh_per_kg_h2 = params["kwh_per_kg_h2"]
    capex_per_kg = params["capex_per_kg"]
    ramp_wear_penalty = params["ramp_wear_penalty"]

    T = len(scenario_df)
    dt = 0.25
    min_kw = min_turndown * electrolyzer_max_kw

    re_avail = scenario_df["total_re_kw"].to_numpy()
    ely_power = np.clip(re_avail, 0, electrolyzer_max_kw)

    # If power drops below turndown threshold, baseline pulls grid power
    grid_draw = np.zeros(T)
    for t in range(T):
        if ely_power[t] > 0 and ely_power[t] < min_kw:
            grid_draw[t] = min_kw - ely_power[t]
            ely_power[t] = min_kw
        elif ely_power[t] == 0 and re_avail[t] > 10.0:
            grid_draw[t] = min_kw
            ely_power[t] = min_kw

    ramp = np.zeros(T)
    ramp[1:] = np.abs(np.diff(ely_power))

    h2_produced_kg = ely_power * dt / kwh_per_kg_h2
    total_h2_kg = float(np.sum(h2_produced_kg))

    # Cost calculations
    re_used = np.minimum(re_avail, ely_power)
    curtail = np.maximum(0, re_avail - ely_power)

    grid_cost_rs = float(np.sum(grid_draw * dt * scenario_df["tariff_rs_kwh"].to_numpy()))
    re_cost_rs = float(np.sum(re_used * dt * scenario_df["re_lcoe_rs_kwh"].to_numpy()))
    # Baseline suffers higher degradation factor due to unconstrained cycling
    ramp_cost_rs = float(np.sum(ramp * ramp_wear_penalty * 1.5))
    water_om_cost_rs = total_h2_kg * 2.50
    capex_rs = total_h2_kg * capex_per_kg
    total_cost_rs = capex_rs + grid_cost_rs + re_cost_rs + water_om_cost_rs + ramp_cost_rs

    lcoh_base = (total_cost_rs / total_h2_kg) if total_h2_kg > 0 else 0.0

    lcoh_breakdown = {
        "capex_rs_kg": round(capex_per_kg, 2),
        "re_electricity_rs_kg": round(re_cost_rs / total_h2_kg, 2) if total_h2_kg > 0 else 0,
        "grid_electricity_rs_kg": round(grid_cost_rs / total_h2_kg, 2) if total_h2_kg > 0 else 0,
        "water_om_rs_kg": round(water_om_cost_rs / total_h2_kg, 2) if total_h2_kg > 0 else 0,
        "degradation_rs_kg": round(ramp_cost_rs / total_h2_kg, 2) if total_h2_kg > 0 else 0,
        "total_lcoh_rs_kg": round(lcoh_base, 2),
    }

    total_ely_kwh = np.sum(ely_power * dt)
    total_re_used_kwh = np.sum(re_used * dt)
    green_purity_pct = 100.0 * total_re_used_kwh / (total_ely_kwh + 1e-6)

    grid_emissions_kg = np.sum(grid_draw * dt) * 0.70
    co2_avoided_kg = max(0.0, (total_h2_kg * 10.0) - grid_emissions_kg)
    co2_avoided_tonnes_yr = (co2_avoided_kg * 365.0) / 1000.0

    # Simulate storage for baseline with steady offtake
    offtake_per_step = (total_h2_kg / T) if total_h2_kg > 0 else 0
    soc_tank = np.zeros(T)
    current_soc = storage_capacity_kg * 0.3
    for t in range(T):
        current_soc = np.clip(current_soc + h2_produced_kg[t] - offtake_per_step, 0, storage_capacity_kg)
        soc_tank[t] = current_soc

    base_df = pd.DataFrame({
        "timestamp": scenario_df["timestamp"],
        "interval": scenario_df["interval"],
        "ely_power_kw": np.round(ely_power, 2),
        "re_used_kw": np.round(re_used, 2),
        "grid_power_kw": np.round(grid_draw, 2),
        "curtail_kw": np.round(curtail, 2),
        "ramp_kw": np.round(ramp, 2),
        "h2_kg": np.round(h2_produced_kg, 3),
        "storage_soc_kg": np.round(soc_tank, 2),
        "storage_soc_pct": np.round(100.0 * soc_tank / max(1.0, storage_capacity_kg), 1),
        "offtake_flow_kg": np.round(np.full(T, offtake_per_step), 3),
    })

    summary = {
        "total_h2_kg": round(total_h2_kg, 2),
        "total_cost_rs": round(total_cost_rs, 2),
        "grid_cost_rs": round(grid_cost_rs, 2),
        "re_cost_rs": round(re_cost_rs, 2),
        "lcoh_rs_kg": round(lcoh_base, 2),
        "lcoh_breakdown": lcoh_breakdown,
        "green_purity_pct": round(green_purity_pct, 1),
        "co2_avoided_tonnes_yr": round(co2_avoided_tonnes_yr, 1),
        "avg_ramp_kw": round(float(np.mean(ramp)), 2),
    }

    return base_df, summary
