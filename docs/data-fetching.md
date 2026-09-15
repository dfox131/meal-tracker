# Data Fetching

## Server Components only

All data fetching in this app must be done via **Server Components**. Do not fetch
data in Client Components (`"use client"`) via `useEffect`, SWR, React Query, etc.
Fetch on the server and pass data down as props.

**Route handlers (`src/app/api/**/route.ts`) must never be created to fetch data
for this app.** There is no reason for a client component to call an internal API
route to read data — render it on the server instead. Route handlers are only
acceptable for things that genuinely cannot be a Server Component request, such as
incoming third-party webhooks.

Mutations (creates/updates/deletes) should use Server Actions, not route handlers.

## Database access via `/data` helpers

Every database query must go through a helper function defined in the `/data`
directory (e.g. `data/meals.ts`, `data/food-items.ts`). Server Components and
Server Actions call these helpers — they must never import `db` from `src/db`
and query it directly.

- Helpers must use **Drizzle ORM** query methods (`db.query...`, `db.select()...`,
  etc.). **Raw SQL is not allowed** — do not use `sql\`...\`` templates or a raw
  driver query for application data fetching.
- Each helper is responsible for scoping its query to the current user (see below).

Example shape:

```ts
// data/meals.ts
import 'server-only';
import { db } from '@/db';
import { meals } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireUserId } from '@/lib/auth';

export async function getMealsForCurrentUser() {
  const userId = await requireUserId();

  return db.query.meals.findMany({
    where: eq(meals.userId, userId),
  });
}
```

```tsx
// app/dashboard/page.tsx (Server Component)
import { getMealsForCurrentUser } from '@/data/meals';

export default async function DashboardPage() {
  const meals = await getMealsForCurrentUser();
  return <MealsList meals={meals} />;
}
```

## Per-user data isolation

A logged-in user must only ever be able to read or write their own data. They must
never be able to access another user's rows.

- Every query in a `/data` helper must filter by the current user's ID (via Clerk's
  server-side `auth()` — see `src/proxy.ts` / `src/app/layout.tsx` for existing
  Clerk usage), using a `WHERE user_id = ...` clause (`eq(table.userId, userId)`
  in Drizzle).
- Never accept a `userId` as a parameter from the client and trust it. Always
  derive the user ID from the authenticated session on the server inside the
  helper (or a shared `requireUserId()` utility called by the helper).
- When a query fetches a row by its own ID (e.g. a single meal by `id`), the
  `WHERE` clause must combine both the row ID **and** the user ID
  (`and(eq(meals.id, id), eq(meals.userId, userId))`), so a user cannot read
  another user's row by guessing/passing its ID.
- Apply the same rule to updates and deletes performed in Server Actions.
