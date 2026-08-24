import time
import numpy as np
import pandas as pd
from app.simulator.generation_sim import build_scenario
from app.optimizer.dispatcher import solve_dispatch, naive_baseline

def benchmark():
    print("=======================================================")
    print(" HYDRODISPATCH AI - MILP SOLVER PERFORMANCE BENCHMARK ")
    print("=======================================================")
    
    # 1. Generate 96-interval horizon scenario (24 hours @ 15 min steps)
    scenario_df = build_scenario(
        peak_solar_kw=500.0,
        mean_wind_kw=200.0,
        cloud_cover=0.2,
        wind_variance=0.3,
        peak_price=9.5,
        offpeak_price=3.2,
        re_lcoe=2.4
    )
    print(f"[*] Scenario Horizon: {len(scenario_df)} intervals (24 Hours @ 15-min resolution)")

    # 2. Warm-up solve
    print("[*] Warming up APPSI HiGHS solver engine...")
    _ = solve_dispatch(
        scenario_df=scenario_df,
        electrolyzer_max_kw=600.0,
        ely_type="PEM",
        daily_h2_target_kg=140.0,
        storage_capacity_kg=60.0,
        bess_capacity_kwh=100.0,
        bess_power_kw=50.0,
        o2_price_rs_kg=8.0,
    )

    # 3. Benchmark multiple runs
    N_RUNS = 10
    latencies = []
    print(f"[*] Executing {N_RUNS} benchmark runs...")

    for i in range(N_RUNS):
        t0 = time.perf_counter()
        opt_df, summary = solve_dispatch(
            scenario_df=scenario_df,
            electrolyzer_max_kw=600.0,
            ely_type="PEM",
            daily_h2_target_kg=140.0,
            storage_capacity_kg=60.0,
            bess_capacity_kwh=100.0,
            bess_power_kw=50.0,
            o2_price_rs_kg=8.0,
        )
        t_elapsed_ms = (time.perf_counter() - t0) * 1000.0
        latencies.append(t_elapsed_ms)
        print(f"    Run {i+1:02d}: {t_elapsed_ms:.2f} ms | LCOH: Rs. {summary['lcoh_rs_kg']}/kg | H2: {summary['total_h2_kg']} kg")

    mean_latency = np.mean(latencies)
    median_latency = np.median(latencies)
    p95_latency = np.percentile(latencies, 95)
    min_latency = np.min(latencies)

    print("\n=======================================================")
    print("                BENCHMARK RESULTS                      ")
    print("=======================================================")
    print(f"  Min Execution Time:    {min_latency:.2f} ms")
    print(f"  Mean Execution Time:   {mean_latency:.2f} ms")
    print(f"  Median Execution Time: {median_latency:.2f} ms")
    print(f"  P95 Execution Time:    {p95_latency:.2f} ms")
    print("=======================================================")

    if median_latency < 200.0:
        print(f"[PASS] SUB-SECOND TARGET ACHIEVED (< 200ms): {median_latency:.2f} ms")
    else:
        print(f"[NOTE] Execution Time: {median_latency:.2f} ms")

if __name__ == "__main__":
    benchmark()
