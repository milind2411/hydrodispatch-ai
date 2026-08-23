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
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl mb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Levelized Cost of Hydrogen (LCOH) Financial Waterfall Breakdown
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Decomposed levelized cost structure per kilogram of Green Hydrogen (₹/kg H2)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs text-emerald-300 font-bold font-mono">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Advantage: -₹{savingsPerKg}/kg ({metrics.lcoh_reduction_pct}%)</span>
          </div>

          <button
            onClick={handleExportFinancials}
            disabled={exportingJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingJson ? 'Exporting...' : 'Export Financial Model (JSON)'}</span>
          </button>
        </div>
      </div>

      {/* Role Access Feedback Bar */}
      {!isTrader && (
        <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Active Role: <strong className="text-white">{currentPersona.name} ({currentPersona.badge})</strong>. Detailed Financial Modeling is optimized for the <strong>Energy Trader Persona</strong>.
            </span>
          </div>
          <button
            onClick={() => setRole('trader')}
            className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg font-bold font-mono text-[11px] transition shrink-0"
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
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
              <XAxis dataKey="category" stroke="#71717a" tick={{ fontSize: 11 }} />
              <YAxis stroke="#71717a" tick={{ fontSize: 11 }} unit=" ₹" />
              <Tooltip
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px', color: '#f4f4f5' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="optimized" name="Optimized Dispatch (₹/kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="baseline" name="Naive Baseline (₹/kg)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Breakdown Cards & Summary */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2.5">
          <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300 border-b border-zinc-800 pb-1.5">
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
                  <span className="text-zinc-300">{item.category}</span>
                </div>
                <div className="flex gap-4 font-mono font-semibold">
                  <span className="text-emerald-400 w-12 text-right">₹{item.optimized}</span>
                  <span className="text-zinc-500 w-12 text-right">₹{item.baseline}</span>
                </div>
              </div>
            ))}

            <div className="border-t border-zinc-800 pt-2 flex items-center justify-between font-bold text-xs">
              <span className="text-white">Total LCOH:</span>
              <div className="flex gap-4 font-mono text-sm">
                <span className="text-emerald-400 w-14 text-right">₹{totalOpt}</span>
                <span className="text-rose-400 w-14 text-right line-through">₹{totalBase}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60 text-xs text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Key Optimization Drivers:</span>
            </div>
            <div>• <strong className="text-zinc-200">Grid Arbitrage:</strong> Avoids purchasing peak tariff power (₹9.5-12/kWh), using buffer storage instead.</div>
            <div>• <strong className="text-zinc-200">Degradation Cut:</strong> Strict MILP ramp limits avoid sudden power fluctuations, cutting thermal stack stress.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
