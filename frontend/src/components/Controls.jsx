import React from 'react';
import { Play, RotateCcw, Sliders, Zap, Sun, Wind, BatteryCharging, Factory, Sparkles, X, Layers, Coins } from 'lucide-react';

const PRESETS = [
  {
    name: "Solar + BESS Arbitrage",
    desc: "Coupled 200kWh BESS with peak-shaving & O2 monetization",
    params: { peak_solar_kw: 850, mean_wind_kw: 150, cloud_cover: 0.05, wind_variance: 0.15, peak_price: 11.0, offpeak_price: 3.0, re_lcoe: 2.3, ely_type: "PEM", ely_capacity_kw: 600, daily_h2_target_kg: 160, storage_capacity_kg: 70, bess_capacity_kwh: 200, bess_power_kw: 60, o2_price_rs_kg: 8.0 }
  },
  {
    name: "Monsoon Wind Surge",
    desc: "Heavy cloud attenuation with gusty wind spikes",
    params: { peak_solar_kw: 350, mean_wind_kw: 400, cloud_cover: 0.65, wind_variance: 0.45, peak_price: 11.0, offpeak_price: 3.5, re_lcoe: 2.6, ely_type: "PEM", ely_capacity_kw: 600, daily_h2_target_kg: 130, storage_capacity_kg: 80, bess_capacity_kwh: 150, bess_power_kw: 40, o2_price_rs_kg: 5.0 }
  },
  {
    name: "Alkaline Heavy Baseload",
    desc: "Industrial continuous operation with Alkaline stack",
    params: { peak_solar_kw: 500, mean_wind_kw: 250, cloud_cover: 0.2, wind_variance: 0.25, peak_price: 9.5, offpeak_price: 3.2, re_lcoe: 2.4, ely_type: "Alkaline", ely_capacity_kw: 800, daily_h2_target_kg: 180, storage_capacity_kg: 100, bess_capacity_kwh: 0, bess_power_kw: 0, o2_price_rs_kg: 6.0 }
  },
  {
    name: "High-Efficiency SOEC Steam",
    desc: "Solid Oxide Steam high-temperature electrolysis",
    params: { peak_solar_kw: 600, mean_wind_kw: 200, cloud_cover: 0.15, wind_variance: 0.2, peak_price: 12.0, offpeak_price: 3.0, re_lcoe: 2.2, ely_type: "SOEC", ely_capacity_kw: 500, daily_h2_target_kg: 150, storage_capacity_kg: 50, bess_capacity_kwh: 100, bess_power_kw: 30, o2_price_rs_kg: 10.0 }
  }
];

