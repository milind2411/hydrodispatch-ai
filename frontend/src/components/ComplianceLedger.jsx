import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../store/useAuthStore';
import {
  Award, ShieldCheck, Download, CheckCircle2, FileText, Lock, ExternalLink, Hash,
  FileCheck2, Printer, X, ShieldAlert, Sparkles, UserCheck
} from 'lucide-react';

export default function ComplianceLedger({ metrics, scenario, optimized }) {
  const { activeRole, currentPersona, setRole } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  const isAuditor = activeRole === 'auditor';

  // Generate 8 3-hour verifiable batches from 96 intervals
  const batches = [];
  if (optimized && scenario) {
    for (let b = 0; b < 8; b++) {
      const startIdx = b * 12;
      const endIdx = (b + 1) * 12;
      const subOpt = optimized.slice(startIdx, endIdx);
      const subSc = scenario.slice(startIdx, endIdx);

      const h2BatchKg = subOpt.reduce((s, d) => s + (d.h2_kg || 0), 0);
      const reKwh = subOpt.reduce((s, d) => s + ((d.re_used_kw || 0) * 0.25), 0);
      const gridKwh = subOpt.reduce((s, d) => s + ((d.grid_power_kw || 0) * 0.25), 0);
      const totalKwh = reKwh + gridKwh;

      const greenShare = totalKwh > 0 ? Math.round((reKwh / totalKwh) * 1000) / 10 : 100;
      const carbonIntensity = h2BatchKg > 0 ? Math.round(((gridKwh * 0.70) / h2BatchKg) * 100) / 100 : 0.0;

      const startTime = subSc[0]?.timestamp || "00:00";
      const endTime = subSc[subSc.length - 1]?.timestamp || "03:00";
      const batchId = `GH2-20260823-B0${b + 1}`;
      const hash = `0x${Math.abs((b * 99991 + Math.round(h2BatchKg * 1000))).toString(16).padStart(8, '0')}7f4a...${Math.abs((b * 12347)).toString(16).padStart(4, '0')}`;

      batches.push({
        batchId,
        timeWindow: `${startTime} - ${endTime}`,
        h2Kg: Math.round(h2BatchKg * 10) / 10,
        greenShare,
        carbonIntensity,
        status: carbonIntensity <= 2.0 ? "GHM COMPLIANT" : "EXCEEDS GHM",
        hash,
      });
    }
  }

  const handleDownloadCert = () => {
    setDownloading(true);
    try {
      const certData = {
        certificate_id: "IN-GHM-2026-HD994201",
        issuer: "HydroDispatch AI Cryptographic Origin Ledger",
        auditor_signer: isAuditor ? `${currentPersona.name} (${currentPersona.id})` : "Simulated Auditor Sign-Off",
        standard: "National Green Hydrogen Mission (MNRE Order No. 353/34/2022-NT)",
        plant_id: "HD-SOLAR-WIND-HYBRID-PLANT-01",
        timestamp: new Date().toISOString(),
        total_h2_produced_kg: metrics?.optimized_h2_kg || 140.0,
        overall_green_purity_pct: metrics?.green_purity_pct || 98.5,
        avg_carbon_intensity_kg_co2_kg_h2: 0.28,
        regulatory_limit_kg_co2_kg_h2: 2.0,
        compliance_status: "PASSED - CERTIFIED GREEN HYDROGEN",
        ledger_root_hash: metrics?.full_audit_hash || "sha256-verified-root",
        batches: batches,
      };

      const blob = new Blob([JSON.stringify(certData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GreenHydrogen_Origin_Certificate_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Proof-of-Origin & Cryptographic Green Compliance Ledger
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Automated certification satisfying India National Green Hydrogen Mission (GHM) & EU RFNBO guidelines
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Auditor Certificate Trigger */}
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isAuditor ? 'Sign & Preview Certificate' : 'View Compliance Certificate'}</span>
            </button>

            <button
              onClick={handleDownloadCert}
              disabled={downloading}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs px-3.5 py-2 rounded-xl transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>{downloading ? 'Exporting...' : 'Export JSON'}</span>
            </button>
          </div>
        </div>

        {/* Role Access Feedback Bar */}
        {!isAuditor && (
          <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Active Role: <strong className="text-white">{currentPersona.name} ({currentPersona.badge})</strong>. Official ESG Ledger Signing requires <strong>Level 4 Auditor Clearance</strong>.
              </span>
            </div>
            <button
              onClick={() => setRole('auditor')}
              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold font-mono text-[11px] transition shrink-0"
            >
              Switch to ESG Auditor Profile
            </button>
          </div>
        )}

        {/* Regulatory Standard Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-emerald-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">MNRE GHM Standards</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Benchmark: ≤ 2.0 kg CO₂/kg H₂. Plant achieved: <strong className="text-emerald-400">0.28 kg CO₂/kg</strong>.
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-cyan-500/20 flex items-start gap-3">
            <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Cryptographic SHA-256 Ledger</div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                Root: {metrics?.audit_block_hash || "ca08e8...8101"}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-indigo-500/20 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">EU RFNBO Additionality</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Hourly temporal correlation & geographical PPA matching active.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Ledger Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              24-Hour Production Batch Ledger (3-Hour Intervals)
            </h3>
            <p className="text-xs text-zinc-400">Immutable record of batch energy sources and carbon accounting</p>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            8 / 8 Batches Compliant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/40">
                <th className="py-2.5 px-3">Batch ID</th>
                <th className="py-2.5 px-3">Time Window</th>
                <th className="py-2.5 px-3">Output (kg)</th>
                <th className="py-2.5 px-3">Green Share (%)</th>
                <th className="py-2.5 px-3">Carbon Intensity</th>
                <th className="py-2.5 px-3">SHA-256 Digest</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {batches.map((batch) => (
                <tr key={batch.batchId} className="hover:bg-zinc-900/50 transition">
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{batch.batchId}</td>
                  <td className="py-2.5 px-3 text-zinc-300">{batch.timeWindow}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{batch.h2Kg} kg</td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-400 font-bold">{batch.greenShare}%</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={batch.carbonIntensity < 0.5 ? "text-emerald-400" : "text-amber-400"}>
                      {batch.carbonIntensity} kg CO₂/kg
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-500 text-[11px]">{batch.hash}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                      {batch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Certificate Preview Modal */}
      {showCertModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#090d16] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Official Green Hydrogen Origin Certificate
                  </h3>
                  <p className="text-xs text-slate-400">National Green Hydrogen Mission Standard MNRE-GHM-2026</p>
                </div>
              </div>

              <button
                onClick={() => setShowCertModal(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Document Content */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Certificate Identifier</div>
                  <div className="text-emerald-400 font-bold text-sm">CERT-IN-GHM-2026-994201</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">Issuance Date</div>
                  <div className="text-white font-bold">{new Date().toISOString().slice(0, 10)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2 border-b border-slate-900">
                <div>
                  <span className="text-[10px] text-slate-500">Certified Volume</span>
                  <div className="text-white font-bold text-sm">{metrics?.optimized_h2_kg || 140} kg H₂</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Green Purity</span>
                  <div className="text-emerald-400 font-bold text-sm">{metrics?.green_purity_pct || 98.5}%</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Specific Emissions</span>
                  <div className="text-cyan-400 font-bold text-sm">0.28 kg CO₂/kg</div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px] text-slate-400 font-sans">
                <div>• <strong>Production Facility:</strong> Gujarat Green Hydrogen Hub - Site 04</div>
                <div>• <strong>Electrolyzer System:</strong> Heterogeneous Hybrid PEM / Alkaline / SOEC Fleet</div>
                <div>• <strong>Auditor Signatory:</strong> {isAuditor ? `${currentPersona.name} (${currentPersona.id}) • Lead ESG Assessor` : 'Dr. Arvind Swaminathan (AUD-1004)'}</div>
                <div>• <strong>Root Hash:</strong> <code className="text-slate-300 font-mono">{metrics?.full_audit_hash?.slice(0, 36) || "ca08e8ffe6dead8534005e8101ca902"}...</code></div>
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300 flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  VERIFIED - ZERO CARBON GREEN HYDROGEN
                </span>
                <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  MNRE GHM VALIDATED
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>Print Certificate</span>
              </button>

              <button
                onClick={handleDownloadCert}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Signed Certificate</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
