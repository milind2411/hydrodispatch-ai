import React, { useState } from 'react';
import {
  Server, Zap, Thermometer, Gauge, Activity, ShieldCheck,
  AlertTriangle, Power, Sliders, CheckCircle2, Droplets
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

export default function FleetMonitor({ fleetData }) {
  const [stacks, setStacks] = useState([
    {
      id: "STACK-A",
      name: "PEM-600 Balancer",
      tech: "Proton Exchange Membrane (PEM)",
      capacityKw: 600,
      currentPowerKw: 480,
      setpointPct: 80,
      cellVoltage: 1.84,
      stackTemp: 72.4,
      systemPressureBar: 30.2,
      faradayEfficiencyPct: 98.6,
      h2MassFlowKgh: 9.23,
      waterFlowLph: 83.1,
      status: "ONLINE",
      hoursRun: 8420,
      degradationPct: 3.2,
    },
    {
      id: "STACK-B",
      name: "AEL-1000 Base-Load",
      tech: "Pressurized Alkaline (AEL)",
      capacityKw: 1000,
      currentPowerKw: 720,
      setpointPct: 72,
      cellVoltage: 1.92,
      stackTemp: 66.1,
      systemPressureBar: 28.0,
      faradayEfficiencyPct: 95.8,
      h2MassFlowKgh: 12.85,
      waterFlowLph: 115.6,
      status: "ONLINE",
      hoursRun: 14200,
      degradationPct: 5.8,
    },
    {
      id: "STACK-C",
      name: "SOEC-400 High-Temp",
      tech: "Solid Oxide Steam (SOEC)",
      capacityKw: 400,
      currentPowerKw: 310,
      setpointPct: 77.5,
      cellVoltage: 1.28,
      stackTemp: 752.0,
      systemPressureBar: 1.2,
      faradayEfficiencyPct: 99.1,
      h2MassFlowKgh: 7.38,
      waterFlowLph: 66.4,
      status: "ONLINE",
      hoursRun: 3600,
      degradationPct: 1.4,
    }
  ]);

  const totalCapacityKw = stacks.reduce((s, st) => s + st.capacityKw, 0);
  const totalPowerKw = stacks.reduce((s, st) => s + (st.status === 'ONLINE' ? st.currentPowerKw : 0), 0);
  const totalH2Kgh = stacks.reduce((s, st) => s + (st.status === 'ONLINE' ? st.h2MassFlowKgh : 0), 0);
  const totalWaterLph = stacks.reduce((s, st) => s + (st.status === 'ONLINE' ? st.waterFlowLph : 0), 0);

  const chartData = stacks.map((s) => ({
    name: s.id,
    tech: s.tech,
    activePower: s.status === 'ONLINE' ? s.currentPowerKw : 0,
    availableHeadroom: s.status === 'ONLINE' ? s.capacityKw - s.currentPowerKw : 0,
    h2Flow: s.status === 'ONLINE' ? s.h2MassFlowKgh : 0,
  }));

  const toggleStack = (id) => {
    setStacks(prev => prev.map(st => {
      if (st.id === id) {
        const nextStatus = st.status === 'ONLINE' ? 'STANDBY' : 'ONLINE';
        return { ...st, status: nextStatus };
      }
      return st;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Fleet Overview Header Banner */}
      <div className="glass-panel rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Multi-Stack Fleet Dispatch & Telemetry Monitor
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time balance-of-plant orchestration across heterogeneous PEM, Alkaline, and SOEC cell architectures
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Plant Interlocks OK
            </span>
            <span className="glass-pill text-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-mono">
              H2 Purity: <strong className="text-white">99.999%</strong>
            </span>
          </div>
        </div>

        {/* Global Fleet Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="glass-card p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Fleet Power</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-white font-mono">{totalPowerKw}</span>
              <span className="text-xs text-slate-400">/ {totalCapacityKw} kW</span>
            </div>
            <div className="text-[10px] text-cyan-400 mt-1 font-mono">
              Utilization: {((totalPowerKw / totalCapacityKw) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Hydrogen Mass Flow</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-400 font-mono">{totalH2Kgh.toFixed(2)}</span>
              <span className="text-xs text-slate-400">kg/hr</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Daily Run-Rate: {(totalH2Kgh * 24).toFixed(0)} kg/day
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">DI Water Consumption</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-cyan-400 font-mono">{totalWaterLph.toFixed(1)}</span>
              <span className="text-xs text-slate-400">L/hr</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              Demineralized feed: 18 MΩ·cm
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Fleet Safety Margin</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-white font-mono">100%</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">
              Gas-crossover: &lt; 0.8% LEL
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Load Sharing Chart */}
      <div className="glass-panel rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Real-Time Stack Power Sharing & Headroom (kW)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">3 Heterogeneous Stacks Active</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
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
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="activePower" name="Active Load (kW)" fill="#06b6d4" stackId="a" radius={[0, 0, 4, 4]} />
              <Bar dataKey="availableHeadroom" name="Available Headroom (kW)" fill="rgba(255, 255, 255, 0.08)" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Stack Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stacks.map((stack) => (
          <div
            key={stack.id}
            className={`glass-card rounded-3xl p-5 shadow-xl transition relative ${
              stack.status === 'ONLINE'
                ? 'hover:border-cyan-500/50'
                : 'border-rose-500/30 opacity-70'
            }`}
          >
            {/* Top Info */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stack.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80' : 'bg-rose-500'}`} />
                  <span className="font-bold text-sm text-white">{stack.id}</span>
                  <span className="text-[10px] glass-pill text-slate-300 font-mono px-2 py-0.5 rounded-md">
                    {stack.capacityKw} kW
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{stack.name}</div>
              </div>

              <button
                onClick={() => toggleStack(stack.id)}
                className={`p-2 rounded-xl transition ${
                  stack.status === 'ONLINE'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                }`}
                title={stack.status === 'ONLINE' ? "Set to Standby" : "Activate Stack"}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics List */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Power Setpoint:</span>
                <span className="text-cyan-300 font-bold">{stack.currentPowerKw} kW ({stack.setpointPct}%)</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Avg Cell Voltage:</span>
                <span className="text-white font-bold">{stack.cellVoltage} V</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Operating Temp:</span>
                <span className={stack.stackTemp > 500 ? "text-amber-300 font-bold" : "text-emerald-300 font-bold"}>
                  {stack.stackTemp}°C
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Faraday Efficiency:</span>
                <span className="text-emerald-400 font-bold">{stack.faradayEfficiencyPct}%</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">H2 Mass Output:</span>
                <span className="text-white font-bold">{stack.h2MassFlowKgh} kg/hr</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Operating Life / Wear:</span>
                <span className="text-purple-300 font-bold">{stack.hoursRun} hrs ({stack.degradationPct}% wear)</span>
              </div>
            </div>

            {/* Load bar */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Stack Loading</span>
                <span className="font-mono text-slate-200">{stack.setpointPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${stack.setpointPct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
