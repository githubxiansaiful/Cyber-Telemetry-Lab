'use client';

// Utility hash function (cyrb53 fast 53-bit hash)
export function cyrb53(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

export interface ClientTelemetryData {
  visitorId: string;
  userAgent: string;
  platform: string;
  vendor: string;
  language: string;
  languages: string[];
  cookieEnabled: boolean;
  doNotTrack: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  maxTouchPoints: number;
  isAutomationControlled: boolean;
  pdfViewerEnabled?: boolean;
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelRatio: number;
    orientation?: string;
  };
  gpu: {
    vendor: string;
    renderer: string;
    glVersion: string;
    shadingLanguageVersion: string;
    maxTextureSize: number;
  };
  canvas: {
    hash: string;
    sampleDataUrl: string;
  };
  audio: {
    hash: string;
  };
  connection: {
    type?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  battery?: {
    charging: boolean;
    level: number;
    chargingTime: number;
    dischargingTime: number;
  };
  storage: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDb: boolean;
    serviceWorker: boolean;
    webAssembly: boolean;
  };
  privacy: {
    adBlockerDetected: boolean;
    incognitoDetected: boolean;
    timezone: string;
    timezoneOffset: number;
  };
  permissions: Record<string, string>;
}

// Generate or retrieve persistent visitor ID
function getVisitorId(): string {
  try {
    const storageKey = '__cyber_visitor_id';
    let id = localStorage.getItem(storageKey);
    if (!id) {
      id = 'vid_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(storageKey, id);
    }
    return id;
  } catch {
    return 'vid_' + Math.random().toString(36).substring(2, 10);
  }
}

// Extract WebGL unmasked graphics information
function getGpuInfo() {
  const result = {
    vendor: 'Unknown / Blocked',
    renderer: 'Unknown / Blocked',
    glVersion: 'Unknown',
    shadingLanguageVersion: 'Unknown',
    maxTextureSize: 0,
  };

  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (gl) {
      result.glVersion = gl.getParameter(gl.VERSION) || 'Unknown';
      result.shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || 'Unknown';
      result.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0;

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        result.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown';
        result.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown';
      }
    }
  } catch (e) {
    console.debug('Error getting GPU info', e);
  }

  return result;
}

// Generate Canvas 2D Fingerprint and visual preview
function getCanvasFingerprint(): { hash: string; sampleDataUrl: string } {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { hash: 'unsupported', sampleDataUrl: '' };

    // Canvas drawing test
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', 'Helvetica', 'Times New Roman'";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.fillText('Cyber<Security>! ⚡ 0x99', 4, 17);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Cyber<Security>! ⚡ 0x99', 2, 15);

    // Render arcs & gradients
    const grad = ctx.createLinearGradient(0, 0, 240, 0);
    grad.addColorStop(0, '#00ffcc');
    grad.addColorStop(0.5, '#7928ca');
    grad.addColorStop(1, '#ff0080');
    ctx.fillStyle = grad;
    ctx.fillRect(4, 30, 230, 6);

    ctx.beginPath();
    ctx.arc(30, 48, 8, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    const hash = cyrb53(dataUrl);
    return { hash, sampleDataUrl: dataUrl };
  } catch {
    return { hash: 'error', sampleDataUrl: '' };
  }
}

