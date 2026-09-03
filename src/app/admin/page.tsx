'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Database,
  RefreshCw,
  Search,
  Shield,
  Cpu,
  Monitor,
  Eye,
  Network,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  X,
  AlertTriangle,
  Copy,
  Check,
  Activity,
  Radio,
  FileJson,
  Lock,
  LogIn,
  LogOut,
  KeyRound,
  User,
} from 'lucide-react';

interface InspectionRecord {
  id: string;
  created_at: string;
  visitor_id?: string;
  ip_address?: string;
  country?: string;
  city?: string;
  region?: string;
  user_agent?: string;
  browser_name?: string;
  browser_version?: string;
  os_name?: string;
  os_version?: string;
  device_type?: string;
  device_memory?: number;
  hardware_concurrency?: number;
  screen_resolution?: string;
  color_depth?: number;
  pixel_ratio?: number;
  timezone?: string;
  language?: string;
  languages?: string;
  gpu_vendor?: string;
  gpu_renderer?: string;
  canvas_hash?: string;
  audio_hash?: string;
  battery_level?: number;
  is_charging?: boolean;
  connection_type?: string;
  downlink?: number;
  rtt?: number;
  cookies_enabled?: boolean;
  do_not_track?: string;
  ad_blocker_detected?: boolean;
  incognito_detected?: boolean;
  touch_support?: boolean;
  raw_headers?: Record<string, string>;
  raw_telemetry?: Record<string, unknown>;
}

interface Stats {
  totalScans: number;
  uniqueVisitors: number;
  adblockCount: number;
  incognitoCount: number;
  topBrowsers: { browser_name: string; count: number }[];
  topOS: { os_name: string; count: number }[];
  topGPUs: { gpu_renderer: string; count: number }[];
  topDevices: { device_type: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [logs, setLogs] = useState<InspectionRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filterBrowser, setFilterBrowser] = useState<string>('ALL');
  const [filterAdblock, setFilterAdblock] = useState<string>('ALL');

