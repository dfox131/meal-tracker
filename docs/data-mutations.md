# Data Mutations

See [`docs/data-fetching.md`](./data-fetching.md) for reads. This file covers writes
(creates/updates/deletes).

## Server Actions only, co-located in `actions.ts` files

All data mutations must be performed via **Server Actions** (`'use server'`).

- Do not mutate data from Route Handlers (`src/app/api/**/route.ts`) or from Client
  Components via a fetch to an internal API route.
- Server Actions live in files named `actions.ts`, co-located with the feature/route
  that uses them (e.g. `src/app/dashboard/actions.ts`). Do not scatter mutation logic
  inline inside component files.

```ts
// src/app/dashboard/actions.ts
'use server';

import { z } from 'zod';
import { createMeal } from '@/data/meals';

const CreateMealInput = z.object({
  name: z.string().min(1),
  calories: z.number().int().positive(),
  eatenAt: z.coerce.date(),
});

type CreateMealInput = z.infer<typeof CreateMealInput>;

export async function createMealAction(input: CreateMealInput) {
  const data = CreateMealInput.parse(input);
  return createMeal(data);
}
```

## Explicit TypeScript types — no `FormData`

Server Action parameters must be explicitly typed plain arguments (objects, primitives,
etc.), not `FormData`.

- Do not write actions shaped as `async function action(formData: FormData)`.
- Call actions with typed values built on the client (e.g. from form state, a
  `react-hook-form` submit handler, or plain component state) rather than passing a
  raw `FormData` object through.

## Validate every argument with Zod

Every Server Action must validate its incoming arguments with a Zod schema before
using them, even though they're already typed — types are erased at runtime and a
Server Action is a public network endpoint.

- Define the schema next to the action (or in a shared `schemas.ts` if reused).
- Call `.parse()` (or `.safeParse()` if you need to return validation errors to the
  caller instead of throwing) at the top of the action, before any database access.
- Prefer deriving the action's TypeScript parameter type from the schema
  (`z.infer<typeof Schema>`) so the type and the runtime validation can't drift apart.

## Database access via `/data` helpers, using Drizzle

Server Actions must never import `db` from `src/db` and query it directly. All writes
go through a helper function in the `src/data` directory (e.g. `src/data/meals.ts`),
the same directory used for reads.

- Helpers must use **Drizzle ORM** query/mutation methods (`db.insert()`,
  `db.update()`, `db.delete()`, etc.). Raw SQL (`sql\`...\``) is not allowed.
- The Server Action is responsible for validating input (via Zod) and authenticating
  the caller; the `/data` helper is responsible for the actual Drizzle mutation and
  for enforcing per-user data isolation.

## Auth and per-user scoping

Per [`docs/auth.md`](./auth.md), every Server Action must check auth (via
`requireUserId()` or `await auth()`) before performing any mutation, and every
update/delete helper must scope its `WHERE` clause to both the target row's ID
**and** the current user's ID — never trust a `userId` passed in from the client.

```ts
// src/data/meals.ts
import 'server-only';
import { db } from '@/db';
import { meals } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/auth';

export async function createMeal(data: { name: string; calories: number; eatenAt: Date }) {
  const userId = await requireUserId();
  return db.insert(meals).values({ ...data, userId });
}

export async function deleteMeal(id: string) {
  const userId = await requireUserId();
  return db.delete(meals).where(and(eq(meals.id, id), eq(meals.userId, userId)));
}
```

## Revalidation

After a mutation that changes data shown elsewhere, call `revalidatePath()` (or
`revalidateTag()`) from the Server Action so Server Components re-fetch fresh data.
Do not rely on the client to manually refetch or manage this state.

## Why

Routing every write through a typed, Zod-validated Server Action that calls a Drizzle
`/data` helper keeps mutations consistent with how reads are structured, ensures
input is never trusted as-is, and guarantees a user can never mutate another user's
data.
