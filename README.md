# Clawcean 🦀🌊

**Learn about microplastics in common items. Clean the sea.**
Clawcean is an arcade claw machine set in a polluted ocean. Five short lessons teach which common items turn into ocean microplastics. After each lesson, the claw scans the tank and lights up the items that contain those plastics, and you grab as many as you can before you run out of tries. Each rescued item opens a card that lists its plastic ingredients, explains how it harms the ocean, and shows how to throw it away safely. You pick an ocean guide (a pirate crab, a calm jellyfish, a 100-year-old turtle…). Gemini gives the guide its personality, and ElevenLabs gives it a voice.

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
| `ELEVENLABS_API_KEY` | — | Server-side ElevenLabs key for the guides' voices. Without it, read-aloud uses the browser's voice. |
| `ELEVENLABS_MODEL` | `eleven_v4` | Any ElevenLabs TTS model. `eleven_flash_v2_5` is about 3× faster to start talking. |
| `ELEVENLABS_VOICE_<GUIDE>` | premade voices | Optional voice ID override per guide: `CORAL`, `PINCH`, `JELLY`, `TUCK`, `SPLASH` |
| `PORT` | `3000` | Most hosts set this for you. |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | — | Upstash Redis for the shared leaderboard on serverless hosts like Vercel (set automatically when you connect Upstash in Vercel; `UPSTASH_REDIS_REST_URL`/`_TOKEN` also work). Without them, scores go to a file. |
| `DATA_DIR` | `./data` | Where `leaderboard.json` is saved when Upstash isn't set. On hosts that reset the app folder on each deploy, point this at a persistent disk. |
| `TRUST_PROXY` | on | Uses the `X-Forwarded-For` header to tell players apart behind a host's proxy, so rate limits are per player. Set `0` only when the app is reached directly. |

### Deploying
**Vercel (what we use):** import the repo; Vercel runs `server.js` as-is. In the project's **Settings → Environment Variables**, add `GEMINI_API_KEY` and `ELEVENLABS_API_KEY`. Vercel's file system is read-only, so for a shared leaderboard open **Storage → Create → Upstash for Redis** (free plan) and connect it to the project; that adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Redeploy after changing variables. Without Upstash the game still works, but each player only sees scores saved on their own device.

**Any other Node 18+ host** (Render, Railway, Fly.io, a VM): start command `npm start`, add the same keys as environment variables (never commit `.env`), and either connect Upstash or set `DATA_DIR` to a persistent disk.

`GET /api/health` reports which keys are set and where the leaderboard is stored (`"leaderboard": "upstash"` or `"file"`), which works as a health check. Voice clips are cached in memory, so they're regenerated after a restart.

**On phones**, Label Lens, Leaderboard and Settings fold behind the ☰ button in the top bar; the cabinet fits the screen width.

**Quick demo:** press **▶ Quick demo** on the start screen. It's one dive (The Bathroom Shelf) with a +1 demo try and a checklist of every feature: lesson, quick check, grab, Gemini town tips, guide chat, guide voice, Label Lens, leaderboard and comfort settings. Demo scores don't go on the leaderboard.

## How the game works

1. **Lesson**: one panel with 3 picture tiles, written for middle-school readers, plus a **Quick check** question. A right answer gives you +50 points and a ❤️ bonus try for that dive.
2. **Sonar sweep**: the claw is "tuned" to that module's ingredients, and those items light up with a glow ring and a ◆ marker. The marker is a shape, so you don't need to see color to spot targets.
3. **Grab**: move with ◀ ▶ or the arrow keys, then press DROP or Space. You have 20 s per turn. **Pause** (the ⏸ button next to DROP, or `P`) freezes everything until you press Resume; **Restart** goes back to the start screen. A grab off-center is more likely to slip. A grab on an unlit item always fails, because the claw isn't tuned to that material.
4. **Catch card**: shows the item's ingredients (◆ marks the plastic ones), why it harms the ocean, how to dispose of it safely, a better swap, and *"Tips for where I live"* from Gemini.
5. Each dive starts with **1 try** (❤️ in the HUD), or 2 if you got the quick check right. A miss costs a try. Keep grabbing until you're out of tries or rescue every lit item. Clearing all of them earns a +150 bonus.
6. After 5 dives: the final report, a **Gemini-written ocean pledge**, and the **leaderboard**.

**Scoring:** 100 per item + 25 × streak bonus · +150 perfect module · +50 per correct quick check.
The tank holds **20 items**, 4 per module, so 20/20 is the maximum. The leaderboard ranks by score and shows items rescued out of 20.

The ocean responds as you play: the water clears, the drifting microplastic specks thin out, and more fish come back. Rescue at least half of a dive's lit items and a **sea friend** (jellyfish, turtle, dolphin, crab, coral) moves into the tank. The rescue chute counts every item you've pulled out, and the results screen has a **before/after slider** of your tank.

**My Shelf:** when Label Lens finds plastic in a real product, press *Drop it in the tank*. The product floats mid-water with a pink glow and can be caught in any dive for +200. It doesn't count toward the 20-item total, and each game allows up to 3 My Shelf bonuses.

## Gemini features (MLH · Best Use of Gemini API)

| Feature | What Gemini does |
|---|---|
| **Ask your guide** (its own popup; the game pauses while you chat) | A tutor chat in the chosen guide's personality that knows which module you're on, with multi-turn history and a safety-tuned system prompt. |
| **Tips for where I live** (catch card) | Disposal advice for that item based on the player's city or country, plus a swap and a fact. |
| **Label Lens** | **Multimodal**: upload a photo of a real ingredient label or clothing care tag. Gemini reads it and returns structured JSON (verdict, plastic ingredients, disposal, swap). |
| **Ocean Pledge** (final screen) | A personalized 3-action pledge, weighted toward the modules you struggled with. |

