import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import KpiCards from './components/KpiCards';
import Controls from './components/Controls';
import DispatchChart from './components/DispatchChart';
import StorageChart from './components/StorageChart';
import FinancialWaterfall from './components/FinancialWaterfall';
import LiveSimPlayer from './components/LiveSimPlayer';
import FleetMonitor from './components/FleetMonitor';
import DegradationTwin from './components/DegradationTwin';
import ComplianceLedger from './components/ComplianceLedger';
import RoleSwitcher from './components/RoleSwitcher';
import OverviewLanding from './components/OverviewLanding';
import AnimatedBackground from './components/AnimatedBackground';
import { useAuth } from './store/useAuthStore';
import { runLocalDispatch } from './utils/localOptimizer';

import {
  Cpu, ShieldCheck, AlertCircle, RefreshCw, Loader2, Download,
  Activity, BatteryCharging, Coins, Radio, CheckCircle, SlidersHorizontal,
  WifiOff, Server, Award, Layers, X, Sparkles
} from 'lucide-react';

export default function App() {
  const { toastMessage, clearToast, currentPersona } = useAuth();

  const [params, setParams] = useState({
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

  const [activeView, setActiveView] = useState('overview'); // 'overview' | 'dashboard' | 'fleet' | 'degradation' | 'sandbox' | 'compliance'
  const [activeSubTab, setActiveSubTab] = useState('dispatch'); // 'dispatch' | 'storage' | 'financial' | 'live_sim'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [data, setData] = useState(() => runLocalDispatch({
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
  }));
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getApiUrl = (endpoint) => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:8000${endpoint}`;
      }
    }
    return `http://127.0.0.1:8000${endpoint}`;
  };

  const fetchDispatch = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Dynamic network-aware API endpoint resolution for mobile & desktop
      const primaryUrl = getApiUrl('/dispatch/run');
      let res;
      try {
        res = await fetch(primaryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
      } catch {
        res = await fetch('http://127.0.0.1:8000/dispatch/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setIsOffline(false);
    } catch (err) {
      console.warn('Backend unavailable on network, running in-device mobile mathematical engine:', err);
      // Pure in-device mathematical solver fallback (works 100% offline on mobile)
      const localResult = runLocalDispatch(params);
      setData(localResult);
      setIsOffline(true);
      setErrorMsg('FastAPI remote unreachable. In-device mobile solver active.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      if (!isOffline) {
        const primaryUrl = getApiUrl('/dispatch/export-csv');
        let res;
        try {
          res = await fetch(primaryUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          });
        } catch {
          res = await fetch('http://127.0.0.1:8000/dispatch/export-csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          });
        }

        if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `hydrodispatch_schedule_${params.ely_type}_24h.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          return;
        }
      }

      // Offline CSV Export Fallback
      if (data?.scenario && data?.optimized_schedule) {
        const headers = ["timestamp", "interval", "solar_kw", "wind_kw", "total_re_kw", "tariff_rs_kwh", "ely_power_kw", "grid_power_kw", "ramp_kw", "h2_kg", "storage_soc_kg"];
        const rows = data.scenario.map((sc, i) => {
          const opt = data.optimized_schedule[i] || {};
          return [
            sc.timestamp, sc.interval, sc.solar_kw, sc.wind_kw, sc.total_re_kw, sc.tariff_rs_kwh,
            opt.ely_power_kw || 0, opt.grid_power_kw || 0, opt.ramp_kw || 0, opt.h2_kg || 0, opt.storage_soc_kg || 0
          ].join(',');
        });
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hydrodispatch_schedule_${params.ely_type}_offline.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error('Export CSV failed:', err);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchDispatch();
  }, [params]);

  return (
    <div className="min-h-screen bg-slate-950/20 text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan-500 selection:text-black relative">
      {/* Subtle Animated Background with Floating Orbs and Hydrogen Particles */}
      <AnimatedBackground />

      {/* Desktop Collapsible Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isOffline={isOffline}
        onRefresh={fetchDispatch}
        loading={loading}
      />

      {/* Main SCADA Workspace */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-8 overflow-y-auto relative z-10">
        {/* Top Header Bar */}
        <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-2xl sticky top-0 z-20 shadow-lg shadow-black/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse shadow-md shadow-emerald-400/50`} />
              <h1 className="text-sm md:text-base font-black text-white uppercase tracking-wider">
                HydroDispatch SCADA
              </h1>
              <span className="hidden sm:inline-block text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold backdrop-blur-md shadow-inner">
                {isOffline ? 'OFFLINE TWIN' : 'v2.0 PRO'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 text-xs">
            {/* RBAC Persona Switcher Widget */}
            <RoleSwitcher />

            {/* Quick Mobile Drawer Opener */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-button text-slate-200 font-bold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Params</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              disabled={exporting || !data}
              className="hidden sm:flex items-center gap-1.5 glass-button text-slate-200 font-bold px-3.5 py-1.5 rounded-xl transition shadow-md disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{exporting ? 'Exporting...' : 'Export Schedule'}</span>
            </button>
          </div>
        </header>

        {/* Global Persona Toast Notification Banner */}
        {toastMessage && (
          <div className="mx-4 md:mx-8 mt-3 p-3 glass-panel border-cyan-500/40 rounded-2xl flex items-center justify-between text-xs text-cyan-200 shadow-xl shadow-cyan-500/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
            <button
              onClick={clearToast}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Offline Banner if running client twin */}
        {isOffline && (
          <div className="mx-4 md:mx-8 mt-3 p-3.5 glass-panel border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Offline Simulation Mode:</strong> Backend disconnected. Using high-precision client-side heuristic twin. All sliders & charts are fully interactive.
              </span>
            </div>
            <button
              onClick={fetchDispatch}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition shadow-md shadow-amber-500/20"
            >
              Retry Backend
            </button>
          </div>
        )}

        {/* Content Container */}
        <main className="p-4 md:p-8 space-y-6">
          {/* VIEW 0: Platform Overview & Engine Tour */}
          {activeView === 'overview' && (
            <OverviewLanding
              setActiveView={setActiveView}
              setActiveSubTab={setActiveSubTab}
              onRunSimulation={fetchDispatch}
              metrics={data?.metrics}
              isOffline={isOffline}
            />
          )}

          {/* VIEW 1: Dashboard / Live Dispatch */}
          {activeView === 'dashboard' && (
            <>
              {data && <KpiCards metrics={data.metrics} />}

              {/* Sub-tab Navigation */}
              {data && (
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar touch-scroll py-0.5">
                  {[
                    { id: 'dispatch', label: '24-Hour Dispatch', icon: Activity, tag: 'Power & TOU' },
                    { id: 'storage', label: 'Buffer Storage', icon: BatteryCharging, tag: `${params.storage_capacity_kg}kg` },
                    { id: 'financial', label: 'LCOH Waterfall', icon: Coins, tag: `-₹${(data.metrics.baseline_lcoh_rs_kg - data.metrics.optimized_lcoh_rs_kg).toFixed(1)}` },
                    { id: 'live_sim', label: 'Live Simulator', icon: Radio, tag: '15-min' },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition border ${
                          isActive
                            ? 'bg-cyan-500/15 border-cyan-400/60 text-white backdrop-blur-xl shadow-lg shadow-cyan-500/15'
                            : 'glass-button text-slate-300 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                          isActive ? 'bg-cyan-400/25 text-cyan-200 border border-cyan-400/30' : 'bg-white/5 text-slate-400'
                        }`}>
                          {tab.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active Tab Panel */}
              {data && activeSubTab === 'dispatch' && (
                <DispatchChart
                  scenario={data.scenario}
                  optimized={data.optimized_schedule}
                  baseline={data.baseline_schedule}
                />
              )}

              {data && activeSubTab === 'storage' && (
                <StorageChart
                  scenario={data.scenario}
                  optimized={data.optimized_schedule}
                  baseline={data.baseline_schedule}
                  storageCapacityKg={params.storage_capacity_kg}
                />
              )}

              {data && activeSubTab === 'financial' && (
                <FinancialWaterfall metrics={data.metrics} />
              )}

              {data && activeSubTab === 'live_sim' && (
                <LiveSimPlayer
                  scenario={data.scenario}
                  optimized={data.optimized_schedule}
                  baseline={data.baseline_schedule}
                  metrics={data.metrics}
                  storageCapacityKg={params.storage_capacity_kg}
                />
              )}

              {/* Inline Quick Sandbox on Dashboard */}
              <Controls
                params={params}
                setParams={setParams}
                onRun={fetchDispatch}
                loading={loading}
              />
            </>
          )}

          {/* VIEW 2: Multi-Stack Fleet Monitor */}
          {activeView === 'fleet' && <FleetMonitor />}

          {/* VIEW 3: Degradation Digital Twin */}
          {activeView === 'degradation' && <DegradationTwin />}

          {/* VIEW 4: Scenario Sandbox View */}
          {activeView === 'sandbox' && (
            <div className="space-y-6">
              <Controls
                params={params}
                setParams={setParams}
                onRun={fetchDispatch}
                loading={loading}
              />
              {data && (
                <DispatchChart
                  scenario={data.scenario}
                  optimized={data.optimized_schedule}
                  baseline={data.baseline_schedule}
                />
              )}
            </div>
          )}

          {/* VIEW 5: Compliance & Proof-of-Origin */}
          {activeView === 'compliance' && (
            <ComplianceLedger
              metrics={data?.metrics}
              scenario={data?.scenario}
              optimized={data?.optimized_schedule}
            />
          )}
        </main>
      </div>

      {/* Mobile Slide-Over Controls Drawer */}
      {isDrawerOpen && (
        <Controls
          params={params}
          setParams={setParams}
          onRun={fetchDispatch}
          loading={loading}
          isDrawer={true}
          onCloseDrawer={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Sticky Bottom Floating Dock */}
      <MobileBottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        activeRole={currentPersona.roleKey}
      />
    </div>
  );
}
