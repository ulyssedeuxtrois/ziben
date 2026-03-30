/**
 * Rate limiter in-memory (MVP).
 * Reset au restart du serveur — suffisant pour un seul instance Render.
 */

const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

// Nettoyage périodique des entrées expirées (évite fuite mémoire)
setInterval(() => {
  const now = Date.now();
  attempts.forEach((entry, key) => {
    if (now > entry.resetAt) attempts.delete(key);
  });
}, 5 * 60_000);
