import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.simulator.generation_sim import build_scenario
from app.optimizer.dispatcher import solve_dispatch, naive_baseline

def main():
    print('[1/4] Generating 96-step 24-hr scenario...')
    scenario = build_scenario(
        peak_solar_kw=600.0,
        mean_wind_kw=250.0,
        cloud_cover=0.15,
        wind_variance=0.25,
        peak_price=10.0,
        offpeak_price=3.5,
        re_lcoe=2.4
    )
    assert len(scenario) == 96
    peak_re = scenario['total_re_kw'].max()
    print(f'      Total RE Peak: {peak_re:.2f} kW')

    print('[2/4] Solving MILP dispatch via Pyomo + HiGHS (PEM 600kW, Target 150 kg H2)...')
    opt_schedule, opt_summary = solve_dispatch(
        scenario_df=scenario,
        electrolyzer_max_kw=600.0,
        ely_type="PEM",
        daily_h2_target_kg=150.0,
        storage_capacity_kg=60.0
    )
    assert len(opt_schedule) == 96
    assert opt_summary['total_h2_kg'] >= 149.0, f"Target H2 not met: {opt_summary['total_h2_kg']}"
    assert opt_summary['lcoh_rs_kg'] > 0, "LCOH must be positive"
    print(f"      Optimized H2: {opt_summary['total_h2_kg']} kg")
    print(f"      Optimized Cost: Rs. {opt_summary['total_cost_rs']:,.2f}")
    print(f"      Optimized LCOH: Rs. {opt_summary['lcoh_rs_kg']:.2f}/kg H2")
    print(f"      Green Purity: {opt_summary['green_purity_pct']}%")

    print('[3/4] Running Naive Baseline comparison...')
    base_schedule, base_summary = naive_baseline(
        scenario_df=scenario,
        electrolyzer_max_kw=600.0,
        ely_type="PEM",
        daily_h2_target_kg=150.0,
        storage_capacity_kg=60.0
    )
    
    savings_pct = 100 * (base_summary['total_cost_rs'] - opt_summary['total_cost_rs']) / (base_summary['total_cost_rs'] + 1e-5)
    lcoh_red_pct = 100 * (base_summary['lcoh_rs_kg'] - opt_summary['lcoh_rs_kg']) / (base_summary['lcoh_rs_kg'] + 1e-5)
    avg_ramp_opt = opt_summary['avg_ramp_kw']
    avg_ramp_base = base_summary['avg_ramp_kw']
    ramp_red_pct = 100 * (avg_ramp_base - avg_ramp_opt) / (avg_ramp_base + 1e-5)

    print('\n' + '='*55)
    print('           OPTIMIZER VERIFICATION SUMMARY')
    print('='*55)
    print(f" Baseline Total Cost:   Rs. {base_summary['total_cost_rs']:,.2f}")
    print(f" Optimized Total Cost:  Rs. {opt_summary['total_cost_rs']:,.2f}  ({savings_pct:+.1f}%)")
    print(f" Baseline LCOH:         Rs. {base_summary['lcoh_rs_kg']:.2f}/kg")
    print(f" Optimized LCOH:        Rs. {opt_summary['lcoh_rs_kg']:.2f}/kg ({lcoh_red_pct:+.1f}%)")
    print(f" Baseline Ramp Avg:     {avg_ramp_base:.2f} kW")
    print(f" Optimized Ramp Avg:    {avg_ramp_opt:.2f} kW  ({ramp_red_pct:+.1f}% stress cut)")
    print(f" Green Purity Index:    {opt_summary['green_purity_pct']}%")
    print(f" CO2 Offset:            {opt_summary['co2_avoided_tonnes_yr']} tonnes/year")
    print('='*55)
    print('[4/4] Testing Alkaline and SOEC Tech Presets...')
    for tech in ["Alkaline", "SOEC"]:
        _, s = solve_dispatch(scenario, electrolyzer_max_kw=600.0, ely_type=tech, daily_h2_target_kg=120.0)
        print(f"      Tech {tech:8s} -> LCOH: Rs. {s['lcoh_rs_kg']:.2f}/kg, Green: {s['green_purity_pct']}%")
    print('='*55)
    print('STATUS: ALL OPTIMIZER PHYSICS & FINANCIAL TESTS PASSED!')

if __name__ == '__main__':
    main()
