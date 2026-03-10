/**
 * cooldown.js
 * localStorage-based cooldown helpers mirroring the 60-second backend rate limit.
 */

const STORAGE_KEY = "ai_image_gen_cooldown_end";
const COOLDOWN_DURATION_MS = 60_000; // 60 seconds

/** Returns the stored cooldown end timestamp (ms), or 0 if none. */
export function getCooldownEnd() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? parseInt(raw, 10) : 0;
    } catch {
        return 0;
    }
}

/** Sets cooldown to expire 60 seconds from now. */
export function setCooldownEnd() {
    try {
        localStorage.setItem(STORAGE_KEY, String(Date.now() + COOLDOWN_DURATION_MS));
    } catch {
        // Fail silently — storage may be blocked in some environments
    }
}

/** Returns true if the user is currently in cooldown. */
export function isCooldownActive() {
    return getCooldownEnd() > Date.now();
}

/** Returns seconds remaining, or 0 if not in cooldown. */
export function secondsRemaining() {
    const end = getCooldownEnd();
    if (!end) return 0;
    return Math.max(0, Math.ceil((end - Date.now()) / 1000));
}
