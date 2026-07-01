# Daily Drop — Project Notes & Handoff

> Read this file and the README first, then the generator and app source. This
> captures decisions and gotchas that aren't obvious from the code alone.

---

## ⏭️ RESUME HERE — finish the App Store launch (written 2026-06-30 night)

**Picking up 2026-07-01 at work on the Dell XPS** (NOT the M4 Mac mini this was
built on). Read the machine note below — it changes what you can/can't do.

### ⚠️ XPS (Windows/Linux) vs the M4 mini — what's different
- **EAS Build + Submit run in Expo's CLOUD**, so you build and ship the iOS app
  **from the XPS just fine** — you do NOT need a Mac to build/submit. That's the
  whole point of EAS.
- **You CANNOT run the iOS Simulator on the XPS** (needs macOS/Xcode). So no
  local visual QA tomorrow. That's OK — the app is already QA'd in the sim, and
  the simulator isn't needed to build or submit.
- **Install Node 22 on the XPS too** (nodejs.org LTS or nvm). Same reasoning as
  the Node caveat above — don't grab the bleeding-edge version. `eas-cli` is
  cross-platform.

### Setup on the XPS (fresh)
1. Install **Node 22 LTS** + Git.
2. `npm install -g eas-cli`
3. `git clone https://github.com/elwoodradley/sportsdaily.git` (or `git pull` if
   already cloned) → `cd sportsdaily/app && npm install`
4. `eas login` (account `stonetoaddev` / wood.luke@protonmail.com)

### Then finish launch — IN THIS ORDER
1. **Build:** `eas build --platform ios --profile production`
   - First run is interactive: **Apple login + 2FA**, then say **yes** to
     auto-create the bundle id + generate the distribution cert/provisioning
     profile. ~15–25 min in the cloud (queue + build). It prints a URL to watch.
2. **Store listing** at appstoreconnect.apple.com (manual, browser): app record,
   name/subtitle/description/keywords, category **Games → Trivia**, **App
   Privacy = "Data Not Collected"** (no accounts/server), a privacy-policy URL,
   age rating.
   - ⚠️ **Screenshots:** can't be captured from a sim on the XPS. Either grab
     them from the M4 sim before leaving, or from a real iPhone via TestFlight
     once the build is up. (Claude can capture them from a Mac sim.)
3. **Submit:** `eas submit --platform ios --profile production` → uploads the
   build; attach it to the listing in App Store Connect.
4. **Submit for review** in ASC. Review is ~24–48h. Watch the MLB/NFL trademark
   stuff (the disclaimer helps; no logos).

### What was done the night of 2026-06-30 (already pushed — just `git pull`)
- **App ran in the iOS Simulator** for the first time (Node 22 fix — see caveat).
- **Fixes 1–3** (QA pass): MLB question pool **56 → 216** (kills repetition),
  typed answers now accept **college nicknames** (Ole Miss, SMU, UNC, …), and
  the daily date is computed in **local time not UTC**.
