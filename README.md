# CogLens 🔍

**Enterprise-Grade Fact-Verification Engine for Document Integrity.**

CogLens is a high-performance verification platform designed to ingest PDF documents, perform local heuristic and AI-assisted claim extraction, orchestrate live parallel search queries, and conduct single-pass verification verdicts with granular trust analytics.

This application is built as a Product Management & Engineering assessment for [Cog Culture Agency](https://www.cogculture.agency/). It is optimized for Vercel Serverless deployments and rate-limit resilience.

---

## 🚀 Key Features

*   **Intelligent Claim Extraction:** Scans text documents using a smart line-reconstruction sentence splitter to extract up to 50 factual, statistical, temporal, and comparative assertions.
*   **Dual-AI Resilient Architecture:** Uses **Groq** (`llama-3.3-70b-versatile`) as the primary AI provider for ultra-low latency, and falls back to **Google Gemini** (`gemini-3.5-flash`) on quota exhaustion.
*   **Parallel Search Orchestration:** Executes chunked parallel searches via **Serper API** (Google Search) with concurrent request throttling to avoid rate-limiting.
*   **Single-Pass Batch Verification:** Bundles all extracted claims and search snippets into a single, token-optimized model call to generate verdicts, confidence scores, and reasoning.
*   **Granular Trust Scores:** Calculates an overall document trust score (0–100) using a weighted distribution of claim verdicts (`supported`, `refuted`, `mixed`, `unverifiable`).
*   **Persisted Verification History:** Supports optional persistence of reports via **Supabase** (PostgreSQL) with a graceful no-op fallback.
*   **Editorial Dark Theme:** A minimal, responsive dashboard built with Tailwind CSS and Framer Motion, inspired by premium software tools like Vercel and Linear.

---

## 🛠️ Tech Stack

*   **Frontend & Core:** Next.js 14+ (App Router, Turbopack, Node.js Serverless runtime)
*   **Language:** TypeScript (Strict type checking)
*   **Styling:** Tailwind CSS v4 (Custom dark theme: `#0B0B0B`, `#121212`, `#181818`)
*   **Primary AI Engine:** Groq API (`llama-3.3-70b-versatile` / `mixtral-8x7b-32768`)
*   **Fallback AI Engine:** Google Gemini API (`gemini-3.5-flash` / `gemini-2.5-flash`)
*   **Web Search:** Serper API (Google Organic Search Engine)
*   **Persistence:** Supabase (optional PostgreSQL client)
*   **Deployment:** Vercel (Free Tier Optimized)

---

## 📂 Project Architecture

```
app/
├── api/
│   ├── verify/route.ts       # Core verification pipeline (POST)
│   ├── reports/route.ts      # Report history list (GET)
│   ├── reports/[id]/route.ts # Single report details (GET)
│   └── keys/route.ts         # API Key status panel (GET)
├── page.tsx                  # Marketing Hero & Workflow landing page
├── upload/page.tsx           # Document drop-zone & loading stages
├── dashboard/page.tsx        # Claims summary & analytics overview
├── results/page.tsx          # Granular claim cards & source references
└── settings/page.tsx         # API Key validation & active model status

lib/
├── ai/
│   ├── groq-client.ts        # Primary Groq REST wrapper (Llama/Mixtral)
│   ├── gemini-client.ts      # Secondary Gemini REST wrapper with zero-thinking logic
│   ├── extract-claims.ts     # Combined AI & local sentence claim extraction
│   └── verify-claims.ts      # Multi-claim batch prompt compiler
├── pdf/
│   ├── extract-text.ts       # pdf-parse text extraction with layout normalizer
│   └── validation.ts         # PDF file size & MIME type validation
├── search/
│   ├── serper-client.ts      # Serper API caller
│   └── search-claims.ts      # Throttled parallel query batcher
├── analytics/
│   └── trust-score.ts        # Weighted verdict score calculator
├── supabase/
│   ├── client.ts             # Supabase client initializer
│   └── reports.ts            # Report database operations
├── store.tsx                 # React Context for global verification state
└── types.ts                  # Shared TypeScript interfaces
```

---

## ⚡ Setup & Local Development

### Prerequisites
*   Node.js 18+ installed.
*   A **Serper API Key** (Free 2,500 queries at [serper.dev](https://serper.dev)).
*   A **Groq API Key** (Free at [console.groq.com](https://console.groq.com/keys)).
*   A **Gemini API Key** (Optional fallback, free at [aistudio.google.com](https://aistudio.google.com/apikey)).

### Quick Start
1.  **Clone the Repo:**
    ```bash
    git clone https://github.com/coglens/coglens.git
    cd coglens
    ```
2.  **Run Setup Script:**
    *   **Windows:** Double-click `setup\install.bat` or run it in your shell.
    *   **macOS/Linux:**
        ```bash
        npm install
        cp .env.example .env.local
        ```
3.  **Configure `.env.local`:**
    Open the newly created `.env.local` file and add your keys:
    ```env
    GROQ_API_KEY=gsk_your_groq_key_here
    SERPER_API_KEY=your_serper_key_here
    GEMINI_API_KEY=your_gemini_key_here  # Optional fallback
    ```
4.  **Start Development Server:**
    *   **Windows:** Double-click `setup\start.bat` or run it in your shell.
    *   **macOS/Linux:**
        ```bash
        npm run dev
        ```
    Open `http://localhost:3000` to preview the app.

---

## ⚙️ Environment Variables

| Key | Required | Description |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | **Yes** (Primary) | API key for Groq's high-speed Llama-3.3 completions. |
| `GEMINI_API_KEY` | **No** (Fallback) | Google Gemini API key used if Groq is not configured or fails. |
| `SERPER_API_KEY` | **Yes** | Serper key for Google Search queries. |
| `SUPABASE_URL` | **No** | Supabase database instance endpoint (enables persistence). |
| `SUPABASE_ANON_KEY` | **No** | Supabase anonymous API token. |

---

## 🐳 Supabase Setup (Optional)

If you wish to persist verification reports across page reloads:
1.  Create a free database at [supabase.com](https://supabase.com).
2.  Execute the following schema inside your SQL Editor:
    ```sql
    create table reports (
      id uuid primary key default gen_random_uuid(),
      file_name text not null,
      trust_score integer,
      claims jsonb,
      summary text,
      processing_time integer,
      created_at timestamptz default now()
    );
    ```
3.  Copy the environment variables from your Supabase dashboard and append them to `.env.local`.
4.  The application will automatically detect the variables and persist reports. If they are absent, reports will reside in local memory.

---

## ☁️ Vercel Deployment Guide

CogLens is fully optimized for Vercel's serverless and edge environments.

1.  Push your repository to GitHub/GitLab.
2.  Import the repository in [Vercel](https://vercel.com).
3.  Add the following environment variables in Vercel's project setup:
    *   `GROQ_API_KEY`
    *   `SERPER_API_KEY`
    *   `GEMINI_API_KEY` (optional)
    *   `SUPABASE_URL` (optional)
    *   `SUPABASE_ANON_KEY` (optional)
4.  Click **Deploy**. Vercel will build the Next.js pages and host the serverless functions.
5.  *Note:* Vercel's serverless functions on the free tier have a 10-second timeout by default. However, since the CogLens pipeline is highly optimized (parallelized searches and single-pass batch verification), a full 40-claim document verifies in ~8-12 seconds, staying comfortably within deployment limits.

---

## 🛠️ Deployment Troubleshooting

*   **API Timeout Errors:** If Vercel returns a `54: CONNECTION_TIMEOUT` error, ensure that `GEMINI_API_KEY` is not hitting rate-limits, or use `GROQ_API_KEY` which is much faster.
*   **Supabase Fetch Failures:** Ensure that the database URL matches `https://your-project-id.supabase.co` exactly and that Row-Level Security (RLS) is configured to allow read/write or disabled for the prototype.
*   **Empty Text Extractions:** Ensure the uploaded PDF is text-based. Scanned PDFs (image-only) will return an error since OCR is not integrated.

---

## 🔮 Future Roadmap

*   **OCR Support:** Integrate Tesseract.js or Google Vision API to extract text from scanned image-only PDFs.
*   **Real-time SSE Streaming:** Transition from single-POST request to Server-Sent Events (SSE) to stream claim verdicts live as they are verified.
*   **Custom Search Restrictors:** Add selectors in the Settings page to restrict Google searches to specific domains (e.g. `.gov`, `.edu`, or trusted news publications).
*   **Export Verification Reports:** Support exporting verified dashboard reports as PDF summaries or JSON metadata exports.

---

## 📄 License & Attributions

Built by pair-programming with Antigravity AI. Managed for the **Cog Culture Agency** Product Management Assessment.
For inquiries, refer to [Cog Culture](https://www.cogculture.agency/).
