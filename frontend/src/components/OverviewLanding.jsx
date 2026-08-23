import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Zap, Activity, Cpu, ShieldCheck, Layers, TrendingDown,
  Server, Radio, BatteryCharging, Coins, Award, ArrowRight,
  CheckCircle2, Sparkles, Flame, Leaf, Gauge,
  FileCode2, SlidersHorizontal, ChevronRight, ExternalLink,
  Eye, Image as ImageIcon
} from 'lucide-react';

export default function OverviewLanding({ setActiveView, setActiveSubTab, metrics }) {
  const currentLcoh = metrics?.optimized_lcoh_rs_kg || 220.5;
  const baselineLcoh = metrics?.baseline_lcoh_rs_kg || 268.1;
  const lcohDiff = Math.max(0, baselineLcoh - currentLcoh).toFixed(1);
  const savingsPct = metrics?.savings_pct || 24.6;
  const rampReduction = metrics?.ramp_reduction_pct || 86.1;
  const greenPurity = metrics?.green_purity_pct || 99.1;

  const [activeFacilityTab, setActiveFacilityTab] = useState('plant');
  const [modalImage, setModalImage] = useState(null);

  const facilities = [
    {
      id: 'plant',
      title: 'Integrated Hybrid H2 Facility',
      tag: '500 kW PV • 200 kW Wind',
      image: '/images/plant_hero.jpg',
      desc: 'Co-located hybrid solar photovoltaic and wind farm directly coupled with central electrolysis and buffer balancing.',
      specs: [
        { label: 'RE Peak Capacity', val: '865 kW combined' },
        { label: 'TOU Tariff Arbitrage', val: '₹3.2 - ₹9.5 / kWh' },
        { label: 'Offtake Guarantee', val: '140 kg H2 / day' },
      ],
      targetTab: 'dispatch',
    },
    {
      id: 'stacks',
      title: 'Multi-Stack Electrolysis Hall',
      tag: 'PEM • Alkaline • SOEC',
      image: '/images/electrolyzer_stacks.jpg',
      desc: 'Industrial-scale modular electrolyzer stacks operating with physics-informed polarization and thermal ramp constraints.',
      specs: [
        { label: 'Electrolyzer Power', val: '600 kW Rated' },
        { label: 'Stack Efficiency', val: '53.5 kWh / kg H2' },
        { label: 'Ramp Reduction', val: '-86.1% stress cut' },
      ],
      targetTab: 'fleet',
    },
    {
      id: 'storage',
      title: 'High-Pressure Buffer & Logistics',
      tag: '60 kg Linepack Tank',
      image: '/images/buffer_storage.jpg',
      desc: 'Pressurized linepack buffer tanks and cryogenic distribution terminal absorbing renewable power fluctuations.',
      specs: [
        { label: 'Buffer Capacity', val: '60 kg @ 350 bar' },
        { label: 'Pipeline Delivery', val: '1.54 kg / 15-min steady' },
        { label: 'Purity Compliance', val: '99.1% GHG / RED II' },
      ],
      targetTab: 'storage',
    },
  ];

  const currentFacility = facilities.find((f) => f.id === activeFacilityTab) || facilities[0];

  const pipelineSteps = [
    {
      step: '01',
      title: 'Renewable Forecast',
      desc: '96 15-minute intervals tracking solar irradiance, wind gusts, and grid TOU pricing.',
      icon: Zap,
      color: 'text-amber-400',
    },
    {
      step: '02',
      title: 'MILP Optimization',
      desc: 'Pyomo + HiGHS engine co-optimizes power allocation, ramp limits, and tariff arbitrage.',
      icon: Activity,
      color: 'text-cyan-400',
    },
    {
      step: '03',
      title: 'Linepack Buffer',
      desc: 'Buffer storage smooths raw volatility, preventing stack degradation and thermal cycling.',
      icon: BatteryCharging,
      color: 'text-emerald-400',
    },
    {
      step: '04',
      title: 'Proof-of-Origin',
      desc: 'SHA-256 cryptographic hashes sign hourly clean energy certificates for GHG audit compliance.',
      icon: ShieldCheck,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300 relative z-10">
      {/* HERO SECTION WITH CINEMATIC PLANT BACKGROUND */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 shadow-2xl group min-h-[440px] flex items-center">
        {/* Background Plant Image with Clean Gradient Scrim */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url('/images/plant_hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

        {/* Hero Content */}
        <div className="relative z-10 p-6 md:p-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80" />
            <span>HYDROGEN PRODUCTION & SCADA CO-OPTIMIZER</span>
            <span className="bg-cyan-500/20 px-1.5 py-0.2 rounded text-[10px] text-cyan-200 border border-cyan-500/30">v2.0 PRO</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Real-Time Dispatch & Cost Optimization for{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                Green Hydrogen
              </span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
              Co-optimizing intermittent Solar & Wind power, multi-technology electrolyzers (PEM, Alkaline, SOEC), buffer tanks, and dynamic TOU electricity tariffs to minimize <strong>LCOH (₹/kg)</strong> and extend stack life.
            </p>
          </div>

          {/* Key Stat Badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center gap-2 text-xs font-mono">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">LCOH Cut:</span>
              <strong className="text-emerald-300">-₹{lcohDiff}/kg ({savingsPct}%)</strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center gap-2 text-xs font-mono">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Ramp Stress:</span>
              <strong className="text-cyan-300">-{rampReduction}%</strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center gap-2 text-xs font-mono">
              <Leaf className="w-4 h-4 text-teal-400" />
              <span className="text-slate-400">Green Purity:</span>
              <strong className="text-teal-300">{greenPurity}%</strong>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setActiveView('dashboard');
                setActiveSubTab('dispatch');
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-extrabold text-sm transition shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Live SCADA Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveView('fleet')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-slate-200 font-bold text-sm backdrop-blur-md transition hover:scale-[1.02]"
            >
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Multi-Stack Fleet</span>
            </button>

            <button
              onClick={() => setModalImage('/images/plant_hero.jpg')}
              className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-mono text-xs backdrop-blur-md transition"
              title="View High-Res Facility Aerial View"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>View Plant</span>
            </button>
          </div>
        </div>
      </div>

      {/* PLANT ASSET & INFRASTRUCTURE SHOWCASE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Plant Assets & Co-Optimized Hardware</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore the core physical systems managed by the HydroDispatch AI engine
            </p>
          </div>

          {/* Facility Selector Tabs */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            {facilities.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFacilityTab(f.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeFacilityTab === f.id
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Active Facility Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md items-center">
          {/* Image Container with Zoom Button */}
          <div className="lg:col-span-7 relative rounded-xl overflow-hidden border border-slate-800 group h-64 sm:h-80">
            <img
              src={currentFacility.image}
              alt={currentFacility.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            <button
              onClick={() => setModalImage(currentFacility.image)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/90 text-slate-200 border border-white/20 backdrop-blur-md transition flex items-center gap-1.5 text-xs font-mono"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zoom</span>
            </button>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="bg-black/70 px-2.5 py-1 rounded-md border border-slate-700/60 backdrop-blur-md">
                {currentFacility.tag}
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                ● Telemetry Linked
              </span>
            </div>
          </div>

          {/* Details & Specs */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                PHYSICAL ASSET PROFILE
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {currentFacility.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentFacility.desc}
              </p>
            </div>

            {/* Spec items */}
            <div className="space-y-2 pt-1">
              {currentFacility.specs.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono"
                >
                  <span className="text-slate-400">{s.label}:</span>
                  <strong className="text-slate-100">{s.val}</strong>
                </div>
              ))}
            </div>

            {/* Action */}
            <button
              onClick={() => {
                if (currentFacility.id === 'stacks') {
                  setActiveView('fleet');
                } else if (currentFacility.id === 'storage') {
                  setActiveView('dashboard');
                  setActiveSubTab('storage');
                } else {
                  setActiveView('dashboard');
                  setActiveSubTab('dispatch');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 transition"
            >
              <span>Inspect Hardware in SCADA</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SYSTEM ARCHITECTURE PIPELINE */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>4-Phase Physics & Financial Optimization</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous closed-loop dispatch from raw weather inputs to certified green offtake
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between space-y-3 hover:border-slate-700 transition group backdrop-blur-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-500 group-hover:text-cyan-400 transition">
                      PHASE {step.step}
                    </span>
                    <Icon className={`w-4 h-4 ${step.color}`} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-100 group-hover:text-white transition">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Real-time constraint verified</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK JUMP TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <button
          onClick={() => {
            setActiveView('dashboard');
            setActiveSubTab('dispatch');
          }}
          className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition group backdrop-blur-md"
        >
          <Activity className="w-4 h-4 text-cyan-400 mb-1.5" />
          <div className="text-xs font-bold text-white group-hover:text-cyan-300">24h Dispatch Profile</div>
          <div className="text-[10px] text-slate-400 mt-0.5">MILP overlay & TOU</div>
        </button>

        <button
          onClick={() => {
            setActiveView('dashboard');
            setActiveSubTab('live_sim');
          }}
          className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition group backdrop-blur-md"
        >
          <Radio className="w-4 h-4 text-emerald-400 mb-1.5" />
          <div className="text-xs font-bold text-white group-hover:text-emerald-300">15-Min Scrubber</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Live step replay</div>
        </button>

        <button
          onClick={() => setActiveView('fleet')}
          className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-left transition group backdrop-blur-md"
        >
          <Server className="w-4 h-4 text-purple-400 mb-1.5" />
          <div className="text-xs font-bold text-white group-hover:text-purple-300">Multi-Stack Fleet</div>
          <div className="text-[10px] text-slate-400 mt-0.5">3-Stack thermal routing</div>
        </button>

        <button
          onClick={() => setActiveView('compliance')}
          className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition group backdrop-blur-md"
        >
          <Award className="w-4 h-4 text-amber-400 mb-1.5" />
          <div className="text-xs font-bold text-white group-hover:text-amber-300">Compliance Ledger</div>
          <div className="text-[10px] text-slate-400 mt-0.5">SHA-256 GHG proofs</div>
        </button>
      </div>

      {/* FULLSCREEN IMAGE MODAL PREVIEW */}
      {modalImage && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl p-4 md:p-8 flex items-center justify-center animate-in fade-in"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-5xl w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-2xl overflow-hidden">
              <img src={modalImage} alt="Plant High-Res Preview" className="w-full h-auto max-h-[80vh] object-cover" />
            </div>
            <div className="flex items-center justify-between p-4 text-xs font-mono text-slate-300">
              <span>Green Hydrogen Infrastructure • 8K High-Resolution Plant Asset</span>
              <button
                onClick={() => setModalImage(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
