import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Activity, Cpu, ShieldCheck, TrendingDown, Coins, Clock,
  ArrowRight, CheckCircle2, AlertTriangle, Layers, Gauge, Sparkles
} from 'lucide-react';

export default function FeatureScrollSection({ setActiveView, setActiveSubTab, metrics }) {
  const [activeStep, setActiveStep] = useState(1);

  const savingsPct = metrics?.savings_pct || 24.6;
  const rampReduction = metrics?.ramp_reduction_pct || 86.1;
  const optLcoh = metrics?.optimized_lcoh_rs_kg || 220.5;
  const baseLcoh = metrics?.baseline_lcoh_rs_kg || 268.1;

  return (
    <div className="max-w-6xl w-full mx-auto px-4 md:px-8 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono">
              PHYSICS-INFORMED MULTI-OBJECTIVE OPTIMIZATION
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            How stochastic weather inputs translate into guaranteed green hydrogen delivery & lowest LCOH
          </p>
        </div>

        {/* Interactive Step Selector Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 1, label: '01. Weather Intermittency' },
            { id: 2, label: '02. MILP Solver' },
            { id: 3, label: '03. Cost & Lifetime Gains' },
          ].map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
                activeStep === step.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/15 scale-105'
                  : 'glass-button text-slate-400 hover:text-white'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeStep === step.id ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Metrics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl liquid-glass-card flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">LCOH Cost Reduction</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              -{savingsPct}%
            </div>
            <div className="text-[10px] text-slate-400">vs. Uncoordinated Baseline</div>
          </div>
          <Coins className="w-6 h-6 text-emerald-400/80" />
        </div>

        <div className="p-4 rounded-2xl liquid-glass-card flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Ramp Stress Cut</div>
            <div className="text-2xl font-black text-cyan-400 mt-0.5">
              -{rampReduction}%
            </div>
            <div className="text-[10px] text-slate-400">Degradation Life Extended</div>
          </div>
          <TrendingDown className="w-6 h-6 text-cyan-400/80" />
        </div>

        <div className="p-4 rounded-2xl liquid-glass-card flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Pyomo Solver Latency</div>
            <div className="text-2xl font-black text-purple-300 mt-0.5">
              &lt;85 ms
            </div>
            <div className="text-[10px] text-slate-400">HiGHS MILP 96-Horizon</div>
          </div>
          <Clock className="w-6 h-6 text-purple-400/80" />
        </div>
      </div>

      {/* Stepped Interactive Panel */}
      <div className="rounded-3xl liquid-glass-panel border-white/20 p-6 sm:p-8 shadow-2xl">
        <AnimatePresence mode="wait">
          {activeStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono">
                  <Zap className="w-3.5 h-3.5" />
                  <span>STEP 01 • STOCHASTIC INTERMITTENCY</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Diurnal Solar Irradiance & Stochastic Wind Turbulence
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  Captures continuous 15-minute weather variance across 96 time steps. Sudden cloud cover drops and wind gusts create severe degradation in uncoordinated direct-following stacks.
                </p>
              </div>

              {/* Step 1 Visual Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl liquid-glass-card space-y-1">
                  <span className="text-[11px] text-amber-300 font-mono font-bold">Solar PV Corridor</span>
                  <div className="text-xl font-black text-white font-mono">500 kW Peak</div>
                  <p className="text-[10px] text-slate-400">Diurnal bell-curve generation with stochastic cloud shading</p>
                </div>
                <div className="p-4 rounded-2xl liquid-glass-card space-y-1">
                  <span className="text-[11px] text-cyan-300 font-mono font-bold">Wind Profile</span>
                  <div className="text-xl font-black text-white font-mono">200 kW Mean</div>
                  <p className="text-[10px] text-slate-400">Night generation offsetting solar absence during off-peak hours</p>
                </div>
                <div className="p-4 rounded-2xl liquid-glass-card space-y-1">
                  <span className="text-[11px] text-rose-300 font-mono font-bold">TOU Peak Tariffs</span>
                  <div className="text-xl font-black text-white font-mono">₹9.50 / kWh</div>
                  <p className="text-[10px] text-slate-400">Evening tariff spike avoided via linepack buffer depletion</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                  <Activity className="w-3.5 h-3.5" />
                  <span>STEP 02 • MATHEMATICAL DYNAMIC SCHEDULING</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Pyomo + HiGHS Mixed-Integer Linear Programming Engine
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  Co-optimizes multi-stack setpoints, linepack tank inventory, and minimum turndown constraints (10% - 100%) to enforce smooth power transitions (&Delta;P &le; 15% per 15-min).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl liquid-glass-card border-rose-500/30 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-rose-400 font-bold">Naive Baseline Tracking</span>
                    <span className="text-rose-300">Ramp: 53.9 kW/step</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[85%]" />
                  </div>
                  <p className="text-[10px] text-slate-400">Directly couples intermittent spikes into stacks, accelerating membrane pinhole degradation.</p>
                </div>

                <div className="p-4 rounded-2xl liquid-glass-card border-emerald-500/30 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-emerald-400 font-bold">HydroDispatch AI Co-Optimized</span>
                    <span className="text-emerald-300">Ramp: 7.5 kW/step</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[15%]" />
                  </div>
                  <p className="text-[10px] text-slate-400">Smooth setpoint plateaus absorb shocks with the buffer tank, maintaining high Faraday efficiency.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  <Coins className="w-3.5 h-3.5" />
                  <span>STEP 03 • FINANCIAL & STACK LIFETIME GAINS</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  LCOH Reduced from ₹{baseLcoh} → ₹{optLcoh} / kg H₂
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  By eliminating peak grid tariffs and avoiding catalyst dissolution from rapid power swings, project economics improve dramatically with extended stack operational lifespan.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="liquid-glass-pill px-3 py-1.5 text-xs font-mono text-emerald-300">
                    Daily Savings: <strong className="text-white">₹{metrics?.daily_savings_rs || '8,160'} / day</strong>
                  </span>
                  <span className="liquid-glass-pill px-3 py-1.5 text-xs font-mono text-cyan-300">
                    Stack Life: <strong className="text-white">+3.4 Years</strong>
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    setActiveSubTab('dispatch');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-extrabold text-xs transition shadow-lg shadow-cyan-400/25 hover:scale-105"
                >
                  <span>Launch SCADA Optimization Simulator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
