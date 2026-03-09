import "server-only";
import type { ClimateHeadline } from "@/types";

const GNEWS_TOP_HEADLINES = "https://gnews.io/api/v4/top-headlines";

/* ── SRP headline — always included ── */
const SRP_HEADLINE: ClimateHeadline = {
    id: "fallback-srp-cebu",
    title: "SRP Dumpsite in Cebu Raises Health and Environmental Concerns",
    description:
        "The South Road Properties landfill in Cebu City continues to affect nearby communities with air quality issues and groundwater contamination risks.",
    source: "Cebu Daily News",
    url: "https://cebudailynews.inquirer.net",
    publishedAt: "2025-01-15T00:00:00Z",
    locationTag: "Cebu, Philippines",
    resolvedLat: 10.270399,
    resolvedLng: 123.868957,
};

/* ── Additional fallbacks when GNews fails ── */
const OTHER_FALLBACKS: ClimateHeadline[] = [
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

/** Returns true when the string looks like raw coordinates ("10.81, 118.50"). */
function isCoordinateLike(raw: string): boolean {
    return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(raw.trim());
}

const MAX_HEADLINES = 5; // SRP + up to 4 from GNews
const CLIMATE_QUERY = "climate OR environment OR pollution OR disaster";

export async function fetchHeadlines(
    locationName: string
): Promise<ClimateHeadline[]> {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
        console.warn("GNEWS_API_KEY not set, returning fallbacks");
        return [SRP_HEADLINE, ...OTHER_FALLBACKS].slice(0, MAX_HEADLINES);
    }

    try {
        // Build params for the top-headlines endpoint
        const params = new URLSearchParams({
            q: CLIMATE_QUERY,
            token: apiKey,
            lang: "en",
            max: String(MAX_HEADLINES - 1), // leave room for SRP
            category: "general",
        });

        // If we have a real location name (not coordinates), append it to
        // the query so results skew toward that region
        const trimmed = locationName.trim();
        if (trimmed && !isCoordinateLike(trimmed)) {
            params.set("q", `${trimmed} AND (${CLIMATE_QUERY})`);
        }

        const res = await fetch(
            `${GNEWS_TOP_HEADLINES}?${params.toString()}`
        );
        if (!res.ok) {
            console.error("GNews API error:", res.status);
            return [SRP_HEADLINE, ...OTHER_FALLBACKS].slice(0, MAX_HEADLINES);
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

        // Always lead with SRP, fill remaining slots with GNews articles
        return [SRP_HEADLINE, ...articles].slice(0, MAX_HEADLINES);
    } catch (error) {
        console.error("GNews fetch error:", error);
        return [SRP_HEADLINE, ...OTHER_FALLBACKS].slice(0, MAX_HEADLINES);
    }
}

