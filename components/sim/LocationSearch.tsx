"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";

interface LocationSearchProps {
    onSelect: (name: string, lat: number, lng: number, country: string) => void;
}

interface SearchResult {
    id: string;
    place_name: string;
    center: [number, number];
    context?: Array<{ id: string; text: string }>;
}

const ASEAN_BBOX = "92.2,-11.0,141.0,28.5";

export default function LocationSearch({ onSelect }: LocationSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const search = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            return;
        }

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) return;

        setIsSearching(true);
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&bbox=${ASEAN_BBOX}&limit=5&types=place,locality,neighborhood`;
            const res = await fetch(url);
            const data = await res.json();
            setResults(data.features ?? []);
            setIsOpen(true);
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    function handleInputChange(value: string) {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(value), 300);
    }

    function handleSelect(result: SearchResult) {
        const country = result.context?.find((c) => c.id.startsWith("country"))?.text ?? "";
        onSelect(result.place_name, result.center[1], result.center[0], country);
        setQuery(result.place_name);
        setIsOpen(false);
        setResults([]);
    }

    return (
        <div ref={containerRef} className="relative w-full max-w-sm mx-auto sm:max-w-md">
            <div className="flex items-center gap-2 rounded-2xl bg-card/90 backdrop-blur-md border border-border px-4 py-3 shadow-lg">
                {isSearching ? (
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin shrink-0" />
                ) : (
                    <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Search a location in ASEAN..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-xl overflow-hidden z-50">
                    {results.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => handleSelect(r)}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm hover:bg-primary/10 transition-colors"
                        >
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate">{r.place_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
