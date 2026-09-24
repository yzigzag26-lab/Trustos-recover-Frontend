export type User = { id: string; name: string; email: string; verifiedAt: string };
export type SessionResult = { user: User | null; preview: true };
export type CodeResult = { email: string; devCode: string; resendAfterSeconds: number; expiresAfterMinutes: number; preview: true };
export type PasswordRequestResult = { email: string; devCode: string | null; preview: true };

export class AuthError extends Error {
  code: string;
  retryAfterSeconds?: number;
  devCode?: string;
  email?: string;
  constructor(data: { error?: string; code?: string; retryAfterSeconds?: number; devCode?: string; email?: string }) {
    super(data.error || 'Something went wrong. Please try again.');
    this.name = 'AuthError';
    this.code = data.code || 'UNKNOWN_ERROR';
    this.retryAfterSeconds = data.retryAfterSeconds;
    this.devCode = data.devCode;
    this.email = data.email;
  }
}

async function request<T>(path: string, payload?: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: payload ? 'POST' : 'GET',
      headers: payload ? { 'Content-Type': 'application/json' } : undefined,
      credentials: 'same-origin',
      body: payload ? JSON.stringify(payload) : undefined,
    });
  } catch {
    throw new AuthError({ code: 'NETWORK_ERROR', error: 'The local development service is unavailable. Please refresh and try again.' });
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new AuthError(result);
  return result as T;
}

/** Replace this one adapter when a production auth provider is approved. */
export const authService = {
  session: () => request<SessionResult>('session'),
  signup: (name: string, email: string, password: string, termsAccepted: boolean) =>
    request<CodeResult>('signup', { name, email, password, termsAccepted }),
  login: (email: string, password: string) => request<SessionResult>('login', { email, password }),
  verify: (email: string, code: string) => request<SessionResult>('verify', { email, code }),
  resend: (email: string) => request<CodeResult>('resend', { email }),
  requestPasswordReset: (email: string) => request<PasswordRequestResult>('password/request', { email }),
  resetPassword: (email: string, code: string, password: string) =>
    request<{ ok: boolean }>('password/reset', { email, code, password }),
  logout: () => request<{ ok: boolean }>('logout', {}),
};
