const HEADLINES = [
    "🌊 Sea levels in Jakarta rise 25cm in a decade — thousands displaced",
    "🔥 Record heatwave grips Thailand — Bangkok temperatures hit 44°C",
    "🌪️ Typhoon season intensifies — Philippines braces for Category 5 storms",
    "🏭 Malaysia's air quality index hits hazardous levels amid forest fires",
    "🌾 Vietnam's Mekong Delta faces severe saltwater intrusion — rice yields drop 40%",
    "🐠 Coral bleaching devastates 60% of Indonesia's reef systems",
    "🏗️ Singapore invests $100B in climate adaptation infrastructure",
    "💧 Myanmar's Irrawaddy River at historic low — water crisis looms",
    "🌏 ASEAN pledges net-zero by 2050 — critics say 'too little, too late'",
    "🏥 Dengue cases surge 300% across Southeast Asia amid warming temperatures",
];

export default function NewsTicker() {
    /* Duplicate the list so the marquee seamlessly loops */
    const doubled = [...HEADLINES, ...HEADLINES];

    return (
        <div className="relative z-10 w-full overflow-hidden border-y border-border/30 dark:border-border/20 bg-card/30 dark:bg-card/20 backdrop-blur-sm py-3">
            <div className="landing-marquee flex whitespace-nowrap gap-12">
                {doubled.map((headline, i) => (
                    <span
                        key={i}
                        className="text-xs sm:text-sm font-medium text-muted-foreground shrink-0 px-2"
                    >
                        {headline}
                    </span>
                ))}
            </div>
        </div>
    );
}
