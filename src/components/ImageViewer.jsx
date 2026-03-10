import React, { useState } from "react";

/**
 * ImageViewer — Shows the generated image with a download button.
 * The image src is the Pollinations URL returned by the Worker.
 * The browser loads the image directly from Pollinations (never via the Worker).
 *
 * Props:
 *  imageUrl {string}  - direct Pollinations image URL
 *  prompt   {string}  - used for the alt text and download filename
 *  loading  {boolean} - show skeleton while waiting for Worker response
 */
export default function ImageViewer({ imageUrl, prompt, loading }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Reset state whenever the URL changes
    React.useEffect(() => {
        setImgLoaded(false);
        setImgError(false);
    }, [imageUrl]);

    if (loading) {
        return (
            <div className="glass-card overflow-hidden animate-fade-in">
                <div className="aspect-square w-full shimmer" style={{ minHeight: 320 }} />
                <div className="p-4 flex items-center gap-3">
                    <div className="h-3 w-1/2 rounded shimmer" />
                    <div className="h-3 w-1/4 rounded shimmer ml-auto" />
                </div>
            </div>
        );
    }

    if (!imageUrl) return null;

    const filename = `${prompt.slice(0, 40).replace(/\s+/g, "_")}.jpg`;

    return (
        <div className="glass-card overflow-hidden animate-slide-up">
            {/* Image */}
            <div className="relative aspect-square w-full bg-surface overflow-hidden">
                {!imgLoaded && !imgError && (
                    <div className="absolute inset-0 shimmer" />
                )}
                {imgError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
                        <span className="text-4xl">🖼️</span>
                        <p className="text-sm">Image failed to load from Pollinations.</p>
                        <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-400 text-xs hover:underline"
                        >
                            Open directly ↗
                        </a>
                    </div>
                ) : (
                    <img
                        src={imageUrl}
                        alt={prompt}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100 image-reveal" : "opacity-0"
                            }`}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                    />
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-surface-border/60">
                <p className="text-sm text-slate-400 truncate flex-1" title={prompt}>
                    <span className="text-slate-500">Prompt:</span>{" "}
                    <span className="text-slate-300">{prompt}</span>
                </p>
                {/* Download — opens the Pollinations URL directly for the browser to download */}
                <a
                    href={imageUrl}
                    download={filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 border border-brand-500/30 hover:border-brand-400/60 rounded-lg px-3 py-1.5 transition-all duration-200"
                    aria-label="Download image"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Download
                </a>
            </div>
        </div>
    );
}
