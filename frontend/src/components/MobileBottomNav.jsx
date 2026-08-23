import React from 'react';
import { Activity, Server, Award, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function MobileBottomNav({
  activeView,
  setActiveView,
  onOpenDrawer,
  activeRole,
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Hub',
      fullLabel: 'Platform Overview',
      icon: Sparkles,
      tag: 'Intro',
    },
    {
      id: 'dashboard',
      label: 'Live SCADA',
      fullLabel: 'Live Dispatch SCADA',
      icon: Activity,
      tag: '96 Steps',
    },
    {
      id: 'fleet',
      label: 'Fleet Health',
      fullLabel: 'Electrolyzer Fleet',
      icon: Server,
      tag: '3 Stacks',
    },
    {
      id: 'compliance',
      label: 'Batch Ledger',
      fullLabel: 'Origin Certs',
      icon: Award,
      tag: 'SHA-256',
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/70 backdrop-blur-2xl border-t border-white/15 px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl shadow-black/80">
      <div className="flex items-center justify-between max-w-md mx-auto gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1.5 rounded-2xl transition-all active:scale-95 touch-manipulation ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40 shadow-lg shadow-cyan-500/15 backdrop-blur-xl'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-white/5'
              }`}
            >
              <div className={`p-1 rounded-xl transition ${isActive ? 'text-cyan-400 scale-110' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Quick Scenario Parameters Trigger */}
        <button
          onClick={onOpenDrawer}
          className="flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1.5 rounded-2xl text-amber-300 bg-amber-500/15 border border-amber-400/40 hover:bg-amber-500/25 active:scale-95 transition touch-manipulation shadow-md shadow-amber-500/10 backdrop-blur-xl"
          title="Open Scenario Simulation Sandbox"
        >
          <div className="p-1 rounded-xl text-amber-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-tight leading-tight mt-0.5 whitespace-nowrap text-amber-300">
            Params
          </span>
        </button>
      </div>
    </div>
  );
}
