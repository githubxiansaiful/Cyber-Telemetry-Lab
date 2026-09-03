'use client';

import React, { useState, useEffect } from 'react';
import { ConsentModal } from '@/components/ConsentModal';
import { ScanningOverlay } from '@/components/ScanningOverlay';
import { TelemetryDashboard } from '@/components/TelemetryDashboard';
import { collectBrowserTelemetry, ClientTelemetryData } from '@/lib/telemetry';
import { Shield, Terminal, ShieldAlert, Play, Sparkles } from 'lucide-react';

interface ServerInspectionResult {
  scanId: string;
  clientIp: string;
  parsedInfo?: {
    browserName: string;
    browserVersion: string;
    osName: string;
    osVersion: string;
    deviceType: string;
  };
  rawHeaders?: Record<string, string>;
}

export default function CyberExperimentPage() {
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [telemetryData, setTelemetryData] = useState<ClientTelemetryData | null>(null);
  const [serverData, setServerData] = useState<ServerInspectionResult | null>(null);
  const [hasDeclined, setHasDeclined] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const executeTelemetryScan = async () => {
    setModalOpen(false);
    setHasDeclined(false);
    setIsScanning(true);
    setScanStep(0);

    // Step-by-step progress simulation for cyber effect
    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < 6) return prev + 1;
        return prev;
      });
    }, 280);

    try {
      // Collect client-side browser telemetry
      const clientMetrics = await collectBrowserTelemetry();
      setTelemetryData(clientMetrics);

      setScanStep(7); // Finalizing analysis

      // Transmit to server API for header verification & logging
      const response = await fetch('/api/inspect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientMetrics),
      });

      const json = await response.json();
      if (json.success) {
        setServerData({
          scanId: json.scanId,
          clientIp: json.clientIp,
          parsedInfo: json.parsedInfo,
          rawHeaders: json.rawHeaders,
        });
      }
    } catch (err) {
      console.error('Scan execution error:', err);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsScanning(false);
      }, 600);
    }
  };

  const handleDeny = () => {
    setModalOpen(false);
    setHasDeclined(true);
  };

  return (
    <div suppressHydrationWarning className="min-h-screen cyber-grid scanline flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 border-b border-zinc-800/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white font-mono">
                  CYBER_LAB // EXPERIMENT
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SYSTEM ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono hidden sm:block">
                Browser Diagnostics & Hardware Profiling Research
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-mono text-zinc-400 border border-zinc-800 px-3 py-1.5 rounded-lg bg-zinc-900/50">
              <span className="text-emerald-400">STATUS:</span> {telemetryData ? 'PROFILED' : 'AWAITING SCAN'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Consent Modal upon initial load */}
        <ConsentModal
          isOpen={mounted && modalOpen}
          onAllow={executeTelemetryScan}
          onDeny={handleDeny}
        />

        {/* Animated Scanning Overlay during interrogation */}
        {isScanning && <ScanningOverlay stepIndex={scanStep} />}

        {/* Profiler View */}
        {telemetryData ? (
          <TelemetryDashboard
            telemetry={telemetryData}
            serverData={serverData || undefined}
            onRescan={executeTelemetryScan}
          />
        ) : hasDeclined ? (
          /* Declined Educational State */
          <div className="max-w-xl mx-auto my-12 cyber-card rounded-xl p-8 border border-zinc-800 text-center space-y-5">
            <div className="mx-auto w-14 h-14 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400">
              <ShieldAlert className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-mono">Scan Permission Declined</h2>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                No hardware or browser telemetry was extracted. Your environment parameters remain private. 
                Whenever you are ready to test the browser profiling experiment, you can initiate the scan below.
              </p>
            </div>
            <div className="pt-3">
              <button
                onClick={executeTelemetryScan}
                className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-mono font-bold transition-all inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Diagnostic Scan
              </button>
            </div>
          </div>
        ) : (
          /* Awaiting User Action */
          <div className="max-w-xl mx-auto my-12 cyber-card rounded-xl p-8 border border-emerald-500/30 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-emerald-400">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
                Security Sandbox Ready
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Browser Telemetry Profiler
              </h2>
              <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                Analyze browser capabilities, hardware signatures, unmasked GPU details, and privacy configurations.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-mono font-bold tracking-wider transition-all inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Show Consent & Start Experiment
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/60 py-4 px-4 text-center font-mono text-[11px] text-zinc-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Cyber Telemetry Research Project</span>
          <span className="text-zinc-500">
            Opt-in Client Diagnostic Platform
          </span>
        </div>
      </footer>
    </div>
  );
}
