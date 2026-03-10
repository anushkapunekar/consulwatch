# JSO ConsultWatch Agent
### HR Consultation Monitoring Agent — JSO Phase-2 Agentic Assignment
**Built by Anushka Punekar**

---

## What it does

ConsultWatch is a live AI agent that analyzes HR consultation transcripts and generates:
- **Overall Quality Score** (0–100)
- **3 dimension scores**: Candidate Engagement, Tone & Professionalism, Content Relevance
- **Session flags** with severity levels
- **Actionable recommendations** for the consultant
- **Candidate experience summary**
- **Consultant trend** indicator

Powered by **Anthropic Claude claude-sonnet-4-20250514**.

---

## Deploy to Vercel (5 minutes)

### Option 1: Vercel CLI
```bash
npm install -g vercel
cd consulwatch
npm install
vercel --prod
```

### Option 2: GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Vite. Hit **Deploy**.
4. Done — live URL in ~60 seconds.

---

## Run locally
```bash
npm install
npm run dev
# Open http://localhost:5173
```

---

## Usage
1. Enter your Anthropic API key (get one at console.anthropic.com)
2. Paste or use the sample consultation transcript
3. Click **Analyze Session**
4. View the full quality report

> Your API key is never stored — it's sent directly from your browser to Anthropic's API.

---

## Tech Stack
- React 18 + Vite
- Anthropic Claude claude-sonnet-4-20250514 (via direct API call)
- Zero backend — fully client-side
- Deployable to Vercel in one command