// Generate AudioContext spectral analysis hash
async function getAudioFingerprint(): Promise<string> {
  try {
    const AudioContextClass =
      window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
    if (!AudioContextClass) return 'unsupported';

    const context = new AudioContextClass(1, 44100, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, context.currentTime);
    compressor.knee.setValueAtTime(40, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.attack.setValueAtTime(0, context.currentTime);
    compressor.release.setValueAtTime(0.25, context.currentTime);

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const renderedBuffer = await context.startRendering();
    const channelData = renderedBuffer.getChannelData(0);
    let sampleSum = 0;
    for (let i = 4500; i < 5000; i++) {
      sampleSum += Math.abs(channelData[i]);
    }
    return cyrb53(sampleSum.toString());
  } catch {
    return 'blocked_or_unsupported';
  }
}

// Detect adblocker via bait element
async function detectAdBlocker(): Promise<boolean> {
  try {
    const bait = document.createElement('div');
    bait.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links banner-ads adsbox';
    bait.style.position = 'absolute';
    bait.style.top = '-10000px';
    bait.style.left = '-10000px';
    bait.style.width = '1px';
    bait.style.height = '1px';
    bait.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bait);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const isBlocked =
      bait.offsetParent === null ||
      bait.offsetHeight === 0 ||
      bait.offsetWidth === 0 ||
      window.getComputedStyle(bait).display === 'none' ||
      window.getComputedStyle(bait).visibility === 'hidden';

    bait.remove();
    return isBlocked;
  } catch {
    return false;
  }
}

// Detect Incognito / Private browsing using Storage API heuristic
async function detectIncognito(): Promise<boolean> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { quota } = await navigator.storage.estimate();
      // In private browsing on Chromium, quota is drastically lower (typically <= 120MB)
      if (quota && quota < 125829120) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// Query permissions status
async function queryPermissions(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  if (!navigator.permissions || !navigator.permissions.query) {
    return { status: 'permissions_api_unsupported' };
  }

  const apis = ['geolocation', 'notifications', 'camera', 'microphone'] as const;
  for (const name of apis) {
    try {
      const status = await navigator.permissions.query({ name: name as PermissionName });
      result[name] = status.state;
    } catch {
      result[name] = 'not_queried';
    }
  }
  return result;
}

/**
 * Main telemetry collection function
 */
export async function collectBrowserTelemetry(): Promise<ClientTelemetryData> {
  const visitorId = getVisitorId();
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
    getBattery?: () => Promise<{
      charging: boolean;
      level: number;
      chargingTime: number;
      dischargingTime: number;
    }>;
  };

  const gpu = getGpuInfo();
  const canvas = getCanvasFingerprint();
  const audioHash = await getAudioFingerprint();
  const adBlockerDetected = await detectAdBlocker();
  const incognitoDetected = await detectIncognito();
  const permissions = await queryPermissions();

  let batteryData: ClientTelemetryData['battery'] = undefined;
  if (typeof nav.getBattery === 'function') {
    try {
      const batt = await nav.getBattery();
      batteryData = {
        charging: batt.charging,
        level: Math.round(batt.level * 100),
        chargingTime: batt.chargingTime,
        dischargingTime: batt.dischargingTime,
      };
    } catch {
      // Battery API restricted or rejected
    }
  }

  const connectionData = {
    type: nav.connection?.effectiveType,
    downlink: nav.connection?.downlink,
    rtt: nav.connection?.rtt,
    saveData: nav.connection?.saveData,
  };

  return {
    visitorId,
    userAgent: nav.userAgent,
    platform: nav.platform || 'Unknown',
    vendor: nav.vendor || 'Unknown',
    language: nav.language || 'Unknown',
    languages: Array.from(nav.languages || [nav.language || '']),
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack || (window as unknown as { doNotTrack?: string }).doNotTrack || 'unspecified',
    hardwareConcurrency: nav.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    maxTouchPoints: nav.maxTouchPoints || 0,
    isAutomationControlled: nav.webdriver || false,
    pdfViewerEnabled: nav.pdfViewerEnabled,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: window.screen.orientation?.type,
    },
    gpu,
    canvas,
    audio: {
      hash: audioHash,
    },
    connection: connectionData,
    battery: batteryData,
    storage: {
      localStorage: typeof window.localStorage !== 'undefined',
      sessionStorage: typeof window.sessionStorage !== 'undefined',
      indexedDb: typeof window.indexedDB !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      webAssembly: typeof WebAssembly === 'object',
    },
    privacy: {
      adBlockerDetected,
      incognitoDetected,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
      timezoneOffset: new Date().getTimezoneOffset(),
    },
    permissions,
  };
}
