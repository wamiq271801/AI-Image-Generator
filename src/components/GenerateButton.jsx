import React from "react";

/**
 * GenerateButton
 *
 * Props:
 *  onClick   {function}
 *  loading   {boolean}  - shows spinner + "Generating…"
 *  disabled  {boolean}  - also disabled during cooldown
 */
export default function GenerateButton({ onClick, loading, disabled }) {
    return (
        <button
            className="btn-primary w-full text-base"
            onClick={onClick}
            disabled={disabled || loading}
            aria-label={loading ? "Generating image…" : "Generate image"}
        >
            {loading ? (
                <>
                    {/* Spinner */}
                    <svg
                        className="w-5 h-5 animate-spin-slow"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                        />
                    </svg>
                    Generating…
                </>
            ) : (
                <>
                    {/* Sparkle icon */}
                    <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <path d="M12 2l2.4 7.2H22l-6.2 4.6 2.4 7.2L12 17l-6.2 4L8.2 13.8 2 9.2h7.6z" />
                    </svg>
                    Generate Image
                </>
            )}
        </button>
    );
}
