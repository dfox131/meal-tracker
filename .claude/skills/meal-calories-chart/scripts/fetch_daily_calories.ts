/**
 * Daily calorie totals for ONE user over the 7 days ending on --end-date.
 *
 * Read-only by construction: the only database access is a single
 * `sql.transaction([...], { readOnly: true })`, which Postgres runs as a
 * READ ONLY transaction (any write would be rejected). No INSERT/UPDATE/DELETE
 * statements exist in this file.
 *
 * Calories come from the app's own `getMealCalories` (src/lib/meals.ts), so the
 * chart always matches what the dashboard shows.
 *
 * Usage (from the repo root):
 *   npx tsx .claude/skills/meal-calories-chart/scripts/fetch_daily_calories.ts \
 *     --user-id <clerk user id> [--tz America/New_York] [--end-date YYYY-MM-DD] \
 *     [--fixture rows.json] [--out data.json]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

import { getMealCalories } from "../../../../src/lib/meals";
import {
  formatDateParam,
  formatDateParamInTimeZone,
  getDayRangeInTimeZone,
  isValidTimeZone,
  parseDateParam,
} from "../../../../src/lib/dates";

const DAYS = 7;

type Row = {
  user_id?: string;
  meal_id: string;
  eaten_at: string | Date;
  item_id: string | null;
  quantity: string | number | null;
  calories: number | null;
};

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

const { values } = parseArgs({
  options: {
    "user-id": { type: "string" },
    tz: { type: "string" },
    "end-date": { type: "string" },
    fixture: { type: "string" },
    out: { type: "string" },
  },
});

const userId = values["user-id"]?.trim();
if (!userId) {
  fail("--user-id is required. Ask the user for their user ID; do not look it up.");
}

const timeZone = values.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
if (!isValidTimeZone(timeZone)) fail(`invalid IANA timezone: ${timeZone}`);

const endDate = values["end-date"] ?? formatDateParamInTimeZone(new Date(), timeZone);
const endDay = parseDateParam(endDate);
if (!endDay) fail(`invalid --end-date (expected YYYY-MM-DD): ${endDate}`);

// The 7 calendar days, oldest first. Built from date parts so DST never shifts a day.
const dates = Array.from({ length: DAYS }, (_, i) =>
  formatDateParam(
    new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() - (DAYS - 1 - i))
  )
);
const rangeStart = getDayRangeInTimeZone(dates[0], timeZone).start;
const rangeEnd = getDayRangeInTimeZone(dates[DAYS - 1], timeZone).end;

async function loadRowsFromDatabase(): Promise<Row[]> {
  const { config } = await import("dotenv");
  config({ path: resolve(process.cwd(), ".env.local"), quiet: true });
  const url = process.env.DATABASE_URL;
  if (!url) fail("DATABASE_URL is not set (expected in .env.local at the repo root).");

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);

  const [readOnlyCheck, rows] = await sql.transaction(
    [
      sql`SHOW transaction_read_only`,
      sql`
        SELECT m.id AS meal_id, m.eaten_at, mfi.id AS item_id, mfi.quantity, fi.calories
        FROM meals m
        LEFT JOIN meal_food_items mfi ON mfi.meal_id = m.id
        LEFT JOIN food_items fi ON fi.id = mfi.food_item_id
        WHERE m.user_id = ${userId}
          AND m.eaten_at >= ${rangeStart.toISOString()}
          AND m.eaten_at < ${rangeEnd.toISOString()}
        ORDER BY m.eaten_at
      `,
    ],
    { readOnly: true }
  );

  const mode = (readOnlyCheck as { transaction_read_only: string }[])[0]?.transaction_read_only;
  if (mode !== "on") fail(`expected a read-only transaction, got transaction_read_only=${mode}`);

  return rows as Row[];
}

function loadRowsFromFixture(path: string): Row[] {
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  const rows: Row[] = Array.isArray(parsed) ? parsed : parsed.rows;
  if (!Array.isArray(rows)) fail(`fixture must be an array of rows or { "rows": [...] }`);
  // Apply the same filters the SQL query applies.
  return rows.filter((row) => {
    const eatenAt = new Date(row.eaten_at);
    return row.user_id === userId && eatenAt >= rangeStart && eatenAt < rangeEnd;
  });
}

async function main() {
  const source = values.fixture ? "fixture" : "database";
  const rows = values.fixture
    ? loadRowsFromFixture(values.fixture)
    : await loadRowsFromDatabase();

  // Rebuild each meal in the shape getMealCalories expects.
  type MealShape = {
    eatenAt: Date;
    mealFoodItems: { quantity: string; foodItem: { calories: number | null } | null }[];
  };
  const meals = new Map<string, MealShape>();
  for (const row of rows) {
    let meal = meals.get(row.meal_id);
    if (!meal) {
      meal = { eatenAt: new Date(row.eaten_at), mealFoodItems: [] };
      meals.set(row.meal_id, meal);
    }
    if (row.item_id != null && row.quantity != null) {
      meal.mealFoodItems.push({
        quantity: String(row.quantity),
        foodItem: { calories: row.calories },
      });
    }
  }

  const days = new Map(dates.map((date) => [date, { date, calories: 0, mealCount: 0 }]));
  for (const meal of meals.values()) {
    const day = days.get(formatDateParamInTimeZone(meal.eatenAt, timeZone));
    if (!day) continue;
    day.calories += getMealCalories(meal);
    day.mealCount += 1;
  }

  const result = {
    userId,
    timeZone,
    source,
    startDate: dates[0],
    endDate: dates[DAYS - 1],
    days: [...days.values()],
  };
  const json = JSON.stringify(result, null, 2);
  if (values.out) {
    writeFileSync(values.out, json + "\n");
    console.error(`wrote ${values.out}`);
  } else {
    console.log(json);
  }
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
