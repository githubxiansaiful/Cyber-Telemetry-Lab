'use client';

import React, { useState } from 'react';
import { ClientTelemetryData } from '@/lib/telemetry';
import {
  Shield,
  Cpu,
  Monitor,
  Eye,
  Network,
  Database,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Battery,
  BatteryCharging,
  Fingerprint,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

interface TelemetryDashboardProps {
  telemetry: ClientTelemetryData;
  serverData?: {
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
  };
  onRescan: () => void;
}

export function TelemetryDashboard({ telemetry, serverData, onRescan }: TelemetryDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'headers' | 'raw'>('overview');

  const handleExportJson = () => {
    const exportObject = {
      scanId: serverData?.scanId || 'local_scan',
      timestamp: new Date().toISOString(),
      clientTelemetry: telemetry,
      serverInspection: serverData,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cyber-telemetry-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyHeaders = () => {
    if (serverData?.rawHeaders) {
      navigator.clipboard.writeText(JSON.stringify(serverData.rawHeaders, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner with Neon DB Connection Badge */}
      <div className="cyber-card rounded-xl p-5 border border-emerald-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                TELEMETRY PROFILE COMPLETE
              </span>
              <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                Scan ID: {serverData?.scanId || 'SCAN_LOCAL'}
              </span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded">
                Visitor: {telemetry.visitorId.slice(0, 14)}...
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Fingerprint className="w-6 h-6 text-emerald-400" />
              Browser Telemetry Profile Captured
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRescan}
              className="px-3.5 py-2 rounded-lg border border-zinc-700 hover:border-emerald-500/60 text-zinc-300 hover:text-emerald-400 text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-Scan
            </button>
            <button
              onClick={handleExportJson}
              className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-800/80 text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overview & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'headers'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            HTTP Request Headers ({serverData?.rawHeaders ? Object.keys(serverData.rawHeaders).length : 0})
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'raw'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Raw Telemetry Dump
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Privacy, Leaks & Heuristics */}
          <div className="cyber-card rounded-xl p-5 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800">
                <Shield className="w-4 h-4" />
                Privacy & Heuristics
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Adblocker Active:</span>
                  <span className={`inline-flex items-center gap-1 font-bold ${telemetry.privacy.adBlockerDetected ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {telemetry.privacy.adBlockerDetected ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        DETECTED
                      </>
                    ) : (
                      'NONE'
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Incognito / Private Mode:</span>
                  <span className={`font-bold ${telemetry.privacy.incognitoDetected ? 'text-purple-400' : 'text-zinc-400'}`}>
                    {telemetry.privacy.incognitoDetected ? 'PROBABLE' : 'STANDARD'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Do Not Track (DNT):</span>
                  <span className="text-white font-bold">{telemetry.doNotTrack}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Automated / Webdriver:</span>
                  <span className={telemetry.isAutomationControlled ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {telemetry.isAutomationControlled ? 'YES (BOT)' : 'NO (HUMAN)'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Cookies Enabled:</span>
                  <span className="text-emerald-400">{telemetry.cookieEnabled ? 'YES' : 'NO'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 font-mono">
              Permissions:{' '}
              {Object.entries(telemetry.permissions || {}).map(([k, v]) => (
                <span key={k} className="inline-block mr-2 text-zinc-400">
                  {k}: <b className="text-zinc-300">{v}</b>
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Hardware & Architecture */}
          <div className="cyber-card rounded-xl p-5 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800">
                <Cpu className="w-4 h-4" />
                Hardware & Architecture
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">CPU Logical Cores:</span>
                  <span className="text-emerald-300 font-bold">
                    {telemetry.hardwareConcurrency ? `${telemetry.hardwareConcurrency} Cores` : 'Hidden / Undisclosed'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Device RAM (Approx):</span>
                  <span className="text-emerald-300 font-bold">
                    {telemetry.deviceMemory ? `≥ ${telemetry.deviceMemory} GB` : 'API Unsupported'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Platform:</span>
                  <span className="text-white truncate max-w-[160px]">{telemetry.platform}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Touch Capability:</span>
                  <span className="text-white font-bold">
                    {telemetry.maxTouchPoints > 0 ? `Yes (${telemetry.maxTouchPoints} pts)` : 'No Touch (Mouse/Trackpad)'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Battery Status:</span>
                  <span className="inline-flex items-center gap-1 text-white">
                    {telemetry.battery ? (
                      <>
                        {telemetry.battery.charging ? (
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Battery className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        {telemetry.battery.level}% {telemetry.battery.charging ? '(Charging)' : ''}
                      </>
                    ) : (
                      'Restricted by browser'
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 font-mono">
              WebAssembly: <span className="text-emerald-400">{telemetry.storage.webAssembly ? 'ENABLED' : 'DISABLED'}</span>
            </div>
          </div>

          {/* Card 3: Graphics & Fingerprinting */}
          <div className="cyber-card rounded-xl p-5 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800">
                <Eye className="w-4 h-4" />
                Graphics & Fingerprints
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400 block mb-1">Unmasked GPU Renderer:</span>
                  <span className="text-cyan-300 font-bold break-words text-[11px] leading-tight">
                    {telemetry.gpu.renderer}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">GPU Vendor:</span>
                  <span className="text-white truncate max-w-[160px]">{telemetry.gpu.vendor}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">Canvas 2D Hash:</span>
                  <span className="text-emerald-400 font-bold bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                    {telemetry.canvas.hash}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                  <span className="text-zinc-400">AudioContext Hash:</span>
                  <span className="text-purple-400 font-bold bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                    {telemetry.audio.hash}
                  </span>
                </div>

                {/* Visual Canvas Sample Render */}
                {telemetry.canvas.sampleDataUrl && (
                  <div className="p-2 bg-zinc-950 rounded border border-zinc-800 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Canvas Signature Preview</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={telemetry.canvas.sampleDataUrl}
                      alt="Canvas Fingerprint"
                      className="border border-zinc-700/60 rounded bg-white h-7 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 font-mono">
              Max Texture Size: <span className="text-zinc-300">{telemetry.gpu.maxTextureSize}px</span>
            </div>
          </div>

          {/* Card 4: Display & Screen */}
          <div className="cyber-card rounded-xl p-5 border border-zinc-800">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800">
              <Monitor className="w-4 h-4" />
              Display & Resolution
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Hardware Resolution:</span>
                <span className="text-amber-300 font-bold">
                  {telemetry.screen.width} × {telemetry.screen.height}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Available Resolution:</span>
                <span className="text-white">
                  {telemetry.screen.availWidth} × {telemetry.screen.availHeight}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Device Pixel Ratio:</span>
                <span className="text-white font-bold">{telemetry.screen.pixelRatio}x (HiDPI)</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Color / Pixel Depth:</span>
                <span className="text-white">{telemetry.screen.colorDepth}-bit</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Orientation:</span>
                <span className="text-white">{telemetry.screen.orientation || 'landscape-primary'}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Network & Environment */}
          <div className="cyber-card rounded-xl p-5 border border-zinc-800">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800">
              <Network className="w-4 h-4" />
              Network & Environment
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Public Client IP:</span>
                <span className="text-emerald-400 font-bold">{serverData?.clientIp || '127.0.0.1'}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Connection Class:</span>
                <span className="text-white font-bold">{telemetry.connection.type?.toUpperCase() || 'BROADBAND'}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Downlink Speed:</span>
                <span className="text-white">{telemetry.connection.downlink ? `${telemetry.connection.downlink} Mbps` : 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Round Trip Time (RTT):</span>
                <span className="text-white">{telemetry.connection.rtt ? `${telemetry.connection.rtt} ms` : 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Timezone / Offset:</span>
                <span className="text-white font-bold">{telemetry.privacy.timezone} ({telemetry.privacy.timezoneOffset}m)</span>
              </div>
            </div>
          </div>

          {/* Card 6: Storage & Client Capabilities */}
          <div className="cyber-card rounded-xl p-5 border border-zinc-800">
            <div className="flex items-center gap-2 text-teal-400 font-mono text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800">
              <Layers className="w-4 h-4" />
              Storage & Capabilities
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">LocalStorage:</span>
                <span className="text-emerald-400 font-bold">{telemetry.storage.localStorage ? 'AVAILABLE' : 'BLOCKED'}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">SessionStorage:</span>
                <span className="text-emerald-400 font-bold">{telemetry.storage.sessionStorage ? 'AVAILABLE' : 'BLOCKED'}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">IndexedDB:</span>
                <span className="text-emerald-400 font-bold">{telemetry.storage.indexedDb ? 'AVAILABLE' : 'BLOCKED'}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Service Worker:</span>
                <span className="text-teal-300 font-bold">{telemetry.storage.serviceWorker ? 'SUPPORTED' : 'UNSUPPORTED'}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                <span className="text-zinc-400">Languages:</span>
                <span className="text-white truncate max-w-[160px]">{telemetry.languages.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HTTP Headers Tab */}
      {activeTab === 'headers' && (
        <div className="cyber-card rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
              <Network className="w-4 h-4" />
              Incoming Server-Side HTTP Headers
            </div>
            <button
              onClick={handleCopyHeaders}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-mono transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Headers'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase">
                  <th className="py-2.5 px-3 font-semibold">Header Name</th>
                  <th className="py-2.5 px-3 font-semibold">Server-Observed Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {serverData?.rawHeaders &&
                  Object.entries(serverData.rawHeaders).map(([key, value]) => (
                    <tr key={key} className="hover:bg-zinc-900/50">
                      <td className="py-2 px-3 text-cyan-400 font-semibold">{key}</td>
                      <td className="py-2 px-3 text-zinc-300 break-all">{value}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw JSON Dump Tab */}
      {activeTab === 'raw' && (
        <div className="cyber-card rounded-xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold">
              <Database className="w-4 h-4" />
              Complete JSON Telemetry Object
            </div>
            <button
              onClick={handleExportJson}
              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON
            </button>
          </div>

          <pre className="p-4 bg-zinc-950 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto max-h-[500px] border border-zinc-800">
            {JSON.stringify({ telemetry, serverData }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
