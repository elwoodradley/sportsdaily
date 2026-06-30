#!/usr/bin/env python3
"""
Sports Daily — question-bank generator.

Pulls real data from:
  - MLB Stats API   (statsapi.mlb.com, free, no key)
  - nflverse         (github releases, free CSV/parquet)

Builds a pool of factually-correct questions across several templates,
then emits dated daily sets (mixed MLB + NFL) as JSON the Expo app reads.

Question shapes produced:
  - multiple_choice : 4 options, one correct (e.g. season leaders)
  - typed           : free-text answer + autocomplete pool (e.g. player college)

Usage:
  python generate_questions.py --build-pool        # fetch data -> question_pool.json
  python generate_questions.py --make-sets 30      # pool -> daily_sets.json (30 days)
  python generate_questions.py --all 30            # both in one go

Design notes:
  - Every generated question is tagged with `valid_as_of` (the season/date the
    fact was true) so "record / leader" questions don't silently go stale.
  - Daily set = 7 questions, deterministic per date (seeded by the date string)
    so every player gets the SAME set on a given day — the geohistory hook.
"""

import argparse
import csv
import io
import json
import hashlib
import random
import sys
import urllib.request
from datetime import date, timedelta
from pathlib import Path

HERE = Path(__file__).parent
POOL_PATH = HERE / "question_pool.json"
SETS_PATH = HERE / "daily_sets.json"

MLB_API = "https://statsapi.mlb.com/api/v1"
# nflverse roster release (player college, position, draft, etc.)
NFLVERSE_ROSTER = (
    "https://github.com/nflverse/nflverse-data/releases/download/"
    "rosters/roster_2024.csv"
)

QUESTIONS_PER_DAY = 7
# rough MLB:NFL balance per day (4:3)
MLB_PER_DAY = 4
NFL_PER_DAY = 3


