import { NextResponse } from 'next/server';
import { getRecentInspectionLogs, getInspectionStats } from '@/lib/db';

export async function GET() {
  try {
    const logs = await getRecentInspectionLogs(30);
    const stats = await getInspectionStats();

    return NextResponse.json({
      success: true,
      logs,
      stats,
    });
  } catch (error) {
    console.error('API /api/logs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch logs',
      },
      { status: 500 }
    );
  }
}
