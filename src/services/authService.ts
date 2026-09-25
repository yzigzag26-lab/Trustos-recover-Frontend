/** Authentication integration seam. The previous development provider has been removed.
 * No replacement provider is configured: every operation rejects without a network call.
 * Keep this contract behind AuthContext until the separately approved auth phase.
 */
export type User = { id: string; name: string; email: string };
export type SessionResult = { user: User | null };
export type CodeResult = { email: string };
export type PasswordRequestResult = { email: string };

export class AuthError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface AuthService {
  session(): Promise<SessionResult>;
  signup(name: string, email: string, password: string, termsAccepted: boolean): Promise<CodeResult>;
  login(email: string, password: string): Promise<SessionResult>;
  verify(email: string, code: string): Promise<SessionResult>;
  resend(email: string): Promise<CodeResult>;
  requestPasswordReset(email: string): Promise<PasswordRequestResult>;
  resetPassword(email: string, code: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

async function unavailable(): Promise<never> {
  throw new AuthError('AUTH_NOT_CONFIGURED', 'Authentication is not connected yet. No request was sent.');
}

/** No accounts, sessions, codes, API requests, or signed-in bypasses in this phase. */
export const authService: AuthService = {
  session: unavailable,
  signup: unavailable,
  login: unavailable,
  verify: unavailable,
  resend: unavailable,
  requestPasswordReset: unavailable,
  resetPassword: unavailable,
  logout: unavailable,
};
