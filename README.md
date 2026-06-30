# Daily Drop — MLB + NFL daily sports quiz

A geohistory-style daily quiz. Each day everyone gets the **same** 7-question
set (4 MLB + 3 NFL), mixing multiple-choice (season leaders, draft round) and
typed-with-autocomplete (player college). Daily streaks drive retention.
React Native + Expo, ships to iOS and Android from one codebase.

```
sportsdaily/
├── generator/                  # Python — builds the question bank from real data
│   └── generate_questions.py
└── app/                        # Expo app (iOS + Android)
    ├── App.js
    ├── app.json
    └── src/
        ├── screens/            # QuizScreen, ResultsScreen
        ├── components/         # LeagueBadge, ProgressDots, MultipleChoice, TypedAnswer
        ├── data/               # daily_sets.json (bundled), progress.js (streaks)
        └── theme/              # theme.js (sporty palette, league colors)
```

## 1. Generate the question bank

Runs on YOUR machine (this needs open internet — the build sandbox blocks
sports APIs, which is why the repo ships with a small hand-verified sample set).

```bash
cd generator
python generate_questions.py --all 30      # fetch data + build 30 days of sets
```

Sources (all free, no API key):
- **MLB Stats API** (statsapi.mlb.com) — season leaders: strikeouts, HR, AVG, SB, etc.
- **nflverse** (github releases) — player college + draft round.

`--all N` writes `question_pool.json`, `daily_sets.json`, and copies the bundle
into `app/src/data/daily_sets.json` automatically.

Each question carries `valid_as_of` (the season the fact was true) so
leader/record questions don't silently go stale.

## 2. Run the app

```bash
cd app
npm install
npx expo start          # scan QR with Expo Go on your phone, or press i / a
```

The bundled `daily_sets.json` means the quiz works fully offline — instant load,
no spinner. Falls back to the first available set if today's date has no set.

## 3. Ship it

```bash
npm install -g eas-cli
eas build --platform ios       # needs Apple Developer account ($99/yr)
eas build --platform android   # needs Google Play account ($25 one-time)
```

## How the daily set works

`progress.js` tracks streak in AsyncStorage. Playing on consecutive days
increments the streak; a gap resets it to 1. Replaying the same day doesn't
double-count. The set for a date is deterministic (seeded by the date string),
so you and a friend get the identical set — the shareable score grid
(🟩🟥🟩...) is the social hook.

## Next steps / ideas

- More question templates in the generator (career records via the Lahman DB,
  "which team drafted X", uniform numbers, award winners).
- Server-delivered daily sets (instead of bundled) so you can push new questions
  without an app update — a tiny JSON endpoint is enough.
- Leaderboard among friends (needs a backend + accounts).
- Per-league streaks if you later split MLB / NFL.
