import { useState } from "react";
import { TrackedItem } from "../api/Scrape/useTrackedItems";
import { useDeleteItem } from "../api/Scrape/useDeleteItem";
import { useSetThreshold } from "../api/Scrape/useSetThreshold";
import { useSetEmail } from "../api/Scrape/useSetEmail";

type Props = {
    item: TrackedItem;
    animationDelay?: number;
};

function formatLastChecked(ts: string): string {
    const date = new Date(ts + "Z");
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
}

function displayUrl(url: string): string {
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, "") + u.pathname;
    } catch {
        return url;
    }
}

const TrackedItemCard = ({ item, animationDelay = 0 }: Props) => {
    const [thresholdInput, setThresholdInput] = useState(
        item.threshold !== null ? String(item.threshold) : ""
    );
    const [emailInput, setEmailInput] = useState(item.notify_email ?? "");
    const { mutate: deleteItem, isPending: isDeleting } = useDeleteItem();
    const { mutate: setThreshold, isPending: isSaving } = useSetThreshold();
    const { mutate: setEmail, isPending: isSavingEmail } = useSetEmail();

    const handleThresholdSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const value = parseFloat(thresholdInput);
        if (!isNaN(value) && value > 0) {
            setThreshold({ id: item.id, threshold: value });
        }
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setEmail({ id: item.id, notify_email: emailInput.trim() || null });
    };

    const linkHref = item.buy_link || item.url;

    return (
        <div
            className="item-card"
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            {/* Top row: name + delete */}
            <div className="item-card-top">
                <div className="item-meta">
                    <span className="item-name">
                        {item.item_name || "Unknown product"}
                    </span>
                    <a
                        href={linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="item-link"
                        title={linkHref}
                    >
                        {displayUrl(linkHref)}
                    </a>
                </div>
                <button
                    className="delete-btn"
                    onClick={() => deleteItem(item.id)}
                    disabled={isDeleting}
                    title="Remove"
                >
                    {isDeleting ? (
                        <span className="spinner" style={{ borderColor: "rgba(255,77,94,0.3)", borderTopColor: "var(--danger)" }} />
                    ) : (
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <line x1="1" y1="1" x2="10" y2="10" />
                            <line x1="10" y1="1" x2="1" y2="10" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Price */}
            <div className="item-price-row">
                {item.price !== null ? (
                    <span className="item-price">${item.price.toFixed(2)}</span>
                ) : (
                    <span className="item-price na">Price unavailable</span>
                )}
                {item.threshold !== null && (
                    <div className="threshold-badge">
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <polyline points="1,3 4.5,7 8,3" />
                        </svg>
                        alert at ${item.threshold.toFixed(2)}
                    </div>
                )}
            </div>

            {/* Alert form */}
            <div className="card-divider" />
            <form className="alert-form" onSubmit={handleThresholdSubmit}>
                <span className="alert-prefix">Alert below</span>
                <input
                    className="alert-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={thresholdInput}
                    onChange={(e) => setThresholdInput(e.target.value)}
                />
                <button className="alert-save" type="submit" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Set alert"}
                </button>
            </form>

            {/* Email form */}
            <form className="alert-form" onSubmit={handleEmailSubmit}>
                <span className="alert-prefix">Notify</span>
                <input
                    className="alert-input notify-email-input"
                    type="email"
                    placeholder="email@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                />
                <button className="alert-save" type="submit" disabled={isSavingEmail}>
                    {isSavingEmail ? "Saving…" : "Save"}
                </button>
            </form>

            {/* Footer */}
            {item.last_checked && (
                <div className="item-footer">
                    <span className="last-checked">
                        checked {formatLastChecked(item.last_checked)}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TrackedItemCard;
