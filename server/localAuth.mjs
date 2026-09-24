/**
 * IN-MEMORY DEVELOPMENT AUTH API — NOT PRODUCTION SECURITY.
 * Accounts and sessions reset on server restart. Codes are returned to the
 * browser for explicit on-screen demo, never emailed. Swap this adapter for
 * a production auth provider after the interface has been reviewed.
 */
import { randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';

const accounts = new Map();
const sessions = new Map();
const CODE_LIFETIME = 10 * 60 * 1000;
const RESEND_WAIT = 45 * 1000;
const SESSION_LIFETIME = 7 * 24 * 60 * 60 * 1000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cleanEmail = (value) => String(value ?? '').trim().toLowerCase();
const devCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');
const makeHash = (password, salt) => scryptSync(password, salt, 64).toString('hex');
const publicUser = (a) => ({ id: a.id, name: a.name, email: a.email, verifiedAt: a.verifiedAt });

function json(res, status, data, cookie) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...(cookie ? { 'Set-Cookie': cookie } : {}),
  });
  res.end(JSON.stringify(data));
}
function fail(res, status, code, error, extra = {}) {
  json(res, status, { code, error, ...extra });
}
function body(req) {
  return new Promise((resolve, reject) => {
    let text = '';
    req.on('data', (chunk) => {
      text += chunk;
      if (text.length > 16384) {
        reject(new Error('Request is too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(text || '{}')); }
      catch { reject(new Error('Invalid JSON.')); }
    });
    req.on('error', reject);
  });
}
function getSession(req) {
  const value = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith('trustos_dev_session='));
  const token = value?.slice('trustos_dev_session='.length);
  const session = token && sessions.get(token);
  if (!session || session.expires < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return { session, token, account: accounts.get(session.email) };
}
function issueSession(res, account) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { email: account.email, expires: Date.now() + SESSION_LIFETIME });
  json(res, 200, { user: publicUser(account), preview: true }, `trustos_dev_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_LIFETIME / 1000}`);
}
const resetCookie = 'trustos_dev_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0';

export function createLocalAuthHandler() {
  return async (req, res) => {
    const pathname = new URL(req.url, 'http://local.trustos').pathname;
    if (pathname === '/api/health') return json(res, 200, { status: 'ok', mode: 'in-memory-development' });
    if (pathname === '/api/auth/session' && req.method === 'GET') {
      const found = getSession(req);
      return json(res, 200, { user: found?.account?.verifiedAt ? publicUser(found.account) : null, preview: true });
    }
    if (req.method !== 'POST') return fail(res, 404, 'NOT_FOUND', 'Local API route not found.');

    let data;
    try { data = await body(req); }
    catch { return fail(res, 400, 'INVALID_REQUEST', 'We could not read that request.'); }

    if (pathname === '/api/auth/signup') {
      const email = cleanEmail(data.email);
      const name = String(data.name ?? '').trim().replace(/\s+/g, ' ');
      const password = String(data.password ?? '');
      if (!name || name.length > 80 || !emailPattern.test(email) || email.length > 254 || password.length < 8 || password.length > 128) {
        return fail(res, 400, 'INVALID_DETAILS', 'Enter a name, a valid email, and a password of at least 8 characters.');
      }
      if (data.termsAccepted !== true) return fail(res, 400, 'TERMS_REQUIRED', 'Please accept the preview Terms & Conditions to continue.');
      if (accounts.has(email)) return fail(res, 409, 'EMAIL_EXISTS', 'An account with this email already exists. Try logging in.');
      const salt = randomBytes(16).toString('hex');
      const code = devCode();
      accounts.set(email, {
        id: randomBytes(12).toString('hex'), name, email, salt,
        hash: makeHash(password, salt), verifiedAt: null,
        code, codeExpires: Date.now() + CODE_LIFETIME, nextResend: Date.now() + RESEND_WAIT,
        resetCode: null, resetExpires: 0,
      });
      return json(res, 201, { email, devCode: code, resendAfterSeconds: 45, expiresAfterMinutes: 10, preview: true });
    }
    if (pathname === '/api/auth/login') {
      const email = cleanEmail(data.email);
      const account = accounts.get(email);
      const password = String(data.password ?? '');
      if (!account || !password || password.length > 128) return fail(res, 401, 'INVALID_CREDENTIALS', 'That email and password combination does not match.');
      const candidate = Buffer.from(makeHash(password, account.salt), 'hex');
      if (!timingSafeEqual(candidate, Buffer.from(account.hash, 'hex'))) return fail(res, 401, 'INVALID_CREDENTIALS', 'That email and password combination does not match.');
      if (!account.verifiedAt) return fail(res, 403, 'EMAIL_UNVERIFIED', 'Please complete the local verification step first.', { email, devCode: account.code });
      return issueSession(res, account);
    }
    if (pathname === '/api/auth/verify') {
      const email = cleanEmail(data.email);
      const account = accounts.get(email);
      const code = String(data.code ?? '').trim();
      if (!account || account.verifiedAt) return fail(res, 400, 'INVALID_VERIFICATION', 'There is no pending verification for this email.');
      if (!account.code || account.codeExpires < Date.now()) return fail(res, 400, 'CODE_EXPIRED', 'This local verification code has expired. Request a new one.');
      if (code !== account.code) return fail(res, 400, 'CODE_INVALID', 'That code does not match. Please check the on-screen demo code.');
      account.verifiedAt = new Date().toISOString();
      account.code = null;
      return issueSession(res, account);
    }
    if (pathname === '/api/auth/resend') {
      const email = cleanEmail(data.email);
      const account = accounts.get(email);
      if (!account || account.verifiedAt) return fail(res, 400, 'INVALID_VERIFICATION', 'There is no pending verification for this email.');
      const remaining = Math.ceil((account.nextResend - Date.now()) / 1000);
      if (remaining > 0) return fail(res, 429, 'WAIT_TO_RESEND', `Try again in ${remaining} seconds.`, { retryAfterSeconds: remaining });
      account.code = devCode();
      account.codeExpires = Date.now() + CODE_LIFETIME;
      account.nextResend = Date.now() + RESEND_WAIT;
      return json(res, 200, { email, devCode: account.code, resendAfterSeconds: 45, expiresAfterMinutes: 10, preview: true });
    }
    if (pathname === '/api/auth/password/request') {
      const email = cleanEmail(data.email);
      if (!emailPattern.test(email)) return fail(res, 400, 'INVALID_EMAIL', 'Enter a valid email address.');
      const account = accounts.get(email);
      if (account) {
        account.resetCode = devCode();
        account.resetExpires = Date.now() + CODE_LIFETIME;
      }
      // Dev code only exists when a matching local account exists. Never sent by email.
      return json(res, 200, { email, devCode: account?.resetCode ?? null, preview: true });
    }
    if (pathname === '/api/auth/password/reset') {
      const email = cleanEmail(data.email);
      const account = accounts.get(email);
      const password = String(data.password ?? '');
      if (password.length < 8 || password.length > 128) return fail(res, 400, 'INVALID_PASSWORD', 'Use a password of at least 8 characters.');
      if (!account?.resetCode || account.resetExpires < Date.now() || String(data.code ?? '').trim() !== account.resetCode) {
        return fail(res, 400, 'INVALID_RESET_CODE', 'That local reset code is invalid or has expired. Request another code.');
      }
      account.salt = randomBytes(16).toString('hex');
      account.hash = makeHash(password, account.salt);
      account.resetCode = null;
      for (const [token, value] of sessions) if (value.email === email) sessions.delete(token);
      return json(res, 200, { ok: true, preview: true });
    }
    if (pathname === '/api/auth/logout') {
      const found = getSession(req);
      if (found) sessions.delete(found.token);
      return json(res, 200, { ok: true }, resetCookie);
    }
    return fail(res, 404, 'NOT_FOUND', 'Local API route not found.');
  };
}
