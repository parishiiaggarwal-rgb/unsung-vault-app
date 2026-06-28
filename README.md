# Unsung: The Tech Mystery Vault

A full-stack, individual-participant detective game built around real
women in technology history. Four rounds: Memory Vault, Mystery Market,
Case File Challenge, and the Master Detective Auction.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **Frontend:** React (Vite), React Router, Axios
- **Sync:** polling (no WebSockets) — simpler to run and debug on event night

## Project layout

```
unsung-vault-app/
  server/      Express API
  client/      React frontend
```

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/unsung-vault
JWT_SECRET=replace-with-a-long-random-string
ADMIN_CODE=pick-your-own-admin-code
```

You need a real MongoDB instance running and reachable at `MONGO_URI`.
For local testing, install MongoDB Community Edition and run `mongod`,
or point `MONGO_URI` at a free MongoDB Atlas cluster.

Start the API:

```bash
npm run dev    # if you add nodemon, or:
node server.js
```

You should see:

```
MongoDB connected: mongodb://localhost:27017/unsung-vault
Unsung Vault API running on port 4000
```

Check it's alive: `curl http://localhost:4000/api/health`

## 2. Frontend setup

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env` if your API isn't on `localhost:4000`:

```
VITE_API_URL=http://localhost:4000/api
```

Start the dev server:

```bash
npm run dev
```

Open the printed URL (usually `http://localhost:5173`).

## 3. Running the event

1. **Host logs in** at `/admin-login` using the `ADMIN_CODE` from your `.env`.
2. **Participants log in** at `/` with their name and an access code of
   their choice (or one you hand out on a card — first login with that
   code creates the participant record).
3. From the **host panel** (`/admin`):
   - Click **Start 20-min timer** to begin Round 1 for everyone.
   - Participants are auto-routed into Round 1 once it's running, and
     auto-advance to Round 2 when their personal timer or the file
     submit button completes.
   - Round 2 (Mystery Market) and Round 3 (Case File Challenge) are
     self-paced per participant — no admin action needed between them,
     they flow automatically.
   - For **Round 4 (the Auction)**, use the host panel to:
     1. Set a question ID (e.g. `Q15`) from the question bank in
        `server/data/questions.js`.
     2. Open bidding — participants see the question and a bid slider.
     3. Close bidding + reveal — fetches all bids server-side, ranked
        highest first (currently logged; extend the panel to display
        them inline if you want it on-screen).
     4. Enter the winning participant's ID and whether they answered
        correctly, then **Resolve bid** to apply coin/score changes.
   - **End event** moves everyone to the final leaderboard.

## 4. Content

All 20 real women-in-tech case files, the 20-question Round 2 bank, and
the 6 Round 3 evidence-board cases live in `server/data/`. Edit those
files directly to change content — no code changes needed elsewhere.

- `data/personalities.js` — Round 1 dossiers
- `data/questions.js` — Round 2 MCQ bank (recall + deduction types)
- `data/cases.js` — Round 3 clue-matching cases (includes red herrings)

## 5. Deploying

Since you already run a Hostinger VPS with PM2 + Nginx for the CRM, the
same pattern works here:

- `server/` → run with PM2 (`pm2 start server.js --name unsung-vault-api`)
- `client/` → `npm run build`, serve the `dist/` folder via Nginx (or
  copy it alongside the CRM's static files), proxy `/api` to the
  Express process the same way you already proxy the CRM API.

## Notes on what's stubbed vs complete

- The TechCoin shop, MCQ engine, evidence board, and auction bidding
  are fully wired end-to-end against the real API.
- The Round 4 admin flow resolves bids manually (enter winner ID) rather
  than auto-detecting the highest bidder, so the host can account for
  ties or who actually buzzed in first in the room.
- There's no participant photo upload — Round 1 dossiers are text-only
  by design (era, field, achievement, fact, quote) to keep the build
  self-contained with no external image dependencies.
