/**
 * Maps Supabase/PostgreSQL errors to safe, user-friendly messages.
 * Raw error details are logged to the console for debugging only.
 */
export const getSafeErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') return 'An unexpected error occurred. Please try again.';

  const err = error as Record<string, unknown>;

  // Log full error for debugging
  console.error('[App Error]', err);

  // Supabase auth errors – some are safe to surface
  if (typeof err.message === 'string') {
    const msg = err.message.toLowerCase();
    if (msg.includes('invalid login credentials')) return 'Invalid email or password.';
    if (msg.includes('email not confirmed')) return 'Please verify your email before signing in.';
    if (msg.includes('user already registered')) return 'An account with this email already exists.';
    if (msg.includes('password') && msg.includes('characters')) return 'Password must be at least 6 characters.';
    if (msg.includes('rate limit') || msg.includes('too many requests')) return 'Too many attempts. Please wait a moment and try again.';
    if (msg.includes('email rate limit')) return 'Too many emails sent. Please wait before trying again.';
  }

  // PostgreSQL error codes
  if (typeof err.code === 'string') {
    if (err.code === '23505') return 'This item already exists.';
    if (err.code === '23503') return 'A related record was not found.';
    if (err.code === '42501') return 'You do not have permission to perform this action.';
  }

  return 'An unexpected error occurred. Please try again.';
};
