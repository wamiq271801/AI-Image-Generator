import React, { useCallback, useRef, useState } from "react";
import PromptInput from "./components/PromptInput";
import GenerateButton from "./components/GenerateButton";
import ImageViewer from "./components/ImageViewer";
import CooldownTimer from "./components/CooldownTimer";
import ErrorMessage from "./components/ErrorMessage";
import { generateImage } from "./services/api";
import {
    isCooldownActive,
    setCooldownEnd,
    secondsRemaining,
} from "./utils/cooldown";

export default function App() {
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [imagePrompt, setImagePrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [cooldownSecs, setCooldownSecs] = useState(
        isCooldownActive() ? secondsRemaining() : 0
    );
    const [error, setError] = useState(null);
    const [errorStatus, setErrorStatus] = useState(null);

    const handleGenerate = useCallback(async () => {
        setError(null);
        setErrorStatus(null);

        // ── Client-side cooldown check ───────────────────────────────
        if (isCooldownActive()) {
            setCooldownSecs(secondsRemaining());
            return;
        }

        // ── Prompt validation (mirror server-side) ───────────────────
        const trimmed = prompt.trim();
        if (!trimmed) {
            setError("Please enter a prompt before generating.");
            setErrorStatus(400);
            return;
        }
        if (trimmed.length > 300) {
            setError("Prompt must not exceed 300 characters.");
            setErrorStatus(400);
            return;
        }

        setLoading(true);
        try {
            const result = await generateImage(trimmed);
            setImageUrl(result.imageUrl);
            setImagePrompt(result.prompt);
            setCooldownEnd();
            setCooldownSecs(60);
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
            setErrorStatus(err.status || 500);
            // If rate-limited by server, sync the frontend cooldown too
            if (err.status === 429) {
                setCooldownEnd();
                setCooldownSecs(err.retryAfter || 60);
            }
        } finally {
            setLoading(false);
        }
    }, [prompt]);

    const isDisabled = loading || cooldownSecs > 0;

    return (
        <div className="min-h-screen bg-surface bg-hero-gradient">
            {/* ── Header ───────────────────────────────────────────────── */}
            <header className="border-b border-surface-border/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-button-gradient flex items-center justify-center shadow-glow">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.2H22l-6.2 4.6 2.4 7.2L12 17l-6.2 4L8.2 13.8 2 9.2h7.6z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white leading-none">AI Image Generator</h1>
                        <p className="text-xs text-slate-500 leading-none mt-0.5">Powered by Pollinations AI</p>
                    </div>
                    <div className="ml-auto">
                        <span className="text-[11px] font-medium text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full px-2.5 py-1">
                            Free · Secure · Fast
                        </span>
                    </div>
                </div>
            </header>

            {/* ── Main ─────────────────────────────────────────────────── */}
            <main className="max-w-5xl mx-auto px-4 py-10">
                {/* Hero */}
                <div className="text-center mb-10 animate-fade-in">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Turn words into<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-violet-400 to-purple-400">
                            stunning visuals
                        </span>
                    </h2>
                    <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
                        Describe anything. Our AI will generate a unique image in seconds — no sign-up required.
                    </p>
                </div>

                {/* Two-column layout on large screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ── Left — Controls ──────────────────────────────────── */}
                    <div className="space-y-4">
                        <PromptInput
                            value={prompt}
                            onChange={setPrompt}
                            onSubmit={handleGenerate}
                            disabled={isDisabled}
                        />

                        {cooldownSecs > 0 && (
                            <div className="glass-card p-4">
                                <CooldownTimer
                                    secondsRemaining={cooldownSecs}
                                    onDone={() => setCooldownSecs(0)}
                                />
                            </div>
                        )}

                        <GenerateButton
                            onClick={handleGenerate}
                            loading={loading}
                            disabled={isDisabled}
                        />

                        <ErrorMessage
                            error={error}
                            status={errorStatus}
                            onDismiss={() => { setError(null); setErrorStatus(null); }}
                        />

                        {/* Info card */}
                        <div className="glass-card px-4 py-3 space-y-2 text-xs text-slate-500">
                            <p className="flex items-start gap-2">
                                <span className="text-brand-400 mt-0.5">✦</span>
                                Images are loaded directly from Pollinations — your data is never stored.
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-brand-400 mt-0.5">✦</span>
                                Same prompt always produces the same image (deterministic seed).
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-brand-400 mt-0.5">✦</span>
                                Rate limited to 1 generation per 60 seconds to ensure fair use.
                            </p>
                        </div>
                    </div>

                    {/* ── Right — Image viewer ─────────────────────────────── */}
                    <div className="flex flex-col">
                        {imageUrl || loading ? (
                            <ImageViewer
                                imageUrl={imageUrl}
                                prompt={imagePrompt || prompt}
                                loading={loading}
                            />
                        ) : (
                            <div className="glass-card flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center min-h-[360px]">
                                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center animate-pulse-glow">
                                    <svg className="w-8 h-8 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="3" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-300">Your image will appear here</p>
                                    <p className="text-sm text-slate-600 mt-1">Enter a prompt and click Generate</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <footer className="border-t border-surface-border/30 mt-16">
                <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                    <p>Built with Pollinations AI · Cloudflare Workers · React</p>
                    <p>Images © their respective prompts · For creative use only</p>
                </div>
            </footer>
        </div>
    );
}
