# Setup Guide

Welcome to the AI Image Generator! This project is open-source (Apache 2.0). You are free to download, rebrand, modify, and use it for commercial purposes (including earning revenue).

Follow these steps to deploy your own instance of the application for free using Cloudflare.

---

## Prerequisites

1. A [Cloudflare account](https://dash.cloudflare.com/login) (Free tier is fine)
2. [Node.js](https://nodejs.org/) installed (v18+)
3. Cloudflare Wrangler CLI installed:
   ```bash
   npm install -g wrangler
   ```
4. Log in to Wrangler:
   ```bash
   npx wrangler login
   ```

---

## Step 1: Backend Setup (Cloudflare Worker)

The backend handles prompt generation, URL construction, and IP rate limiting.

1. **Navigate to the worker directory:**
   ```bash
   cd worker
   npm install
   ```

2. **Create the Rate Limiting KV Namespace:**
   ```bash
   npx wrangler kv:namespace create RATE_LIMIT_KV
   ```
   *Copy the `id` from the output.*

3. **Update `wrangler.toml`:**
   Open `worker/wrangler.toml` and paste the KV ID:
   ```toml
   [[kv_namespaces]]
   binding = "RATE_LIMIT_KV"
   id = "YOUR_KV_ID_HERE"
   ```

4. **Optional: Set Global Generation Limit:**
   By default, the global limit is 1,000 images per week. You can raise or lower this by modifying `MAX_IMAGES_PER_WEEK` in `wrangler.toml`:
   ```toml
   [vars]
   MAX_IMAGES_PER_WEEK = "1000"
   ```

4. **Deploy the Worker:**
   ```bash
   npx wrangler deploy
   ```
   *Once deployed, save the Worker URL (e.g., `https://ai-image-generator.YOUR_SUBDOMAIN.workers.dev`).*

---

## Step 2: Frontend Setup (Cloudflare Pages)

The frontend is a React application built with Vite and TailwindCSS, located in the root directory.

1. **Navigate back to the project root:**
   ```bash
   cd ..
   npm install
   ```

2. **Set Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Worker URL:
   ```env
   VITE_WORKER_URL=https://your-worker-url-from-step-1.workers.dev
   ```

3. **Build the Application:**
   ```bash
   npm run build
   ```

4. **Deploy to Cloudflare Pages:**
   ```bash
   npx wrangler pages deploy dist --project-name ai-image-generator
   ```

---

## Step 3: Done!

Your application is now live and rate-limited by Cloudflare KV. 
Users can generate images directly without needing to sign up or pass CAPTCHAs.

---

## Step 4: Local Development (Optional)

If you want to test and modify the code locally before deploying to Cloudflare:

1. **Start the Backend Worker locally:**
   ```bash
   cd worker
   npx wrangler dev --local
   # → API running at http://localhost:8787
   ```

2. **Start the Frontend locally:**
   Open a new terminal window at the project root:
   ```bash
   npm run dev
   # → Frontend running at http://localhost:5173
   ```
   *(Note: The Vite frontend config automatically proxies `/api` requests to port `8787` when running locally.)*

---

## Rebranding & Monetization

This project is licensed under Apache 2.0. You are welcome to:
- Change the branding, colors, and text in `src/`
- Introduce ads or payment gateways
- Deploy it under your own custom domain
- Use it to generate revenue

Happy building!
