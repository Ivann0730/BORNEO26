import { NextRequest, NextResponse } from "next/server";
import { headlinesQuerySchema } from "@/lib/validations/api";
import { getCachedHeadlines } from "@/lib/news/cache";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const parsed = headlinesQuerySchema.safeParse({
            lat: searchParams.get("lat"),
            lng: searchParams.get("lng"),
        });

        if (!parsed.success) {
            return NextResponse.json([], { status: 200 });
        }

        const locationName = searchParams.get("name") ?? "ASEAN";
        const headlines = await getCachedHeadlines(locationName);

        return NextResponse.json(headlines);
    } catch (error) {
        console.error("Headlines API error:", error);
        return NextResponse.json([], { status: 200 });
    }
}
