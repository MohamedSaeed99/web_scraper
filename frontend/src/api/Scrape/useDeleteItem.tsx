import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteItem = async (id: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/scrape/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete item");
    return response.json();
};

export const useDeleteItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trackedItems"] });
        },
    });
};
