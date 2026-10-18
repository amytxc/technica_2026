# Clawcean — Devpost write-up

**Tagline:** A Gemini-powered claw machine that teaches you to identify everyday items that can become ocean microplastics, then lets you fish them out to clean the ocean.

**Suggested submission tracks**
- Technica: **Dive into Equity: Best Hack for Social Good** · **Deep Sea Gamechanger: Best Gamification Hack** · **Best Shell-ucation Hack**
- Sponsored: **[MLH] Best Use of Gemini API** · **[MLH] Best Use of ElevenLabs** (if offered at this event) · optional **[MLH] Best Domain Name from GoDaddy Registry** if you register e.g. `clawcean.tech`

## Inspiration
Most people have heard that microplastics are in the ocean. Far fewer know that their face scrub, fleece jacket, tea bags or car tires helped put them there. Ingredient lists are long, and recycling rules vary from town to town. We wanted to turn "read the label" into something people actually want to do, and the most addictive way to pull things out of a tank is a claw machine.

## What it does
- **5 learning modules**: The Bathroom Shelf (microbeads & glitter), Laundry Day (synthetic fibers), Takeout & On-the-Go (single-use plastics), Hidden Plastics (cigarette filters, wipes, masks, tea bags) and Roads & Harbors (tire wear, paint, ghost gear). Each is one picture panel with 3 short facts, written for middle-school readers, plus a quick-check question. A right answer earns a bonus try for that dive.
- **Claw rounds**: a sonar sweep lights up every item in the tank made with that module's ingredients. Each dive gives 1 try, or 2 with a right quick-check answer, and a miss costs a try. Off-center grabs can slip, and the claw can't hold items it isn't tuned for.
- **Ocean guides**: pick a pirate crab, a calm jellyfish, a 100-year-old turtle, a hyped dolphin or a cheerful coral (pronouns shown on each). Your guide chats, reads cards aloud in their own ElevenLabs voice, and reacts in character while you play, with every line shown in an RPG-style caption box.
- **Catch cards**: every rescued item shows its ingredients (plastic ones flagged), why it harms the ocean, how to dispose of it safely, and a better swap.
- **Leaderboard**: score is based on items rescued per module (20 max), streaks, perfect-module bonuses and quiz answers. It's shared across everyone playing on the server.
- **The ocean heals**: the water clears, microplastic specks disappear and fish return as the player cleans. A good dive brings a sea friend back to the tank, and the results screen has a before/after slider.
- **My Shelf**: scan a real product with Label Lens and, if it contains plastic, drop it into the tank as a bonus catch (up to 3 per game).
- **Quick demo**: a one-dive version with a checklist of every feature, for judges and first-time players (`/?demo`).
- **Arcade look**: hand-made pixel sprites and pixel UI icons instead of emoji, a sunset-arcade palette where each color has one job, pixel fonts for the arcade parts, and a cabinet sized to fit a laptop screen.

## How we use Gemini
1. **Ask your ocean guide**: pick from 5 guides (pirate crab, calm jellyfish, wise turtle…), each with its own Gemini personality and ElevenLabs voice. A context-aware tutor chat (multi-turn, system-prompted for accuracy, kindness and local-rules reminders).
2. **Label Lens**: *multimodal*. Players photograph a real product label or clothing tag, and Gemini returns structured JSON flagging plastic ingredients, with disposal and swap advice. This takes the lesson out of the game and into their bathroom.
3. **Tips for where I live**: disposal guidance for each item, tailored to the player's location.
4. **Personal Ocean Pledge**: three doable actions, weighted toward the topics the player struggled with.

## How we use ElevenLabs
Each guide has its own voice and delivery settings. Lessons and cards are read sentence by sentence, so the first words play in about a second, and the captions type along with the audio. Clips are generated through the same server and cached, and if voices are unavailable each guide falls back to a distinct device voice.

All requests go through a small Node proxy, so the API keys never reach the browser. The proxy also whitelists fields, caps request size and rate-limits. Every Gemini feature has an offline fallback, so the demo never breaks.

## Accessibility & inclusion
Calm mode (no timer, wider grip, tap-to-aim, jump-to-target), pause any time (button or P), full keyboard play, screen-reader announcements, captions for everything the guide says, Auto-read and Read to me in the guide's voice, high contrast, larger text, popup text set in Atkinson Hyperlegible plus an Easy-read switch for the rest, reduced motion, shape-coded targets for colorblind players and middle-school-level lessons. Guides show their pronouns, including a they/them guide. Calm-mode scores are tagged openly rather than hidden.

## How we built it
Vanilla HTML/CSS/JS with a hand-drawn Canvas 2D renderer (claw state machine, sonar sweep, ocean "health" shading), 16×16 pixel sprites stored as run-length-encoded rows, Web Audio sound effects, ElevenLabs text-to-speech with a Web Speech fallback, and a dependency-free Node server for the Gemini and ElevenLabs proxies and the leaderboard.

## Challenges
Balancing grab difficulty so it feels like a real claw machine without being unfair. Keeping the science accurate and not preachy. Making a real-time game usable by keyboard and screen reader.

## What's next
A camera-first Label Lens on mobile, Spanish and other languages (Gemini text plus multilingual voices), a one-button mode for switch users, classroom mode with team leaderboards, and more modules (agriculture plastics, toys).
