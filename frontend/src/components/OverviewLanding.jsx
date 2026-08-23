import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LandingHero from './LandingHero';
import FeatureScrollSection from './FeatureScrollSection';
import InteractiveScrollTimeline from './InteractiveScrollTimeline';
import {
  Zap, Activity, Cpu, ShieldCheck, Layers, TrendingDown,
  Server, Radio, BatteryCharging, Coins, Award, ArrowRight,
  CheckCircle2, Sparkles, Flame, Leaf, Gauge,
  FileCode2, SlidersHorizontal, ChevronRight, ExternalLink,
  Eye, Image as ImageIcon
} from 'lucide-react';

export default function OverviewLanding({ setActiveView, setActiveSubTab, metrics }) {
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative z-10">
      {/* 1. SCROLL-DRIVEN PARALLAX HERO & 3D TELEMETRY PREVIEW */}
      <LandingHero
        setActiveView={setActiveView}
        setActiveSubTab={setActiveSubTab}
        metrics={metrics}
        setModalImage={setModalImage}
      />

      {/* 2. STICKY 300VH FEATURE SCROLL SECTION */}
      <FeatureScrollSection
        setActiveView={setActiveView}
        setActiveSubTab={setActiveSubTab}
        metrics={metrics}
      />

      {/* 3. INTERACTIVE SCROLL PIPELINE TIMELINE */}
      <InteractiveScrollTimeline
        setActiveView={setActiveView}
        setActiveSubTab={setActiveSubTab}
      />

      {/* 4. PLANT ASSET & INFRASTRUCTURE SHOWCASE */}
      <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base md:text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-cyan-400" />
              <span>Plant Assets & Co-Optimized Hardware</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore the core physical systems managed by the HydroDispatch AI engine
            </p>
          </div>

          {/* Facility Selector Tabs */}
          <div className="flex liquid-glass-pill p-1 rounded-2xl text-xs">
            {facilities.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFacilityTab(f.id)}
                className={`px-4 py-2 rounded-xl font-bold transition ${
                  activeFacilityTab === f.id
                    ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Active Facility Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 rounded-3xl liquid-glass-panel items-center shadow-2xl">
          {/* Image Container with Zoom Button */}
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/15 group h-64 sm:h-84 shadow-lg">
            <img
              src={currentFacility.image}
              alt={currentFacility.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            <button
              onClick={() => setModalImage(currentFacility.image)}
              className="absolute top-3 right-3 p-2 rounded-xl liquid-glass-button text-slate-200 border-white/20 transition flex items-center gap-1.5 text-xs font-mono"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zoom Asset</span>
            </button>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="liquid-glass-pill px-3 py-1 rounded-xl border-white/15">
                {currentFacility.tag}
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80 backdrop-blur-md">
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
              <h3 className="text-xl font-bold text-white mt-0.5">
                {currentFacility.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentFacility.desc}
              </p>
            </div>

            {/* Spec items */}
            <div className="space-y-2.5 pt-1">
              {currentFacility.specs.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl liquid-glass-card text-xs font-mono"
                >
                  <span className="text-slate-400">{s.label}:</span>
                  <strong className="text-slate-100">{s.val}</strong>
                </div>
              ))}
            </div>

            {/* Action Button */}
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl liquid-glass-button text-xs font-bold text-cyan-300 hover:text-white transition shadow-md"
            >
              <span>Inspect Hardware in SCADA</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. QUICK JUMP SCADA TILES */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setActiveView('dashboard');
              setActiveSubTab('dispatch');
            }}
            className="p-5 rounded-3xl liquid-glass-card-interactive text-left group"
          >
            <Activity className="w-5 h-5 text-cyan-400 mb-3" />
            <div className="text-sm font-bold text-white group-hover:text-cyan-300">24h Dispatch Profile</div>
            <div className="text-xs text-slate-400 mt-1">MILP overlay & TOU</div>
          </button>

          <button
            onClick={() => {
              setActiveView('dashboard');
              setActiveSubTab('live_sim');
            }}
            className="p-5 rounded-3xl liquid-glass-card-interactive text-left group"
          >
            <Radio className="w-5 h-5 text-emerald-400 mb-3" />
            <div className="text-sm font-bold text-white group-hover:text-emerald-300">15-Min Scrubber</div>
            <div className="text-xs text-slate-400 mt-1">Live step replay</div>
          </button>

          <button
            onClick={() => setActiveView('fleet')}
            className="p-5 rounded-3xl liquid-glass-card-interactive text-left group"
          >
            <Server className="w-5 h-5 text-purple-400 mb-3" />
            <div className="text-sm font-bold text-white group-hover:text-purple-300">Multi-Stack Fleet</div>
            <div className="text-xs text-slate-400 mt-1">3-Stack thermal routing</div>
          </button>

          <button
            onClick={() => setActiveView('compliance')}
            className="p-5 rounded-3xl liquid-glass-card-interactive text-left group"
          >
            <Award className="w-5 h-5 text-amber-400 mb-3" />
            <div className="text-sm font-bold text-white group-hover:text-amber-300">Compliance Ledger</div>
            <div className="text-xs text-slate-400 mt-1">SHA-256 GHG proofs</div>
          </button>
        </div>
      </div>

      {/* 7. FLOATING PERSISTENT CTA: ENTER LIVE SCADA CONTROL ROOM */}
      <div className="sticky bottom-6 z-30 flex justify-center px-4 pointer-events-none">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          onClick={() => {
            setActiveView('dashboard');
            setActiveSubTab('dispatch');
          }}
          className="pointer-events-auto flex items-center gap-3 px-7 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-300 hover:from-cyan-300 hover:to-emerald-300 text-black font-black text-sm tracking-wide shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all border border-white/30 backdrop-blur-md"
        >
          <Activity className="w-4 h-4 animate-spin-slow" />
          <span>Enter Live SCADA Control Room</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* FULLSCREEN IMAGE MODAL PREVIEW */}
      {modalImage && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl p-4 md:p-8 flex items-center justify-center animate-in fade-in"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-5xl w-full liquid-glass-modal rounded-3xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-2xl overflow-hidden">
              <img src={modalImage} alt="Plant High-Res Preview" className="w-full h-auto max-h-[80vh] object-cover" />
            </div>
            <div className="flex items-center justify-between p-4 text-xs font-mono text-slate-300">
              <span>Green Hydrogen Infrastructure • High-Resolution Facility Asset</span>
              <button
                onClick={() => setModalImage(null)}
                className="px-4 py-2 rounded-xl liquid-glass-button text-white font-bold transition"
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
