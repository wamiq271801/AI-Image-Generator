import React from "react";

/**
 * PromptInput — Styled textarea with real-time character count.
 *
 * Props:
 *  value       {string}   - controlled value
 *  onChange    {function} - (newValue: string) => void
 *  onSubmit    {function} - () => void  (called on Ctrl+Enter / Cmd+Enter)
 *  disabled    {boolean}
 */
export default function PromptInput({ value, onChange, onSubmit, disabled }) {
    const MAX = 300;
    const remaining = MAX - value.length;
    const nearLimit = remaining <= 30;

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            onSubmit?.();
        }
    }

    return (
        <div className="glass-card p-1 focus-within:ring-2 focus-within:ring-brand-500/60 transition-all duration-200">
            <div className="p-4">
                <textarea
                    className="prompt-textarea min-h-[110px]"
                    placeholder="Describe the image you want to generate…&#10;e.g. a neon-lit cyberpunk city at night, rain-soaked streets"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={MAX}
                    disabled={disabled}
                    aria-label="Image prompt"
                    rows={4}
                />
            </div>
            <div className="flex items-center justify-between px-4 pb-3 border-t border-surface-border/50 pt-2">
                <p className="text-xs text-slate-500">
                    Press <kbd className="px-1.5 py-0.5 bg-surface-border text-slate-400 rounded text-[10px] font-mono">Ctrl+Enter</kbd> to generate
                </p>
                <span
                    className={`text-xs font-medium tabular-nums transition-colors ${nearLimit
                        ? remaining <= 10
                            ? "text-red-400"
                            : "text-amber-400"
                        : "text-slate-500"
                        }`}
                >
                    {remaining} / {MAX}
                </span>
            </div>
        </div>
    );
}
