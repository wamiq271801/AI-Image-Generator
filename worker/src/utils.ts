/**
 * utils.ts
 * Shared helpers: CORS headers, prompt validation, response constructors.
 */

export const CORS_HEADERS: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
};

export function corsHeaders(): Record<string, string> {
    return { ...CORS_HEADERS };
}

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validates a prompt string according to spec:
 *  - must not be empty
 *  - must not exceed 300 characters
 *  - must be valid UTF-8 (guaranteed by JS strings, but we check for null bytes)
 */
export function validatePrompt(prompt: unknown): ValidationResult {
    if (typeof prompt !== "string" || prompt.trim().length === 0) {
        return { valid: false, error: "Prompt is required and must be a non-empty string." };
    }
    if (prompt.trim().length > 300) {
        return { valid: false, error: "Prompt must not exceed 300 characters." };
    }
    // Reject null bytes / invalid encoding markers
    if (/\0/.test(prompt)) {
        return { valid: false, error: "Prompt contains invalid characters." };
    }
    return { valid: true };
}

export function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
}
