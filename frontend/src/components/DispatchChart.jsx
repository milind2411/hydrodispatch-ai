import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line, ComposedChart
} from 'recharts';
import { Layers, Activity, Split } from 'lucide-react';

export default function DispatchChart({ scenario, optimized, baseline }) {
  const [view, setView] = useState('overlay');

  if (!scenario || !optimized || !baseline) return null;

  const chartData = scenario.map((sc, i) => ({
    timestamp: sc.timestamp,
    solar_kw: sc.solar_kw,
    wind_kw: sc.wind_kw,
    total_re_kw: sc.total_re_kw,
    tariff_rs_kwh: sc.tariff_rs_kwh,
    tariff_tier: sc.tariff_tier,
    opt_ely_power_kw: optimized[i]?.ely_power_kw || 0,
    opt_re_used_kw: optimized[i]?.re_used_kw || 0,
    opt_grid_power_kw: optimized[i]?.grid_power_kw || 0,
    opt_curtail_kw: optimized[i]?.curtail_kw || 0,
    bess_ch_kw: optimized[i]?.bess_ch_kw || 0,
    bess_dis_kw: optimized[i]?.bess_dis_kw || 0,
    bess_soc_kwh: optimized[i]?.bess_soc_kwh || 0,
    base_ely_power_kw: baseline[i]?.ely_power_kw || 0,
    base_grid_power_kw: baseline[i]?.grid_power_kw || 0,
  }));

  const hasBessData = chartData.some(d => d.bess_ch_kw > 0 || d.bess_dis_kw > 0);

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-5 shadow-2xl">
      {/* Header with title and view mode buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide">
              24-Hour Power Dispatch & Grid TOU
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Physics-informed MILP plateau dispatch (96 intervals @ 15 min) vs erratic baseline
          </p>
        </div>

        <div className="flex glass-pill p-1 rounded-xl text-xs overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setView('overlay')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
              view === 'overlay' ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Overlay
          </button>
          <button
            onClick={() => setView('allocation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
              view === 'allocation' ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            RE vs Grid
          </button>
          <button
            onClick={() => setView('sideBySide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
              view === 'sideBySide' ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            Split
          </button>
        </div>
      </div>

      {/* Main View Render */}
      {view === 'overlay' && (
        <div className="h-72 sm:h-80 md:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="reSolarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="power" stroke="#64748b" tick={{ fontSize: 11 }} unit=" kW" />
              <YAxis yAxisId="tariff" orientation="right" stroke="#f43f5e" tick={{ fontSize: 11 }} unit=" ₹" domain={[0, 15]} />
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

              <Area yAxisId="power" type="monotone" dataKey="total_re_kw" stroke="#0284c7" fill="url(#reSolarGrad)" name="Total Available RE (kW)" />
              <Line yAxisId="power" type="monotone" dataKey="base_ely_power_kw" stroke="#f43f5e" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Baseline (Erratic Tracking)" />
              <Line yAxisId="power" type="stepAfter" dataKey="opt_ely_power_kw" stroke="#10b981" strokeWidth={2.5} dot={false} name="Optimized Setpoint (MILP)" />
              <Line yAxisId="power" type="stepAfter" dataKey="opt_grid_power_kw" stroke="#eab308" strokeWidth={1.5} dot={false} name="Optimized Grid Import (kW)" />
              {hasBessData && (
                <Line yAxisId="power" type="stepAfter" dataKey="bess_dis_kw" stroke="#c084fc" strokeWidth={1.5} dot={false} name="BESS Battery Discharge (kW)" />
              )}
              <Line yAxisId="tariff" type="stepAfter" dataKey="tariff_rs_kwh" stroke="#f43f5e" strokeWidth={1} dot={false} strokeDasharray="2 2" name="Grid Tariff (₹/kWh)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === 'allocation' && (
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="reUsedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" kW" />
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

              <Area type="monotone" stackId="1" dataKey="opt_re_used_kw" stroke="#10b981" fill="url(#reUsedGrad)" name="Green RE Power Used (kW)" />
              <Area type="monotone" stackId="1" dataKey="opt_grid_power_kw" stroke="#eab308" fill="url(#gridGrad)" name="Off-Peak Grid Power (kW)" />
              <Line type="monotone" dataKey="total_re_kw" stroke="#38bdf8" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Total Available RE (kW)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === 'sideBySide' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Optimized Dispatch (MILP Co-Optimized)
              </span>
              <span className="text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                Smooth Ramp & Minimal Tariff
              </span>
            </div>
            <div className="h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" kW" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(8, 14, 28, 0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="total_re_kw" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} name="Available RE (kW)" />
                  <Line type="stepAfter" dataKey="opt_ely_power_kw" stroke="#10b981" strokeWidth={2.5} dot={false} name="Ely Power (kW)" />
                  <Line type="stepAfter" dataKey="opt_grid_power_kw" stroke="#eab308" strokeWidth={1.5} dot={false} name="Grid Import (kW)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Baseline Dispatch (Direct Tracking)
              </span>
              <span className="text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                Heavy Ramp Wear & Peak Grid Import
              </span>
            </div>
            <div className="h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" kW" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(8, 14, 28, 0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="total_re_kw" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} name="Available RE (kW)" />
                  <Line type="monotone" dataKey="base_ely_power_kw" stroke="#f43f5e" strokeWidth={1.5} dot={false} name="Ely Power (kW)" />
                  <Line type="stepAfter" dataKey="base_grid_power_kw" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Grid Draw (kW)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
