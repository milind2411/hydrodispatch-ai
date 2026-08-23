import React from 'react';
import { useAuth } from '../store/useAuthStore';
import {
  Activity, Server, Cpu, Sliders, Award, ChevronLeft, ChevronRight,
  Radio, ShieldCheck, Zap, Download, RefreshCw, Layers, UserCheck, Shield, Sparkles,
  Flame, BatteryCharging, Gauge, CheckCircle2, Wifi, CircleDot
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  isOffline,
  onRefresh,
  loading
}) {
  const { currentPersona } = useAuth();

  const navSections = [
    {
      title: 'Core Platform',
      items: [
        {
          id: 'overview',
          label: 'Platform Overview',
          shortLabel: 'Overview',
          icon: Sparkles,
          badge: 'Hub',
          accent: 'text-cyan-400',
          activeBg: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/40 text-cyan-300'
        },
        {
          id: 'dashboard',
          label: 'Live Dispatch & SCADA',
          shortLabel: 'Dispatch',
          icon: Activity,
          badge: '96 Steps',
          accent: 'text-emerald-400',
          activeBg: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/40 text-emerald-300'
        },
      ]
    },
    {
      title: 'Digital Twin & Fleet',
      items: [
        {
          id: 'fleet',
          label: 'Multi-Stack Fleet',
          shortLabel: 'Fleet',
          icon: Server,
          badge: '3 Stacks',
          accent: 'text-purple-400',
          activeBg: 'from-purple-500/20 to-purple-500/5 border-purple-500/40 text-purple-300'
        },
        {
          id: 'degradation',
          label: 'Degradation Twin',
          shortLabel: 'Twin',
          icon: Cpu,
          badge: 'V-I Curve',
          accent: 'text-sky-400',
          activeBg: 'from-sky-500/20 to-sky-500/5 border-sky-500/40 text-sky-300'
        },
      ]
    },
    {
      title: 'Simulation & Audit',
      items: [
        {
          id: 'sandbox',
          label: 'Scenario Sandbox',
          shortLabel: 'Sandbox',
          icon: Sliders,
          badge: 'MILP',
          accent: 'text-amber-400',
          activeBg: 'from-amber-500/20 to-amber-500/5 border-amber-500/40 text-amber-300'
        },
        {
          id: 'compliance',
          label: 'Compliance Ledger',
          shortLabel: 'Ledger',
          icon: Award,
          badge: 'SHA-256',
          accent: 'text-teal-400',
          activeBg: 'from-teal-500/20 to-teal-500/5 border-teal-500/40 text-teal-300'
        },
      ]
    }
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#080d1a]/85 backdrop-blur-2xl border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 select-none z-30 shadow-2xl relative ${
        collapsed ? 'w-[78px]' : 'w-[276px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Glowing Animated App Icon */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Zap className="w-5 h-5 text-black fill-current" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#080d1a] animate-pulse" />
          </div>

          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-wider uppercase font-sans">
                  HydroDispatch
                </span>
                <span className="text-[9px] bg-cyan-500/15 text-cyan-300 font-mono font-bold px-1.5 py-0.2 rounded-md border border-cyan-500/30">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Green H2 SCADA Core
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition shadow-sm"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List by Sections */}
      <div className="flex-1 py-4 px-2.5 space-y-4 overflow-y-auto custom-scrollbar">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed ? (
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                {sec.title}
              </div>
            ) : (
              <div className="h-px bg-slate-800/80 my-2 mx-1" />
            )}

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition group relative border ${
                    isActive
                      ? `bg-gradient-to-r ${item.activeBg} shadow-md shadow-cyan-500/5`
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border-transparent hover:border-slate-800/60'
                  }`}
                  title={collapsed ? `${item.label} (${item.badge})` : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? item.accent : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />

                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      <span
                        className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md border ${
                          isActive
                            ? 'bg-slate-950/80 border-cyan-500/30 text-cyan-300'
                            : 'bg-slate-900/80 border-slate-800 text-slate-500 group-hover:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  )}

                  {/* Active Indicator Left Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-cyan-400 to-emerald-400 rounded-r-full shadow-sm shadow-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Operator Profile Card & Live Telemetry Panel */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/70 space-y-3">
        {!collapsed ? (
          <>
            {/* Active Persona Clearance Card */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-lg ${currentPersona.avatarBg} text-black font-extrabold text-[10px] flex items-center justify-center shadow-sm`}>
                    <Shield className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200 leading-tight">
                      {currentPersona.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {currentPersona.id}
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${currentPersona.accentBg} ${currentPersona.accentBorder} ${currentPersona.accentText}`}>
                  {currentPersona.badge}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{currentPersona.clearanceLevel}</span>
              </div>
            </div>

            {/* Industrial SCADA Telemetry Monitor Box */}
            <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[10px]">
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  Modbus-TCP Link:
                </span>
                <span className="text-emerald-400 font-bold">18ms (Sync)</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  Grid Frequency:
                </span>
                <span className="text-cyan-300 font-bold">50.02 Hz</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3 h-3 text-purple-400" />
                  Active Stacks:
                </span>
                <span className="text-white font-bold">3/3 Online</span>
              </div>
            </div>

            {/* Sync Optimizer Action Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition shadow-md disabled:opacity-50 group hover:border-cyan-500/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Re-Solving MILP...' : 'Sync Optimizer Core'}</span>
            </button>
          </>
        ) : (
          /* Collapsed Mode Footer Icons */
          <div className="flex flex-col items-center space-y-3 py-1">
            <div
              className={`h-8 w-8 rounded-xl ${currentPersona.avatarBg} text-black flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition`}
              title={`${currentPersona.name} • ${currentPersona.clearanceLevel}`}
            >
              <Shield className="w-4 h-4 fill-current" />
            </div>

            <div className="relative">
              <span
                className={`h-2.5 w-2.5 rounded-full inline-block ${
                  isOffline ? 'bg-amber-400' : 'bg-emerald-400'
                } animate-pulse shadow-md shadow-emerald-400/40`}
                title={isOffline ? 'Offline Simulation Mode' : 'Live Online Modbus SCADA (18ms)'}
              />
            </div>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition group shadow-md"
              title="Sync Optimizer Core"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
