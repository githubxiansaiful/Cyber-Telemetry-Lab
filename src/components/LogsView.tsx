'use client';

import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, Layers, ShieldCheck, Terminal } from 'lucide-react';

interface LogItem {
  id: string;
  created_at: string;
  visitor_id?: string;
  ip_address?: string;
  browser_name?: string;
  browser_version?: string;
  os_name?: string;
  device_type?: string;
  screen_resolution?: string;
  gpu_renderer?: string;
  canvas_hash?: string;
  timezone?: string;
  ad_blocker_detected?: boolean;
  incognito_detected?: boolean;
}

interface Stats {
  totalScans: number;
  uniqueVisitors: number;
  topBrowsers: { browser_name: string; count: number }[];
  topOS: { os_name: string; count: number }[];
}

export function LogsView() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card rounded-xl p-4 border border-zinc-800">
          <div className="text-zinc-400 text-xs font-mono mb-1">TOTAL SCANS IN NEON</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {loading ? '...' : stats?.totalScans || 0}
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 border border-zinc-800">
          <div className="text-zinc-400 text-xs font-mono mb-1">UNIQUE VISITORS</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {loading ? '...' : stats?.uniqueVisitors || 0}
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 border border-zinc-800">
          <div className="text-zinc-400 text-xs font-mono mb-1">TOP BROWSER</div>
          <div className="text-lg font-bold text-white font-mono truncate">
            {loading
              ? '...'
              : stats?.topBrowsers?.[0]
              ? `${stats.topBrowsers[0].browser_name} (${stats.topBrowsers[0].count})`
              : 'None'}
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 border border-zinc-800">
          <div className="text-zinc-400 text-xs font-mono mb-1">TOP OS</div>
          <div className="text-lg font-bold text-white font-mono truncate">
            {loading
              ? '...'
              : stats?.topOS?.[0]
              ? `${stats.topOS[0].os_name} (${stats.topOS[0].count})`
              : 'None'}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="cyber-card rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-white font-bold text-base font-mono">
            <Database className="w-5 h-5 text-emerald-400" />
            Neon PostgreSQL Telemetry Stream
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-emerald-500/50 text-xs font-mono text-zinc-300 hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-500 text-xs font-mono gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Connecting to Neon PostgreSQL...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs font-mono">
            No telemetry records in database yet. Initiate a scan from the home dashboard!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Scan ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Client IP</th>
                  <th className="py-2.5 px-3">Browser / OS</th>
                  <th className="py-2.5 px-3">Resolution</th>
                  <th className="py-2.5 px-3">Canvas Hash</th>
                  <th className="py-2.5 px-3">Adblock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">{log.id.slice(0, 12)}...</td>
                    <td className="py-2.5 px-3 text-zinc-400">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-2.5 px-3 text-zinc-200">
                      {log.browser_name} {log.browser_version} ({log.os_name})
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">{log.screen_resolution || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-purple-300 font-mono text-[11px]">{log.canvas_hash || 'N/A'}</td>
                    <td className="py-2.5 px-3">
                      {log.ad_blocker_detected ? (
                        <span className="text-amber-400 text-[10px] font-bold bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded">
                          BLOCKED
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[10px]">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
