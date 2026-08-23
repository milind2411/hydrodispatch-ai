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
                margin-bottom: 20px;
            }
            .badge-live {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(16, 185, 129, 0.12);
                color: #34d399;
                border: 1px solid rgba(16, 185, 129, 0.3);
                padding: 6px 14px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 700;
                font-family: var(--mono);
                letter-spacing: 0.5px;
            }
            .badge-solver {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(6, 182, 212, 0.12);
                color: #38bdf8;
                border: 1px solid rgba(6, 182, 212, 0.3);
                padding: 6px 14px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 700;
                font-family: var(--mono);
            }
            .dot {
                width: 8px;
                height: 8px;
                background: #10b981;
                border-radius: 50%;
                box-shadow: 0 0 12px #10b981;
                animation: pulse 2s infinite;
            }
            @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
            h1 {
                font-size: 34px;
                font-weight: 900;
                letter-spacing: -1px;
                line-height: 1.15;
                margin-bottom: 12px;
                background: linear-gradient(135deg, #ffffff 30%, #a5f3fc 70%, #6ee7b7 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            p.lead {
                color: var(--text-muted);
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 28px;
            }
            .stat-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 12px;
                margin-bottom: 32px;
            }
            .stat-box {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(30, 41, 59, 0.7);
                padding: 16px;
                border-radius: 18px;
            }
            .stat-label {
                font-size: 11px;
                color: var(--text-muted);
                text-transform: uppercase;
                font-weight: 700;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            .stat-value {
                font-size: 20px;
                font-weight: 800;
                color: #f1f5f9;
                font-family: var(--mono);
            }
            .stat-sub {
                font-size: 10px;
                color: #38bdf8;
                margin-top: 2px;
            }
            .actions-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 32px;
            }
            @media (max-width: 640px) {
                .actions-grid { grid-template-columns: 1fr; }
                h1 { font-size: 26px; }
                .card { padding: 24px; }
            }
            .btn-hero {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                background: linear-gradient(135deg, #06b6d4, #10b981);
                color: #000;
                font-weight: 800;
                font-size: 14px;
                padding: 16px 24px;
                border-radius: 16px;
                text-decoration: none;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.3);
            }
            .btn-hero:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 30px -5px rgba(6, 182, 212, 0.4);
                opacity: 0.95;
            }
            .btn-secondary {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                background: rgba(30, 41, 59, 0.8);
                color: #f1f5f9;
                font-weight: 700;
                font-size: 14px;
                padding: 16px 24px;
                border-radius: 16px;
                text-decoration: none;
                border: 1px solid rgba(51, 65, 85, 0.8);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .btn-secondary:hover {
                background: rgba(51, 65, 85, 0.9);
                border-color: #06b6d4;
                transform: translateY(-2px);
            }
            .endpoints-section {
                border-top: 1px solid rgba(30, 41, 59, 0.8);
                padding-top: 24px;
            }
            .endpoints-header {
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--text-muted);
                margin-bottom: 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .endpoint-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 14px;
                background: rgba(10, 15, 29, 0.6);
                border: 1px solid rgba(30, 41, 59, 0.6);
                border-radius: 12px;
                margin-bottom: 8px;
                font-family: var(--mono);
                font-size: 12px;
                transition: border-color 0.2s;
            }
            .endpoint-row:hover { border-color: rgba(6, 182, 212, 0.4); }
            .badge-post { background: rgba(6, 182, 212, 0.15); color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-weight: 700; }
            .badge-get { background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 3px 8px; border-radius: 6px; font-weight: 700; }
            .ep-path { color: #f1f5f9; font-weight: 600; }
            .ep-desc { color: #64748b; font-size: 11px; }
            footer {
                text-align: center;
                font-size: 11px;
                color: #475569;
                font-family: var(--mono);
                margin-top: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header-badge-row">
                    <div class="badge-live"><span class="dot"></span> ENGINE ONLINE • FASTAPI v2.0</div>
                    <div class="badge-solver">⚡ PYOMO + HIGHS MILP SOLVER</div>
                </div>

                <h1>HydroDispatch AI Core</h1>
                <p class="lead">
                    High-performance physics-informed co-optimization engine for green hydrogen production, multi-technology electrolysis scheduling, buffer storage dynamics, and dynamic TOU electricity arbitrage.
                </p>

                <div class="stat-grid">
                    <div class="stat-box">
                        <div class="stat-label">Horizon Steps</div>
                        <div class="stat-value">96 @ 15m</div>
                        <div class="stat-sub">24-hour predictive dispatch</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Electrolyzers</div>
                        <div class="stat-value">PEM • AEL • SOEC</div>
                        <div class="stat-sub">Dynamic polarization kinetics</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">LCOH Reduction</div>
                        <div class="stat-value">15% - 28%</div>
                        <div class="stat-sub">Down to ₹220/kg H2</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Audit Hash</div>
                        <div class="stat-value">SHA-256</div>
                        <div class="stat-sub">GHG & RED II Proof-of-Origin</div>
                    </div>
                </div>

                <div class="actions-grid">
                    <a href="http://localhost:5173" class="btn-hero" target="_blank">
                        🚀 Launch SCADA Dashboard (Port 5173)
                    </a>
                    <a href="/docs" class="btn-secondary" target="_blank">
                        📖 Interactive OpenAPI Swagger (/docs)
                    </a>
                </div>

                <div class="endpoints-section">
                    <div class="endpoints-header">
                        <span>REST API Endpoints</span>
                        <a href="/redoc" style="color: #38bdf8; text-decoration: none; font-size: 11px;" target="_blank">ReDoc Specification &rarr;</a>
                    </div>
                    
                    <div class="endpoint-row">
                        <div>
                            <span class="badge-post">POST</span>
                            <span class="ep-path">/dispatch/run</span>
                        </div>
                        <span class="ep-desc">96-step Pyomo MILP optimizer & financial metrics</span>
                    </div>
                    <div class="endpoint-row">
                        <div>
                            <span class="badge-post">POST</span>
                            <span class="ep-path">/dispatch/export-csv</span>
                        </div>
                        <span class="ep-desc">24-hour schedule CSV data stream</span>
                    </div>
                    <div class="endpoint-row">
                        <div>
                            <span class="badge-get">GET</span>
                            <span class="ep-path">/health</span>
                        </div>
                        <span class="ep-desc">System health check & supported electrolyzer techs</span>
                    </div>
                </div>
            </div>

            <footer>
                HydroDispatch AI Core Optimization Engine • Powered by FastAPI & Pyomo + HiGHS
            </footer>
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
        "supported_techs": list(TECH_PRESETS.keys())
    }

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
        )

        base_schedule, base_summary = naive_baseline(
            scenario_df=scenario,
            electrolyzer_max_kw=params.ely_capacity_kw,
            ely_type=params.ely_type,
            daily_h2_target_kg=params.daily_h2_target_kg,
            storage_capacity_kg=params.storage_capacity_kg,
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

        # Cryptographic SHA-256 Audit Fingerprint of Dispatch Block
        dispatch_payload_str = json.dumps(opt_schedule.to_dict(orient="records"), sort_keys=True)
        block_hash = hashlib.sha256(dispatch_payload_str.encode("utf-8")).hexdigest()

        return {
            "scenario": scenario.to_dict(orient="records"),
            "optimized_schedule": opt_schedule.to_dict(orient="records"),
            "baseline_schedule": base_schedule.to_dict(orient="records"),
            "metrics": {
                "optimized_cost_rs": round(float(opt_cost), 2),
                "baseline_cost_rs": round(float(base_cost), 2),
                "daily_savings_rs": round(float(base_cost - opt_cost), 2),
                "savings_pct": round(float(savings_pct), 1),
                "optimized_lcoh_rs_kg": round(float(opt_lcoh), 2),
                "baseline_lcoh_rs_kg": round(float(base_lcoh), 2),
                "lcoh_reduction_pct": round(float(lcoh_reduction_pct), 1),
                "optimized_h2_kg": round(float(opt_summary["total_h2_kg"]), 2),
                "baseline_h2_kg": round(float(base_summary["total_h2_kg"]), 2),
                "green_purity_pct": round(float(opt_summary["green_purity_pct"]), 1),
                "baseline_green_purity_pct": round(float(base_summary["green_purity_pct"]), 1),
                "co2_avoided_tonnes_yr": round(float(opt_summary["co2_avoided_tonnes_yr"]), 1),
                "avg_ramp_optimized_kw": round(float(avg_ramp_opt), 2),
                "avg_ramp_baseline_kw": round(float(avg_ramp_base), 2),
                "ramp_reduction_pct": round(float(ramp_reduction_pct), 1),
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
