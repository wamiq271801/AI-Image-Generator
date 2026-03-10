import React from "react";

/**
 * ErrorMessage — Displays a human-readable error with appropriate icon/color.
 *
 * Props:
 *  error   {string | null}  - message to show
 *  status  {number | null}  - HTTP status code (400/403/429/500)
 *  onDismiss {function}     - optional dismiss callback
 */

const STATUS_CONFIG = {
    400: {
        icon: "⚠️",
        label: "Invalid request",
        color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    },
    403: {
        icon: "🛡️",
        label: "Verification failed",
        color: "border-orange-500/40 bg-orange-500/10 text-orange-300",
    },
    429: {
        icon: "⏱️",
        label: "Rate limit exceeded",
        color: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    },
    500: {
        icon: "⚡",
        label: "Server error",
        color: "border-red-500/40 bg-red-500/10 text-red-400",
    },
};

export default function ErrorMessage({ error, status, onDismiss }) {
    if (!error) return null;

    const cfg = STATUS_CONFIG[status] ?? {
        icon: "❌",
        label: "Error",
        color: "border-red-500/40 bg-red-500/10 text-red-400",
    };

    return (
        <div
            role="alert"
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm animate-slide-up ${cfg.color}`}
        >
            <span className="text-lg mt-0.5" aria-hidden="true">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
                <p className="font-semibold">{cfg.label}</p>
                <p className="mt-0.5 leading-snug opacity-90">{error}</p>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
                    aria-label="Dismiss error"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
