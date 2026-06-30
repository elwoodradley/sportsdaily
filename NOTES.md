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

## Setup — resume on a new machine

Prereqs: **Node 18+ & npm**, **Git**, **Python 3** (generator is stdlib-only —
no pip installs), and either the **Expo Go** app on a phone or iOS/Android
simulators. The committed `daily_sets.json` means the app runs immediately —
you do NOT need to regenerate questions to start.

```bash
git clone https://github.com/elwoodradley/sportsdaily.git
cd sportsdaily/app
npm install            # pulls all deps incl. fonts, linear-gradient,
                       # notifications, sharing, view-shot (all in package.json)
npx expo start         # scan QR in Expo Go, or press i / a for a simulator
```

Regenerate / extend the question bank (needs **open internet** — corporate or
sandboxed networks often block the sports APIs):

```bash
cd ../generator
python3 generate_questions.py --all 30     # fetch + build 30 days, auto-copies
                                           # the bundle into app/src/data/
```

**What a more powerful machine unlocks:** three features are stubbed out in
Expo Go and only run in a **native dev build** — the daily notification
*firing*, **image sharing**, and (later) **AdMob**. With Xcode / Android Studio
installed you can make a dev build and test them for real:

```bash
cd ../app
npx expo run:ios       # or: npx expo run:android  (first build is slow)
```

---

## Current state (where we are)

- **Two build passes are in** (see sections below): the **design pass**
  (custom fonts, palette, scorecard, motion) and the **retention/growth pass**
  (real streak persistence, stats screen, daily reminder, image share, more
  question types). App bundles clean (`npx expo export`).

- App **runs in Expo Go** on a physical iPhone. Works.
- Generator pulls **live data** and produces real questions:
  - MLB: `statsapi.mlb.com` season leaders (K, HR, AVG, SB, etc.)
  - NFL: `nflverse` roster (player college, draft) + player stats (for ranking)
- NFL questions are **filtered by playing time** so we don't ask about obscure
  practice-squad players. Controlled by `TOP_N_PER_POSITION` in the generator
  (currently **75**). Lower it (~40) for stars-only; 150 was too loose.
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

- **Persistence is now REAL (the old dev hack is gone).** `progress.js` saves
  streak/maxStreak/history to AsyncStorage, so the quiz locks to one play per
  day and jumps to the saved result on replay — this scarcity *is* the game.
  To replay during dev, open **Stats → "Reset progress (dev)"** (only rendered
  when `__DEV__`). `computeStats()` rolls history up for the stats screen.
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

> **STATUS: built (first pass).** The brief below was implemented. What landed:
> - **Type:** Oswald (condensed grotesque — prompts/scores/numerals) + Inter
>   (options/labels), loaded via `expo-font`/`useFonts` in `App.js` with direct
>   `.ttf` requires (only 8 weights bundle, not the whole family). Family names
>   live in `theme.FONTS`; use `type.display*` (Oswald) and `type.body*` (Inter).
> - **Palette:** cool **card-stock** light + **stadium-dark** dark (no warm cream).
>   Richer MLB-blue / NFL-red each with a deep secondary + gradient (`LEAGUES`),
>   plus one **electric amber** (`theme.electric`) used only on streaks/wins.
> - **Signature element:** the **daily scorecard** on `ResultsScreen` — a
>   collectible card (deep gradient, foil-sheen sweep, ⚾🏈 marks, ticket date
>   stamp, designed ✓/✕ grid, electric streak strip) built to be screenshotted.
> - **Motion:** confident slide/wipe between questions, color-snap answer lock-in
>   (haptics kept), score count-up + card assemble. All gated on
>   `useReducedMotion()` (`src/hooks/useReducedMotion.js`).
> - New deps: `expo-font`, `expo-linear-gradient`, `@expo-google-fonts/oswald`,
>   `@expo-google-fonts/inter`. Verified with `npx expo export` (clean bundle).
> - **Not yet done:** visual QA on device (run Expo Go), app icon + native splash
>   (`app.json` splash still the old blue — that's part of the EAS/icon step).
>
> _Original brief preserved below for reference / further polish._

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

## Retention / growth / money (built — second pass)

Added the engine pieces a daily-quiz app lives on, all no-backend:
- **Daily local reminder** (`app/src/data/notify.js`, `expo-notifications`) —
  schedules a ~9am repeating local notification after the first finished quiz.
  Local-only (no push tokens/server); needs a dev/EAS build to fire — no-ops in
  Expo Go. Asks permission once (flag in AsyncStorage).
- **Stats screen** (`app/src/screens/StatsScreen.jsx`, a Modal) — played,
  accuracy, current/best streak, score distribution, perfect-cards count. Opens
  from the streak chip (quiz) and a "View stats" button (results).
- **Share-as-image** — results "Share" captures the scorecard to a PNG
  (`react-native-view-shot`) and shares via `expo-sharing`; falls back to the
  emoji-grid text (e.g. in Expo Go). Image shares are the main free growth loop.
- **More question variety** (generator): MLB "how many … did the leader have?"
  magnitude questions (counting stats only) + NFL "what jersey number does X
  wear?". Re-run `python generate_questions.py --all 30` to bake them in.

**Money plan:** ship FREE. AdMob interstitial on the results screen at
EAS-build time (`react-native-google-mobile-ads` — needs a dev build, NOT Expo
Go), optional "remove ads" IAP later. Revenue scales with DAU, so treat it as a
volume outcome, not an early goal.

⚠️ **Trademark:** "MLB"/"NFL" are protected and league/team logos are off-limits.
Trivia *facts* are fine, but add a visible "Not affiliated with or endorsed by
MLB/NFL" disclaimer and avoid official logos — especially once monetized.

## File map
```
generator/generate_questions.py   # builds the question bank from real data
app/App.js                        # flow: quiz -> results, stats modal, fonts, reminder
app/src/screens/QuizScreen.jsx    # question card, league-dressed header, transitions
app/src/screens/ResultsScreen.jsx # the daily scorecard, count-up, image share
app/src/screens/StatsScreen.jsx   # stats modal (streak, accuracy, distribution)
app/src/components/                # LeagueBadge, MultipleChoice, TypedAnswer, ProgressDots
app/src/hooks/useReducedMotion.js  # gates all animation
app/src/data/daily_sets.json      # the baked-in question bank (generated)
app/src/data/progress.js          # streak/stats persistence + computeStats + dev reset
app/src/data/notify.js            # local daily reminder (expo-notifications)
app/src/theme/theme.js            # fonts, palette, type scale, league colors, elevate()
```
