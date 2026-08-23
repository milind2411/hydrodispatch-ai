import React from 'react';
import { Activity, Server, Cpu, Sliders, Award, Menu, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function MobileNav({ activeView, setActiveView, onOpenDrawer }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'dashboard', label: 'Dispatch', icon: Activity },
    { id: 'fleet', label: 'Fleet', icon: Server },
    { id: 'degradation', label: 'Twin', icon: Cpu },
    { id: 'compliance', label: 'Ledger', icon: Award },
    { id: 'sandbox', label: 'Controls', icon: SlidersHorizontal },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-1.5 safe-area-pb shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'sandbox' && onOpenDrawer) {
                  onOpenDrawer();
                } else {
                  setActiveView(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 py-1 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition ${
                isActive ? 'bg-cyan-500/15 text-cyan-400 shadow-sm' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
