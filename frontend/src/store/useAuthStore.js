import { useState, useEffect } from 'react';

export const PERSONAS = {
  operator: {
    id: "OP-7821",
    roleKey: "operator",
    name: "Rajesh Varma",
    title: "Lead Dispatch Engineer",
    department: "SCADA Plant Operations",
    clearanceLevel: "Level 2 (SCADA Dispatch)",
    badge: "Plant Operator",
    color: "cyan",
    accentBg: "bg-cyan-500/10",
    accentBorder: "border-cyan-500/30",
    accentText: "text-cyan-400",
    avatarBg: "bg-cyan-600",
    description: "Responsible for real-time plant telemetry, stack thermal bounds, buffer storage balancing, and manual MILP solver runs.",
    permissions: [
      "Real-time 15-min dispatch setpoint control",
      "Electrolyzer stack safety & thermal override",
      "Manual Pyomo + HiGHS optimization trigger",
      "Buffer tank storage inventory management",
    ]
  },
  trader: {
    id: "TR-4409",
    roleKey: "trader",
    name: "Priya Menon",
    title: "Energy Portfolio Manager",
    department: "Power Trading & Arbitrage Desk",
    clearanceLevel: "Level 3 (Market Trading & Financials)",
    badge: "Energy Trader",
    color: "amber",
    accentBg: "bg-amber-500/10",
    accentBorder: "border-amber-500/30",
    accentText: "text-amber-400",
    avatarBg: "bg-amber-600",
    description: "Optimizes green hydrogen production against dynamic day-ahead power markets, open-access wheeling, and grid TOU peak arbitrage.",
    permissions: [
      "ToD grid tariff sensitivity modeling",
      "Peak vs off-peak arbitrage cost analysis",
      "Levelized cost (LCOH) breakdown decomposition",
      "Financial dispatch ledger export (CSV/JSON)",
    ]
  },
  auditor: {
    id: "AUD-1004",
    roleKey: "auditor",
    name: "Dr. Arvind Swaminathan",
    title: "Chief ESG & Regulatory Auditor",
    department: "Clean Energy Assurance & Origin Bureau",
    clearanceLevel: "Level 4 (Origin Certification)",
    badge: "ESG Auditor",
    color: "emerald",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/30",
    accentText: "text-emerald-400",
    avatarBg: "bg-emerald-600",
    description: "Audits carbon intensity compliance (<2.0 kg CO2/kg H2) under the National Green Hydrogen Mission and issues tamper-proof certificates.",
    permissions: [
      "Cryptographic SHA-256 batch ledger signing",
      "National Green Hydrogen Mission (GHM) certification",
      "EU RFNBO hourly additionality verification",
      "Tamper-proof batch certificate generation & print",
    ]
  }
};

let globalState = {
  activeRole: 'operator',
  plantLocation: 'Gujarat Green Hydrogen Hub - Site 04',
  toastMessage: null,
};

const listeners = new Set();

export function useAuth() {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);

  const setRole = (roleKey) => {
    if (!PERSONAS[roleKey]) return;
    const persona = PERSONAS[roleKey];
    globalState = {
      ...globalState,
      activeRole: roleKey,
      toastMessage: `Switched profile to ${persona.badge} (${persona.name}) • ${persona.clearanceLevel}`,
    };
    listeners.forEach((listener) => listener(globalState));

    // Auto clear toast after 4s
    setTimeout(() => {
      if (globalState.toastMessage) {
        globalState = { ...globalState, toastMessage: null };
        listeners.forEach((listener) => listener(globalState));
      }
    }, 4000);
  };

  const clearToast = () => {
    globalState = { ...globalState, toastMessage: null };
    listeners.forEach((listener) => listener(globalState));
  };

  return {
    activeRole: state.activeRole,
    currentPersona: PERSONAS[state.activeRole] || PERSONAS.operator,
    plantLocation: state.plantLocation,
    toastMessage: state.toastMessage,
    setRole,
    clearToast,
    allPersonas: PERSONAS,
  };
}
