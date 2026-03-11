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

Powered by **Groq · LLaMA 3.3 70B** (free API).

>  **Note:** This is a proof-of-concept prototype built to demonstrate the core AI analysis pipeline. It is not the full production system. The complete JSO integration would use AWS Lambda, SQS, DynamoDB, and EventBridge as described in the assignment architecture.

---

## Live Demo

 **https://consulwatch-kl-59df0e.netlify.app**

**How to use:**
1. Go to [console.groq.com](https://console.groq.com) → Sign up free with Google
2. Click **API Keys** → **Create API Key** → Copy it (starts with `gsk_...`)
3. Paste the key into the app
4. Click **Load Sample** to fill in a demo transcript
5. Click **Analyze Session**
6. View the full quality report 

> Your API key is never stored — it's sent directly from your browser to Groq's API.

---

## Run Locally

```bash
npm install
npm run dev
# Open http://localhost:5173
```

**Prerequisites:** Node.js v18+ → download at [nodejs.org](https://nodejs.org)

---

## Deploy to Netlify

1. Push this folder to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
3. Set **Build command:** `npm run build`
4. Set **Publish directory:** `dist`
5. Click **Deploy site**
6. Done — live URL in ~60 seconds 

---

## Tech Stack

- React 18 + Vite
- Groq API · LLaMA 3.3 70B (via direct browser API call)
- Zero backend — fully client-side
- Deployed on Netlify

---

## Assignment Context

This prototype was built as part of the **JSO Phase-2: Agentic Career Intelligence Development** assignment by Aariyatech Corp Private Limited.

The agent addresses the core Part B task: designing an AI agent that monitors HR consultations and analyzes conversation tone, professionalism, and candidate engagement on the JSO HR Dashboard.

**GitHub:** [github.com/anushkapunekar/consulwatch](https://github.com/anushkapunekar/consultwatch)