All calls go through `server.js` → `/api/gemini`, which forwards only whitelisted fields, caps size, and rate-limits each IP. The key stays on the server. For a quick test, you can also paste a key in Settings; it's kept in that browser only.

## Ocean guides & voices (ElevenLabs)

| Guide | Pronouns | Personality | ElevenLabs voice |
|---|---|---|---|
| 🪸 Coral | she/her | Cheerful reef who loves fun facts | Jessica (playful, bright) |
| 🦀 Captain Pinch | he/him | Salty pirate crab | Callum (husky trickster) |
| 🪼 Jelly | they/them | Dreamy and calm, good for stressed players | River (calm, neutral) |
| 🐢 Old Tuck | he/him | 100-year-old turtle with stories | Bill (wise, old) |
| 🐬 Splash | she/her | Speedy, hyped dolphin | Laura (sunny, quirky) |

**Guide reactions:** during play the guide reacts in character to misses, slips, streaks, the last 5 seconds and cleared dives ("Arr, an empty claw!"). Reactions never talk over a card being read, and they're preloaded at the start of each dive so they play instantly. Turn them off in Settings.

**Captions:** everything the guide says appears in an RPG-style dialogue box with the guide's portrait, name plate and typewriter text in the Bungee game font. It shows at the top of the screen over popups, in the water during play on laptops, and just above the tank on phones. It never blocks clicks. Easy-read swaps the caption font for Atkinson Hyperlegible.

The guide reads lessons, catch cards, Gemini tips and chat answers aloud (turn on **Auto-read** to hear every card as it opens, or tap **Read to me** on any card). Audio is made through `/api/tts` on the server, so the key stays private, and repeated lines are cached so they cost no extra credits. If ElevenLabs isn't available, each guide still gets its own pitch and speed in the browser's voice.

## Accessibility & inclusion (Technica mission)

- **Calm mode**: no timer, wider grip, tap-to-aim, and `T` jumps to the next lit target. Choose it before a game starts. These scores get a "Calm" tag, so the mode is never hidden.
- **Pause any time** with the Pause button or `P`. The cabinet dims, the guide stops talking, and nothing pops up until you press Resume.
- Any popup (guide chat, Label Lens, a card) pauses the timer and claw. Game popups wait until the chat or Label Lens closes, and focus returns to the tank so Space drops the claw.
- Fully playable by keyboard, with screen-reader live announcements ("Above Fleece jacket, lit target").
- **Captions** for everything the guide says, for deaf and hard-of-hearing players (Settings → Captions).
- **Auto-read** or **Read to me** on lessons, catch cards and chat, in the chosen guide's ElevenLabs voice (device voice as a fallback).
- High-contrast mode, larger text, and reduced motion (also follows the OS setting).
- Targets use a shape (◆) as well as color.
- Everything you read as sentences in popups (lessons, cards, chat, tips) uses **Atkinson Hyperlegible**, a typeface designed for low-vision readers. The **Easy-read font** setting switches the remaining pixel fonts (titles, labels, buttons, HUD, captions) to it as well.
- Colors each have one job: gold for targets and rewards, sky blue for the guide and info, coral for buttons, green for success and pink for misses.
- Lessons are written in plain language. Label Lens turns the game into a real-world habit.

## Files

```
public/index.html   the game (HTML + JS: canvas renderer, content, Gemini/voice clients)
public/style.css    all styling
public/art.js       pixel sprites + UI icons
public/fonts/       self-hosted Jersey 15 (the body font)
server.js           static server + Gemini proxy + shared leaderboard (data/leaderboard.json)
DEVPOST.md          submission write-up
```

## Art & fonts

Every graphic is pixel art, so it looks the same on every device.

- **Sprites** (guides and the 20 ocean items): 16×16 pixel art made for Clawcean in the [Sweetie 16 palette](https://lospec.com/palette-list/sweetie-16) by GrafxKid. They live in `public/art.js` as run-length-encoded rows; the outline is added in code.
- **UI icons**: [Pixelarticons](https://github.com/halfmage/pixelarticons) (MIT) and [Pixel Icon Library](https://pixeliconlibrary.com) by HackerNoon (CC BY 4.0), downloaded through the [Iconify API](https://iconify.design) and stored in `public/art.js` so the game works offline.
- **Fonts**: Bungee (titles), [Jersey 15](https://fonts.google.com/specimen/Jersey+15) (body, self-hosted in `public/fonts/`), Silkscreen (labels), VT323 (HUD numbers), Atkinson Hyperlegible (popup reading text and Easy-read). All SIL Open Font License.

## Sources for the lesson facts

- Microbead-Free Waters Act of 2015 (US FDA). EU Commission Regulation (EU) 2023/2055 on intentionally added microplastics.
- Napper & Thompson (2016), *Marine Pollution Bulletin*: release of synthetic microfibers from domestic washing (up to ~700,000 fibers per 6 kg acrylic wash).
- Textile Exchange, *Materials Market Report 2024*: polyester ≈ 57% of global fiber production.
- Tian et al. (2021), *Science*: 6PPD-quinone from tire rubber is toxic to coho salmon.
- Lebreton et al. (2018), *Scientific Reports*: fishing nets ≥ 46% of the Great Pacific Garbage Patch by mass.
- Ocean Conservancy International Coastal Cleanup reports: cigarette butts among the most-collected items.

Disposal rules vary by town. The game always tells players to check their local program.
