import URLInputForm from "./components/URLInputForm";
import TrackedItemsList from "./components/TrackedItemsList";
import { useScrape } from "./api/Scrape/useScrape";

function App() {
    const { mutate, isPending, error } = useScrape();

    return (
        <div className="app-shell">
            <div className="app-content">
                <header className="app-header">
                    <div className="app-logo">
                        <div className="app-logo-mark">
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="1 5 8 11 15 5" />
                                <line x1="1" y1="10" x2="5" y2="13" />
                                <line x1="15" y1="10" x2="11" y2="13" />
                            </svg>
                        </div>
                        <span className="app-title">Pricehound</span>
                    </div>
                    <p className="app-subtitle">Paste a product URL to start tracking its price.</p>
                </header>

                <URLInputForm
                    handleURLScrape={(url, email) => mutate({ url, email })}
                    isPending={isPending}
                    error={error as Error | null}
                />

                <TrackedItemsList />
            </div>
        </div>
    );
}

export default App;
