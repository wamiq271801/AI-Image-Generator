/**
 * api.js
 * API service — calls the Cloudflare Worker and returns { imageUrl, seed, prompt }.
 *
 * IMPORTANT: The Worker only returns a URL. The browser loads the image directly
 * from Pollinations — this function never fetches the image itself.
 */

const WORKER_URL = import.meta.env.VITE_WORKER_URL || "";

/**
 * @param {string} prompt         - User's text prompt
 * @returns {Promise<{ imageUrl: string, seed: number, prompt: string }>}
 */
export async function generateImage(prompt) {
    const endpoint = `${WORKER_URL}/api/generate`;

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (!res.ok) {
        // Surface specific error messages from the Worker
        throw Object.assign(
            new Error(data.error || "An unexpected error occurred."),
            { status: res.status, retryAfter: data.retryAfter ?? null }
        );
    }

    if (!data.imageUrl) {
        throw new Error("No image URL returned from server.");
    }

    return {
        imageUrl: data.imageUrl,
        seed: data.seed,
        prompt: data.prompt,
    };
}