# --------------------------------------------------------------------------
# fetch helpers
# --------------------------------------------------------------------------
def _get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "sportsdaily/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def _get_csv(url):
    req = urllib.request.Request(url, headers={"User-Agent": "sportsdaily/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        text = r.read().decode("utf-8", errors="replace")
    return list(csv.DictReader(io.StringIO(text)))


# --------------------------------------------------------------------------
# MLB question builders
# --------------------------------------------------------------------------
def mlb_leader_questions(seasons, categories):
    """
    Season-leader multiple-choice questions.
    categories: list of (statGroup, sortStat, human_label)
      e.g. ("pitching", "strikeOuts", "strikeouts")
           ("hitting",  "homeRuns",   "home runs")
    """
    out = []
    for season in seasons:
        for group, stat, label in categories:
            url = (
                f"{MLB_API}/stats/leaders?leaderCategories={stat}"
                f"&season={season}&statGroup={group}&limit=8"
            )
            try:
                data = _get_json(url)
            except Exception as e:
                print(f"  [mlb] skip {label} {season}: {e}", file=sys.stderr)
                continue

            leaders = []
            for cat in data.get("leagueLeaders", []):
                for entry in cat.get("leaders", []):
                    name = entry.get("person", {}).get("fullName")
                    if name:
                        leaders.append(name)
            # dedupe, keep order
            seen, ranked = set(), []
            for n in leaders:
                if n not in seen:
                    seen.add(n)
                    ranked.append(n)
            if len(ranked) < 4:
                continue

            correct = ranked[0]
            distractors = ranked[1:4]
            options = [correct] + distractors
            random.shuffle(options)

            out.append(
                {
                    "id": f"mlb_{stat}_{season}",
                    "league": "MLB",
                    "type": "multiple_choice",
                    "prompt": f"Who led MLB in {label} in {season}?",
                    "options": options,
                    "answer": correct,
                    "valid_as_of": str(season),
                    "source": "MLB Stats API",
                }
            )
    return out


# --------------------------------------------------------------------------
# NFL question builders
# --------------------------------------------------------------------------
def nfl_college_questions(rows, max_q=120):
    """
    'What college did <player> attend?' typed questions.
    Pulls a spread of notable positions so it isn't all QBs.
    Autocomplete pool = the full set of colleges seen.
    """
    notable_pos = {"QB", "RB", "WR", "TE"}
    candidates = [
        r
        for r in rows
        if r.get("college")
        and r.get("college") not in ("", "None")
        and r.get("position") in notable_pos
        and r.get("full_name")
    ]
    # prefer players with a real depth-chart presence if status present
    random.shuffle(candidates)
    candidates = candidates[:max_q]

    college_pool = sorted({r["college"] for r in candidates})

    out = []
    for r in candidates:
        out.append(
            {
                "id": f"nfl_college_{r.get('gsis_id') or r['full_name'].replace(' ', '_')}",
                "league": "NFL",
                "type": "typed",
                "prompt": f"What college did {r['full_name']} attend?",
                "answer": r["college"],
                "accept": [r["college"]],
                "autocomplete_pool_ref": "nfl_colleges",
                "valid_as_of": "2024",
                "source": "nflverse",
            }
        )
    return out, college_pool


def nfl_draft_questions(rows, max_q=40):
    """
    Multiple-choice: which round was <player> drafted? (when data present)
    """
    out = []
    pool = [
        r
        for r in rows
        if r.get("draft_number")
        and r.get("entry_year")
        and r.get("full_name")
        and r.get("position") in {"QB", "RB", "WR", "TE"}
    ]
    random.shuffle(pool)
    for r in pool[:max_q]:
        try:
            pick = int(r["draft_number"])
        except ValueError:
            continue
        rnd = (pick - 1) // 32 + 1
        if rnd > 7:
            continue
        opts = sorted({rnd, max(1, rnd - 1), min(7, rnd + 1), min(7, rnd + 2)})
        while len(opts) < 4:
            opts.append(min(7, max(opts) + 1) if max(opts) < 7 else max(1, min(opts) - 1))
        opts = sorted(set(opts))[:4]
        labels = [f"Round {o}" for o in opts]
        out.append(
            {
                "id": f"nfl_draft_{r.get('gsis_id') or r['full_name'].replace(' ', '_')}",
                "league": "NFL",
                "type": "multiple_choice",
                "prompt": f"In which round was {r['full_name']} drafted?",
                "options": labels,
                "answer": f"Round {rnd}",
                "valid_as_of": r.get("entry_year", ""),
                "source": "nflverse",
            }
        )
    return out


# --------------------------------------------------------------------------
# pool build
# --------------------------------------------------------------------------
def build_pool():
    random.seed(7)
    print("Building question pool...")

    pool = {"questions": [], "autocomplete_pools": {}}

    # ---- MLB ----
    print("[MLB] fetching season leaders...")
    seasons = [2021, 2022, 2023, 2024]
    categories = [
        ("pitching", "strikeOuts", "strikeouts"),
        ("pitching", "wins", "wins"),
        ("pitching", "earnedRunAverage", "ERA (lowest)"),
        ("hitting", "homeRuns", "home runs"),
        ("hitting", "battingAverage", "batting average"),
        ("hitting", "runsBattedIn", "RBIs"),
        ("hitting", "stolenBases", "stolen bases"),
        ("hitting", "hits", "hits"),
    ]
    mlb_q = mlb_leader_questions(seasons, categories)
    print(f"  -> {len(mlb_q)} MLB questions")
    pool["questions"].extend(mlb_q)

    # ---- NFL ----
    print("[NFL] fetching nflverse roster...")
    try:
        rows = _get_csv(NFLVERSE_ROSTER)
    except Exception as e:
        print(f"  [nfl] roster fetch failed: {e}", file=sys.stderr)
        rows = []

    if rows:
        college_q, college_pool = nfl_college_questions(rows)
        draft_q = nfl_draft_questions(rows)
        print(f"  -> {len(college_q)} college + {len(draft_q)} draft questions")
        pool["questions"].extend(college_q)
        pool["questions"].extend(draft_q)
        pool["autocomplete_pools"]["nfl_colleges"] = college_pool

    POOL_PATH.write_text(json.dumps(pool, indent=2))
    print(f"Wrote {len(pool['questions'])} questions -> {POOL_PATH}")
    return pool


# --------------------------------------------------------------------------
# daily set assembly
# --------------------------------------------------------------------------
def _seeded_rng(date_str):
    h = hashlib.sha256(date_str.encode()).hexdigest()
    return random.Random(int(h[:16], 16))


def make_sets(num_days, start=None):
    if not POOL_PATH.exists():
        print("No pool found. Run --build-pool first.", file=sys.stderr)
        sys.exit(1)
    pool = json.loads(POOL_PATH.read_text())
    qs = pool["questions"]
    mlb = [q for q in qs if q["league"] == "MLB"]
    nfl = [q for q in qs if q["league"] == "NFL"]

    start = start or date.today()
    sets = {}
    for i in range(num_days):
        d = start + timedelta(days=i)
        ds = d.isoformat()
        rng = _seeded_rng(ds)
        chosen = rng.sample(mlb, min(MLB_PER_DAY, len(mlb))) + rng.sample(
            nfl, min(NFL_PER_DAY, len(nfl))
        )
        rng.shuffle(chosen)
        sets[ds] = chosen

    out = {"autocomplete_pools": pool.get("autocomplete_pools", {}), "sets": sets}
    SETS_PATH.write_text(json.dumps(out, indent=2))
    print(f"Wrote {num_days} daily sets -> {SETS_PATH}")
    # also drop a copy the app bundles
    app_data = HERE.parent / "app" / "src" / "data" / "daily_sets.json"
    if app_data.parent.exists():
        app_data.write_text(json.dumps(out))
        print(f"Copied bundle -> {app_data}")


# --------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--build-pool", action="store_true")
    ap.add_argument("--make-sets", type=int, metavar="DAYS")
    ap.add_argument("--all", type=int, metavar="DAYS")
    args = ap.parse_args()

    if args.all:
        build_pool()
        make_sets(args.all)
    elif args.build_pool:
        build_pool()
    elif args.make_sets:
        make_sets(args.make_sets)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
