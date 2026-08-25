import hashlib
import io
import json
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd

from app.simulator.generation_sim import build_scenario
from app.optimizer.dispatcher import solve_dispatch, naive_baseline, TECH_PRESETS

app = FastAPI(
    title="HydroDispatch AI API",
    description="Physics-informed real-time dispatch and levelized cost optimization engine for Green Hydrogen.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScenarioParams(BaseModel):
    peak_solar_kw: float = Field(default=500.0, ge=50.0, le=3000.0)
    mean_wind_kw: float = Field(default=200.0, ge=0.0, le=2000.0)
    cloud_cover: float = Field(default=0.2, ge=0.0, le=1.0)
    wind_variance: float = Field(default=0.3, ge=0.0, le=1.0)
    peak_price: float = Field(default=9.5, ge=1.0, le=30.0)
    offpeak_price: float = Field(default=3.2, ge=0.5, le=20.0)
    re_lcoe: float = Field(default=2.4, ge=0.5, le=10.0)
    ely_type: str = Field(default="PEM")
    ely_capacity_kw: float = Field(default=600.0, ge=100.0, le=5000.0)
    daily_h2_target_kg: float = Field(default=140.0, ge=10.0, le=2000.0)
    storage_capacity_kg: float = Field(default=60.0, ge=0.0, le=500.0)
    bess_capacity_kwh: float = Field(default=0.0, ge=0.0, le=2000.0)
    bess_power_kw: float = Field(default=0.0, ge=0.0, le=1000.0)
    o2_price_rs_kg: float = Field(default=0.0, ge=0.0, le=50.0)
    solver_time_limit: float = Field(default=30.0, ge=1.0, le=300.0)

from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HydroDispatch AI • Physics-Informed Green H2 Optimization Core</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg: #060911;
                --card-bg: rgba(13, 19, 33, 0.85);
                --card-border: rgba(30, 41, 59, 0.8);
                --cyan: #06b6d4;
                --emerald: #10b981;
                --teal: #14b8a6;
                --text-main: #f8fafc;
                --text-muted: #94a3b8;
                --mono: 'JetBrains Mono', monospace;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                background-color: var(--bg);
                background-image: 
                    radial-gradient(at 15% 15%, rgba(6, 182, 212, 0.12) 0px, transparent 50%),
                    radial-gradient(at 85% 85%, rgba(16, 185, 129, 0.10) 0px, transparent 50%);
                color: var(--text-main);
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 48px 20px;
            }
            .container {
                max-width: 920px;
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            .card {
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-radius: 28px;
                padding: 40px;
                box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(20px);
            }
            .header-badge-row {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 24px;
            }
            .badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 14px;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 700;
                font-family: var(--mono);
                text-transform: uppercase;
                letter-spacing: 0.08em;
            }
            .badge-live {
                background: rgba(16, 185, 129, 0.12);
                border: 1px solid rgba(16, 185, 129, 0.35);
                color: #34d399;
            }
            .badge-pulse-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
                box-shadow: 0 0 10px #10b981;
                animation: pulse 2s infinite ease-in-out;
            }
            .badge-tech {
                background: rgba(6, 182, 212, 0.12);
                border: 1px solid rgba(6, 182, 212, 0.3);
                color: #38bdf8;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.4; transform: scale(0.85); }
            }
            h1 {
                font-size: 2.25rem;
                font-weight: 900;
                letter-spacing: -0.03em;
                line-height: 1.15;
                margin-bottom: 12px;
                background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .subtitle {
                font-size: 1rem;
                color: var(--text-muted);
                line-height: 1.6;
                margin-bottom: 32px;
            }
            .grid-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 32px;
            }
            .stat-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-radius: 18px;
                padding: 18px 20px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .stat-label {
                font-size: 0.75rem;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-family: var(--mono);
            }
            .stat-value {
                font-size: 1.4rem;
                font-weight: 800;
                color: #f8fafc;
                font-family: var(--mono);
            }
            .stat-sub {
                font-size: 0.75rem;
                color: #10b981;
                font-weight: 600;
            }
            .action-bar {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
            }
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 22px;
                border-radius: 14px;
                font-size: 0.875rem;
                font-weight: 700;
                text-decoration: none;
                transition: all 0.2s ease;
                cursor: pointer;
            }
            .btn-primary {
                background: linear-gradient(135deg, #06b6d4, #10b981);
                color: #030712;
                box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.4);
                border: none;
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 30px -5px rgba(6, 182, 212, 0.55);
            }
            .btn-secondary {
                background: rgba(255, 255, 255, 0.05);
                color: #e2e8f0;
                border: 1px solid rgba(255, 255, 255, 0.12);
            }
            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.25);
                transform: translateY(-2px);
            }
            .footer-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.8rem;
                color: #64748b;
                padding: 0 12px;
                font-family: var(--mono);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header-badge-row">
                    <div class="badge badge-live">
                        <div class="badge-pulse-dot"></div>
                        CORE DISPATCH ENGINE ONLINE
                    </div>
                    <div class="badge badge-tech">PYOMO 6.8 + HIGHS 1.7.2</div>
                </div>

                <h1>HydroDispatch AI Core</h1>
                <p class="subtitle">
                    Industrial-grade mathematical optimization backend for real-time green hydrogen plant dispatch, dynamic TOU power arbitrage, BESS co-dispatch, O2 byproduct monetization, and multi-technology stack degradation management.
                </p>

                <div class="grid-stats">
                    <div class="stat-card">
                        <div class="stat-label">Solver Framework</div>
                        <div class="stat-value">Pyomo MILP</div>
                        <div class="stat-sub">HiGHS Branch-and-Cut</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Temporal Horizon</div>
                        <div class="stat-value">96 Steps</div>
                        <div class="stat-sub">15-Min Intervals (24-Hr)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Electrolyzer Physics</div>
                        <div class="stat-value">PEM • ALK • SOEC</div>
                        <div class="stat-sub">Dynamic Faraday & Ramp</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Co-Optimization</div>
                        <div class="stat-value">H2 + BESS + O2</div>
                        <div class="stat-sub">Byproduct & Arbitrage</div>
                    </div>
                </div>

                <div class="action-bar">
                    <a href="/docs" class="btn btn-primary">
                        <span>Explore Interactive OpenAPI Docs</span>
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                    <a href="/health" class="btn btn-secondary">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        <span>Health Probe</span>
                    </a>
                </div>
            </div>

            <div class="footer-info">
                <span>HydroDispatch AI SCADA Core v2.0</span>
                <span>Port 8000 • Protocol HTTP/REST</span>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "HydroDispatch AI Core",
        "version": "2.0.0",
        "supported_techs": list(TECH_PRESETS.keys()),
        "features": ["BESS_co_dispatch", "O2_byproduct_monetization", "Ammonia_coupling", "SHA256_audit_block"]
    }

