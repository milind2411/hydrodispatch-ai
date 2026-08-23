import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Activity, ArrowRight, Server, Eye, Coins, TrendingDown, Leaf,
  Zap, Sun, Wind, BatteryCharging, Gauge, CheckCircle2, Waves
} from 'lucide-react';

export default function LandingHero({ setActiveView, setActiveSubTab, metrics, setModalImage }) {
  const currentLcoh = metrics?.optimized_lcoh_rs_kg || 220.5;
  const baselineLcoh = metrics?.baseline_lcoh_rs_kg || 268.1;
  const lcohDiff = Math.max(0, baselineLcoh - currentLcoh).toFixed(1);
  const savingsPct = metrics?.savings_pct || 24.6;
  const rampReduction = metrics?.ramp_reduction_pct || 86.1;
  const greenPurity = metrics?.green_purity_pct || 99.1;

  return (
    <div className="relative flex flex-col justify-between pt-2 pb-6 overflow-hidden">
      {/* Background Animated Floating Energy Flow Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="energyGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="energyGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Animated Energy Streamlines */}
          <motion.path
            d="M -100 120 C 300 20, 600 280, 1400 80"
            fill="none"
            stroke="url(#energyGrad1)"
            strokeWidth="2.5"
            strokeDasharray="12 12"
            animate={{ strokeDashoffset: [0, -200] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          />
          <motion.path
            d="M -50 340 C 400 450, 800 120, 1500 380"
            fill="none"
            stroke="url(#energyGrad2)"
            strokeWidth="2"
            strokeDasharray="8 16"
            animate={{ strokeDashoffset: [0, -240] }}
            transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
          />
          <motion.path
            d="M 100 -50 C 500 300, 900 200, 1600 600"
            fill="none"
            stroke="url(#energyGrad1)"
            strokeWidth="1.5"
            strokeDasharray="15 15"
            animate={{ strokeDashoffset: [0, -300] }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          />
        </svg>
      </div>

      {/* HERO HEADER SECTION */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-4xl space-y-5">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full liquid-glass-pill text-cyan-300 text-xs font-mono font-semibold"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80" />
          <span className="tracking-wide">HYDROGEN PRODUCTION & SCADA CO-OPTIMIZER</span>
          <span className="bg-cyan-500/20 px-2 py-0.5 rounded text-[10px] text-cyan-200 border border-cyan-500/30">
            v2.0 PRO
          </span>
        </motion.div>

        {/* Headline with Staggered Word Motion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="space-y-3"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Real-Time Dispatch & Cost Optimization for{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent drop-shadow-sm">
              Green Hydrogen
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl">
            Co-optimizing intermittent Solar & Wind power, multi-technology electrolyzers (PEM, Alkaline, SOEC), buffer tanks, and dynamic TOU electricity tariffs to minimize <strong>LCOH (₹/kg)</strong> and extend stack life.
          </p>
        </motion.div>

        {/* Key Live Stat Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-wrap gap-3 pt-1"
        >
          <div className="px-4 py-2.5 rounded-2xl liquid-glass-card flex items-center gap-2.5 text-xs font-mono">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">LCOH Cut:</span>
            <strong className="text-emerald-300 font-bold">-₹{lcohDiff}/kg ({savingsPct}%)</strong>
          </div>
          <div className="px-4 py-2.5 rounded-2xl liquid-glass-card flex items-center gap-2.5 text-xs font-mono">
            <TrendingDown className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Ramp Stress:</span>
            <strong className="text-cyan-300 font-bold">-{rampReduction}%</strong>
          </div>
          <div className="px-4 py-2.5 rounded-2xl liquid-glass-card flex items-center gap-2.5 text-xs font-mono">
            <Leaf className="w-4 h-4 text-teal-400" />
            <span className="text-slate-400">Green Purity:</span>
            <strong className="text-teal-300 font-bold">{greenPurity}%</strong>
          </div>
        </motion.div>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-wrap items-center gap-3.5 pt-2"
        >
          <button
            onClick={() => {
              setActiveView('dashboard');
              setActiveSubTab('dispatch');
            }}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-sm transition shadow-xl shadow-cyan-500/25 hover:scale-[1.03] active:scale-[0.98]"
          >
            <Activity className="w-4 h-4" />
            <span>Launch Live SCADA Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveView('fleet')}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl liquid-glass-button text-slate-200 font-bold text-sm transition hover:scale-[1.02] hover:text-white"
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Multi-Stack Fleet</span>
          </button>

          <button
            onClick={() => setModalImage && setModalImage('/images/plant_hero.jpg')}
            className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl liquid-glass-button text-slate-400 hover:text-white font-mono text-xs transition"
            title="View High-Res Facility Aerial View"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>View Plant</span>
          </button>
        </motion.div>
      </div>

      {/* 3D FLOATING PHYSICS TELEMETRY PREVIEW CARD */}
      <div className="relative z-10 mt-4 px-4 md:px-8 w-full max-w-5xl mx-auto">
        <div className="relative rounded-3xl p-5 sm:p-7 liquid-glass-panel border-white/20 shadow-2xl overflow-hidden group">
          {/* Top Card SCADA Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>LIVE MILP DISPATCH CO-OPTIMIZATION CORE</span>
                  <span className="liquid-glass-pill px-2 py-0.5 text-[10px] text-cyan-300">
                    96 INTERVALS (15-MIN)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Pyomo + HiGHS Mathematical Solver Active • State: Optimal Feasible
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Interlocks Nominal
              </span>
              <span className="liquid-glass-pill text-slate-300 px-3 py-1 rounded-xl text-[11px] font-mono">
                Latency: <strong className="text-white">&lt;85ms</strong>
              </span>
            </div>
          </div>

          {/* 4 Interactive Live Preview Telemetry Meters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* Meter 1 */}
            <div className="p-3.5 rounded-2xl liquid-glass-card space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Solar PV Forecast</span>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">485.2 <span className="text-xs font-normal text-slate-400">kW</span></div>
              <div className="text-[10px] text-emerald-400 font-mono">Peak Solar Corridor</div>
            </div>

            {/* Meter 2 */}
            <div className="p-3.5 rounded-2xl liquid-glass-card space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Wind Generation</span>
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-black text-white font-mono">194.0 <span className="text-xs font-normal text-slate-400">kW</span></div>
              <div className="text-[10px] text-cyan-400 font-mono">Gust Turbulence: 14%</div>
            </div>

            {/* Meter 3 */}
            <div className="p-3.5 rounded-2xl liquid-glass-card space-y-1 border-emerald-500/30">
              <div className="flex items-center justify-between text-[11px] text-emerald-300 font-semibold">
                <span>Electrolyzer Load</span>
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-300 font-mono">540.0 <span className="text-xs font-normal text-emerald-400/70">kW</span></div>
              <div className="text-[10px] text-slate-400 font-mono">Ramp Smooth: 9.5 kW/int</div>
            </div>

            {/* Meter 4 */}
            <div className="p-3.5 rounded-2xl liquid-glass-card space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>H2 Linepack Buffer</span>
                <BatteryCharging className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-xl font-black text-indigo-300 font-mono">48.6 <span className="text-xs font-normal text-slate-400">kg</span></div>
              <div className="text-[10px] text-indigo-300 font-mono">81.0% SOC @ 350 bar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
