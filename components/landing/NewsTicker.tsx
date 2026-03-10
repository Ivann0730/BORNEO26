import { Waves, Flame, Tornado, Factory, Wheat, Fish, Building, Droplet, Globe, Hospital } from "lucide-react";

const HEADLINES = [
    { Icon: Waves, text: "Sea levels in Jakarta rise 25cm in a decade — thousands displaced", color: "text-blue-400" },
    { Icon: Flame, text: "Record heatwave grips Thailand — Bangkok temperatures hit 44°C", color: "text-orange-500" },
    { Icon: Tornado, text: "Typhoon season intensifies — Philippines braces for Category 5 storms", color: "text-slate-400" },
    { Icon: Factory, text: "Malaysia's air quality index hits hazardous levels amid forest fires", color: "text-stone-400" },
    { Icon: Wheat, text: "Vietnam's Mekong Delta faces severe saltwater intrusion — rice yields drop 40%", color: "text-yellow-500" },
    { Icon: Fish, text: "Coral bleaching devastates 60% of Indonesia's reef systems", color: "text-cyan-400" },
    { Icon: Building, text: "Singapore invests $100B in climate adaptation infrastructure", color: "text-indigo-400" },
    { Icon: Droplet, text: "Myanmar's Irrawaddy River at historic low — water crisis looms", color: "text-sky-400" },
    { Icon: Globe, text: "ASEAN pledges net-zero by 2050 — critics say 'too little, too late'", color: "text-primary" },
    { Icon: Hospital, text: "Dengue cases surge 300% across Southeast Asia amid warming temperatures", color: "text-rose-400" },
];

export default function NewsTicker() {
    /* Duplicate the list so the marquee seamlessly loops */
    const doubled = [...HEADLINES, ...HEADLINES];

    return (
        <div className="relative z-10 w-full overflow-hidden border-y border-border/30 dark:border-border/20 bg-card/30 dark:bg-card/20 backdrop-blur-sm py-3">
            <div className="landing-marquee flex whitespace-nowrap gap-12">
                {doubled.map((item, i) => {
                    const { Icon, text, color } = item;
                    return (
                        <div key={i} className="flex items-center gap-2 shrink-0 px-2">
                            <Icon className={`h-4 w-4 ${color}`} />
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                {text}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
