import { z } from "zod";
import { geminiModel } from "./client";

function stripMarkdownFences(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "");
        cleaned = cleaned.replace(/\s*```$/, "");
    }
    return cleaned.trim();
}

export async function parseGeminiJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    maxRetries = 1
): Promise<T> {
    let lastError: Error | null = null;
    let lastRaw: unknown = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await geminiModel.generateContent(prompt);
            const text = result.response.text();
            const cleaned = stripMarkdownFences(text);
            const parsed = JSON.parse(cleaned);
            lastRaw = parsed;

            const validated = schema.safeParse(parsed);
            if (validated.success) {
                return validated.data;
            }

            // Log validation issues but try to use the raw data if structurally ok
            console.warn(
                `Gemini response validation issues (attempt ${attempt + 1}):`,
                JSON.stringify(validated.error.issues.slice(0, 3))
            );

            // If it's a retry, try once more with the AI
            if (attempt < maxRetries) {
                continue;
            }

            // On final attempt, return the raw parsed data as-is (best effort)
            return parsed as T;
        } catch (error) {
            lastError =
                error instanceof Error ? error : new Error(String(error));

            if (attempt < maxRetries) {
                continue;
            }
        }
    }

    // If we have raw parsed data but schema failed, return it anyway
    if (lastRaw !== null) {
        return lastRaw as T;
    }

    throw new Error(
        `Failed to parse Gemini response after ${maxRetries + 1} attempts: ${lastError?.message}`
    );
}

export async function getGeminiText(
    prompt: string,
    maxRetries = 1
): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await geminiModel.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            lastError =
                error instanceof Error ? error : new Error(String(error));

            if (attempt < maxRetries) {
                continue;
            }
        }
    }

    throw new Error(
        `Failed to get Gemini text after ${maxRetries + 1} attempts: ${lastError?.message}`
    );
}
