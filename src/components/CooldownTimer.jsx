import React, { useEffect, useRef, useState } from "react";

/**
 * CooldownTimer
 * Counts down from `secondsRemaining` and calls `onDone` when it hits zero.
 *
 * Props:
 *  secondsRemaining {number}   - total seconds left
 *  onDone           {function} - called when countdown reaches 0
 */
export default function CooldownTimer({ secondsRemaining, onDone }) {
    const [secs, setSecs] = useState(secondsRemaining);
    const intervalRef = useRef(null);

    useEffect(() => {
        setSecs(secondsRemaining);
    }, [secondsRemaining]);

    useEffect(() => {
        if (secs <= 0) {
            onDone?.();
            return;
        }
        intervalRef.current = setInterval(() => {
            setSecs((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    onDone?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [secs, onDone]);

    if (secs <= 0) return null;

    const pct = Math.round((secs / 60) * 100);
    const circumference = 2 * Math.PI * 16;

    return (
        <div className="flex items-center gap-3 justify-center py-2 animate-fade-in">
            {/* Circular progress */}
            <svg className="w-9 h-9 -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#2a2a4a" strokeWidth="3" />
                <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct / 100)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                />
                {/* Number inside circle */}
                <text
                    x="20"
                    y="24"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#a5b4fc"
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    transform="rotate(90, 20, 20)"
                >
                    {secs}
                </text>
            </svg>
            <div>
                <p className="text-sm font-medium text-slate-300">Rate limit active</p>
                <p className="text-xs text-slate-500">
                    Retry in <span className="text-brand-400 font-semibold tabular-nums">{secs}s</span>
                </p>
            </div>
        </div>
    );
}