export default function Controls({ params, setParams, onRun, loading, isDrawer, onCloseDrawer }) {
  const handleChange = (field, value) => {
    setParams(prev => ({ ...prev, [field]: typeof value === 'number' ? value : parseFloat(value) || value }));
  };

  const handleReset = () => {
    setParams({
      peak_solar_kw: 500.0,
      mean_wind_kw: 200.0,
      cloud_cover: 0.2,
      wind_variance: 0.3,
      peak_price: 9.5,
      offpeak_price: 3.2,
      re_lcoe: 2.4,
      ely_type: "PEM",
      ely_capacity_kw: 600.0,
      daily_h2_target_kg: 140.0,
      storage_capacity_kg: 60.0,
      bess_capacity_kwh: 0.0,
      bess_power_kw: 0.0,
      o2_price_rs_kg: 0.0,
    });
  };

  const applyPreset = (preset) => {
    setParams(preset.params);
  };

  const content = (
    <div className={`glass-panel rounded-3xl p-6 shadow-2xl ${isDrawer ? 'h-full overflow-y-auto' : 'mb-6'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5 text-slate-100 font-bold text-sm tracking-wide">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Interactive Scenario Simulation Sandbox</span>
          </div>
          {isDrawer && (
            <button onClick={onCloseDrawer} className="sm:hidden p-1.5 rounded-xl glass-button text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-button text-slate-300 text-xs font-semibold transition hover:text-white">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={() => { onRun(); if (isDrawer && onCloseDrawer) onCloseDrawer(); }}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black text-xs font-extrabold transition shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {loading ? 'Solving MILP...' : 'Run Dispatch Solver'}
          </button>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Scenario Presets:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="p-2.5 rounded-xl glass-card text-left transition hover:border-cyan-500/40 hover:bg-cyan-500/10 group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition">
                {p.name}
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {p.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-4 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sun className="w-3.5 h-3.5" />
            <span>Renewable Resources</span>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Peak Solar PV</span>
              <span className="text-amber-400 font-mono font-bold">{params.peak_solar_kw} kW</span>
            </div>
            <input type="range" min="100" max="2000" step="50" value={params.peak_solar_kw} onChange={(e) => handleChange('peak_solar_kw', e.target.value)} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-amber-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Mean Wind Power</span>
              <span className="text-cyan-400 font-mono font-bold">{params.mean_wind_kw} kW</span>
            </div>
            <input type="range" min="0" max="1000" step="25" value={params.mean_wind_kw} onChange={(e) => handleChange('mean_wind_kw', e.target.value)} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Cloud Cover Factor</span>
              <span className="text-amber-400 font-mono font-bold">{Math.round(params.cloud_cover * 100)}%</span>
            </div>
            <input type="range" min="0.0" max="0.9" step="0.05" value={params.cloud_cover} onChange={(e) => handleChange('cloud_cover', e.target.value)} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-amber-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Wind Volatility / Gusts</span>
              <span className="text-cyan-400 font-mono font-bold">{params.wind_variance}</span>
            </div>
            <input type="range" min="0.1" max="0.6" step="0.05" value={params.wind_variance} onChange={(e) => handleChange('wind_variance', e.target.value)} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>TOU Tariffs & BESS Co-Dispatch</span>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Peak Grid Tariff</span>
              <span className="text-rose-400 font-mono font-bold">₹{params.peak_price}/kWh</span>
            </div>
            <input type="range" min="5.0" max="18.0" step="0.5" value={params.peak_price} onChange={(e) => handleChange('peak_price', e.target.value)} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-rose-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Off-Peak Grid Tariff</span>
              <span className="text-emerald-400 font-mono font-bold">₹{params.offpeak_price}/kWh</span>
            </div>
            <input type="range" min="1.5" max="6.0" step="0.2" value={params.offpeak_price} onChange={(e) => handleChange('offpeak_price', e.target.value)} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-emerald-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>BESS Battery Capacity</span>
              <span className="text-purple-400 font-mono font-bold">{params.bess_capacity_kwh || 0} kWh</span>
            </div>
            <input type="range" min="0" max="500" step="25" value={params.bess_capacity_kwh || 0} onChange={(e) => { const cap = parseFloat(e.target.value); handleChange('bess_capacity_kwh', cap); if (cap > 0 && (!params.bess_power_kw || params.bess_power_kw === 0)) { handleChange('bess_power_kw', Math.round(cap * 0.3)); } }} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-purple-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Byproduct O2 Credit Price</span>
              <span className="text-teal-400 font-mono font-bold">₹{params.o2_price_rs_kg || 0}/kg O2</span>
            </div>
            <input type="range" min="0" max="20" step="1" value={params.o2_price_rs_kg || 0} onChange={(e) => handleChange('o2_price_rs_kg', e.target.value)} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-teal-400" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Electrolyzer & Linepack Storage</span>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1.5">Electrolyzer Chemistry:</div>
            <div className="grid grid-cols-3 gap-2">
              {['PEM', 'Alkaline', 'SOEC'].map((tech) => (
                <button
                  key={tech}
                  onClick={() => handleChange('ely_type', tech)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${params.ely_type === tech ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'glass-button text-slate-400 hover:text-white'}`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Electrolyzer Rating</span>
              <span className="text-emerald-400 font-mono font-bold">{params.ely_capacity_kw} kW</span>
            </div>
            <input type="range" min="200" max="2000" step="50" value={params.ely_capacity_kw} onChange={(e) => handleChange('ely_capacity_kw', e.target.value)} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-emerald-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Daily H2 Offtake Target</span>
              <span className="text-emerald-400 font-mono font-bold">{params.daily_h2_target_kg} kg/day</span>
            </div>
            <input type="range" min="30" max="500" step="10" value={params.daily_h2_target_kg} onChange={(e) => handleChange('daily_h2_target_kg', e.target.value)} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-emerald-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>H2 Buffer Storage Tank</span>
              <span className="text-indigo-400 font-mono font-bold">{params.storage_capacity_kg} kg</span>
            </div>
            <input type="range" min="10" max="200" step="10" value={params.storage_capacity_kg} onChange={(e) => handleChange('storage_capacity_kg', e.target.value)} className="w-full h-1.5 bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  );

  if (isDrawer) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-end bg-black/80 backdrop-blur-md animate-in fade-in"
        onClick={onCloseDrawer}
      >
        <div 
          className="w-full sm:max-w-xl glass-modal border-t sm:border-t-0 sm:border-l border-white/15 p-4 sm:p-6 max-h-[90vh] sm:max-h-full sm:h-full overflow-y-auto rounded-t-3xl sm:rounded-none pb-24 sm:pb-6 safe-area-pb"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Handle Indicator */}
          <div className="sm:hidden w-12 h-1.5 bg-white/25 rounded-full mx-auto mb-3" />
          {content}
        </div>
      </div>
    );
  }

  return content;
}
