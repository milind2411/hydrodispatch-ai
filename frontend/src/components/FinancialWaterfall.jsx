import React, { useState } from 'react';
import { useAuth } from '../store/useAuthStore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell
} from 'recharts';
import { Coins, TrendingDown, DollarSign, Award, CheckCircle, Download, TrendingUp, Lock } from 'lucide-react';

export default function FinancialWaterfall({ metrics }) {
  const { activeRole, currentPersona, setRole } = useAuth();
  const [exportingJson, setExportingJson] = useState(false);

  if (!metrics || !metrics.lcoh_breakdown_opt || !metrics.lcoh_breakdown_base) return null;

  const isTrader = activeRole === 'trader';
  const opt = metrics.lcoh_breakdown_opt;
  const base = metrics.lcoh_breakdown_base;

  const costData = [
    {
      category: "Stack CAPEX",
      optimized: opt.capex_rs_kg,
      baseline: base.capex_rs_kg,
      unit: "₹/kg",
      color: "#818cf8",
      desc: "Amortized equipment & installation capital"
    },
    {
      category: "Renewable Power",
      optimized: opt.re_electricity_rs_kg,
      baseline: base.re_electricity_rs_kg,
      unit: "₹/kg",
      color: "#34d399",
      desc: "Direct solar PV & wind turbine LCOE"
    },
    {
      category: "Grid Import",
      optimized: opt.grid_electricity_rs_kg,
      baseline: base.grid_electricity_rs_kg,
      unit: "₹/kg",
      color: "#fbbf24",
      desc: "Grid TOU supplemental electricity tariff"
    },
    {
      category: "Water & O&M",
      optimized: opt.water_om_rs_kg,
      baseline: base.water_om_rs_kg,
      unit: "₹/kg",
      color: "#38bdf8",
      desc: "Demineralized H2O feed & balance of plant"
    },
    {
      category: "Ramp Degradation",
      optimized: opt.degradation_rs_kg,
      baseline: base.degradation_rs_kg,
      unit: "₹/kg",
      color: "#f87171",
      desc: "Dynamic thermal cycling & membrane wear penalty"
    },
  ];

  if (opt.bess_cycling_rs_kg > 0) {
    costData.push({
      category: "BESS Cycling",
      optimized: opt.bess_cycling_rs_kg,
      baseline: 0,
      unit: "₹/kg",
      color: "#c084fc",
      desc: "Battery throughput & electrochemical degradation"
    });
  }

  if (opt.o2_byproduct_credit_rs_kg < 0) {
    costData.push({
      category: "O2 Byproduct Credit",
      optimized: opt.o2_byproduct_credit_rs_kg,
      baseline: base.o2_byproduct_credit_rs_kg || opt.o2_byproduct_credit_rs_kg,
      unit: "₹/kg",
      color: "#2dd4bf",
      desc: "Medical/Industrial oxygen revenue credit (8kg O2 / kg H2)"
    });
  }

  const totalOpt = opt.total_lcoh_rs_kg;
  const totalBase = base.total_lcoh_rs_kg;
  const savingsPerKg = (totalBase - totalOpt).toFixed(2);

  const handleExportFinancials = () => {
    setExportingJson(true);
    try {
      const financialReport = {
        title: "HydroDispatch AI - Levelized Cost of Hydrogen (LCOH) Financial Decomposition",
        generated_by: `${currentPersona.name} (${currentPersona.badge})`,
        clearance: currentPersona.clearanceLevel,
        currency: "INR (₹)",
        optimized_lcoh_rs_kg: totalOpt,
        baseline_lcoh_rs_kg: totalBase,
        net_savings_rs_kg: parseFloat(savingsPerKg),
        lcoh_reduction_pct: metrics.lcoh_reduction_pct,
        daily_opex_savings_rs: metrics.daily_savings_rs,
        annualized_opex_savings_rs: (metrics.daily_savings_rs || 0) * 365,
        breakdown_optimized: opt,
        breakdown_baseline: base,
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(financialReport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HydroDispatch_Financial_LCOH_Model_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setExportingJson(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
              LCOH Financial Waterfall Breakdown
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Decomposed levelized cost structure per kilogram of Green Hydrogen (₹/kg H2)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-pill px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-emerald-300 font-bold font-mono">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Advantage: -₹{savingsPerKg}/kg ({metrics.lcoh_reduction_pct}%)</span>
          </div>

          <button
            onClick={handleExportFinancials}
            disabled={exportingJson}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl glass-button text-amber-300 text-xs font-bold font-mono transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingJson ? 'Exporting...' : 'Export Financial Model (JSON)'}</span>
          </button>
        </div>
      </div>

      {/* Role Access Feedback Bar */}
      {!isTrader && (
        <div className="mb-4 p-3.5 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Active Role: <strong className="text-white">{currentPersona.name} ({currentPersona.badge})</strong>. Detailed Financial Modeling is optimized for the <strong>Energy Trader Persona</strong>.
            </span>
          </div>
          <button
            onClick={() => setRole('trader')}
            className="px-3 py-1 glass-button text-amber-300 rounded-xl font-bold font-mono text-[11px] transition shrink-0"
          >
            Switch to Energy Trader Profile
          </button>
        </div>
      )}

      {/* Chart & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bar Comparison */}
        <div className="lg:col-span-7 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" ₹" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(8, 14, 28, 0.85)',
                  backdropFilter: 'blur(16px)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="optimized" name="Optimized Dispatch (₹/kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="baseline" name="Naive Baseline (₹/kg)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Breakdown Cards & Summary */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2.5">
          <div className="glass-card p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-white/10 pb-2">
              <span>Cost Component</span>
              <div className="flex gap-4">
                <span className="text-emerald-400">Optimized</span>
                <span className="text-rose-400">Baseline</span>
              </div>
            </div>

            {costData.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.category}</span>
                </div>
                <div className="flex gap-4 font-mono font-semibold">
                  <span className="text-emerald-400 w-12 text-right">₹{item.optimized}</span>
                  <span className="text-slate-400 w-12 text-right">₹{item.baseline}</span>
                </div>
              </div>
            ))}

            <div className="border-t border-white/10 pt-2 flex items-center justify-between font-bold text-xs">
              <span className="text-white">Total LCOH:</span>
              <div className="flex gap-4 font-mono text-sm">
                <span className="text-emerald-400 w-14 text-right">₹{totalOpt}</span>
                <span className="text-rose-400 w-14 text-right line-through">₹{totalBase}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Key Optimization Drivers:</span>
            </div>
            <div>• <strong className="text-slate-200">Grid Arbitrage:</strong> Avoids purchasing peak tariff power (₹9.5-12/kWh), using buffer storage instead.</div>
            <div>• <strong className="text-slate-200">Degradation Cut:</strong> Strict MILP ramp limits avoid sudden power fluctuations, cutting thermal stack stress.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
