<img width="1901" height="862" alt="Screenshot 2026-03-13 164343" src="https://github.com/user-attachments/assets/fa3472fb-079d-424d-8f8e-385ce25171c4" />


# STEMMA

Built for the BorNEO HackWknd 2026, STEMMA is a geospatial scenario simulation platform designed to bridge the gap between abstract climate data and actionable community education. Representing the Philippines, our team is dedicated to transforming how the ASEAN region visualizes and prepares for its most pressing environmental threats.

### VIDEO DEMO: [Link]
### REPORT: [View Report](https://drive.google.com/file/d/1EIcvyHEKbIps6HSNui63zr-nerH2jYi7/view?usp=sharing)


# The Challenge: AI for Climate Education (Case Study #4)
**ASEAN** is one of the world's most vulnerable regions to climate risks, facing intensifying typhoons, rising sea levels, and devastating heatwaves. Despite the urgency, climate education often remains theoretical and abstract.

**STEMMA** addresses these critical gaps:

**Abstract to Viscera**l: Moving beyond static textbooks to show the reality of climate change.

**Policy Visualization**: Using AI-powered simulators to visualize the environmental and social consequences of policies like carbon taxes or reforestation.

**Local Relevance**: Utilizing personalized AI to adapt complex science into locally relevant, age-appropriate insights.

**Active Problem-Solving:** Turning passive learners into active designers of sustainable systems for water preservation and farming.

# Features
**Interactive Geospatial Interface**: High-fidelity map overlays using deck.gl to visualize rising sea levels and climate impact zones.

**Scenario Simulation Engine**: A decision-driven workflow where users can input parameters such as reforestation rates and urban density to see real-time risk scores.

**AI-Assisted Analysis**: Automated generation of "Climate Headlines" and deep-dive reports via custom API routes to explain the data.

**Shareable Decision Reports**: Dynamically generated reports with unique slugs to foster community-led climate advocacy.

**Accessible UX**: Responsive design featuring a theme toggle and voice hints to ensure education is inclusive for all users.

# Tech Stack
**Framework:** Next.js 15+ (App Router)

**Visualization:** Deck.gl, Mapbox GL JS

**Backend & Persistence:** Supabase

**AI Engine:** Gemini (Genie API) for derived insights and personalized tutoring logic

**State Management:** Custom React Hooks for simulation logic

# Getting Started

Follow these instructions to set up the STEMMA project locally on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+
- npm, yarn, pnpm, or bun

You will also need API keys for the following services:
- **Mapbox** (for map rendering and geocoding)
- **Supabase** (for storing simulation reports)
- **Google Gemini API** (for AI scenario and decision generation)
- **GNews API** (for fetching real-time climate headlines)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ivann0730/BORNEO26.git
   cd BORNEO26
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup

Create a `.env.local` file in the root directory and add the following variables:

```env
# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI & Data APIs
GEMINI_API_KEY=your_google_gemini_api_key
GNEWS_API_KEY=your_gnews_api_key
```

*Note: If `GNEWS_API_KEY` is not provided, the app will fall back to predefined mock headlines (like the Cebu SRP Dumpsite scenario).*

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application supports hot-reloading as you edit files.

# Team James (Philippines)
We are 3rd-year BS Computer Science students at Cebu Institute of Technology – University passionate about leveraging technology for social impact:

* *Ivann James Paradero*
* *Gianna Katrin Carreon*
* *Jervin Ryle Melliza*
* *James Ewican*
* *Lorraine Quezada*

## Acknowledgments

Developed for the **BorNEO HackWknd 2026 Case Study Booklet**. Special thanks to the organizers for highlighting the role of AI in ASEAN Social Impact.

> "we are teaching them to think about their own thinking"

### AI Usage
- Gemini 2.5 Flash (Large Language Model): Used as the core simulation engine to process student policy inputs, generate localized environmental narratives, and perform real-time sentiment analysis of simulated stakeholders.
- Gemini 3 Flash (Development Assistance): Utilized during the development phase for code optimization (Next.js/Turf.js logic), drafting technical documentation, and refining the pedagogical structure of the learning checks.
- Claude Opus 4.6 (Development Assistance): Utilized during the initial setup of the “skeleton” of the application, integrated MapBox with Deck.GL, created the mathematics needed for the zones.
- Claude Sonnet 4.6 (General Prompting): Utilized in the creation of prompts used by the aforementioned AI tools. Also utilized in research of topics, technologies, and general information.
- Gemini Nano Banana (PPT): Utilized in the generation of some images that were used in the PPT for the Demo Video.


<img width="1917" height="867" alt="Loding" src="https://github.com/user-attachments/assets/0e9658d6-177d-4c8b-91d3-b7a31a5804ac" />



