import "server-only";
import type { ClimateHeadline } from "@/types";

const GNEWS_BASE = "https://gnews.io/api/v4/search";

const FALLBACK_HEADLINES: ClimateHeadline[] = [
    {
        id: "fallback-srp-cebu",
        title: "SRP Dumpsite in Cebu Raises Health and Environmental Concerns",
        description:
            "The South Road Properties landfill in Cebu City continues to affect nearby communities with air quality issues and groundwater contamination risks.",
        source: "Cebu Daily News",
        url: "https://cebudailynews.inquirer.net",
        publishedAt: "2025-01-15T00:00:00Z",
        locationTag: "Cebu, Philippines",
    },
    {
        id: "fallback-jakarta-flooding",
        title: "Jakarta Flooding Displaces Thousands as Sea Levels Rise",
        description:
            "Repeated flooding in North Jakarta highlights the urgent need for climate adaptation as the city sinks and sea levels continue to rise.",
        source: "Jakarta Post",
        url: "https://www.thejakartapost.com",
        publishedAt: "2025-02-01T00:00:00Z",
        locationTag: "Jakarta, Indonesia",
    },
];

export async function fetchHeadlines(
    locationName: string
): Promise<ClimateHeadline[]> {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
        console.warn("GNEWS_API_KEY not set, returning fallbacks");
        return FALLBACK_HEADLINES;
    }

    try {
        const params = new URLSearchParams({
            q: `climate ${locationName}`,
            token: apiKey,
            lang: "en",
            max: "5",
        });

        const res = await fetch(`${GNEWS_BASE}?${params.toString()}`);
        if (!res.ok) {
            console.error("GNews API error:", res.status);
            return FALLBACK_HEADLINES;
        }

        const data = await res.json();
        const articles: ClimateHeadline[] = (data.articles ?? []).map(
            (a: Record<string, unknown>, i: number) => ({
                id: `gnews-${i}-${Date.now()}`,
                title: String(a.title ?? ""),
                description: String(a.description ?? ""),
                source: (a.source as Record<string, string>)?.name ?? "Unknown",
                url: String(a.url ?? ""),
                publishedAt: String(a.publishedAt ?? ""),
                locationTag: locationName,
            })
        );

        if (articles.length < 3) {
            return [...articles, ...FALLBACK_HEADLINES.slice(0, 3 - articles.length)];
        }

        return articles;
    } catch (error) {
        console.error("GNews fetch error:", error);
        return FALLBACK_HEADLINES;
    }
}
