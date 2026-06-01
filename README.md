# FixIt Portal 🔧

A full-stack tenant repair request and management portal built with React + Supabase.

## Features

- **Tenant portal** — submit repair requests with photos, urgency, and categories
- **Complaints & requests** — raise complaints, submit requests (keys, transfers, etc.) or suggestions
- **Ticket tracking** — tenants can track their own tickets by phone number
- **Agent dashboard** — view all tickets with search, filtering, and sorting
- **Ticket management** — assign technicians, update status, log repair costs
- **Audit history** — full timeline of every action on a ticket
- **PDF reports** — generate filtered reports for ticket history and expenses

---

## Tech stack

| Layer    | Tech                    |
|----------|-------------------------|
| Frontend | React 18                |
| Database | Supabase (PostgreSQL)   |
| Hosting  | Vercel                  |
| PDF      | jsPDF                   |

---

## Deployment guide

### Step 1 — Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project** — give it a name (e.g. `fixit-portal`) and set a database password
3. Wait ~2 minutes for the project to spin up
4. Go to **SQL Editor** → **New query**
5. Paste the entire contents of `supabase-schema.sql` and click **Run**
6. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 2 — Deploy to Vercel (free)

**Option A — Via GitHub (recommended)**

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create fixit-portal --public --push
   ```
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **Add New Project** → import your `fixit-portal` repo
4. In **Environment Variables**, add:
   - `REACT_APP_SUPABASE_URL` = your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy** — Vercel builds and gives you a live URL in ~2 minutes

**Option B — Via Vercel CLI**

```bash
npm install -g vercel
cd fixit-portal
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
vercel
# Follow the prompts, then:
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
vercel --prod
```

### Step 3 — You're live! 🎉

Your portal will be at `https://fixit-portal-xxxx.vercel.app`

- Share the **Tenant** tab URL with your tenants
- Bookmark the **Agent Dashboard** tab for your management team

---

## Local development

```bash
cd fixit-portal
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local
npm install
npm start
# Opens at http://localhost:3000
```

---

## Customising technicians

Edit `src/lib/constants.js` → `TECHNICIANS` array to add your actual staff names.

## Adding more request subtypes

Edit `src/lib/constants.js` → `REQUEST_SUBTYPES` array.

---

## Project structure

```
fixit-portal/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── RepairForm.jsx      # Tenant repair submission form
│   │   ├── FeedbackForm.jsx    # Complaints / requests / suggestions
│   │   ├── TrackTickets.jsx    # Tenant ticket tracker
│   │   ├── TicketModal.jsx     # Agent ticket detail & editing
│   │   └── ReportModal.jsx     # PDF report generator
│   ├── pages/
│   │   ├── TenantPortal.jsx    # Tenant-facing page
│   │   └── AgentDashboard.jsx  # Agent-facing dashboard
│   ├── lib/
│   │   ├── supabase.js         # Database client & queries
│   │   ├── constants.js        # Categories, technicians, labels
│   │   └── pdf.js              # PDF generation logic
│   ├── App.jsx                 # Root component + navigation
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── supabase-schema.sql         # Run this in Supabase SQL editor
├── vercel.json                 # Vercel SPA routing config
├── .env.example                # Environment variable template
└── package.json
```
