import React from 'react';
import { DollarSign, Zap, TrendingDown, ShieldCheck, Leaf, Gauge } from 'lucide-react';

export default function KpiCards({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {/* 1. LCOH Card */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider">Levelized LCOH</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white">₹{metrics.optimized_lcoh_rs_kg}</span>
          <span className="text-xs text-zinc-500 font-medium">/kg H2</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold">
            -{metrics.lcoh_reduction_pct}%
          </span>
          <span className="text-[11px] text-zinc-400">vs Base ₹{metrics.baseline_lcoh_rs_kg}</span>
        </div>
      </div>

      {/* 2. Daily Plant OPEX */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-cyan-500/40 transition">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider">Daily Plant Cost</span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white">₹{metrics.optimized_cost_rs?.toLocaleString()}</span>
          <span className="text-xs text-zinc-500 font-medium">/day</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-cyan-400">
          <span className="bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 font-bold">
            -₹{metrics.daily_savings_rs?.toLocaleString()}
          </span>
          <span className="text-[11px] text-zinc-400 font-semibold">({metrics.savings_pct}% cut)</span>
        </div>
      </div>

      {/* 3. Daily H2 Output */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider">H2 Production</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white">{metrics.optimized_h2_kg}</span>
          <span className="text-xs text-zinc-500 font-medium">kg/day</span>
        </div>
        <div className="mt-2.5 text-[11px] text-zinc-400 flex items-center gap-1">
          <span className="text-emerald-400 font-bold">100%</span>
          <span>contract delivery quota met</span>
        </div>
      </div>

      {/* 4. Green Purity Index */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-emerald-400/40 transition">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider">Green Purity</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Leaf className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-emerald-400">{metrics.green_purity_pct}%</span>
          <span className="text-xs text-zinc-500 font-medium">RE power</span>
        </div>
        <div className="mt-2.5 text-[11px] text-zinc-400">
          Peak grid import avoided
        </div>
      </div>

      {/* 5. Carbon Offset */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-teal-400/40 transition">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider">CO2 Offset</span>
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white">{metrics.co2_avoided_tonnes_yr}</span>
          <span className="text-xs text-zinc-500 font-medium">t CO2/yr</span>
        </div>
        <div className="mt-2.5 text-[11px] text-zinc-400">
          vs Steam Methane Reforming
        </div>
      </div>

      {/* 6. Stack Health & Longevity */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider">Stack Longevity</span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-purple-400">+{metrics.ramp_reduction_pct}%</span>
          <span className="text-xs text-zinc-500 font-medium">stress cut</span>
        </div>
        <div className="mt-2.5 text-[11px] text-zinc-400">
          Ramp: {metrics.avg_ramp_optimized_kw} kW vs {metrics.avg_ramp_baseline_kw} kW
        </div>
      </div>
    </div>
  );
}
