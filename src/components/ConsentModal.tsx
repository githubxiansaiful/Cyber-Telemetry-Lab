'use client';

import React from 'react';
import { ShieldAlert, Cpu, Eye, Network, Lock, CheckCircle2, XCircle } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export function ConsentModal({ isOpen, onAllow, onDeny }: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div suppressHydrationWarning className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div suppressHydrationWarning className="relative w-full max-w-2xl cyber-card rounded-xl p-6 md:p-8 border border-emerald-500/40 shadow-2xl shadow-emerald-950/50">
        {/* Top corner cyber accent lines */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-xl" />

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                CYBER EXPERIMENT
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                v1.0.0
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
              Browser Telemetry & Fingerprint Profiler
            </h2>
          </div>
        </div>

        {/* Description */}
        <div className="text-zinc-300 text-sm md:text-base mb-6 leading-relaxed">
          This experimental security research platform demonstrates what digital traces and hardware signatures your browser exposes to web applications. 
          With your permission, we will extract non-sensitive diagnostic telemetry and compile your diagnostic security benchmark profile.
        </div>

        {/* What gets analyzed grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-zinc-900/70 rounded-lg border border-zinc-800">
            <Cpu className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-white">Hardware & GPU Architecture</div>
              <div className="text-xs text-zinc-400">CPU cores, RAM size, unmasked WebGL GPU card & vendor.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-zinc-900/70 rounded-lg border border-zinc-800">
            <Eye className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-white">Graphics & Audio Signatures</div>
              <div className="text-xs text-zinc-400">Canvas 2D render hash & AudioContext spectral fingerprint.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-zinc-900/70 rounded-lg border border-zinc-800">
            <Network className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-white">Network & HTTP Headers</div>
              <div className="text-xs text-zinc-400">IP address, latency RTT, connection class, server headers.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-zinc-900/70 rounded-lg border border-zinc-800">
            <Lock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-white">Privacy & Heuristic Tests</div>
              <div className="text-xs text-zinc-400">Adblocker detection, Incognito quota check, DNT headers.</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onDeny}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-zinc-400" />
            Decline / Deny
          </button>

          <button
            type="button"
            onClick={onAllow}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold tracking-wide shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-black" />
            ALLOW & INITIATE SCAN
          </button>
        </div>
      </div>
    </div>
  );
}
