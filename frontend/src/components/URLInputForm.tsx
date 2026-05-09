import { useState } from "react";

type URLInputFormProps = {
    handleURLScrape: (url: string, email?: string) => void;
    isPending?: boolean;
    error?: Error | null;
};

const URLInputForm = ({ handleURLScrape, isPending = false, error }: URLInputFormProps) => {
    const [url, setUrl] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (url.trim()) {
            handleURLScrape(url.trim(), email.trim() || undefined);
            setUrl("");
            setEmail("");
        }
    };

    return (
        <form className="track-form" onSubmit={handleSubmit}>
            <div className="track-input-row">
                <input
                    className="track-input"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://store.com/product/..."
                    disabled={isPending}
                    autoComplete="off"
                    spellCheck={false}
                />
                <button className="track-btn" type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <span className="spinner" />
                            Tracking…
                        </>
                    ) : (
                        "Track"
                    )}
                </button>
            </div>
            <input
                className="track-input track-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alert email (optional)"
                disabled={isPending}
                autoComplete="email"
            />
            {error && (
                <div className="track-error">{error.message}</div>
            )}
        </form>
    );
};

export default URLInputForm;
