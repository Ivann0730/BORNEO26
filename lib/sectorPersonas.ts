export interface SectorPersona {
    name: string;
    role: string;
    avatarEmoji: string;
}

export const SECTOR_PERSONAS: Record<string, SectorPersona> = {
    "Agriculture": { name: "Rina", role: "Smallholder Farmer", avatarEmoji: "🧑🌾" },
    "Infrastructure": { name: "Marco", role: "City Infrastructure Planner", avatarEmoji: "🏗️" },
    "Public Health": { name: "Dr. Asel", role: "Community Health Officer", avatarEmoji: "🩺" },
    "Economy": { name: "James", role: "Local Business Owner", avatarEmoji: "🏪" },
    "Biodiversity": { name: "Priya", role: "Conservation Researcher", avatarEmoji: "🌿" },
    "Energy": { name: "Tariq", role: "Utility Grid Engineer", avatarEmoji: "⚡" },
    "Housing": { name: "Fatima", role: "Displaced Resident", avatarEmoji: "🏠" },
    "Water": { name: "Luca", role: "Municipal Water Manager", avatarEmoji: "💧" },
    "Transport": { name: "Sofia", role: "Public Transit Coordinator", avatarEmoji: "🚌" },
    "Education": { name: "Mr. Yaw", role: "School Principal", avatarEmoji: "📚" },
    "Residential": { name: "Fatima", role: "Local Resident", avatarEmoji: "🏠" },
    "Commercial": { name: "James", role: "Local Business Owner", avatarEmoji: "🏪" },
    "Industrial": { name: "Chen", role: "Factory Operations Manager", avatarEmoji: "🏭" },
    "Institutional": { name: "Dr. Asel", role: "Public Servant", avatarEmoji: "🏛️" },
    "Central Business District": { name: "Priya", role: "Corporate Executive", avatarEmoji: "🏢" },
    "Mixed Use": { name: "Marco", role: "Community Organizer", avatarEmoji: "🏘️" },
    "Green/Open Space": { name: "Rina", role: "Parks Coordinator", avatarEmoji: "🌳" }
};
