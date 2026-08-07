# 🛡️ SupplyShield Live

Real-time supply chain security and supplier risk monitoring. SupplyShield Live gives procurement and security teams a single pane of glass to track supplier portfolios, investigate incidents, manage actions, and keep a full audit history — so you can spot risk before it disrupts your operations.

## ✨ Features

- **Supplier Portfolio** — browse and search your entire supplier base with risk posture at a glance
- **Supplier Detail** — drill into a supplier's profile, risk score, and incident history
- **Investigation Workspace** — structured workflows for investigating incidents and supplier risk alerts
- **Action Centre** — track remediation actions and follow-ups to resolution
- **Live Dashboard** — KPIs, risk trends, and recent activity in one view
- **Full History** — immutable audit trail of every event and action
- **Team Authentication** — secure email/password sign-up, login, and session management powered by Supabase Auth
- **Settings** — manage your account and preferences

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4 (custom design system) |
| UI | Custom component library (shadcn-inspired), Lucide icons |
| Backend | Supabase (Auth, Postgres, RLS) |
| Routing | React Router |
| Auth | Supabase Auth (email/password) |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/phunkie24/supplyshield-live.git
cd supplyshield-live

# 2. Install dependencies
npm install

# 3. Configure Supabase
# Create a .env.local (or add to your environment) with:
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** Never commit real Supabase keys. The anon key is publishable by design (protected by Row Level Security); the service-role key must stay server-side only.

### Database Setup

The schema lives in `docs/prd/schema.md`. Apply the migration (tables, RLS policies, and triggers) to your Supabase project, then run `npm run build` to generate TypeScript types.

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
├── src/
│   ├── components/       # Reusable UI components (AuthGuard, ui/ library)
│   ├── contexts/         # React contexts (AuthContext)
│   ├── layouts/          # AppLayout, PublicLayout
│   ├── lib/              # supabase client, utilities
│   ├── pages/            # Route-level pages
│   ├── types/            # Database and domain types
│   ├── App.tsx           # Route definitions
│   ├── index.css         # Tailwind v4 theme tokens
│   └── main.tsx          # Entry point
├── docs/                 # PRD, schema, technical spec, design system
├── public/               # Static assets
├── index.html
└── package.json
```

## 📖 Documentation

- [Product Overview](docs/prd/overview.md)
- [Database Schema](docs/prd/schema.md)
- [Technical Specification](docs/prd/technical-spec.md)
- [Design System](docs/design-system/MASTER.md)

## 🛡️ Security

- Row Level Security (RLS) enforced on all tables
- Supabase Auth for authentication with secure session handling
- No secrets in client code — anything sensitive runs through Supabase Edge Functions with secrets stored in the Secret Manager

## 📄 License

Proprietary — © SupplyShield. All rights reserved.
