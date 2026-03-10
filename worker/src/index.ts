/**
 * index.ts — Cloudflare Worker entry point
 *
 * Route: POST /api/generate
 *
 * Order of operations (per spec):
 *  1. Validate request body & prompt
 *  3. Apply IP rate limiting
 *  4. Generate deterministic seed
 *  5. Encode prompt & construct Pollinations URL
 *  6. Record rate limit
 *  7. Return JSON — NEVER proxies or downloads the image
 */

import { CORS_HEADERS, validatePrompt, jsonResponse } from "./utils";
import { checkRateLimit, setRateLimit, checkGlobalLimit, incrementGlobalLimit } from "./ratelimit";
import { generateSeed, buildImageUrl } from "./pollinations";

export interface Env {
    RATE_LIMIT_KV: KVNamespace;
    POLLINATIONS_PUBLIC_KEY: string;
    POLLINATIONS_SECRET_KEY: string; // set via wrangler secret put
    MAX_IMAGES_PER_WEEK?: string;    // Configurable via wrangler.toml
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // ── CORS preflight ──────────────────────────────────────────────────────
        if (request.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        // ── Route guard ─────────────────────────────────────────────────────────
        if (url.pathname !== "/api/generate" || request.method !== "POST") {
            return jsonResponse({ error: "Not found" }, 404);
        }

        // ── 1. Parse & validate request body ────────────────────────────────────
        let body: Record<string, unknown>;
        try {
            body = (await request.json()) as Record<string, unknown>;
        } catch (err) {
            return jsonResponse({ error: "Invalid JSON format" }, 400);
        }

        const { prompt } = body as {
            prompt: unknown;
        };

        const promptValidation = validatePrompt(prompt);
        if (!promptValidation.valid) {
            return jsonResponse({ error: promptValidation.error }, 400);
        }

        // ── 3. Apply Global Weekly Rate Limiting ──────────────────────────────────
        // Default to 1000 if not set in environment or if parsing fails
        const maxGlobalWeekly = parseInt(env.MAX_IMAGES_PER_WEEK || "1000", 10);
        const globalCheck = await checkGlobalLimit(env.RATE_LIMIT_KV, maxGlobalWeekly);

        if (!globalCheck) {
            return jsonResponse(
                { error: "Global weekly AI image generation limit reached. Please try again next week." },
                429
            );
        }

        // ── 4. Apply IP Rate Limiting ─────────────────────────────────────────────────────
        const ip =
            request.headers.get("CF-Connecting-IP") ??
            request.headers.get("X-Forwarded-For") ??
            "unknown";

        const rateLimitResult = await checkRateLimit(env.RATE_LIMIT_KV, ip);
        if (!rateLimitResult.allowed) {
            return jsonResponse(
                {
                    error: "Please wait 60 seconds before generating again.",
                    retryAfter: rateLimitResult.ttl,
                },
                429
            );
        }

        // ── 4. Generate URL ─────────────────────────────────────────────
        const cleanPrompt = (prompt as string).trim();
        const seed = generateSeed(cleanPrompt);
        const imageUrl = buildImageUrl(cleanPrompt, seed, env.POLLINATIONS_PUBLIC_KEY);

        // 6. Record rate limits AFTER successful processing ────────────────────
        await setRateLimit(env.RATE_LIMIT_KV, ip);
        await incrementGlobalLimit(env.RATE_LIMIT_KV);

        // ── 7. Return JSON to browser ────────────────────────────────────────────
        return jsonResponse({ prompt: cleanPrompt, seed, imageUrl });
    },
} satisfies ExportedHandler<Env>;
