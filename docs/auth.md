# Authentication

## Rule: Clerk only

All authentication in this app is handled by [Clerk](https://clerk.com) (`@clerk/nextjs`).

- **No custom auth.** Do not hand-roll sign-in/sign-up forms, session/cookie handling, password hashing, or JWT verification. Use Clerk's components and APIs.
- **No other auth providers or libraries.** Do not introduce NextAuth/Auth.js, Supabase Auth, Firebase Auth, Passport, etc.

## Server vs client APIs — never mix them

- **Server Components / Server Actions / Route Handlers**: use `await auth()` from `@clerk/nextjs/server`. It is async — always `await` it.
- **Client Components** (`"use client"`): use the `useAuth()` / `useUser()` hooks from `@clerk/nextjs`.

```ts
// Server Component
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) return <p>Not signed in</p>;
  return <p>Hello {userId}</p>;
}
```

```tsx
// Client Component
'use client';
import { useAuth } from '@clerk/nextjs';

export function AuthStatus() {
  const { isSignedIn } = useAuth();
  return <p>{isSignedIn ? 'Signed in' : 'Signed out'}</p>;
}
```

## Route protection

Route protection is configured centrally in `src/proxy.ts` (Clerk middleware). Do not implement ad hoc redirect/guard logic in individual pages — extend the middleware matcher/config instead.

## Deriving the current user

Per [`docs/data-fetching.md`](./data-fetching.md), every `/data` helper must scope its query to the current user, derived from the authenticated session on the server — never from a client-supplied value.

- Use a shared `requireUserId()` utility (see `src/lib/auth.ts`) that calls `auth()` and throws/redirects if there is no session, rather than repeating `const { userId } = await auth()` null-checks in every helper.
- Never accept a `userId` parameter from the client and trust it for scoping a query.

## Server Actions

Every Server Action that mutates data must check auth at the start of the action (via `requireUserId()` or `await auth()`), before performing any read or write. Do not rely solely on middleware or UI-level checks to protect mutations.

## Route Handlers

Per `docs/data-fetching.md`, route handlers should generally not exist in this app except for things that cannot be a Server Component/Action (e.g. incoming webhooks). If one is added, it must independently verify the caller (e.g. `await auth()` for same-origin requests, or Clerk's webhook signature verification for third-party webhooks) — do not assume middleware alone secures it.

## Conditional rendering

For client-side conditional UI based on auth state, prefer Clerk's built-in components (`<SignedIn>`, `<SignedOut>`, `<Show>` where available) over manually branching on `useAuth()` state.

## Why

Centralizing on Clerk's server/client APIs and a shared `requireUserId()` helper keeps user-scoping consistent across every data-access path, avoids per-user data leaks, and prevents duplicated/inconsistent auth logic as meal-tracker features are built out.
