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

const PRESETS = [
    { label: "🌆 Cyberpunk", text: "A highly detailed futuristic cyberpunk city street with neon lights, rain, and reflections, 8k resolution, photorealistic" },
    { label: "🐉 Fantasy Dragon", text: "A majestic ancient dragon breathing fire on top of a mountain, epic fantasy art, highly detailed" },
    { label: "🚀 Deep Space", text: "A stunning view of a glowing nebula and a highly detailed futuristic spaceship, space opera, cinematic lighting" },
    { label: "🐶 Cute Puppy", text: "An impossibly cute fluffy puppy playing in a field of glowing magical flowers, soft cinematic lighting, 8k" },
];

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
                    <div className="ml-auto flex items-center gap-3">
                        <a
                            href="https://github.com/wamiq271801/AI-Image-Generator"
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-white transition-colors"
                            aria-label="GitHub Repository"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                        </a>
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
                        <div className="space-y-3">
                            <PromptInput
                                value={prompt}
                                onChange={setPrompt}
                                onSubmit={handleGenerate}
                                disabled={isDisabled}
                            />

                            {/* Preset Prompts */}
                            <div className="flex flex-wrap items-center gap-2 px-1">
                                <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Try:</span>
                                {PRESETS.map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => setPrompt(preset.text)}
                                        disabled={isDisabled}
                                        className="text-[11px] font-medium text-slate-400 bg-surface-border/20 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/30 border border-white/5 hover:shadow-glow-sm px-3 py-1.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

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
                                Every generation is unique with random seeds.
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