- **Studio credit** "A Stone Toad joint" added to the results footer (matches
  Flyspeck's wording).

### Still open (NOT launch blockers — decide/track)
- **Content cliff:** after 2027-06-29 the app replays day 1 forever. Refill via
  OTA (EAS Update) before then.
- **Friends leaderboard:** the planned fast-follow. Needs a backend — recommended
  **Supabase + Sign in with Apple**. Launch v1 without it (manual share is the
  social hook for now).
- **Apple enrollment type:** check whether you enrolled as **individual** (store
  seller shows your personal name) or **organization** (shows "Stone Toad").
  Switching later is a hassle — sort it now if you want the studio as the seller.
- **On-device QA:** only tested in the Simulator. Do a pass on a real iPhone once
  you have a build (notifications/share/AdMob only work in a real build anyway).

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

## Setup — fresh Mac from scratch (do this on the M4 Mac mini)

Verified end-to-end on a clean M2 Max on 2026-06-30. Follow top to bottom.
The committed `daily_sets.json` means the app runs immediately — you do NOT
need to regenerate questions to start.

**0. Baseline (already present on these Macs):** Homebrew, Git, Python 3
(system 3.9 is fine — generator is stdlib-only, no pip), and full **Xcode**
(needed for native iOS builds + the Simulator).

**1. Node + npm** — NOT preinstalled. Install via Homebrew:
```bash
brew install node          # gets Node (npm bundled)
node --version && npm --version
```
⚠️ **Node version caveat — CONFIRMED problem, use Node 22.** brew installs the
newest Node (was **26.4.0**), which is *ahead* of what Expo SDK 54 targets
(18/20/22). Bundling is fine on 26 (`npm install`, `expo export` clean), BUT
**`npx expo start` fails to launch the iOS Simulator on Node 26**: the
"Fetching Expo Go" step dies with `TypeError: fetch failed` every time (Node 26's
networking stack breaks Expo's downloader — the exact same URLs download fine via
curl/plain fetch, so it's not the network). Verified on the M4 mini 2026-06-30.
Fix — install Node 22 alongside 26 and run Expo under it:
```bash
brew install node@22                                 # keg-only, sits beside 26
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"    # Node 22 for this shell
node --version                                        # confirm v22.x
cd sportsdaily/app && npx expo start                  # press i, then choose
                                                      # "Proceed anonymously"
```
(To make it permanent instead of per-shell: add that PATH line to `~/.zshrc`, or
`brew link --overwrite node@22`.)

**2. Clone + install app deps:**
```bash
git clone https://github.com/elwoodradley/sportsdaily.git
cd sportsdaily/app
npm install                # ignore the audit/deprecation noise; do NOT run
                           # `npm audit fix --force` — it breaks pinned Expo vers
npx expo start             # scan QR in Expo Go, or press i for the iOS Simulator
```

**3. EAS CLI + account** (for cloud builds / store submit):
```bash
npm install -g eas-cli
# `eas register` was REMOVED in eas-cli v20 — sign up in a browser instead:
#   https://expo.dev/signup   (free)
eas login                  # account is `stonetoaddev` / wood.luke@protonmail.com
eas whoami                 # confirm
```
The EAS **project is already linked** — `app.json` carries
`extra.eas.projectId` (eb712a94-…) + `owner: stonetoaddev`, and `app/eas.json`
holds the build profiles. So on a fresh clone you do NOT re-run `eas init`;
just `eas login` and you can build. Dashboard:
https://expo.dev/accounts/stonetoaddev/projects/sportsdaily

**4. First production build** (run interactively — needs your Apple login the
first time so EAS can generate the iOS distribution cert + provisioning profile;
let it do this automatically):
```bash
cd sportsdaily/app
eas build --platform ios --profile production      # ~15–20 min in the cloud
```

**Regenerate / extend the question bank** (needs **open internet** — corporate
or sandboxed networks block the sports APIs):
```bash
cd ../generator
python3 generate_questions.py --all 365    # fetch + build a full year, auto-
                                           # copies the bundle into app/src/data/
```

**Regenerate the app icon / splash** (only if changing the art — assets are
committed, so normally skip). Needs ImageMagick — Expo's own SVG renderer is
NOT used; icons are drawn with ImageMagick **native primitives** (its built-in
SVG rasterizer botches `linearGradient` fills → black icon):
```bash
brew install imagemagick   # `magick` command
# see the "Icon + splash" section below for the exact draw commands
```

**Native dev build** (tests the three Expo-Go-stubbed features for real — daily
notification *firing*, **image sharing**, **AdMob**):
```bash
cd ../app
npx expo run:ios           # or run:android; first build is slow
```

---

## Current state (where we are)

- **Pass 4 — first Simulator run + QA (2026-06-30, M4 mini):** the app now runs
  in the **iOS Simulator** (Expo Go, iPhone 17 Pro, iOS 26.5). Getting there:
  installed the iOS runtime (`xcodebuild -downloadPlatform iOS`, 8.5 GB), then hit
  the Node 26 `expo start` bug (see Node caveat above) → fixed with **Node 22**.
  QA found + fixed a **display-number clipping bug**: `lineHeight` was set equal
  to `fontSize` on the big Oswald numerals, so iOS shaved their tops. Fixed by
  bumping to `1.2×` in `StatsScreen.jsx` (`tileValue`) and `ResultsScreen.jsx`
  (`score`). Verified in light + dark on Results and Stats. Dark mode confirmed
  first-class on both screens. Still un-QA'd: the quiz question cards (MC + typed)
  in dark — use Stats → "Reset progress (dev)" to replay and check.

- **THREE build passes are in.** Passes 1–2 (see sections below): the **design
  pass** (custom fonts, palette, scorecard, motion) and the **retention/growth
  pass** (real streak persistence, stats screen, daily reminder, image share,
  more question types). App bundles clean (`npx expo export`).

- **Pass 3 — launch-prep (2026-06-30, this session):** the app is now
  **build-ready**. What shipped:
  - **Full year of questions** baked in — 374-question pool → 365 daily sets,
    2026-06-30 → 2027-06-29 (was only ~30 days).
  - **Trademark disclaimer** — "Not affiliated with or endorsed by MLB or NFL."
    on the results footer (`ResultsScreen.jsx`).
  - **EAS wired** — `app/eas.json` (dev/preview/production profiles); project
    created + linked on Expo (`stonetoaddev/sportsdaily`, projectId in
    `app.json`).
  - **App icon + splash** — real assets in `app/assets/` (blue/red diagonal
    split + amber double-print check; navy splash via `expo-splash-screen`
    plugin). Wired in `app.json`. See the "Icon + splash" section for how they
    were made.
  - Toolchain proven on a clean Mac (Node via brew, eas-cli, ImageMagick).
  - **Left to do before store submit:** run the first `eas build` (needs Apple
    login, interactive), create store listings, optional Google Play account
    ($25) for Android, optional AdMob, on-device visual QA.

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
3. ~~`eas build:configure` → creates `eas.json`.~~ **DONE** — `app/eas.json`
   scaffolded (development / preview / production profiles, production channel
   for future OTA). `eas build:configure` will still link the project on first
   `eas build` (writes the `projectId` into `app.json` → `extra.eas`).
4. ~~App icon + splash screen (see design section below).~~ **DONE** — icon +
   splash live in `app/assets/` (blue/red diagonal split, amber double-print
   check; navy splash via `expo-splash-screen` plugin). Wired in `app.json`
   (`icon`, `android.adaptiveIcon`, `web.favicon`, splash plugin). Regenerate
   from the SVG primitives with ImageMagick if the mark needs tweaking.
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
- **Bundle now has a full year of questions** (365 days, 2026-06-30 →
  2027-06-29, 374-question pool). Re-run `--all 365` to roll the window forward
  as the year burns down, or wire OTA (EAS Update) to push fresh bundles.
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
> - **Not yet done:** visual QA on device (run Expo Go). ~~app icon + native
>   splash~~ **DONE** — see `app/assets/` + `app.json` (splash plugin, navy bg).
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
**DONE (disclaimer):** results screen footer now renders "Not affiliated with
or endorsed by MLB or NFL." (`ResultsScreen.jsx`). Logos are still off-limits.

## Icon + splash — how the assets were made

Assets live in `app/assets/` (committed): `icon.png` (1024², no alpha —
Apple-safe), `adaptive-icon.png` (Android foreground, transparent, check in the
safe zone), `splash-icon.png` (same mark, for the splash plugin), `favicon.png`.

**Design:** full-bleed **diagonal split** — MLB blue (`#3C7DF2`→`#0C2F73`)
top-left, NFL red (`#F04A4E`→`#7A1117`) bottom-right — with a **bold white
check** over an **amber (`#F5A300`) offset** (a trading-card "double-print"
look; amber = the scoreboard-light/win accent). Navy base `#0C1A30`.

**Gotcha:** ImageMagick's built-in SVG rasterizer mangles `linearGradient`
fills (renders black). We have no rsvg/resvg/inkscape/cairosvg. So the icons are
drawn with **ImageMagick native primitives**, and line caps go INSIDE the
`-draw` string (`-strokelinecap` is not a valid top-level option in this build).
Rebuild:
```bash
cd app
# base: diagonal blue/red split
magick -size 1024x1024 -define gradient:angle=135 gradient:'#3C7DF2'-'#0C2F73' /tmp/blue.png
magick -size 1024x1024 -define gradient:angle=315 gradient:'#F04A4E'-'#7A1117' /tmp/red.png
magick -size 1024x1024 xc:black -fill white -draw "polygon 1024,0 1024,1024 0,1024" /tmp/mask.png
magick /tmp/blue.png /tmp/red.png /tmp/mask.png -composite /tmp/base.png
# icon: seam + double-print check, flattened (no alpha)
magick /tmp/base.png -fill none \
  -stroke 'rgba(255,255,255,0.16)' -strokewidth 7 -draw "line 1024,0 0,1024" \
  -stroke '#F5A300' -strokewidth 108 -draw "stroke-linecap round stroke-linejoin round path 'M 315 548 L 467 698 L 750 376'" \
  -stroke '#FFFFFF'  -strokewidth 108 -draw "stroke-linecap round stroke-linejoin round path 'M 300 528 L 452 678 L 735 356'" \
  -background '#0C1A30' -flatten assets/icon.png
# transparent centered mark (adaptive foreground + splash)
magick -size 1024x1024 xc:none -fill none \
  -stroke '#F5A300' -strokewidth 74 -draw "stroke-linecap round stroke-linejoin round path 'M 388 531 L 482 624 L 657 424'" \
  -stroke '#FFFFFF' -strokewidth 74 -draw "stroke-linecap round stroke-linejoin round path 'M 378 517 L 472 610 L 647 410'" \
  PNG32:assets/adaptive-icon.png
cp assets/adaptive-icon.png assets/splash-icon.png
magick assets/icon.png -resize 48x48 assets/favicon.png
```
Wired in `app.json`: top-level `icon`, `android.adaptiveIcon`
(foreground + `backgroundColor #0C1A30`), `web.favicon`, and the
`expo-splash-screen` plugin (`image` splash-icon, `backgroundColor #0C1A30`).
NOTE: icon/splash only show in a real build, **not in Expo Go**.

## File map
```
generator/generate_questions.py   # builds the question bank from real data
app/app.json                      # expo config: icon, adaptiveIcon, splash plugin, eas projectId
app/eas.json                      # EAS build profiles (dev / preview / production)
app/assets/                       # icon.png, adaptive-icon.png, splash-icon.png, favicon.png
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
