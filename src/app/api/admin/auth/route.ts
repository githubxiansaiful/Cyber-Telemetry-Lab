import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminCredentials,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  validateAdminSession,
} from '@/lib/auth';

// Check auth status
export async function GET() {
  const isAuthenticated = await validateAdminSession();
  return NextResponse.json({ authenticated: isAuthenticated });
}

// Login
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    await setAdminSessionCookie(username);

    return NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Logout
export async function DELETE() {
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
