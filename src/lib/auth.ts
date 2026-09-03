import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'cyber_admin_session';
const SECRET = process.env.ADMIN_SECRET_KEY || 'cyber_experiment_secret_key_default_2026';

function signToken(payload: string): string {
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}

function verifyToken(token: string): string | null {
  try {
    const [b64Payload, signature] = token.split('.');
    if (!b64Payload || !signature) return null;

    const payload = Buffer.from(b64Payload, 'base64url').toString('utf8');
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(user: string, pass: string): boolean {
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'cyberadmin2026';

  return user === validUser && pass === validPass;
}

export async function setAdminSessionCookie(username: string) {
  const payload = JSON.stringify({
    user: username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const token = signToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return token;
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function validateAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return false;

  const payloadStr = verifyToken(token);
  if (!payloadStr) return false;

  try {
    const data = JSON.parse(payloadStr);
    if (data.exp && Date.now() < data.exp) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
