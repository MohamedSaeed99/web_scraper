import { useMutation, useQueryClient } from "@tanstack/react-query";

const fetchScrapedData = async ({ url, email }: { url: string; email?: string }) => {
    const params = new URLSearchParams({ url });
    if (email) params.set("email", email);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/scrape/?${params}`, {
        method: "POST",
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to scrape URL");
    }
    return response.json();
};

export const useScrape = () => {
    const queryClient = useQueryClient();
    const { mutate, isPending, error } = useMutation({
        mutationKey: ["scrape"],
        mutationFn: (args: { url: string; email?: string }) => fetchScrapedData(args),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trackedItems"] });
        },
    });

    return { mutate, isPending, error };
};
