import { useEffect, useState } from "react";
import { TrackedItem, useTrackedItems } from "../api/Scrape/useTrackedItems";
import TrackedItemCard from "./TrackedItemCard";

function groupByEmail(items: TrackedItem[]): [string, TrackedItem[]][] {
    const map = new Map<string, TrackedItem[]>();
    for (const item of items) {
        const key = item.notify_email ?? "";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item);
    }
    return [...map.entries()].sort(([a], [b]) => {
        if (a === "") return 1;
        if (b === "") return -1;
        return a.localeCompare(b);
    });
}

const TrackedItemsList = () => {
    const { data: items, isLoading, isError } = useTrackedItems();
    const [activeEmail, setActiveEmail] = useState<string | null>(null);

    const groups = groupByEmail(items ?? []);
    const emailKeys = groups.map(([e]) => e);

    // Reset to "All" if the active email disappears (e.g. last item deleted)
    useEffect(() => {
        if (activeEmail !== null && !emailKeys.includes(activeEmail)) {
            setActiveEmail(null);
        }
    }, [activeEmail, emailKeys.join(",")]);

    if (isLoading) {
        return (
            <div className="loading-state">
                <span className="spinner-lg" />
                Loading tracked items…
            </div>
        );
    }

    if (isError) {
        return (
            <div className="track-error">Failed to load tracked items. Is the backend running?</div>
        );
    }

    const totalCount = items?.length ?? 0;
    const showTabs = groups.length > 1;

    const filteredItems = activeEmail === null
        ? null
        : (items ?? []).filter(item => (item.notify_email ?? "") === activeEmail);

    return (
        <section className="items-section">
            <div className="items-header">
                <span className="items-label">Tracked items</span>
                {totalCount > 0 && (
                    <span className="items-count">
                        {filteredItems ? filteredItems.length : totalCount}
                    </span>
                )}
            </div>

            {totalCount === 0 ? (
                <div className="empty-state">
                    <svg className="empty-icon" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="8" width="30" height="22" rx="3" />
                        <line x1="4" y1="14" x2="34" y2="14" />
                        <line x1="11" y1="21" x2="27" y2="21" />
                        <line x1="11" y1="26" x2="20" y2="26" />
                    </svg>
                    <p className="empty-title">Nothing tracked yet</p>
                    <p className="empty-sub">Paste a product URL above and we'll watch the price for you.</p>
                </div>
            ) : (
                <>
                    {showTabs && (
                        <div className="email-tabs">
                            <button
                                className={`email-tab${activeEmail === null ? " active" : ""}`}
                                onClick={() => setActiveEmail(null)}
                            >
                                All
                            </button>
                            {groups.map(([email, groupItems]) => (
                                <button
                                    key={email || "__no_email__"}
                                    className={`email-tab${activeEmail === email ? " active" : ""}${!email ? " no-email-tab" : ""}`}
                                    onClick={() => setActiveEmail(email)}
                                    title={email || undefined}
                                >
                                    {email || "No email"}
                                    <span className="email-tab-count">{groupItems.length}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {filteredItems ? (
                        <div className="items-list">
                            {filteredItems.map((item, i) => (
                                <TrackedItemCard
                                    key={item.id}
                                    item={item}
                                    animationDelay={i * 60}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="groups-list">
                            {groups.map(([email, groupItems], gi) => (
                                <div key={email || "__no_email__"} className="email-group">
                                    <button
                                        className="email-group-header"
                                        onClick={() => setActiveEmail(email)}
                                        title={email ? `Filter to ${email}` : undefined}
                                    >
                                        {email ? (
                                            <>
                                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="1" y="2.5" width="9" height="6" rx="1" />
                                                    <polyline points="1,2.5 5.5,6 10,2.5" />
                                                </svg>
                                                <span className="email-group-label">{email}</span>
                                            </>
                                        ) : (
                                            <span className="email-group-label no-email">No email set</span>
                                        )}
                                        <span className="items-count">{groupItems.length}</span>
                                    </button>
                                    <div className="items-list">
                                        {groupItems.map((item, i) => (
                                            <TrackedItemCard
                                                key={item.id}
                                                item={item}
                                                animationDelay={gi * 80 + i * 60}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default TrackedItemsList;
