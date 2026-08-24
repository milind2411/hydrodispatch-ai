import React, { useState, useEffect } from 'react';
import {
  Smartphone, Tablet, RotateCw, X, Wifi, BatteryMedium, Signal,
  Sliders, Activity, Server, Award, SlidersHorizontal, Sparkles, Check, Monitor
} from 'lucide-react';

const DEVICES = [
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', width: 393, height: 840, radius: 48, bezel: 12, notch: 'dynamic-island' },
  { id: 'pixel-8', name: 'Google Pixel 8', width: 412, height: 860, radius: 44, bezel: 12, notch: 'punch-hole' },
  { id: 'galaxy-s24', name: 'Galaxy S24', width: 360, height: 780, radius: 40, bezel: 10, notch: 'punch-hole' },
  { id: 'ipad-mini', name: 'iPad Mini', width: 620, height: 860, radius: 36, bezel: 16, notch: 'none' },
];

export default function MobileSimulator({ children, isOpen, onClose }) {
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[0]);
  const [isLandscape, setIsLandscape] = useState(false);
  const [zoom, setZoom] = useState(90);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const currentWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
  const currentHeight = isLandscape ? selectedDevice.width : selectedDevice.height;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-3xl animate-in fade-in select-none">
      {/* Top Simulator Control Bar */}
      <header className="h-16 px-4 md:px-8 bg-black/60 border-b border-white/15 flex items-center justify-between z-20 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Interactive Mobile SCADA Simulator</span>
          </div>
          <span className="hidden sm:inline-block text-xs text-slate-400">
            Preview touch controls, bottom dock, and responsive cards live on desktop
          </span>
        </div>

        {/* Device & Orientation Tools */}
        <div className="flex items-center gap-2 md:gap-3 text-xs">
          {/* Device Model Selector */}
          <div className="flex glass-pill p-1 rounded-xl">
            {DEVICES.map((dev) => (
              <button
                key={dev.id}
                onClick={() => setSelectedDevice(dev)}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  selectedDevice.id === dev.id
                    ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {dev.id.includes('ipad') ? <Tablet className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{dev.name}</span>
              </button>
            ))}
          </div>

          {/* Orientation Toggle */}
          <button
            onClick={() => setIsLandscape(!isLandscape)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-button text-slate-200 font-bold transition"
            title="Rotate Device"
          >
            <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isLandscape ? 'rotate-90 text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">{isLandscape ? 'Landscape' : 'Portrait'}</span>
          </button>

          {/* Zoom Slider / Controls */}
          <div className="hidden lg:flex items-center gap-1.5 glass-pill px-2.5 py-1 rounded-xl text-slate-300 font-mono text-[11px]">
            <span>Scale:</span>
            {[80, 90, 100].map((scale) => (
              <button
                key={scale}
                onClick={() => setZoom(scale)}
                className={`px-2 py-0.5 rounded-md font-bold transition ${
                  zoom === scale ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {scale}%
              </button>
            ))}
          </div>

          {/* Exit Simulator Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold transition shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Exit Demo</span>
          </button>
        </div>
      </header>

      {/* Main Workspace with Center Device Chassis */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto relative">
        {/* Subtle background glow */}
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Realistic Mobile Device Outer Chassis */}
        <div
          className="relative transition-all duration-300 ease-out shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(6,182,212,0.15)] border border-slate-700/80 bg-slate-900 flex flex-col overflow-hidden"
          style={{
            width: `${currentWidth}px`,
            height: `${currentHeight}px`,
            borderRadius: `${selectedDevice.radius}px`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Metallic Edge Ring */}
          <div
            className="absolute inset-0 border-[4px] border-slate-600/40 rounded-[inherit] pointer-events-none z-40"
            style={{ borderRadius: `${selectedDevice.radius}px` }}
          />

          {/* Simulated Mobile Status Bar */}
          <div className="h-11 px-6 bg-slate-950/90 text-slate-200 flex items-center justify-between z-30 shrink-0 select-none border-b border-white/5 backdrop-blur-md">
            {/* Clock */}
            <span className="font-bold text-xs tracking-tight font-mono">{currentTime || '09:41'}</span>

            {/* Dynamic Island / Punch Hole */}
            {selectedDevice.notch === 'dynamic-island' && (
              <div className="w-24 h-6 bg-black rounded-full border border-white/10 flex items-center justify-between px-2.5 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
              </div>
            )}
            {selectedDevice.notch === 'punch-hole' && (
              <div className="w-3.5 h-3.5 bg-black rounded-full border border-white/10" />
            )}

            {/* Hardware Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-300 text-xs">
              <Signal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold font-mono">5G</span>
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <BatteryMedium className="w-4 h-4 text-slate-200" />
            </div>
          </div>

          {/* Inside Mobile Screen Viewport (Scrollable Content Container) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col relative custom-scrollbar">
            {children}
          </div>

          {/* Bottom Native Home Indicator Bar */}
          <div className="h-5 bg-slate-950/90 flex items-center justify-center shrink-0 z-30 border-t border-white/5">
            <div className="w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
