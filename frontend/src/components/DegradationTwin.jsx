import React, { useState } from 'react';
import {
  Cpu, Activity, TrendingUp, ShieldCheck, AlertCircle, Info, Sparkles, HeartPulse
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';

export default function DegradationTwin() {
  const [selectedTech, setSelectedTech] = useState('PEM');

  // Generate polarization data (Cell Voltage vs Current Density)
  const currentDensities = [0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2];
  
  const polarizationData = currentDensities.map((cd) => {
    // Electrochemical model parameters
    const eRev = 1.23;
    // Activation overpotential (Tafel slope)
    const etaActFresh = 0.06 * Math.log(cd / 0.001);
    const etaActAged = 0.08 * Math.log(cd / 0.0008);
    // Ohmic resistance
    const rOhmFresh = 0.22;
    const rOhmAged = 0.31;
    // Mass transport
    const etaMassFresh = -0.02 * Math.log(Math.max(0.01, 1 - (cd / 2.5)));
    const etaMassAged = -0.035 * Math.log(Math.max(0.01, 1 - (cd / 2.4)));

    const vFresh = Math.round((eRev + etaActFresh + (cd * rOhmFresh) + etaMassFresh) * 1000) / 1000;
    const vAged = Math.round((eRev + etaActAged + (cd * rOhmAged) + etaMassAged) * 1000) / 1000;
    
    // Faraday efficiency vs current density
    const faradayFresh = Math.round((100 - (1.5 / (cd + 0.1))) * 10) / 10;
    const faradayAged = Math.round((100 - (3.2 / (cd + 0.1))) * 10) / 10;

    return {
      currentDensity: cd,
      vFresh,
      vAged,
      vDiffMv: Math.round((vAged - vFresh) * 1000),
      faradayFresh: Math.min(99.4, Math.max(85, faradayFresh)),
      faradayAged: Math.min(97.8, Math.max(80, faradayAged)),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Electrochemical Digital Twin & Membrane Degradation Physics
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Polarization curves (V_cell = E_rev + η_act + η_ohm + η_mass) and dynamic aging trajectories
            </p>
          </div>

          <div className="flex glass-pill p-1 rounded-xl text-xs font-bold">
            {['PEM', 'Alkaline', 'SOEC'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTech(t)}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  selectedTech === t ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t} Stack
              </button>
            ))}
          </div>
        </div>

        {/* Digital Twin Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="glass-card p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Membrane Resistance</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-white font-mono">0.24</span>
              <span className="text-xs text-slate-400">Ω·cm²</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono">
              +4.2% from BOL baseline
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Remaining Useful Life (RUL)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-indigo-300 font-mono">43,200</span>
              <span className="text-xs text-slate-400">hrs</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">
              +32% extended via MILP smoothing
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Thermodynamic Eff (HHV)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-cyan-300 font-mono">79.2%</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              SEC: 50.8 kWh/kg H2
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Health Score</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-300 font-mono">96.8 / 100</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Nominal thermal cycling
            </div>
          </div>
        </div>
      </div>

      {/* Chart 1: Polarization Curve */}
      <div className="glass-panel rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Cell Polarization Curve (V_cell vs. Current Density i)
            </h3>
            <p className="text-xs text-slate-400">
              Comparing Begin-of-Life (BOL Fresh) vs. End-of-Life (EOL Aged) membrane overpotential
            </p>
          </div>
          <span className="text-xs glass-pill text-indigo-300 px-3 py-1 rounded-xl font-mono">
            Optimal Operating Window: 1.6V - 1.95V
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={polarizationData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="currentDensity" stroke="#64748b" tick={{ fontSize: 11 }} unit=" A/cm²" />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[1.2, 2.4]} unit=" V" />
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
              <Line type="monotone" dataKey="vFresh" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Fresh Stack (BOL)" />
              <Line type="monotone" dataKey="vAged" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Aged Stack (+15,000 hrs)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Faraday Efficiency vs Current Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel rounded-3xl p-6 shadow-2xl">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide mb-1">
            Faraday Efficiency vs. Current Density (%)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Parasitic gas-crossover losses at low turndown vs high load
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={polarizationData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="faradayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="currentDensity" stroke="#64748b" tick={{ fontSize: 10 }} unit=" A/cm²" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[80, 100]} unit=" %" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(8, 14, 28, 0.85)',
                    backdropFilter: 'blur(16px)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
                <Area type="monotone" dataKey="faradayFresh" stroke="#06b6d4" fill="url(#faradayGrad)" strokeWidth={2} name="Faraday Eff (Fresh)" />
                <Line type="monotone" dataKey="faradayAged" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Faraday Eff (Aged)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-3">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Degradation Mitigation Physics
              </h3>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 glass-card rounded-2xl">
                <strong className="text-cyan-300">1. Thermal Cycling Protection:</strong>
                <p className="text-slate-400 mt-0.5">Rapid temperature gradients during sudden solar cloud drops induce mechanical shear in the Catalyst Coated Membrane (CCM). The MILP ramp constraint keeps ΔT &lt; 0.5°C/min.</p>
              </div>

              <div className="p-3.5 glass-card rounded-2xl">
                <strong className="text-emerald-300">2. Catalyst Dissolution Prevention:</strong>
                <p className="text-slate-400 mt-0.5">High-frequency potential swings cause Platinum/Iridium dissolution at the anode. HydroDispatch AI enforces minimum up/down time states to avoid micro-cycling.</p>
              </div>

              <div className="p-3.5 glass-card rounded-2xl">
                <strong className="text-indigo-300">3. Gas Crossover Avoidance:</strong>
                <p className="text-slate-400 mt-0.5">Operating below 10% minimum turndown increases H₂ → O₂ membrane permeation. The solver automatically draws minimum grid power or smoothly shuts down safely.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
