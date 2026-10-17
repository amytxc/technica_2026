# Clawcean — Devpost write-up

**Tagline:** A Gemini-powered claw machine that teaches you which everyday ingredients become ocean microplastics, then lets you fish them out.

**Suggested submission tracks**
- Technica (max 3): **Dive into Equity: Best Hack for Social Good** · **Deep Sea Gamechanger: Best Gamification Hack** · **Best Shell-ucation Hack** (or **A Sea for All: Accessibility**)
- Sponsored: **[MLH] Best Use of Gemini API** (+ optional **[MLH] Best Domain Name from GoDaddy Registry** if you register e.g. `clawcean.tech`)

## Inspiration
Most people have heard that microplastics are in the ocean. Far fewer know that their face scrub, fleece jacket, tea bags or car tires helped put them there. Ingredient lists are long, and recycling rules vary from town to town. We wanted to turn "read the label" into something people actually want to do, and the most addictive way to pull things out of a tank is a claw machine.

## What it does
- **5 learning modules**: The Bathroom Shelf (microbeads & glitter), Laundry Day (synthetic fibers), Takeout & On-the-Go (single-use plastics), Hidden Plastics (cigarette filters, wipes, masks, tea bags) and Roads & Harbors (tire wear, paint, ghost gear). Each has 3 short lesson cards and a quick-check question. A right answer earns a 🐚 second chance.
- **Claw rounds**: a sonar sweep lights up every item in the tank made with that module's ingredients. Players keep grabbing until they miss. Off-center grabs can slip, and the claw can't hold items it isn't tuned for.
- **Catch cards**: every rescued item shows its ingredients (plastic ones flagged), why it harms the ocean, how to dispose of it safely, and a better swap.
- **Leaderboard**: score is based on items rescued per module (20 max), streaks, perfect-module bonuses and quiz answers. It's shared across everyone playing on the server.
- **The ocean heals**: the water clears, microplastic specks disappear and fish return as the player cleans.

## How we use Gemini
1. **Ask Coral**: a context-aware ocean tutor chat (multi-turn, system-prompted for accuracy, kindness and local-rules reminders).
2. **Label Lens**: *multimodal*. Players photograph a real product label or clothing tag, and Gemini returns structured JSON flagging plastic ingredients, with disposal and swap advice. This takes the lesson out of the game and into their bathroom.
3. **Tips for where I live**: disposal guidance for each item, tailored to the player's location.
4. **Personal Ocean Pledge**: three doable actions, weighted toward the topics the player struggled with.

All requests go through a small Node proxy, so the API key never reaches the browser. The proxy also whitelists fields, caps request size and rate-limits. Every Gemini feature has an offline fallback, so the demo never breaks.

## Accessibility & inclusion
Calm mode (no timer, wider grip, tap-to-aim, jump-to-target), full keyboard play, screen-reader announcements, read-aloud, high contrast, larger text, reduced motion, shape-coded targets for colorblind players, the Atkinson Hyperlegible typeface and plain-language lessons. Calm-mode scores are tagged openly rather than hidden.

## How we built it
Vanilla HTML/CSS/JS with a hand-drawn Canvas 2D renderer (claw state machine, sonar sweep, ocean "health" shading), Web Audio sound effects, the Web Speech API, and a dependency-free Node server for the Gemini proxy and leaderboard.

## Challenges
Balancing grab difficulty so it feels like a real claw machine without being unfair. Keeping the science accurate and not preachy. Making a real-time game usable by keyboard and screen reader.

## What's next
A camera-first Label Lens on mobile, classroom mode with team leaderboards, more modules (agriculture plastics, toys), and voice narration.
