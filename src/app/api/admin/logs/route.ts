import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/auth';
import {
  getAdminInspectionLogs,
  getInspectionLogById,
  getInspectionStats,
  deleteInspectionLog,
  clearAllInspectionLogs,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const isAuth = await validateAdminSession();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const log = await getInspectionLogById(id);
      if (!log) {
        return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, log });
    }

    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || '';

    const { logs, total } = await getAdminInspectionLogs({ limit, offset, search });
    const stats = await getInspectionStats();

    return NextResponse.json({
      success: true,
      logs,
      total,
      stats,
    });
  } catch (error) {
    console.error('API /api/admin/logs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query admin logs',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAuth = await validateAdminSession();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    if (all) {
      await clearAllInspectionLogs();
      return NextResponse.json({ success: true, message: 'All logs cleared' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing log ID' }, { status: 400 });
    }

    await deleteInspectionLog(id);
    return NextResponse.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('API /api/admin/logs DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete log',
      },
      { status: 500 }
    );
  }
}