  // Verify active session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchLogs();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        fetchLogs();
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Authentication service unreachable');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setLogs([]);
      setStats(null);
      setSelectedRecord(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/logs', window.location.origin);
      if (searchQuery.trim()) {
        url.searchParams.set('search', searchQuery.trim());
      }
      url.searchParams.set('limit', '100');

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setStats(data.stats || null);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to load admin logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this inspection record from Neon PostgreSQL?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/logs?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (selectedRecord?.id === id) {
          setSelectedRecord(null);
        }
        await fetchLogs();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('WARNING: This will purge ALL telemetry records from your Neon database. Continue?')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/logs?all=true', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedRecord(null);
        await fetchLogs();
      }
    } catch (err) {
      console.error('Clear failed:', err);
    }
  };

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = [
      'ID',
      'Timestamp',
      'Visitor ID',
      'IP Address',
      'Browser',
      'Browser Version',
      'OS',
      'Device Type',
      'CPU Cores',
      'RAM (GB)',
      'Resolution',
      'GPU Renderer',
      'Canvas Hash',
      'Audio Hash',
      'AdBlocker',
      'Incognito',
      'Timezone',
    ];

    const rows = logs.map((log) => [
      log.id,
      log.created_at,
      log.visitor_id || '',
      log.ip_address || '',
      log.browser_name || '',
      log.browser_version || '',
      log.os_name || '',
      log.device_type || '',
      log.hardware_concurrency || '',
      log.device_memory || '',
      log.screen_resolution || '',
      `"${(log.gpu_renderer || '').replace(/"/g, '""')}"`,
      log.canvas_hash || '',
      log.audio_hash || '',
      log.ad_blocker_detected ? 'Yes' : 'No',
      log.incognito_detected ? 'Yes' : 'No',
      log.timezone || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `neon_telemetry_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter logs locally
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterBrowser !== 'ALL' && log.browser_name !== filterBrowser) {
        return false;
      }
      if (filterAdblock === 'YES' && !log.ad_blocker_detected) return false;
      if (filterAdblock === 'NO' && log.ad_blocker_detected) return false;
      return true;
    });
  }, [logs, filterBrowser, filterAdblock]);

  const adblockRate = stats && stats.totalScans > 0 ? Math.round((stats.adblockCount / stats.totalScans) * 100) : 0;
  const incognitoRate = stats && stats.totalScans > 0 ? Math.round((stats.incognitoCount / stats.totalScans) * 100) : 0;

  // 1. Loading state for initial session check
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center bg-[#06090e] text-zinc-400 font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <span>Verifying Admin Credentials...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Cyber Admin Login Gate
  if (!isAuthenticated) {
    return (
      <div suppressHydrationWarning className="min-h-screen cyber-grid scanline bg-[#06090e] flex items-center justify-center p-4">
        <div className="w-full max-w-md cyber-card rounded-2xl p-8 border border-emerald-500/40 shadow-2xl shadow-emerald-950/60 relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-2xl" />

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
              RESTRICTED ACCESS
            </div>
            <h1 className="text-xl font-bold text-white font-mono tracking-tight">
              Neon PostgreSQL Security Console
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Enter authorized administrative credentials to inspect stored telemetry records.
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/60 rounded-lg text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold">Admin Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500/60"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold">Admin Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500/60"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold tracking-wider rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
              ) : (
                <LogIn className="w-4 h-4 text-black" />
              )}
              {loginLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors">
              ← Return to Public Test Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated: Full Admin Dashboard
  return (
    <div suppressHydrationWarning className="min-h-screen cyber-grid scanline bg-[#06090e] text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white font-mono">
                  NEON POSTGRESQL // ADMIN ARCHIVE
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  AUTHENTICATED
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Host: ep-shiny-bread-avnin9r0-pooler.c-11.us-east-1.aws.neon.tech / Database: neondb
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Public Profiler
            </Link>

            <button
              onClick={handleExportCsv}
              disabled={logs.length === 0}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export CSV
            </button>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono text-emerald-300 font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleClearAll}
              disabled={logs.length === 0}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-xs font-mono text-red-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge Database
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Top Aggregated Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="cyber-card rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
              <span>TOTAL LOGGED SCANS</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {loading ? '...' : stats?.totalScans || 0}
            </div>
            <div className="text-[11px] text-zinc-500 font-mono mt-1">Stored in table: inspection_logs</div>
          </div>

          <div className="cyber-card rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
              <span>UNIQUE VISITORS</span>
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-cyan-400 font-mono">
              {loading ? '...' : stats?.uniqueVisitors || 0}
            </div>
            <div className="text-[11px] text-zinc-500 font-mono mt-1">Distinct cryptographic visitor IDs</div>
          </div>

          <div className="cyber-card rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
              <span>ADBLOCK PENETRATION</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400 font-mono">
              {loading ? '...' : `${adblockRate}%`}
            </div>
            <div className="text-[11px] text-zinc-500 font-mono mt-1">
              {stats?.adblockCount || 0} users blocking telemetry/ads
            </div>
          </div>

          <div className="cyber-card rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
              <span>INCOGNITO BROWSING</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400 font-mono">
              {loading ? '...' : `${incognitoRate}%`}
            </div>
            <div className="text-[11px] text-zinc-500 font-mono mt-1">
              {stats?.incognitoCount || 0} private storage quota flags
            </div>
          </div>
        </div>

        {/* Breakdown Summary Section */}
        {stats && (stats.topBrowsers.length > 0 || stats.topOS.length > 0 || stats.topGPUs.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Browsers */}
            <div className="cyber-card rounded-xl p-4 border border-zinc-800">
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider mb-3">
                Browser Distribution
              </div>
              <div className="space-y-2">
                {stats.topBrowsers.map((b) => {
                  const pct = stats.totalScans > 0 ? Math.round((b.count / stats.totalScans) * 100) : 0;
                  return (
                    <div key={b.browser_name} className="text-xs font-mono">
                      <div className="flex justify-between text-zinc-300 mb-1">
                        <span>{b.browser_name}</span>
                        <span className="text-zinc-500">
                          {b.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top OS */}
            <div className="cyber-card rounded-xl p-4 border border-zinc-800">
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-3">
                Operating Systems
              </div>
              <div className="space-y-2">
                {stats.topOS.map((o) => {
                  const pct = stats.totalScans > 0 ? Math.round((o.count / stats.totalScans) * 100) : 0;
                  return (
                    <div key={o.os_name} className="text-xs font-mono">
                      <div className="flex justify-between text-zinc-300 mb-1">
                        <span>{o.os_name}</span>
                        <span className="text-zinc-500">
                          {o.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top GPUs */}
            <div className="cyber-card rounded-xl p-4 border border-zinc-800">
              <div className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider mb-3">
                Unmasked GPUs
              </div>
              <div className="space-y-2">
                {stats.topGPUs.slice(0, 3).map((g) => (
                  <div key={g.gpu_renderer} className="text-xs font-mono p-2 bg-zinc-900/60 rounded border border-zinc-800/60">
                    <div className="text-zinc-200 truncate text-[11px] font-semibold">{g.gpu_renderer}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{g.count} device matches</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="cyber-card rounded-xl p-4 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchLogs();
            }}
            className="relative flex-1 w-full"
          >
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Neon records by IP, Visitor ID, Browser, OS, or GPU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterBrowser}
              onChange={(e) => setFilterBrowser(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
            >
              <option value="ALL">All Browsers</option>
              <option value="Chrome">Chrome</option>
              <option value="Firefox">Firefox</option>
              <option value="Edge">Edge</option>
              <option value="Safari">Safari</option>
              <option value="Opera">Opera</option>
            </select>

            <select
              value={filterAdblock}
              onChange={(e) => setFilterAdblock(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
            >
              <option value="ALL">All Adblock Status</option>
              <option value="YES">Adblock Active</option>
              <option value="NO">No Adblock</option>
            </select>
          </div>
        </div>

        {/* Main Logs Table */}
        <div className="cyber-card rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="text-xs font-mono text-zinc-400">
              Showing <span className="text-white font-bold">{filteredLogs.length}</span> records from Neon PostgreSQL
            </div>
            <div className="text-xs font-mono text-zinc-500">Click any row to inspect complete forensic dossier</div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-500 text-xs font-mono gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <span>Querying Neon PostgreSQL Cluster...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs font-mono space-y-2">
              <p>No matching inspection logs found in database.</p>
              <p className="text-zinc-600">Run a scan on the Public Profiler page to capture visitor telemetry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[11px] bg-zinc-950/50">
                    <th className="py-3 px-3">Scan ID</th>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Client IP</th>
                    <th className="py-3 px-3">Browser / Platform</th>
                    <th className="py-3 px-3">Hardware / GPU</th>
                    <th className="py-3 px-3">Resolution</th>
                    <th className="py-3 px-3">Canvas Hash</th>
                    <th className="py-3 px-3">Privacy</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedRecord(log)}
                      className="hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3 font-semibold text-emerald-400 group-hover:text-emerald-300">
                        {log.id.slice(0, 14)}...
                      </td>
                      <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 text-cyan-300 font-semibold">{log.ip_address || '127.0.0.1'}</td>
                      <td className="py-3 px-3 text-zinc-200">
                        <div>
                          {log.browser_name} {log.browser_version}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {log.os_name} {log.os_version} ({log.device_type})
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-300 max-w-[200px]">
                        <div className="truncate text-[11px] text-zinc-200" title={log.gpu_renderer || ''}>
                          {log.gpu_renderer || 'GPU Not Unmasked'}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {log.hardware_concurrency ? `${log.hardware_concurrency} Cores` : 'Unknown'} •{' '}
                          {log.device_memory ? `${log.device_memory}GB RAM` : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">{log.screen_resolution || 'N/A'}</td>
                      <td className="py-3 px-3 text-purple-400 font-mono text-[11px]">{log.canvas_hash || 'N/A'}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {log.ad_blocker_detected && (
                            <span className="text-amber-400 text-[9px] font-bold bg-amber-950/80 border border-amber-800/80 px-1 py-0.5 rounded">
                              ADBLOCK
                            </span>
                          )}
                          {log.incognito_detected && (
                            <span className="text-purple-400 text-[9px] font-bold bg-purple-950/80 border border-purple-800/80 px-1 py-0.5 rounded">
                              INCOGNITO
                            </span>
                          )}
                          {!log.ad_blocker_detected && !log.incognito_detected && (
                            <span className="text-zinc-600 text-[10px] font-mono">Standard</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(log);
                            }}
                            className="p-1.5 rounded hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-300 transition-colors"
                            title="Inspect Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteRecord(log.id, e)}
                            className="p-1.5 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Forensic Detail Slide-Over Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] cyber-card rounded-xl border border-emerald-500/50 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      SCAN DOSSIER: {selectedRecord.id}
                    </span>
                    <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                      {new Date(selectedRecord.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-mono mt-0.5">
                    Visitor: {selectedRecord.visitor_id || 'Unknown'} • IP: {selectedRecord.ip_address || '127.0.0.1'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const dataStr =
                      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedRecord, null, 2));
                    const a = document.createElement('a');
                    a.setAttribute('href', dataStr);
                    a.setAttribute('download', `${selectedRecord.id}.json`);
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  }}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Grid of Telemetry Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hardware & CPU */}
                <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold pb-2 border-b border-zinc-800">
                    <Cpu className="w-4 h-4" />
                    Hardware & Architecture
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Logical CPU Cores:</span>
                    <span className="text-white font-bold">{selectedRecord.hardware_concurrency || 'Undisclosed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Device RAM:</span>
                    <span className="text-white font-bold">
                      {selectedRecord.device_memory ? `${selectedRecord.device_memory} GB` : 'API Unsupported'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Touch Support:</span>
                    <span className="text-white">{selectedRecord.touch_support ? 'Yes (Touchscreen)' : 'No (Mouse)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Battery Level:</span>
                    <span className="text-white">
                      {selectedRecord.battery_level !== undefined && selectedRecord.battery_level !== null
                        ? `${selectedRecord.battery_level}% ${selectedRecord.is_charging ? '(Charging)' : ''}`
                        : 'Restricted by browser'}
                    </span>
                  </div>
                </div>

                {/* Display & Screen */}
                <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold pb-2 border-b border-zinc-800">
                    <Monitor className="w-4 h-4" />
                    Display & Viewport
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Screen Resolution:</span>
                    <span className="text-white font-bold">{selectedRecord.screen_resolution || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Device Pixel Ratio:</span>
                    <span className="text-white">{selectedRecord.pixel_ratio || 1}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Color Depth:</span>
                    <span className="text-white">{selectedRecord.color_depth || 24}-bit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Timezone:</span>
                    <span className="text-white">{selectedRecord.timezone || 'UTC'}</span>
                  </div>
                </div>

                {/* Graphics & Fingerprints */}
                <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold pb-2 border-b border-zinc-800">
                    <Eye className="w-4 h-4" />
                    Graphics & Audio Fingerprint
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Unmasked WebGL GPU Renderer:</span>
                    <span className="text-cyan-300 font-bold text-xs break-words">{selectedRecord.gpu_renderer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">GPU Vendor:</span>
                    <span className="text-white">{selectedRecord.gpu_vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Canvas 2D Hash:</span>
                    <span className="text-emerald-400 font-bold bg-black px-1.5 py-0.5 rounded border border-zinc-800">
                      {selectedRecord.canvas_hash}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">AudioContext Hash:</span>
                    <span className="text-purple-400 font-bold bg-black px-1.5 py-0.5 rounded border border-zinc-800">
                      {selectedRecord.audio_hash}
                    </span>
                  </div>
                </div>

                {/* Privacy & Security Leaks */}
                <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-purple-400 font-bold pb-2 border-b border-zinc-800">
                    <Shield className="w-4 h-4" />
                    Privacy & Security Posture
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Adblocker:</span>
                    <span className={selectedRecord.ad_blocker_detected ? 'text-amber-400 font-bold' : 'text-zinc-400'}>
                      {selectedRecord.ad_blocker_detected ? 'DETECTED' : 'NOT DETECTED'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Incognito Mode:</span>
                    <span className={selectedRecord.incognito_detected ? 'text-purple-400 font-bold' : 'text-zinc-400'}>
                      {selectedRecord.incognito_detected ? 'PROBABLE' : 'STANDARD'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Do Not Track (DNT):</span>
                    <span className="text-white">{selectedRecord.do_not_track || 'unspecified'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Cookies Enabled:</span>
                    <span className="text-white">{selectedRecord.cookies_enabled ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Full User Agent */}
              <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800 font-mono text-xs space-y-1">
                <div className="text-zinc-400 text-[11px] font-bold uppercase">Raw User Agent String</div>
                <div className="text-zinc-300 break-all bg-black/60 p-2.5 rounded border border-zinc-800">
                  {selectedRecord.user_agent}
                </div>
              </div>

              {/* Server-Side HTTP Request Headers Table */}
              {selectedRecord.raw_headers && Object.keys(selectedRecord.raw_headers).length > 0 && (
                <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-emerald-400 font-bold uppercase flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      Server-Side HTTP Headers Captured in Neon
                    </div>
                    <button
                      onClick={() =>
                        handleCopyText(JSON.stringify(selectedRecord.raw_headers, null, 2), 'headers')
                      }
                      className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      {copiedKey === 'headers' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'headers' ? 'Copied' : 'Copy Headers'}
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-60 border border-zinc-800 rounded">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-zinc-950 text-zinc-400 text-[10px] uppercase sticky top-0">
                        <tr>
                          <th className="py-2 px-3 border-b border-zinc-800">Header Key</th>
                          <th className="py-2 px-3 border-b border-zinc-800">Header Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {Object.entries(selectedRecord.raw_headers).map(([key, value]) => (
                          <tr key={key} className="hover:bg-zinc-900/40">
                            <td className="py-1.5 px-3 text-cyan-400 font-semibold">{key}</td>
                            <td className="py-1.5 px-3 text-zinc-300 break-all">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Complete Database JSON Dump */}
              <div className="p-4 bg-zinc-900/60 rounded-lg border border-zinc-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-cyan-400 font-bold uppercase flex items-center gap-2">
                    <FileJson className="w-4 h-4" />
                    Complete Neon Database JSON Document
                  </div>
                  <button
                    onClick={() => handleCopyText(JSON.stringify(selectedRecord, null, 2), 'full')}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedKey === 'full' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'full' ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="bg-black/90 p-3 rounded-lg text-emerald-300/90 max-h-56 overflow-auto border border-zinc-800 text-[11px]">
                  {JSON.stringify(selectedRecord, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">Neon PostgreSQL Primary Key: {selectedRecord.id}</span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/60 py-4 px-4 text-center font-mono text-[11px] text-zinc-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Neon PostgreSQL Security Management Console</span>
          <span className="text-zinc-500">Connected: PostgreSQL 18.6 • AWS US-East-1 • Connection Pooler Active</span>
        </div>
      </footer>
    </div>
  );
}