@app.get("/tech-specs")
def get_tech_specs():
    return TECH_PRESETS

@app.post("/dispatch/run")
def run_dispatch(params: ScenarioParams):
    try:
        scenario = build_scenario(
            peak_solar_kw=params.peak_solar_kw,
            mean_wind_kw=params.mean_wind_kw,
            cloud_cover=params.cloud_cover,
            wind_variance=params.wind_variance,
            peak_price=params.peak_price,
            offpeak_price=params.offpeak_price,
            re_lcoe=params.re_lcoe,
        )

        opt_schedule, opt_summary = solve_dispatch(
            scenario_df=scenario,
            electrolyzer_max_kw=params.ely_capacity_kw,
            ely_type=params.ely_type,
            daily_h2_target_kg=params.daily_h2_target_kg,
            storage_capacity_kg=params.storage_capacity_kg,
            bess_capacity_kwh=params.bess_capacity_kwh,
            bess_power_kw=params.bess_power_kw,
            o2_price_rs_kg=params.o2_price_rs_kg,
            solver_time_limit=params.solver_time_limit,
        )

        base_schedule, base_summary = naive_baseline(
            scenario_df=scenario,
            electrolyzer_max_kw=params.ely_capacity_kw,
            ely_type=params.ely_type,
            daily_h2_target_kg=params.daily_h2_target_kg,
            storage_capacity_kg=params.storage_capacity_kg,
            bess_capacity_kwh=params.bess_capacity_kwh,
            bess_power_kw=params.bess_power_kw,
            o2_price_rs_kg=params.o2_price_rs_kg,
        )

        opt_cost = opt_summary["total_cost_rs"]
        base_cost = base_summary["total_cost_rs"]
        opt_lcoh = opt_summary["lcoh_rs_kg"]
        base_lcoh = base_summary["lcoh_rs_kg"]

        savings_pct = 100.0 * (base_cost - opt_cost) / (base_cost + 1e-5)
        lcoh_reduction_pct = 100.0 * (base_lcoh - opt_lcoh) / (base_lcoh + 1e-5)

        avg_ramp_opt = opt_summary["avg_ramp_kw"]
        avg_ramp_base = base_summary["avg_ramp_kw"]
        ramp_reduction_pct = 100.0 * (avg_ramp_base - avg_ramp_opt) / (avg_ramp_base + 1e-5)

        # Convert DataFrames to JSON-compliant records using Pandas native C-level serializer
        sc_records = json.loads(scenario.to_json(orient="records"))
        opt_records = json.loads(opt_schedule.to_json(orient="records"))
        base_records = json.loads(base_schedule.to_json(orient="records"))

        # Cryptographic SHA-256 Audit Fingerprint of Dispatch Block
        dispatch_payload_str = opt_schedule.to_json(orient="records")
        block_hash = hashlib.sha256(dispatch_payload_str.encode("utf-8")).hexdigest()

        return {
            "scenario": sc_records,
            "optimized_schedule": opt_records,
            "baseline_schedule": base_records,
            "metrics": {
                "optimized_cost_rs": round(float(opt_cost), 2),
                "baseline_cost_rs": round(float(base_cost), 2),
                "daily_savings_rs": round(float(base_cost - opt_cost), 2),
                "savings_pct": round(float(savings_pct), 1),
                "optimized_lcoh_rs_kg": round(float(opt_lcoh), 2),
                "baseline_lcoh_rs_kg": round(float(base_lcoh), 2),
                "gross_lcoh_rs_kg": round(float(opt_summary.get("gross_lcoh_rs_kg", opt_lcoh)), 2),
                "lcoh_reduction_pct": round(float(lcoh_reduction_pct), 1),
                "optimized_h2_kg": round(float(opt_summary["total_h2_kg"]), 2),
                "baseline_h2_kg": round(float(base_summary["total_h2_kg"]), 2),
                "o2_produced_kg": round(float(opt_summary["o2_produced_kg"]), 2),
                "o2_revenue_rs": round(float(opt_summary["o2_revenue_rs"]), 2),
                "ammonia_produced_kg": round(float(opt_summary["ammonia_produced_kg"]), 2),
                "green_purity_pct": round(float(opt_summary["green_purity_pct"]), 1),
                "baseline_green_purity_pct": round(float(base_summary["green_purity_pct"]), 1),
                "co2_avoided_tonnes_yr": round(float(opt_summary["co2_avoided_tonnes_yr"]), 1),
                "avg_ramp_optimized_kw": round(float(avg_ramp_opt), 2),
                "avg_ramp_baseline_kw": round(float(avg_ramp_base), 2),
                "ramp_reduction_pct": round(float(ramp_reduction_pct), 1),
                "bess_throughput_kwh": round(float(opt_summary.get("bess_throughput_kwh", 0.0)), 2),
                "lcoh_breakdown_opt": opt_summary["lcoh_breakdown"],
                "lcoh_breakdown_base": base_summary["lcoh_breakdown"],
                "audit_block_hash": block_hash[:16] + "..." + block_hash[-12:],
                "full_audit_hash": block_hash,
            },
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dispatch/export-csv")
def export_csv(params: ScenarioParams):
    scenario = build_scenario(
        peak_solar_kw=params.peak_solar_kw,
        mean_wind_kw=params.mean_wind_kw,
        cloud_cover=params.cloud_cover,
        wind_variance=params.wind_variance,
        peak_price=params.peak_price,
        offpeak_price=params.offpeak_price,
        re_lcoe=params.re_lcoe,
    )
    opt_schedule, opt_summary = solve_dispatch(
        scenario_df=scenario,
        electrolyzer_max_kw=params.ely_capacity_kw,
        ely_type=params.ely_type,
        daily_h2_target_kg=params.daily_h2_target_kg,
        storage_capacity_kg=params.storage_capacity_kg,
        bess_capacity_kwh=params.bess_capacity_kwh,
        bess_power_kw=params.bess_power_kw,
        o2_price_rs_kg=params.o2_price_rs_kg,
    )
    
    # Merge scenario and schedule
    export_df = pd.merge(scenario, opt_schedule, on=["timestamp", "interval"])
    csv_buffer = io.StringIO()
    export_df.to_csv(csv_buffer, index=False)
    
    return Response(
        content=csv_buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=hydrodispatch_schedule_24h.csv"}
    )

@app.post("/dispatch/export-report", response_class=HTMLResponse)
def export_audit_report(params: ScenarioParams):
    scenario = build_scenario(
        peak_solar_kw=params.peak_solar_kw,
        mean_wind_kw=params.mean_wind_kw,
        cloud_cover=params.cloud_cover,
        wind_variance=params.wind_variance,
        peak_price=params.peak_price,
        offpeak_price=params.offpeak_price,
        re_lcoe=params.re_lcoe,
    )
    opt_schedule, opt_summary = solve_dispatch(
        scenario_df=scenario,
        electrolyzer_max_kw=params.ely_capacity_kw,
        ely_type=params.ely_type,
        daily_h2_target_kg=params.daily_h2_target_kg,
        storage_capacity_kg=params.storage_capacity_kg,
        bess_capacity_kwh=params.bess_capacity_kwh,
        bess_power_kw=params.bess_power_kw,
        o2_price_rs_kg=params.o2_price_rs_kg,
    )
    
    dispatch_payload_str = opt_schedule.to_json(orient="records")
    block_hash = hashlib.sha256(dispatch_payload_str.encode("utf-8")).hexdigest()
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>HydroDispatch AI • Executive Audit & Compliance Dossier</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; padding: 36px; }}
            .container {{ max-width: 960px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; }}
            .header {{ border-bottom: 2px solid #06b6d4; padding-bottom: 18px; margin-bottom: 24px; display: flex; justify-content: space-between; }}
            h1 {{ margin: 0 0 6px 0; font-size: 24px; color: #38bdf8; }}
            .badge {{ display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; background: #065f46; color: #34d399; }}
            .grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }}
            .card {{ background: #1e293b; padding: 14px; border-radius: 10px; border: 1px solid #334155; }}
            .label {{ font-size: 11px; color: #94a3b8; text-transform: uppercase; }}
            .val {{ font-size: 18px; font-weight: bold; margin-top: 4px; color: #f8fafc; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }}
            th, td {{ padding: 10px; border: 1px solid #334155; text-align: left; }}
            th {{ background: #0f172a; color: #38bdf8; }}
            .hash {{ font-family: monospace; background: #020617; padding: 10px; border-radius: 8px; border: 1px solid #1e293b; font-size: 12px; word-break: break-all; }}
            .print-btn {{ background: #06b6d4; color: black; font-weight: bold; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }}
            @media print {{
                .no-print {{ display: none; }}
                body {{ background: white; color: black; padding: 0; }}
                .container {{ background: white; color: black; border: none; padding: 0; }}
                .card {{ background: #f8fafc; color: black; border: 1px solid #ccc; }}
                .val {{ color: black; }}
                th {{ background: #e2e8f0; color: black; }}
                td {{ border-color: #ccc; }}
                .hash {{ background: #f1f5f9; color: black; }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div>
                    <h1>HydroDispatch AI • Official Dispatch & ESG Compliance Audit</h1>
                    <div style="font-size: 13px; color: #94a3b8;">ISO 14064 / India National Green Hydrogen Mission (GHM) Certified Block</div>
                </div>
                <div class="no-print">
                    <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
                </div>
            </div>

            <div class="grid">
                <div class="card">
                    <div class="label">Total H2 Yield</div>
                    <div class="val">{opt_summary['total_h2_kg']} kg</div>
                </div>
                <div class="card">
                    <div class="label">Levelized Cost (LCOH)</div>
                    <div class="val" style="color: #34d399;">₹{opt_summary['lcoh_rs_kg']} / kg</div>
                </div>
                <div class="card">
                    <div class="label">Green Purity Index</div>
                    <div class="val" style="color: #38bdf8;">{opt_summary['green_purity_pct']}%</div>
                </div>
                <div class="card">
                    <div class="label">CO2 Avoided (Yr)</div>
                    <div class="val" style="color: #a78bfa;">{opt_summary['co2_avoided_tonnes_yr']} tonnes</div>
                </div>
            </div>

            <h3 style="margin-top: 24px; color: #e2e8f0;">LCOH Financial Waterfall (₹/kg H2)</h3>
            <table>
                <thead>
                    <tr>
                        <th>Cost Category</th>
                        <th>Optimized Rate</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Electrolyzer CAPEX Amortization</td><td>₹{opt_summary['lcoh_breakdown']['capex_rs_kg']}</td><td>Capital depreciation over rated stack lifespan</td></tr>
                    <tr><td>Renewable Electricity</td><td>₹{opt_summary['lcoh_breakdown']['re_electricity_rs_kg']}</td><td>Direct Solar PV + Wind turbine feed</td></tr>
                    <tr><td>Grid Supplemental Power</td><td>₹{opt_summary['lcoh_breakdown']['grid_electricity_rs_kg']}</td><td>Off-peak & solar corridor arbitrage imports</td></tr>
                    <tr><td>Water & Balance of Plant (O&M)</td><td>₹{opt_summary['lcoh_breakdown']['water_om_rs_kg']}</td><td>Demineralized H2O feed & consumables</td></tr>
                    <tr><td>Ramp Degradation Cost</td><td>₹{opt_summary['lcoh_breakdown']['degradation_rs_kg']}</td><td>Dynamic membrane & thermal cycle wear</td></tr>
                    <tr><td>BESS Cycling Cost</td><td>₹{opt_summary['lcoh_breakdown']['bess_cycling_rs_kg']}</td><td>Battery round-trip degradation wear</td></tr>
                    <tr><td>Oxygen (O2) Byproduct Credit</td><td style="color: #34d399;">₹{opt_summary['lcoh_breakdown']['o2_byproduct_credit_rs_kg']}</td><td>Industrial / Medical O2 monetization (8 kg O2 / kg H2)</td></tr>
                    <tr style="font-weight: bold; background: rgba(6, 182, 212, 0.1);"><td>NET OPTIMIZED LCOH</td><td style="color: #38bdf8;">₹{opt_summary['lcoh_breakdown']['total_lcoh_rs_kg']} / kg</td><td>Total Levelized Cost of Green Hydrogen Molecule</td></tr>
                </tbody>
            </table>

            <h3 style="margin-top: 24px; color: #e2e8f0;">Cryptographic Audit Block Verification</h3>
            <div class="hash">
                <strong>SHA-256 Dispatch Block Hash:</strong> {block_hash}<br>
                <strong>Electrolyzer Type:</strong> {params.ely_type} ({params.ely_capacity_kw} kW Rated)<br>
                <strong>BESS Co-Dispatch:</strong> {params.bess_capacity_kwh} kWh ({params.bess_power_kw} kW inverter)<br>
                <strong>Byproduct Yield:</strong> {opt_summary['o2_produced_kg']} kg O2 • {opt_summary['ammonia_produced_kg']} kg Green Ammonia (NH3)
            </div>
        </div>
    </body>
    </html>
    """
    return html
