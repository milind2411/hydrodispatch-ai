import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, Radio, Sun, Wind, Zap, BatteryCharging, Gauge, Leaf
} from 'lucide-react';

export default function LiveSimPlayer({ scenario, optimized, baseline, metrics, storageCapacityKg }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);

  const totalSteps = scenario?.length || 96;

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(100, 800 / speed);
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, totalSteps]);

  if (!scenario || !optimized || !baseline) return null;

  const currentSc = scenario[currentStep] || scenario[0];
  const currentOpt = optimized[currentStep] || optimized[0];
  const currentBase = baseline[currentStep] || baseline[0];

  // Cumulative sums up to current step
  const cumH2 = optimized.slice(0, currentStep + 1).reduce((acc, d) => acc + (d.h2_kg || 0), 0);
  const cumCost = optimized.slice(0, currentStep + 1).reduce((acc, d, i) => {
    const gridCost = (d.grid_power_kw || 0) * 0.25 * (scenario[i]?.tariff_rs_kwh || 0);
    const reCost = (d.re_used_kw || 0) * 0.25 * (scenario[i]?.re_lcoe_rs_kwh || 0);
    return acc + gridCost + reCost;
  }, 0);

  const handleSeek = (e) => {
    setCurrentStep(parseInt(e.target.value, 10));
  };

  const handleStep = (delta) => {
    setCurrentStep((prev) => Math.max(0, Math.min(totalSteps - 1, prev + delta)));
  };

  return (
    <div className="glass-panel rounded-3xl p-6 mb-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Live Real-Time SCADA Telemetry & Dispatch Replay
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            15-minute interval telemetry streamer demonstrating dynamic setpoint adjustments
          </p>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStep(-1)}
            disabled={currentStep === 0}
            className="p-2 rounded-xl glass-button text-slate-300 disabled:opacity-30 transition"
            title="Step Back"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-lg ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20'
                : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-emerald-400/20'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Pause' : 'Play Replay'}
          </button>

          <button
            onClick={() => handleStep(1)}
            disabled={currentStep === totalSteps - 1}
            className="p-2 rounded-xl glass-button text-slate-300 disabled:opacity-30 transition"
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
            className="p-2 rounded-xl glass-button text-slate-300 transition hover:text-white"
            title="Reset to 00:00"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="flex glass-pill p-0.5 rounded-xl text-[11px] font-bold">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  speed === s ? 'bg-cyan-400 text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress / Timeline Scrubber */}
      <div className="mb-6 glass-card p-4 rounded-2xl">
        <div className="flex justify-between items-center text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-black text-cyan-400">{currentSc.timestamp}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              currentSc.tariff_tier === 'Evening Peak' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
              currentSc.tariff_tier === 'Morning Peak' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
              currentSc.tariff_tier === 'Solar Corridor' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/40'
            }`}>
              {currentSc.tariff_tier} (₹{currentSc.tariff_rs_kwh}/kWh)
            </span>
          </div>

          <div className="text-slate-400 text-xs font-mono">
            Interval <strong className="text-white">{currentStep + 1}</strong> of {totalSteps}
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={currentStep}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
          <span>00:00 (Night Off-Peak)</span>
          <span>06:00 (Morning Peak)</span>
          <span>12:00 (Solar Peak)</span>
          <span>18:00 (Evening Peak)</span>
          <span>23:45</span>
        </div>
      </div>

      {/* Telemetry Gauge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* Gauge 1: Solar Gen */}
        <div className="glass-card p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Solar PV Power</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{currentSc.solar_kw} <span className="text-xs text-slate-400 font-normal">kW</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Available irradiance</div>
        </div>

        {/* Gauge 2: Wind Gen */}
        <div className="glass-card p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Wind Turbine</span>
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">{currentSc.wind_kw} <span className="text-xs text-slate-400 font-normal">kW</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Available gust power</div>
        </div>

        {/* Gauge 3: Optimized Electrolyzer Power */}
        <div className="glass-card p-3.5 rounded-2xl border-emerald-500/40">
          <div className="flex items-center justify-between text-[11px] text-emerald-300 mb-1 font-semibold">
            <span>Ely Setpoint</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">{currentOpt.ely_power_kw} <span className="text-xs text-emerald-300/70 font-normal">kW</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Base: <span className="text-rose-400">{currentBase.ely_power_kw} kW</span></div>
        </div>

        {/* Gauge 4: Grid Import */}
        <div className="glass-card p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Grid Power Draw</span>
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-xl font-black text-yellow-400 font-mono">{currentOpt.grid_power_kw} <span className="text-xs text-slate-400 font-normal">kW</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Tariff: ₹{currentSc.tariff_rs_kwh}/kWh</div>
        </div>

        {/* Gauge 5: H2 Buffer Tank */}
        <div className="glass-card p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Tank Inventory</span>
            <BatteryCharging className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-black text-indigo-400 font-mono">{currentOpt.storage_soc_kg} <span className="text-xs text-slate-400 font-normal">kg</span></div>
          <div className="text-[10px] text-slate-400 mt-1">{currentOpt.storage_soc_pct}% capacity</div>
        </div>

        {/* Gauge 6: Cumulative H2 Produced */}
        <div className="glass-card p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Cum. H2 Output</span>
            <Leaf className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-black text-teal-400 font-mono">{cumH2.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kg</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Cost: ₹{Math.round(cumCost).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
