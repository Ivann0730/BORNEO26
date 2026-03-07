import "server-only";
import { unstable_cache } from "next/cache";
import { fetchHeadlines } from "./gnews";
import type { ClimateHeadline } from "@/types";

export const getCachedHeadlines = unstable_cache(
    async (locationName: string): Promise<ClimateHeadline[]> => {
        return fetchHeadlines(locationName);
    },
    ["headlines"],
    { revalidate: 3600 }
);
