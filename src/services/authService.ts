import { supabase } from '../lib/supabase';

export type User = {
  id: string;
  name: string;
  email: string;
};

export type SessionResult = {
  user: User | null;
};

export class AuthError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface AuthService {
  session(): Promise<SessionResult>;
  signup(
    name: string,
    email: string,
    password: string,
    termsAccepted: boolean
  ): Promise<void>;
  login(email: string, password: string): Promise<SessionResult>;
  requestPasswordReset(email: string): Promise<void>;
  resendVerification(email: string): Promise<void>;
  resetPassword(password: string): Promise<void>;
  logout(): Promise<void>;
}

function mapUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): User {
  const metadataName = user.user_metadata?.name;

  return {
    id: user.id,
    email: user.email ?? '',
    name:
      typeof metadataName === 'string' && metadataName.trim()
        ? metadataName
        : user.email ?? 'Trustos User',
  };
}

function toAuthError(error: { message: string; name?: string }): AuthError {
  return new AuthError(error.name ?? 'AUTH_ERROR', error.message);
}

const getRedirectUrl = (path: string) =>
  `${window.location.origin}${path}`;

export const authService: AuthService = {
  async session(): Promise<SessionResult> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw toAuthError(error);
    }

    return {
      user: session?.user ? mapUser(session.user) : null,
    };
  },

  async signup(
    name: string,
    email: string,
    password: string,
    termsAccepted: boolean
  ): Promise<void> {
    if (!termsAccepted) {
      throw new AuthError(
        'TERMS_NOT_ACCEPTED',
        'You must accept the Terms & Conditions and Privacy Policy.'
      );
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: getRedirectUrl('/verify'),
      },
    });

    if (error) {
      throw toAuthError(error);
    }
  },

  async login(
    email: string,
    password: string
  ): Promise<SessionResult> {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw toAuthError(error);
    }

    return {
      user: data.user ? mapUser(data.user) : null,
    };
  },

  async requestPasswordReset(email: string): Promise<void> {
    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl('/reset-password'),
      });

    if (error) {
      throw toAuthError(error);
    }
  },

  async resendVerification(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getRedirectUrl('/verify'),
      },
    });

    if (error) {
      throw toAuthError(error);
    }
  },

  async resetPassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw toAuthError(error);
    }
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw toAuthError(error);
    }
  },
};