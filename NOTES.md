# Daily Drop — Project Notes & Handoff

> Read this file and the README first, then the generator and app source. This
> captures decisions and gotchas that aren't obvious from the code alone.

---

## What this is

A geohistory.gg-style **daily sports quiz** for MLB + NFL. Every day, everyone
gets the **same** 7-question set (4 MLB + 3 NFL) mixing:
- **multiple choice** (e.g. "Who led MLB in strikeouts in 2023?", draft round)
- **typed + autocomplete** (e.g. "What college did Jerry Jeudy attend?")

Daily streaks + a shareable result grid (🟩🟥) are the retention/social hook.

Stack: **React Native + Expo** (one codebase → iOS + Android). A **Python
generator** builds the question bank from real data and bakes it into the app.

---

## Current state (where we are)

- App **runs in Expo Go** on a physical iPhone. Works.
- Generator pulls **live data** and produces real questions:
  - MLB: `statsapi.mlb.com` season leaders (K, HR, AVG, SB, etc.)
  - NFL: `nflverse` roster (player college, draft) + player stats (for ranking)
- NFL questions are **filtered by playing time** so we don't ask about obscure
  practice-squad players. Controlled by `TOP_N_PER_POSITION` in the generator
  (currently **40** = star/starter level). 150 was too loose (got "Tip Reiman").
- Repo is on GitHub under user **elwoodradley**, pushed.

## Decisions locked

- **No backend server.** Use **EAS Update** to push new question bundles
  over-the-air. The question bank is just a JSON asset; EAS Update ships asset
  changes without an App Store review. This is the "never runs out of questions"
  solution — generate more days locally, push via EAS Update.
- **Ship to BOTH stores** (Apple App Store + Google Play) via EAS Build + Submit.
- Daily set is **deterministic per date** (seeded by date string) so all players
  get the identical set — required for the shareable-score hook to make sense.

## Next steps (the plan)

1. Install EAS CLI, `eas login` (Expo account, free).
2. Enroll Apple Developer ($99/yr) + Google Play ($25 once). **Long pole** —
   Apple approval can take a day+. Start early.
3. `eas build:configure` → creates `eas.json`.
4. App icon + splash screen (see design section below).
5. `eas build --platform all --profile production`.
6. Store listings (screenshots, description, privacy, age rating) — manual, in
   App Store Connect + Google Play Console.
7. `eas submit` → uploads binaries. Then submit for review in each console.
8. Wire `expo-updates` so OTA question pushes work post-launch.

---

## GOTCHAS — read before building

- **`app/src/data/progress.js` has a TEMPORARY HACK.** The first line of
  `loadProgress()` is `return { streak: 0, lastPlayed: null, history: {} };`
  added during dev so the quiz can be replayed (otherwise it locks to one play
  per day and shows a stale score). **REMOVE that line before shipping** or
  scores/streaks won't persist. The real logic is right below it.
- **Bundle only has ~30 days of questions.** Generate more (`--all 365`) before
  a real launch, or the app runs dry.
- **MLB question pool is small** (~32–80 depending on seasons/categories). To
  add variety: add more `seasons` and more `categories` in `generator/
  generate_questions.py` (`build_pool`). Some exotic stat keys may not exist in
  the MLB API — generator prints `[mlb] skip ...` and moves on; that's harmless.
- **nflverse stats filename is a single combined file**
  (`player_stats/player_stats.csv`), NOT per-year. The generator filters to
  `RELEVANCE_SEASON` internally. If a fetch fails it warns loudly
  ("relevance filter is EMPTY") — heed that, it means players won't be filtered.
- The user **avoids heredoc paste workflows** (they fail in their environment)
  and prefers **one command at a time with confirmation**, manual step-by-step
  over automation, and **complete final files over partial diffs**.

---

## DESIGN DIRECTION — make it look incredible

The current UI is functional but plain: flat cards, system font, basic team
colors. Goal is a polished, distinctive sports-quiz app that feels premium.
This is the area to invest in. Treat it like a real design brief.

