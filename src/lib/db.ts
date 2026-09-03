import { neon } from '@neondatabase/serverless';

// Initialize the Neon SQL client using the DATABASE_URL environment variable
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }
  return url;
};

// Create serverless SQL connection
export const sql = neon(getDatabaseUrl());

/**
 * Initializes the database tables if they do not already exist.
 * This runs automatically on first API request.
 */
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS inspection_logs (
        id VARCHAR(64) PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        visitor_id VARCHAR(128),
        ip_address VARCHAR(128),
        country VARCHAR(64),
        city VARCHAR(64),
        region VARCHAR(64),
        user_agent TEXT,
        browser_name VARCHAR(64),
        browser_version VARCHAR(64),
        os_name VARCHAR(64),
        os_version VARCHAR(64),
        device_type VARCHAR(64),
        device_memory NUMERIC,
        hardware_concurrency INT,
        screen_resolution VARCHAR(64),
        color_depth INT,
        pixel_ratio NUMERIC,
        timezone VARCHAR(128),
        language VARCHAR(64),
        languages TEXT,
        gpu_vendor TEXT,
        gpu_renderer TEXT,
        canvas_hash VARCHAR(128),
        audio_hash VARCHAR(128),
        battery_level NUMERIC,
        is_charging BOOLEAN,
        connection_type VARCHAR(64),
        downlink NUMERIC,
        rtt INT,
        cookies_enabled BOOLEAN,
        do_not_track VARCHAR(32),
        ad_blocker_detected BOOLEAN,
        incognito_detected BOOLEAN,
        touch_support BOOLEAN,
        raw_headers JSONB,
        raw_telemetry JSONB
      );
    `;

    // Create index on created_at and visitor_id if not exists
    await sql`
      CREATE INDEX IF NOT EXISTS idx_inspection_logs_created_at ON inspection_logs(created_at DESC);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_inspection_logs_visitor_id ON inspection_logs(visitor_id);
    `;

    return { success: true };
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    throw error;
  }
}

export interface TelemetryPayload {
  visitorId?: string;
  ipAddress?: string;
  userAgent?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  deviceType?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  screenResolution?: string;
  colorDepth?: number;
  pixelRatio?: number;
  timezone?: string;
  language?: string;
  languages?: string;
  gpuVendor?: string;
  gpuRenderer?: string;
  canvasHash?: string;
  audioHash?: string;
  batteryLevel?: number;
  isCharging?: boolean;
  connectionType?: string;
  downlink?: number;
  rtt?: number;
  cookiesEnabled?: boolean;
  doNotTrack?: string;
  adBlockerDetected?: boolean;
  incognitoDetected?: boolean;
  touchSupport?: boolean;
  rawHeaders?: Record<string, string>;
  rawTelemetry?: Record<string, unknown>;
}

/**
 * Saves a new inspection entry into Neon PostgreSQL
 */
export async function insertInspectionLog(payload: TelemetryPayload) {
  await initDatabase();

  const id = 'scan_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

  await sql`
    INSERT INTO inspection_logs (
      id,
      visitor_id,
      ip_address,
      user_agent,
      browser_name,
      browser_version,
      os_name,
      os_version,
      device_type,
      device_memory,
      hardware_concurrency,
      screen_resolution,
      color_depth,
      pixel_ratio,
      timezone,
      language,
      languages,
      gpu_vendor,
      gpu_renderer,
      canvas_hash,
      audio_hash,
      battery_level,
      is_charging,
      connection_type,
      downlink,
      rtt,
      cookies_enabled,
      do_not_track,
      ad_blocker_detected,
      incognito_detected,
      touch_support,
      raw_headers,
      raw_telemetry
    ) VALUES (
      ${id},
      ${payload.visitorId || null},
      ${payload.ipAddress || null},
      ${payload.userAgent || null},
      ${payload.browserName || null},
      ${payload.browserVersion || null},
      ${payload.osName || null},
      ${payload.osVersion || null},
      ${payload.deviceType || null},
      ${payload.deviceMemory ?? null},
      ${payload.hardwareConcurrency ?? null},
      ${payload.screenResolution || null},
      ${payload.colorDepth ?? null},
      ${payload.pixelRatio ?? null},
      ${payload.timezone || null},
      ${payload.language || null},
      ${payload.languages || null},
      ${payload.gpuVendor || null},
      ${payload.gpuRenderer || null},
      ${payload.canvasHash || null},
      ${payload.audioHash || null},
      ${payload.batteryLevel ?? null},
      ${payload.isCharging ?? null},
      ${payload.connectionType || null},
      ${payload.downlink ?? null},
      ${payload.rtt ?? null},
      ${payload.cookiesEnabled ?? null},
      ${payload.doNotTrack || null},
      ${payload.adBlockerDetected ?? null},
      ${payload.incognitoDetected ?? null},
      ${payload.touchSupport ?? null},
      ${JSON.stringify(payload.rawHeaders || {})},
      ${JSON.stringify(payload.rawTelemetry || {})}
    )
  `;

  return { id, success: true };
}

/**
 * Retrieves the latest scans from the database
 */
export async function getRecentInspectionLogs(limit: number = 25) {
  await initDatabase();
  const rows = await sql`
    SELECT 
      id,
      created_at,
      visitor_id,
      ip_address,
      browser_name,
      browser_version,
      os_name,
      device_type,
      screen_resolution,
      gpu_renderer,
      canvas_hash,
      timezone,
      ad_blocker_detected,
      incognito_detected
    FROM inspection_logs
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows;
}

