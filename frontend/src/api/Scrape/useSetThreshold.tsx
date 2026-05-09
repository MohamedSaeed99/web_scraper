import { useMutation, useQueryClient } from "@tanstack/react-query";

const setThreshold = async ({ id, threshold }: { id: number; threshold: number }) => {
    const response = await fetch(`http://localhost:8000/scrape/${id}/threshold`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold }),
    });
    if (!response.ok) throw new Error("Failed to set threshold");
    return response.json();
};

export const useSetThreshold = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setThreshold,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trackedItems"] });
        },
    });
};
