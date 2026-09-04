/* ============================================================
 * Simple in-memory rate limiter (per IP, fixed window).
 * Cukup untuk single-instance deployment; untuk production
 * berskala besar ganti dengan Redis-backed limiter.
 * ============================================================ */

const buckets = new Map<string, number[]>();

/**
 * Returns true when the request is allowed. Applies a fixed
 * window of `windowSeconds` with at most `maxHits` requests.
 */
export function rateLimit(
  key: string,
  maxHits = 1,
  windowSeconds = 60
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const hits = (buckets.get(key) || []).filter((ts) => now - ts < windowMs);

  if (hits.length >= maxHits) {
    const oldest = hits[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + windowMs - now) / 1000)
    );
    buckets.set(key, hits);
    return { allowed: false, retryAfterSeconds };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Housekeeping: drop stale buckets occasionally to bound memory.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((ts) => now - ts >= windowMs)) buckets.delete(k);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP from proxy headers. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "anonymous"
  );
}
