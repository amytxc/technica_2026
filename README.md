# Clawcean 🦀🌊

**Learn the ingredients. Clean the sea.**
Clawcean is an arcade claw machine set in a polluted ocean. Five short lessons teach which everyday ingredients turn into ocean microplastics. After each lesson, the items in the tank made with those ingredients light up, and you grab as many as you can before you miss. Each rescued item opens a card that lists its plastic ingredients, explains how it harms the ocean, and shows how to throw it away safely. Gemini is your guide the whole way.

## Run it

```bash
cp .env.example .env        # paste your key from https://aistudio.google.com/apikey
npm start                   # no dependencies; needs Node 18+
# open http://localhost:3000
```

Without a key, the game still runs in **offline mode** with all its built-in content. Gemini features fall back gracefully.

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | — | Server-side Gemini key (never sent to the browser) |
| `GEMINI_MODEL` | `gemini-flash-latest` | Any `generateContent` model, e.g. `gemini-3.8-flash` |
| `PORT` | `3000` | |

## How the game works

1. **Lesson** (3 cards) → **Quick check** question. A right answer gives you +50 points and a 🐚 *second chance* that cancels one miss.
2. **Sonar sweep**: the claw is "tuned" to that module's ingredients, and those items light up with a glow ring and a ◆ marker. The marker is a shape, so you don't need to see color to spot targets.
3. **Grab**: move with ◀ ▶ or the arrow keys, then press DROP or Space. You have 20 s per turn. A grab off-center is more likely to slip. A grab on an unlit item always fails, because the claw isn't tuned to that material.
4. **Catch card**: shows the item's ingredients (◆ marks the plastic ones), why it harms the ocean, how to dispose of it safely, a better swap, and *"Tips for where I live"* from Gemini.
5. Keep grabbing **until you fail a turn** or rescue every lit item. Clearing all of them earns a +150 bonus.
6. After 5 modules: the final report, a **Gemini-written ocean pledge**, and the **leaderboard**.

**Scoring:** 100 per item + 25 × streak bonus · +150 perfect module · +50 per correct quick check.
The tank holds **20 items**, 4 per module, so 20/20 is the maximum. The leaderboard ranks by score and shows items rescued out of 20.

The ocean responds as you play: the water clears, the drifting microplastic specks thin out, and more fish come back.

## Gemini features (MLH · Best Use of Gemini API)

| Feature | What Gemini does |
|---|---|
| **Ask Coral** (side panel) | A tutor chat that knows which module you're on, with multi-turn history and a safety-tuned system prompt. |
| **Tips for where I live** (catch card) | Disposal advice for that item based on the player's city or country, plus a swap and a fact. |
| **Label Lens** | **Multimodal**: upload a photo of a real ingredient label or clothing care tag. Gemini reads it and returns structured JSON (verdict, plastic ingredients, disposal, swap). |
| **Ocean Pledge** (final screen) | A personalized 3-action pledge, weighted toward the modules you struggled with. |

All calls go through `server.js` → `/api/gemini`, which forwards only whitelisted fields, caps size, and rate-limits each IP. The key stays on the server. For a quick test, you can also paste a key in Settings; it's kept in that browser only.

## Accessibility & inclusion (Technica mission)

- **Calm mode**: no timer, wider grip, tap-to-aim, and `T` jumps to the next lit target. These scores get a "Calm" tag, so the mode is never hidden.
- Fully playable by keyboard, with screen-reader live announcements ("Above Fleece jacket, lit target").
- **Read aloud** for lessons and catch cards (Web Speech API).
- High-contrast mode, larger text, and reduced motion (also follows the OS setting).
- Targets use a shape (◆) as well as color. Text is set in Atkinson Hyperlegible, a typeface designed for low-vision readers.
- Lessons are written in plain language. Label Lens turns the game into a real-world habit.

## Files

```
public/index.html   the whole game (HTML/CSS/JS, canvas renderer, content)
server.js           static server + Gemini proxy + shared leaderboard (data/leaderboard.json)
DEVPOST.md          submission write-up
```

## Sources for the lesson facts

- Microbead-Free Waters Act of 2015 (US FDA). EU Commission Regulation (EU) 2023/2055 on intentionally added microplastics.
- Napper & Thompson (2016), *Marine Pollution Bulletin*: release of synthetic microfibers from domestic washing (up to ~700,000 fibers per 6 kg acrylic wash).
- Textile Exchange, *Materials Market Report 2024*: polyester ≈ 57% of global fiber production.
- Tian et al. (2021), *Science*: 6PPD-quinone from tire rubber is toxic to coho salmon.
- Lebreton et al. (2018), *Scientific Reports*: fishing nets ≥ 46% of the Great Pacific Garbage Patch by mass.
- Ocean Conservancy International Coastal Cleanup reports: cigarette butts among the most-collected items.

Disposal rules vary by town. The game always tells players to check their local program.
