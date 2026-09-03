'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Shield, CheckCircle2 } from 'lucide-react';

interface ScanningOverlayProps {
  stepIndex: number;
}

const SCAN_STEPS = [
  'Querying navigator and system hardware concurrency...',
  'Extracting unmasked WebGL GPU vendor and renderer...',
  'Rendering off-screen Canvas 2D fingerprint hash...',
  'Analyzing AudioContext dynamic compression spectral matrix...',
  'Evaluating storage quotas for Incognito/Private mode heuristic...',
  'Triggering DOM bait probes for Adblocker detection...',
  'Capturing connection telemetry (RTT, Downlink, Effective Type)...',
  'Compiling and verifying diagnostic telemetry profile...',
];

export function ScanningOverlay({ stepIndex }: ScanningOverlayProps) {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (stepIndex < SCAN_STEPS.length) {
      setLogs((prev) => [...prev, SCAN_STEPS[stepIndex]]);
    }
  }, [stepIndex]);

  const progressPercent = Math.min(100, Math.round(((stepIndex + 1) / SCAN_STEPS.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div className="w-full max-w-xl cyber-card rounded-xl p-6 border border-emerald-500/50 shadow-2xl shadow-emerald-500/10">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <Terminal className="w-5 h-5 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest font-bold">
              DIAGNOSTIC TELEMETRY IN PROGRESS
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">{progressPercent}%</span>
        </div>

        {/* Cyber Progress Bar */}
        <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 mb-6">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Live Terminal Log Stream */}
        <div className="bg-black/80 rounded-lg p-4 font-mono text-xs text-zinc-300 h-44 overflow-y-auto border border-zinc-800/80 flex flex-col justify-end space-y-2">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-emerald-400 select-none">›</span>
              <span className={idx === logs.length - 1 ? 'text-emerald-300 font-bold' : 'text-zinc-400'}>
                {log}
              </span>
              {idx < logs.length - 1 && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-auto" />
              )}
            </div>
          ))}
          <div className="flex items-center gap-1 text-emerald-400 animate-pulse">
            <span>_</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-500 font-mono">
          <Shield className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Opt-in experiment securely sandboxed in your local browser runtime</span>
        </div>
      </div>
    </div>
  );
}
