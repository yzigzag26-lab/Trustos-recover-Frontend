/** Authentication integration seam. The previous development provider has been removed.
 * No replacement provider is configured: every operation rejects without a network call.
 * Keep this contract behind AuthContext until the separately approved auth phase.
 */
export type User = { id: string; name: string; email: string };
export type SessionResult = { user: User | null };

export class AuthError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface AuthService {
  session(): Promise<SessionResult>;
  signup(name: string, email: string, password: string, termsAccepted: boolean): Promise<void>;
  login(email: string, password: string): Promise<SessionResult>;
  requestPasswordReset(email: string): Promise<void>;
  /** A future provider must establish the recovery session from its emailed link. */
  resetPassword(password: string): Promise<void>;
  logout(): Promise<void>;
}

async function unavailable(): Promise<never> {
  throw new AuthError('AUTH_NOT_CONFIGURED', 'Authentication is not connected yet. No request was sent.');
}

/** No accounts, sessions, email delivery, API requests, or signed-in bypasses in this phase. */
export const authService: AuthService = {
  session: unavailable,
  signup: unavailable,
  login: unavailable,
  requestPasswordReset: unavailable,
  resetPassword: unavailable,
  logout: unavailable,
};
