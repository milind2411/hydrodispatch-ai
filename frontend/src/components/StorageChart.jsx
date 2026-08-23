import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line, ComposedChart
} from 'recharts';
import { BatteryCharging, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function StorageChart({ scenario, optimized, baseline, storageCapacityKg }) {
  if (!scenario || !optimized) return null;

  const chartData = scenario.map((sc, i) => ({
    timestamp: sc.timestamp,
    opt_h2_rate_kgh: (optimized[i]?.h2_kg || 0) * 4, // 15-min to hourly rate
    opt_soc_kg: optimized[i]?.storage_soc_kg || 0,
    opt_soc_pct: optimized[i]?.storage_soc_pct || 0,
    offtake_flow_kgh: (optimized[i]?.offtake_flow_kg || 0) * 4,
    base_soc_kg: baseline[i]?.storage_soc_kg || 0,
  }));

  const maxSoc = Math.max(...chartData.map(d => d.opt_soc_kg));
  const minSoc = Math.min(...chartData.map(d => d.opt_soc_kg));

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
              Buffer Storage & Pipeline Delivery
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Decoupling intermittent solar/wind generation from 24/7 steady pipeline flow
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="text-slate-400">Peak Storage:</span>
            <span className="text-indigo-300 font-mono font-bold">{maxSoc.toFixed(1)} kg</span>
          </div>
          <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="text-slate-400">Min Buffer:</span>
            <span className="text-emerald-300 font-mono font-bold">{minSoc.toFixed(1)} kg</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-72 sm:h-80 md:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="kg" stroke="#64748b" tick={{ fontSize: 11 }} unit=" kg" />
            <YAxis yAxisId="rate" orientation="right" stroke="#10b981" tick={{ fontSize: 11 }} unit=" kg/h" />
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
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />

            <Area yAxisId="kg" type="monotone" dataKey="opt_soc_kg" stroke="#6366f1" fill="url(#storageGrad)" strokeWidth={2} name="Buffer Tank Storage (kg)" />
            <Line yAxisId="rate" type="stepAfter" dataKey="opt_h2_rate_kgh" stroke="#10b981" strokeWidth={2} dot={false} name="Electrolyzer H2 Output (kg/h)" />
            <Line yAxisId="rate" type="monotone" dataKey="offtake_flow_kgh" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Offtaker Contract Flow (kg/h)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Industrial Buffer Storage Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4 pt-4 border-t border-white/10">
        <div className="glass-card p-3.5 rounded-2xl flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-slate-200">Zero Offtaker Deficit</div>
            <div className="text-slate-400 mt-0.5">Buffer tank absorbs excess generation during midday solar peak to guarantee uninterrupted pipeline supply during night.</div>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex items-start gap-2.5">
          <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-slate-200">Arbitrage Buffering</div>
            <div className="text-slate-400 mt-0.5">Shifts electrolysis load out of high-cost evening grid tariff bands (18:00 - 22:00) without interrupting client delivery.</div>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-slate-200">Tank Sizing Utilization</div>
            <div className="text-slate-400 mt-0.5">Max storage peak: <span className="font-mono text-slate-200 font-bold">{((maxSoc / Math.max(1, storageCapacityKg)) * 100).toFixed(0)}%</span> of total {storageCapacityKg} kg tank capacity.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
