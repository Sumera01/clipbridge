# ClipBridge

Instant encrypted clipboard between machines. Open the same room on two browsers — text syncs in real time. No history, no accounts, no server can read your data.

## How it works

- **Room codes** — generate a short code like `swift-bolt-42`, open the same URL on both machines
- **End-to-end encrypted** — AES-256-GCM key derived from the room code via PBKDF2, entirely in the browser. The server only ever sees ciphertext.
- **SSE + Redis pub/sub** — Server-Sent Events for real-time relay, Upstash Redis as the pub/sub broker
- **No persistence** — messages are never stored, only published and forgotten

## Deploy to Vercel + Upstash (free)

### 1. Upstash Redis

1. Go to [upstash.com](https://upstash.com) → create a free account
2. Create a new Redis database (free tier: 10k requests/day, plenty)
3. Copy the **Redis URL** (looks like `rediss://default:...@...upstash.io:6379`)

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "init clipbridge"
gh repo create clipbridge --public --push
```

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
2. Add environment variable:
   - `REDIS_URL` = your Upstash Redis URL
3. Deploy — done!

### 4. Use it

- Open `https://your-app.vercel.app` on your **host**
- Click **Generate room code** — you'll get something like `swift-bolt-42`
- Open the same URL on your **VirtualBox guest** browser
- Enter the same room code → **text syncs instantly**

## Local dev

```bash
# You need a Redis instance locally or just use Upstash URL
cp .env.example .env.local
# fill in REDIS_URL

npm install
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `REDIS_URL` | Redis connection URL (Upstash or any Redis) |

## Stack

- Next.js 15 (App Router)
- Server-Sent Events (SSE)  
- Upstash Redis (pub/sub relay)
- Web Crypto API (AES-GCM, PBKDF2) — client-side only
