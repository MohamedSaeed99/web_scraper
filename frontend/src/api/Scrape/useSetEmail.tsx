import { useMutation, useQueryClient } from "@tanstack/react-query";

const setEmail = async ({ id, notify_email }: { id: number; notify_email: string | null }) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/scrape/${id}/email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notify_email }),
    });
    if (!response.ok) throw new Error("Failed to set email");
    return response.json();
};

export const useSetEmail = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setEmail,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trackedItems"] });
        },
    });
};
