# UI Coding Standards

## Rule: shadcn/ui only

All UI in this project must be built exclusively from [shadcn/ui](https://ui.shadcn.com) components.

- **No custom UI components.** Do not hand-write components like buttons, inputs, cards, dialogs, dropdowns, etc. If a needed component doesn't exist yet in the project, add it via the shadcn CLI (`npx shadcn@latest add <component>`) rather than writing it from scratch.
- **No third-party UI libraries.** Do not introduce other component libraries (MUI, Chakra, Ant Design, react-bootstrap, etc.) or ad hoc styled elements that duplicate what shadcn/ui already provides.
- **Compose, don't recreate.** Build screens by composing shadcn/ui primitives (`Button`, `Card`, `Dialog`, `Form`, `Table`, `Input`, `Select`, etc.). Layout wrappers (e.g. a page container using `div` + Tailwind utility classes) are fine — the restriction is on interactive/visual UI primitives, not plain structural markup.
- **Installed components live in `components/ui/`.** This directory is generated/managed by the shadcn CLI. Do not hand-edit generated component internals unless intentionally customizing a primitive's base styling — prefer composition over modification.
- **Icons** should come from the icon set shadcn/ui is configured with (Lucide) rather than introducing another icon library.
- **Styling** stays within Tailwind CSS v4 utility classes and shadcn/ui's theme tokens (see `src/app/globals.css`). Avoid inline styles or one-off custom CSS.

## Adding a new component

1. Check if shadcn/ui already offers it: https://ui.shadcn.com/docs/components
2. Install it: `npx shadcn@latest add <component-name>`
3. Import from `@/components/ui/<component-name>` and compose it into the page/feature.

## Why

Keeping the entire UI surface to a single, consistent component set (shadcn/ui) ensures visual consistency, avoids duplicated/conflicting styling systems, and keeps the codebase simple to maintain as the meal-tracker features are built out.
