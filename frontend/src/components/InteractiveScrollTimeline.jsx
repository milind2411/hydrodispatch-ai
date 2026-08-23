import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  Server, BatteryCharging, Activity, Award, ShieldCheck, Zap,
  CheckCircle2, ArrowRight, Gauge, Cpu, Droplets, Sparkles
} from 'lucide-react';

export default function InteractiveScrollTimeline({ setActiveView, setActiveSubTab }) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const milestones = [
    {
      id: '01',
      title: 'Electrolyzer Stack Orchestration',
      subtitle: 'Heterogeneous PEM, Alkaline & SOEC Fleet',
      desc: 'Physics-informed dispatch dynamic load allocation across stacks with varying Faraday efficiency, minimum turndown (10%), and thermal startup curves.',
      icon: Server,
      color: 'text-cyan-400',
      badge: '53.5 kWh / kg H2',
      targetView: 'fleet',
      targetTab: 'fleet',
    },
    {
      id: '02',
      title: 'Linepack Compression & Buffer Storage',
      subtitle: '60 kg Buffer Tank @ 350 bar Linepack',
      desc: 'Decouples volatile hourly electricity input from steady industrial off-take delivery (1.54 kg/15-min), eliminating thermal cycling and mechanical membrane fatigue.',
      icon: BatteryCharging,
      color: 'text-emerald-400',
      badge: '60 kg Buffer @ 350 bar',
      targetView: 'dashboard',
      targetTab: 'storage',
    },
    {
      id: '03',
      title: 'Pyomo + HiGHS Mixed-Integer Solver',
      subtitle: '96 Horizon Intervals Co-Optimized in <85ms',
      desc: 'Simultaneously solves multi-period power flows, ramp rates, state-of-charge limits, and dynamic TOU electricity pricing arbitrage to minimize levelized cost (LCOH).',
      icon: Activity,
      color: 'text-purple-400',
      badge: 'HiGHS MILP Solver',
      targetView: 'dashboard',
      targetTab: 'dispatch',
    },
    {
      id: '04',
      title: 'Grid Arbitrage & ESG Cryptographic Origin',
      subtitle: 'SHA-256 Verifiable Green Hydrogen Ledger',
      desc: 'Automates hourly Green Purity compliance against India National Green Hydrogen Mission (GHM) and EU RFNBO additionality rules with cryptographic proof certificates.',
      icon: Award,
      color: 'text-amber-400',
      badge: 'MNRE GHM ≤ 2.0 kg CO2',
      targetView: 'compliance',
      targetTab: 'compliance',
    },
  ];

  return (
    <div ref={containerRef} className="relative py-12 px-4 md:px-8 max-w-5xl mx-auto space-y-10">
      {/* Timeline Section Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-cyan-300 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>END-TO-END PHYSICAL PIPELINE</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          From Intermittent Power to Certified Green Molecule
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Scroll through the automated balance-of-plant orchestration pipeline
        </p>
      </div>

      {/* Interactive Timeline Container */}
      <div className="relative pt-6">
        {/* SVG Pipeline Line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 pointer-events-none z-0">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 32 800">
            <defs>
              <linearGradient id="pipelineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="85%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Background Track Line */}
            <line
              x1="16"
              y1="0"
              x2="16"
              y2="800"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Dynamic Scroll-Linked Glowing Fill Line */}
            <motion.line
              x1="16"
              y1="0"
              x2="16"
              y2="800"
              stroke="url(#pipelineGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#glow)"
              style={{
                pathLength: smoothProgress,
              }}
            />
          </svg>
        </div>

        {/* Milestone Node Items */}
        <div className="space-y-12 relative z-10">
          {milestones.map((node, index) => {
            const isEven = index % 2 === 0;
            const Icon = node.icon;

            return (
              <div
                key={node.id}
                className={`flex flex-col md:flex-row items-start md:items-center gap-6 ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Node Card */}
                <div className="w-full md:w-[calc(50%-2.5rem)] ml-14 md:ml-0">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 rounded-3xl liquid-glass-card-interactive space-y-3 group border-white/15"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-cyan-300 transition">
                        PHASE {node.id}
                      </span>
                      <span className="liquid-glass-pill px-2.5 py-0.5 text-[10px] font-mono text-emerald-300">
                        {node.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition">
                        {node.title}
                      </h3>
                      <div className="text-xs font-medium text-slate-400 mt-0.5">
                        {node.subtitle}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {node.desc}
                    </p>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Automated Closed-Loop
                      </span>

                      <button
                        onClick={() => {
                          if (setActiveView) setActiveView(node.targetView);
                          if (setActiveSubTab && node.targetTab) setActiveSubTab(node.targetTab);
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white transition group-hover:translate-x-0.5"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Central Milestone Icon Node Circle */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="h-12 w-12 rounded-2xl liquid-glass-panel border-white/30 flex items-center justify-center shadow-xl shadow-black/50 group hover:scale-110 transition-transform"
                  >
                    <Icon className={`w-5 h-5 ${node.color}`} />
                  </motion.div>
                </div>

                {/* Empty Spacer Column for Desktop Alternate Grid */}
                <div className="hidden md:block w-[calc(50%-2.5rem)]" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
