/**
 * pollinations.ts
 * Builds a deterministic Pollinations image URL.
 *
 * CRITICAL: This module NEVER fetches the image. It only constructs and returns
 * the URL string. The browser is responsible for loading the image directly.
 */

const BASE_URL = "https://gen.pollinations.ai/image";
const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 1024;

/**
 * Generates a random positive 32-bit integer for the seed.
 * Ensures identical prompts produce different images every time.
 */
export function generateSeed(_prompt: string): number {
    return Math.floor(Math.random() * 1_000_000) + 1;
}

/**
 * Constructs the Pollinations image URL.
 *
 * Format:
 *   https://image.pollinations.ai/prompt/{encodedPrompt}?seed=…&width=…&height=…&nologo=true
 *
 * Note: The publishable key (pk_xxxxx) is appended as the `key` query param.
 * The secret key NEVER appears here.
 */
export function buildImageUrl(
    prompt: string,
    seed: number,
    publicKey: string,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT
): string {
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const params = new URLSearchParams({
        seed: String(seed),
        width: String(width),
        height: String(height),
        model: "flux",
        nologo: "true",
        ...(publicKey ? { key: publicKey } : {}),
    });

    return `${BASE_URL}/${encodedPrompt}?${params.toString()}`;
}
