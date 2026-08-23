import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../store/useAuthStore';
import {
  UserCheck, Shield, ChevronDown, Check, X, ShieldAlert,
  Sparkles, Award, TrendingUp, Activity, Lock
} from 'lucide-react';

export default function RoleSwitcher() {
  const { activeRole, currentPersona, allPersonas, setRole } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPersonaIcon = (roleKey) => {
    switch (roleKey) {
      case 'operator': return Activity;
      case 'trader': return TrendingUp;
      case 'auditor': return Award;
      default: return Shield;
    }
  };

  const CurrentIcon = getPersonaIcon(activeRole);

  return (
    <>
      {/* Top Navbar Role Trigger Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl glass-button text-slate-200 hover:text-white transition group shadow-sm"
        title="Switch Operator Profile & Clearance Level"
      >
        <div className={`h-6 w-6 rounded-lg ${currentPersona.avatarBg} text-black font-extrabold text-[11px] flex items-center justify-center shrink-0 shadow-sm`}>
          <CurrentIcon className="w-3.5 h-3.5 fill-current" />
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">
              {currentPersona.name}
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold uppercase ${currentPersona.accentBg} ${currentPersona.accentBorder} ${currentPersona.accentText}`}>
              {currentPersona.badge}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            {currentPersona.id} • {currentPersona.clearanceLevel.split(' ')[0]} {currentPersona.clearanceLevel.split(' ')[1]}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition shrink-0 ml-0.5" />
      </button>

      {/* Role Switcher Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-in fade-in">
          <div className="w-full max-w-2xl glass-modal rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Role-Based Access Control (RBAC) Switcher
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Select a simulated industrial persona to preview role-scoped permissions, financial tools, and compliance signing
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl glass-button text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Persona Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
              {Object.entries(allPersonas).map(([key, persona]) => {
                const isSelected = activeRole === key;
                const Icon = getPersonaIcon(key);

                return (
                  <div
                    key={key}
                    onClick={() => {
                      setRole(key);
                      setIsModalOpen(false);
                    }}
                    className={`rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between group relative ${
                      isSelected
                        ? `${persona.accentBg} ${persona.accentBorder} shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/40 backdrop-blur-xl`
                        : 'glass-card-interactive hover:bg-white/[0.08]'
                    }`}
                  >
                    {/* Top Status */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`h-8 w-8 rounded-xl ${persona.avatarBg} text-black font-extrabold flex items-center justify-center shadow-md`}>
                          <Icon className="w-4 h-4 fill-current" />
                        </div>
                        {isSelected ? (
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                            <Check className="w-3 h-3" /> ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300">
                            {persona.id}
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                        {persona.name}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        {persona.badge}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {persona.clearanceLevel}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">
                        {persona.description}
                      </p>
                    </div>

                    {/* Permissions list snippet */}
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-1 text-[10px]">
                      {persona.permissions.slice(0, 2).map((perm, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="truncate">{perm}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action button */}
                    <button
                      className={`w-full mt-4 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/25'
                          : 'glass-button text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Current Active Role' : 'Switch to Persona'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Note */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero-friction demo mode: No passwords required. All roles unrestricted.</span>
              </div>
              <span className="text-[10px] font-mono">HydroDispatch Auth v2.0</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
