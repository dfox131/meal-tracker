---
name: meal-calories-chart
description: Generate a PNG bar chart of one Meal Tracker user's daily calorie totals for the past seven days, read from the app's Postgres (Neon) database with read-only queries and the app's own calorie calculation. Use this whenever the user wants to see, plot, graph, chart, visualize, or export their calories, calorie intake, or meal totals over the last week / past 7 days / recent days in this meal-tracker project — even if they don't say "bar chart" or "PNG".
---

# Meal calories chart

Produces a bar chart (dates on x, calories on y) of a single user's calories over the 7 days ending today, saved as a PNG outside the repository.

Two bundled scripts do the work; use them rather than writing new queries or plotting code:

- `scripts/fetch_daily_calories.ts` — loads meals + food items for one user and computes daily totals with the app's `getMealCalories` from `src/lib/meals.ts` (round(calories × quantity) per item, summed per meal). Reusing it keeps the chart identical to what the dashboard shows; don't re-implement the formula.
- `scripts/plot_calories.py` — turns that JSON into the PNG.

## Ground rules, and why

- **Read-only.** The database holds real user data. The fetch script runs its single SELECT inside a Postgres `READ ONLY` transaction and aborts if the session isn't read-only. Never write ad-hoc SQL, never run INSERT/UPDATE/DELETE/DDL, and don't use Neon MCP tools or drizzle for this task.
- **One user, explicitly named.** Meals belong to individual users. Chart only the user ID the user gives you. If no user ID was given, stop and ask for it — don't query the database to list or guess users, and never combine data across users.
- **Generated files stay out of the Git repo by default.** The Python venv, intermediate JSON, and PNG all live outside the project, so `git status` stays clean. The only exception is an output path inside the repo that the user explicitly asks for.
- **Live database access needs the user's go-ahead.** If the user hasn't clearly asked you to read their real data in this conversation, confirm before running against the database. Fixture mode (below) needs no confirmation.

## Workflow

Run everything from the repo root (the directory containing `package.json`). `SKILL_DIR` is `.claude/skills/meal-calories-chart`.

1. **Get the user ID.** If missing, ask: "Which user ID should I chart?" and wait.

2. **Set up Python once** (venv lives in the user's cache, not the repo):
   ```bash
   VENV="$HOME/.cache/meal-calories-chart/venv"
   [ -x "$VENV/bin/python" ] || { python3 -m venv "$VENV" && "$VENV/bin/pip" install -q -r "$SKILL_DIR/scripts/requirements.txt"; }
   ```

3. **Fetch daily totals** into a fresh, uniquely named temp dir, so a later step can never pick up JSON left over from an earlier run:
   ```bash
   mkdir -p "${TMPDIR:-/tmp}/meal-calories-chart"
   RUN_DIR="$(mktemp -d "${TMPDIR:-/tmp}/meal-calories-chart/run.XXXXXX")"
   npx tsx "$SKILL_DIR/scripts/fetch_daily_calories.ts" --user-id "<USER_ID>" --out "$RUN_DIR/daily.json"
   ```
   If this command fails, stop and report the error. Don't run the plot step or reuse any other `daily.json`.
   Options:
   - `--tz <IANA zone>` — which calendar day a meal belongs to. If the user gives a timezone, convert it to an IANA name (e.g. "New York" → `America/New_York`) and pass it; that takes precedence over the machine's timezone, which is only the fallback when they don't say. Meals near midnight shift days otherwise.
   - `--end-date YYYY-MM-DD` — last day of the window (default: today in that timezone).
   - `--fixture <rows.json>` — use synthetic rows instead of the database (for testing/demos). The file is an array (or `{ "rows": [...] }`) of `{ user_id, meal_id, eaten_at, item_id, quantity, calories }`, one row per meal food item (`item_id`/`quantity` null for a meal with no items). The same user/date filtering applies.

   `DATABASE_URL` is read from `.env.local`; never print or echo it.

4. **Plot** only after step 3 succeeded, reading the JSON from that same `RUN_DIR`. Shell variables don't carry between separate commands, so run steps 3 and 4 as one command joined with `&&` (or substitute the literal `RUN_DIR` path printed by step 3):
   ```bash
   "$VENV/bin/python" "$SKILL_DIR/scripts/plot_calories.py" "$RUN_DIR/daily.json" \
     --out "$RUN_DIR/calories-<USER_ID>-<END_DATE>.png"
   ```
   By default every generated file (JSON and PNG) stays in `RUN_DIR`, outside the Git repository. Write inside the repo only if the user explicitly asks for an output path there, and then mention that the file will show up in `git status`.

5. **Check and report.** Look at the PNG (Read tool) to make sure it rendered sensibly. Then give the user the absolute PNG path and a small table of date → calories (and meal count), plus the timezone used. Days with no meals show as 0 — say so rather than leaving them out.

## Troubleshooting

- `--user-id is required` — you skipped step 1.
- `DATABASE_URL is not set` — `.env.local` is missing or you're not at the repo root.
- `Cannot find module` from tsx — dependencies aren't installed. `npm install` changes the project, so ask the user before running it.
- All zeros — likely the wrong user ID or timezone; report it rather than guessing another user.