/**
 * Retrieves full details for a single inspection log
 */
export async function getInspectionLogById(id: string) {
  await initDatabase();
  const rows = await sql`
    SELECT * FROM inspection_logs WHERE id = ${id} LIMIT 1
  `;
  return rows[0] || null;
}

/**
 * Retrieves inspection logs with pagination and search
 */
export async function getAdminInspectionLogs(options?: {
  limit?: number;
  offset?: number;
  search?: string;
  browser?: string;
  adBlocker?: boolean;
  incognito?: boolean;
}) {
  await initDatabase();
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  const search = options?.search?.trim() || '';

  let rows;
  if (search) {
    const searchPattern = `%${search}%`;
    rows = await sql`
      SELECT *
      FROM inspection_logs
      WHERE 
        ip_address ILIKE ${searchPattern} OR
        visitor_id ILIKE ${searchPattern} OR
        browser_name ILIKE ${searchPattern} OR
        os_name ILIKE ${searchPattern} OR
        gpu_renderer ILIKE ${searchPattern} OR
        user_agent ILIKE ${searchPattern}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    rows = await sql`
      SELECT *
      FROM inspection_logs
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  const [countResult] = await sql`SELECT COUNT(*)::int as total FROM inspection_logs`;
  return {
    logs: rows,
    total: countResult?.total || 0,
  };
}

/**
 * Deletes a single inspection log by ID
 */
export async function deleteInspectionLog(id: string) {
  await initDatabase();
  await sql`DELETE FROM inspection_logs WHERE id = ${id}`;
  return { success: true };
}

/**
 * Clears all inspection logs (for test environment reset)
 */
export async function clearAllInspectionLogs() {
  await initDatabase();
  await sql`TRUNCATE TABLE inspection_logs`;
  return { success: true };
}

/**
 * Aggregates advanced statistics about all visitor scans
 */
export async function getInspectionStats() {
  await initDatabase();
  const [totalCountResult] = await sql`SELECT COUNT(*)::int as count FROM inspection_logs`;
  const totalScans = totalCountResult?.count || 0;

  const [uniqueVisitorsResult] = await sql`SELECT COUNT(DISTINCT visitor_id)::int as count FROM inspection_logs`;
  const [adblockResult] = await sql`SELECT COUNT(*)::int as count FROM inspection_logs WHERE ad_blocker_detected = true`;
  const [incognitoResult] = await sql`SELECT COUNT(*)::int as count FROM inspection_logs WHERE incognito_detected = true`;

  const topBrowsers = await sql`
    SELECT browser_name, COUNT(*)::int as count 
    FROM inspection_logs 
    WHERE browser_name IS NOT NULL 
    GROUP BY browser_name 
    ORDER BY count DESC 
    LIMIT 6
  `;
  const topOS = await sql`
    SELECT os_name, COUNT(*)::int as count 
    FROM inspection_logs 
    WHERE os_name IS NOT NULL 
    GROUP BY os_name 
    ORDER BY count DESC 
    LIMIT 6
  `;
  const topGPUs = await sql`
    SELECT gpu_renderer, COUNT(*)::int as count 
    FROM inspection_logs 
    WHERE gpu_renderer IS NOT NULL AND gpu_renderer != 'Unknown / Blocked'
    GROUP BY gpu_renderer 
    ORDER BY count DESC 
    LIMIT 5
  `;
  const topDevices = await sql`
    SELECT device_type, COUNT(*)::int as count 
    FROM inspection_logs 
    WHERE device_type IS NOT NULL 
    GROUP BY device_type 
    ORDER BY count DESC
  `;

  return {
    totalScans,
    uniqueVisitors: uniqueVisitorsResult?.count || 0,
    adblockCount: adblockResult?.count || 0,
    incognitoCount: incognitoResult?.count || 0,
    topBrowsers,
    topOS,
    topGPUs,
    topDevices,
  };
}
