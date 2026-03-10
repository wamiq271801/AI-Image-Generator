/**
 * ratelimit.ts
 * IP-based rate limiting using Cloudflare KV.
 *
 * Strategy:
 *  - Key: `ratelimit:{ip}`
 *  - Value: `"1"` (presence is all we need)
 *  - TTL: 60 seconds (set via KV `expirationTtl`)
 *
 * Returns `allowed: false` if a key already exists for the IP.
 */

const RATE_LIMIT_TTL_SECONDS = 60;
const KEY_PREFIX = "ratelimit:";

// Global weekly limit
const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;
const GLOBAL_KEY_PREFIX = "global_limit_week:";

function getCurrentWeekKey(): string {
    // 0 = Jan 1 1970 week. This ensures every week has a unique integer identifier.
    const weekNumber = Math.floor(Date.now() / (1000 * WEEK_IN_SECONDS));
    return `${GLOBAL_KEY_PREFIX}${weekNumber}`;
}

export interface RateLimitResult {
    allowed: boolean;
    /** Seconds remaining on the cooldown, or 0 if allowed */
    ttl: number;
}

/**
 * Checks whether the IP is within rate limit.
 * Does NOT set the key — call setRateLimit separately on success.
 */
export async function checkRateLimit(
    kv: KVNamespace,
    ip: string
): Promise<RateLimitResult> {
    const key = `${KEY_PREFIX}${ip}`;

    // getWithMetadata gives us the TTL remaining (in seconds)
    const { value, metadata } = await kv.getWithMetadata<{ exp: number }>(key);

    if (value === null) {
        // No key → IP is allowed
        return { allowed: true, ttl: 0 };
    }

    // Key exists → rate limited. Try to infer remaining TTL.
    // Cloudflare KV does not expose remaining TTL directly in getWithMetadata,
    // so we store the expiry timestamp in metadata.
    const now = Math.floor(Date.now() / 1000);
    const remainingTtl =
        metadata && metadata.exp ? Math.max(0, metadata.exp - now) : RATE_LIMIT_TTL_SECONDS;

    return { allowed: false, ttl: remainingTtl };
}

/**
 * Records a generation event for the IP. Must be called AFTER the request succeeds.
 */
export async function setRateLimit(kv: KVNamespace, ip: string): Promise<void> {
    const key = `${KEY_PREFIX}${ip}`;
    const exp = Math.floor(Date.now() / 1000) + RATE_LIMIT_TTL_SECONDS;

    await kv.put(key, "1", {
        expirationTtl: RATE_LIMIT_TTL_SECONDS,
        metadata: { exp },
    });
}

/**
 * Checks if the global total generations this week have exceeded the maximum allowed.
 */
export async function checkGlobalLimit(kv: KVNamespace, maxPerWeek: number): Promise<boolean> {
    if (isNaN(maxPerWeek) || maxPerWeek <= 0) return true; // Disabled or invalid limit

    const key = getCurrentWeekKey();
    const countStr = await kv.get(key);

    if (!countStr) return true; // No generations yet this week

    const count = parseInt(countStr, 10);
    return count < maxPerWeek;
}

/**
 * Increments the global counter for the current week.
 * Note: Cloudflare KV lacks atomic increments. Under extremely high concurrency 
 * this might under-count slightly, but for a 1k weekly limit it is effective.
 */
export async function incrementGlobalLimit(kv: KVNamespace): Promise<void> {
    const key = getCurrentWeekKey();
    const countStr = await kv.get(key);

    const nextCount = (countStr ? parseInt(countStr, 10) : 0) + 1;

    await kv.put(key, String(nextCount), {
        expirationTtl: WEEK_IN_SECONDS * 2, // Keep data alive slightly longer than a week
    });
}