### The thesis
A daily sports ritual. The feeling should be **broadcast graphics meets a
collectible scorecard** — the energy of a pre-game stat overlay, the
satisfaction of filling in a card. Bold, confident, kinetic, but legible. Not a
generic quiz template.

### Identity & subject
Lean into the *vernacular of sports broadcast and trading cards*: stat-line
typography, jersey-number weight, the chunky condensed numerals you see on
scoreboards and the backs of cards. The two leagues should feel visually
distinct the instant a question appears (MLB vs NFL), like switching channels.

### Color (suggested starting palette — refine, don't just accept)
- Keep **MLB blue / NFL red** as league identity, but make them richer and pair
  each with a secondary so a question screen feels "dressed" in that league.
- A near-neutral **stadium-dark** base for dark mode and a clean **card-stock**
  light mode. Avoid the AI-default warm-cream-+-terracotta look.
- One **electric accent** for streaks / correct moments (the "scoreboard light"
  — a hot yellow or green that only appears on wins).

### Typography (the biggest lever — current system font is the weak point)
- A **condensed bold display** face for prompts, scores, and numbers — something
  with scoreboard/jersey energy (e.g. a condensed grotesque). This carries the
  whole personality. Numbers especially should feel like a stat line.
- A clean, highly legible **body/UI** face for options and labels.
- Expo: load custom fonts via `expo-font` / `useFonts`. This single change
  (system font → a characterful condensed display) will do more for "looks
  incredible" than anything else.

### Signature element (the one memorable thing)
Pick ONE and execute it beautifully — don't pile on:
- **The daily scorecard**: the result screen as a collectible card the user
  wants to screenshot and share — foil-like sheen, league marks, the 🟩🟥 grid
  as a designed element, date stamped like a ticket.
- or **the answer reveal**: a broadcast-style "graphic wipe" when an answer
  locks in — color sweep, number count, a satisfying snap.
Spend the boldness here; keep everything else quiet and precise.

### Motion (deliberate, not scattered)
- Question transitions: a confident slide/wipe, not a fade.
- Answer lock-in: micro-interaction with **haptics** (already wired via
  `expo-haptics`) + a quick scale/color snap. Correct = scoreboard light.
- Score reveal on results: count-up (already present) — make it feel earned,
  ease-out, with the card assembling.
- Respect **reduced motion**. Keep cold-start instant.

### Quality floor (non-negotiable)
- Looks right on small phones through large; safe-area aware.
- Dark + light both first-class.
- Visible focus / large tap targets (these are buttons people hammer fast).
- Empty/finished states are designed moments ("Come back tomorrow" should look
  intentional, like the back of the card), not afterthoughts.

### Copy voice
Plain, confident, sports-desk register. Active voice. "Share result," not
"Submit." Sentence case. The finished-state and streak copy should feel like a
broadcast lower-third, not an app dialog.

### Process suggestion for the agent
Brainstorm a compact token system (palette hexes, the 2–3 typefaces, layout
concept, the one signature element) and sanity-check it against the AI-default
looks before building. Then build to that plan. Take screenshots and critique.
The current components (`LeagueBadge`, `MultipleChoice`, `TypedAnswer`,
`ProgressDots`, `QuizScreen`, `ResultsScreen`) are the surfaces to elevate.

---

## File map
```
generator/generate_questions.py   # builds the question bank from real data
app/App.js                        # flow: quiz -> results, streak, dark mode
app/src/screens/QuizScreen.jsx    # question card, transitions
app/src/screens/ResultsScreen.jsx # score reveal, streak, share grid
app/src/components/                # LeagueBadge, MultipleChoice, TypedAnswer, ProgressDots
app/src/data/daily_sets.json      # the baked-in question bank (generated)
app/src/data/progress.js          # streak persistence (HAS DEV HACK - see gotchas)
app/src/theme/theme.js            # palette, type scale, league colors
```
