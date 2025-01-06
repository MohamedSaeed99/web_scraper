import { useMutation } from "@tanstack/react-query";

const fetchScrapedData = async (url: string) => {
    const response = await fetch(`http://localhost:8000/scrape?url=${url}`);
    return response.json
}

export const useScrape = () => {
    const {
        data,
        mutate
    } = useMutation({ 
        mutationKey: ['scrape'], 
        mutationFn: (url: string) => fetchScrapedData (url),
    });

    return {
        mutate, 
        data,
    }
}


