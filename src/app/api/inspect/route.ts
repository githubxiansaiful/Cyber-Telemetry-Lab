import { NextRequest, NextResponse } from 'next/server';
import { insertInspectionLog, TelemetryPayload } from '@/lib/db';

function parseUserAgent(ua: string) {
  let browserName = 'Other';
  let browserVersion = '';
  let osName = 'Unknown';
  let osVersion = '';
  let deviceType = 'Desktop';

  if (!ua) {
    return { browserName, browserVersion, osName, osVersion, deviceType };
  }

  // OS detection
  if (/windows phone/i.test(ua)) {
    osName = 'Windows Phone';
    deviceType = 'Mobile';
  } else if (/win(dows|98|nt|95)/i.test(ua)) {
    osName = 'Windows';
    if (/nt 10.0/i.test(ua)) osVersion = '10 / 11';
    else if (/nt 6.3/i.test(ua)) osVersion = '8.1';
    else if (/nt 6.2/i.test(ua)) osVersion = '8';
    else if (/nt 6.1/i.test(ua)) osVersion = '7';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    osName = 'iOS';
    deviceType = /ipad/i.test(ua) ? 'Tablet' : 'Mobile';
  } else if (/android/i.test(ua)) {
    osName = 'Android';
    deviceType = /mobile/i.test(ua) ? 'Mobile' : 'Tablet';
  } else if (/macintosh|mac os x/i.test(ua)) {
    osName = 'macOS';
  } else if (/linux/i.test(ua)) {
    osName = 'Linux';
  } else if (/cros/i.test(ua)) {
    osName = 'ChromeOS';
  }

  // Browser detection
  if (/edg/i.test(ua)) {
    browserName = 'Edge';
    const match = ua.match(/edg\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/opr\//i.test(ua) || /opera/i.test(ua)) {
    browserName = 'Opera';
    const match = ua.match(/(?:opr|opera)\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/brave/i.test(ua)) {
    browserName = 'Brave';
  } else if (/chrome|crios/i.test(ua)) {
    browserName = 'Chrome';
    const match = ua.match(/chrome\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/firefox|fxios/i.test(ua)) {
    browserName = 'Firefox';
    const match = ua.match(/firefox\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browserName = 'Safari';
    const match = ua.match(/version\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  }

  return { browserName, browserVersion, osName, osVersion, deviceType };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Server-side headers interrogation
    const headersList = req.headers;
    const clientIp =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      headersList.get('cf-connecting-ip') ||
      '127.0.0.1';

    const rawHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      // Don't store sensitive auth cookies if any
      if (!key.toLowerCase().includes('cookie') && !key.toLowerCase().includes('authorization')) {
        rawHeaders[key] = value;
      }
    });

    const userAgent = headersList.get('user-agent') || body.userAgent || '';
    const parsedUa = parseUserAgent(userAgent);

    const payload: TelemetryPayload = {
      visitorId: body.visitorId,
      ipAddress: clientIp,
      userAgent: userAgent,
      browserName: parsedUa.browserName,
      browserVersion: parsedUa.browserVersion,
      osName: parsedUa.osName,
      osVersion: parsedUa.osVersion,
      deviceType: parsedUa.deviceType,
      deviceMemory: body.deviceMemory,
      hardwareConcurrency: body.hardwareConcurrency,
      screenResolution: body.screen ? `${body.screen.width}x${body.screen.height}` : undefined,
      colorDepth: body.screen?.colorDepth,
      pixelRatio: body.screen?.pixelRatio,
      timezone: body.privacy?.timezone,
      language: body.language,
      languages: Array.isArray(body.languages) ? body.languages.join(', ') : body.languages,
      gpuVendor: body.gpu?.vendor,
      gpuRenderer: body.gpu?.renderer,
      canvasHash: body.canvas?.hash,
      audioHash: body.audio?.hash,
      batteryLevel: body.battery?.level,
      isCharging: body.battery?.charging,
      connectionType: body.connection?.type,
      downlink: body.connection?.downlink,
      rtt: body.connection?.rtt,
      cookiesEnabled: body.cookieEnabled,
      doNotTrack: body.doNotTrack,
      adBlockerDetected: body.privacy?.adBlockerDetected,
      incognitoDetected: body.privacy?.incognitoDetected,
      touchSupport: (body.maxTouchPoints || 0) > 0,
      rawHeaders: rawHeaders,
      rawTelemetry: body,
    };

    const result = await insertInspectionLog(payload);

    return NextResponse.json({
      success: true,
      scanId: result.id,
      clientIp: clientIp,
      parsedInfo: parsedUa,
      rawHeaders: rawHeaders,
    });
  } catch (error) {
    console.error('API /api/inspect error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record telemetry',
      },
      { status: 500 }
    );
  }
}
