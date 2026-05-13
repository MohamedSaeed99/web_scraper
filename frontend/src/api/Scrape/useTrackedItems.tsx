import { useQuery } from "@tanstack/react-query";

export type TrackedItem = {
    id: number;
    url: string;
    item_name: string | null;
    price: number | null;
    buy_link: string | null;
    threshold: number | null;
    notify_email: string | null;
    last_checked: string | null;
    created_at: string;
};

const fetchTrackedItems = async (): Promise<TrackedItem[]> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/scrape/`);
    if (!response.ok) throw new Error("Failed to fetch tracked items");
    return response.json();
};

export const useTrackedItems = () => {
    return useQuery({
        queryKey: ["trackedItems"],
        queryFn: fetchTrackedItems,
    });
};
