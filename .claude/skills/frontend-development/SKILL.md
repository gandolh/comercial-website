---
name: frontend-development
description: Use when touching any file under /frontend/src — adding pages, components, hooks, connecting React Query, wiring Zod validation, fixing frontend bugs, or building any React/TypeScript feature for the my-olx digital-assets marketplace.
---

# Frontend Development — my-olx (React/TypeScript)

## Stack

React 19 · React Router v7 · TanStack Query v5 · Axios · Zustand · React Hook Form · Zod · react-i18next · Tailwind CSS v4 · @base-ui/react 1.4.1 · Material Symbols Outlined

## Directory Structure

**New split (core + app):**

```
src/
├── core/                # Shared engine & UI library
│   ├── layout/          # Navbar, Footer, PageShell
│   ├── ui/              # 28+ shared components (Button, Input, Modal, etc.)
│   ├── hooks/           # Global hooks (useAuth, useToast)
│   ├── types/           # Global types & interfaces
│   ├── lib/             # Config & providers
│   │   ├── axios.ts     # Axios instance + Bearer token injection
│   │   ├── queryClient.ts  # React Query client + QueryClientProvider
│   │   ├── i18n.ts      # react-i18next setup (ro default)
│   │   └── auth.ts      # Zustand auth store
│   └── routes/          # Route declarations only
├── app/                 # Feature modules
│   └── {feature}/       # One folder per feature (e.g., listings, users, assets)
│       ├── pages/       # Route-level components (ListingsPage.tsx)
│       ├── components/  # Feature UI components (ListingCard.tsx)
│       ├── hooks/       # Feature hooks (useListingFilters.ts)
│       ├── types/       # Feature types (Listing, ListingFilter)
│       ├── apis/        # Axios calls (listingsApi.ts)
│       └── queries/     # React Query factories (listingQueries.ts)
└── App.tsx              # Root + router setup
```

**Path aliases:**
- `@/` → `src/`
- `@core/*` → `src/core/`
- `@app/*` → `src/app/`

## Styling Rules

**Design system:** Carpathian Clear. Tokens are registered in `index.css` as CSS custom properties and mapped to Tailwind classes via `tailwind.config.ts`.

- Use named Tailwind classes: `text-primary`, `bg-surface-low` — **never hardcode hex values**
- Flagging hardcoded hex (e.g. `text-[#0040a1]`) is a violation — replace with token class
- No 1px borders — use background shifts between surface levels instead
- Shadows: ambient style (`shadow-ambient`) not drop shadows
- Buttons: `rounded-full`; Cards: `rounded-xl`
- Typography: Manrope for headlines, Inter for body, line-height ≥ 1.5
- Icons: Material Symbols Outlined only — `<span className="material-symbols-outlined">search</span>`
- Glass overlays: `bg-white/80 backdrop-blur-xl`

## Data Fetching Pattern

Define query options as factories in `app/<feature>/queries/`:

```ts
// app/listings/queries/listingQueries.ts
import { queryOptions } from '@tanstack/react-query'
import { listingsApi } from '../apis/listingsApi'

export const listingQueries = {
  list: (filters: ListingFilter) =>
    queryOptions({
      queryKey: ['listings', filters],
      queryFn: () => listingsApi.getAll(filters),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ['listings', id],
      queryFn: () => listingsApi.getOne(id),
    }),
}
```

Use `useSuspenseQuery` in components — never `useQuery` with manual `isLoading` checks:

```tsx
const { data } = useSuspenseQuery(listingQueries.list(filters))
```

Wrap page components with `<Suspense fallback={<Skeleton />}>` and `<ErrorBoundary fallback={<ErrorCard />}>` in the route definition.

## API Layer

Single Axios instance in `core/lib/axios.ts`:
- `baseURL` from `import.meta.env.VITE_API_URL`
- Request interceptor: attach JWT from Zustand auth store
- Response interceptor: 401 → redirect to login; surface typed errors

Feature API calls live in `app/<feature>/apis/`:

```ts
// app/listings/apis/listingsApi.ts
import { axiosInstance } from '@core/lib/axios'

export const listingsApi = {
  getAll: (filters: ListingFilter) =>
    axiosInstance.get<Listing[]>('/listings', { params: filters }).then(r => r.data),
  getOne: (id: string) =>
    axiosInstance.get<Listing>(`/listings/${id}`).then(r => r.data),
}
```

## Auth State

Zustand store in `core/lib/auth.ts` exposes `{ user, isAuthenticated, login, logout }`. Access via `useAuth()` hook. JWT stored in `localStorage`.

## Forms

All forms use React Hook Form + Zod resolver:

```ts
const schema = z.object({ title: z.string().min(3), price: z.number().positive() })
const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
```

Never use raw `useState` for form fields with more than one input.

## Routing

- `core/routes/` contains React Router declarations only — no component logic
- Use `<Link>` for user-driven navigation, `useNavigate()` for logic-driven
- Page components live in `app/<feature>/pages/`
- All routes wrapped with Suspense + ErrorBoundary at route level

## Localization

- UI strings in Romanian by default via react-i18next (`t('key')`)
- English translations added as fallback in `core/lib/i18n.ts`
- No hardcoded English strings in JSX
- Romanian diacritics must be correct: **ș ț ă â î** (not cedilla variants ş ţ)
- Currency: `formatPrice(ron)` → `"1.200 RON"` via `core/lib/formatters.ts`
- Dates: `Intl.DateTimeFormat('ro-RO')`

## Accessibility Guidelines (WCAG 2.1 AA — best effort)

- Semantic HTML: `<button>`, `<nav>`, `<main>`, `<section>` — never `<div onClick>`
- Icon-only buttons must have `aria-label`
- All images have `alt` text
- Focus-visible styles on all interactive elements
- `lang="ro"` on `<html>`

## Task Checklist

### New feature module
1. Create `app/<feature>/` with subfolders: `pages`, `components`, `hooks`, `types`, `apis`, `queries`
2. Define types in `app/<feature>/types/`
3. Define API calls in `app/<feature>/apis/`
4. Define query factories in `app/<feature>/queries/`
5. Build components using `useSuspenseQuery`
6. Add page component in `app/<feature>/pages/`
7. Register route in `core/routes/`
8. All strings via `t()` with Romanian as default

## Shared UI Components (`core/ui/`)

All exported from `@core/ui`. Full list:

| Component | Primitive | Notes |
|-----------|-----------|-------|
| Button | plain | variant: primary/secondary/tertiary/ghost/danger; size: sm/md/lg |
| Input | plain | forwardRef; label, error, hint, icon slots |
| Textarea | plain | forwardRef; same wrapper as Input |
| Select | plain | native select; options array |
| PriceInput | plain | RON currency input with negotiable checkbox |
| Slider | `@base-ui/react/slider` | range; debounced onChange |
| CityAutocomplete | `@base-ui/react/autocomplete` | Romanian city picker |
| SearchAutocomplete | `@base-ui/react/autocomplete` | listing title suggestions |
| **Tabs** | `@base-ui/react/tabs` | `value`/`onValueChange`; tabs: `{value, label, icon?}[]`; `data-[active]` drives style |
| **ConfirmDialog** | `@base-ui/react/alert-dialog` | open/onClose/onConfirm/title/description/variant |
| **Dropdown** | `@base-ui/react/menu` | trigger + items `{key, label, icon?, variant?, onClick?}`; link items use `onClick+useNavigate` |
| **Tooltip** | `@base-ui/react/tooltip` | wraps children; content/side/delay props |
| **Pagination** | plain | page/totalPages/onPageChange; hides at ≤1 page |
| **Alert** | plain | inline banner; variant: info/success/warning/error |
| Badge | plain | variant: primary/secondary/tertiary/error/surface |
| Chip | plain | filter chip with selected state + optional remove |
| Avatar | plain | image or initials fallback; 5 sizes |
| Card / CardHeader | plain | padding: none/sm/md/lg; interactive hover |
| Modal | plain | backdrop + Escape handling; size: sm/md/lg |
| Toast / AuthRequiredToast | plain | position-fixed; auto-dismiss; variant: info/success/error/warning |
| EmptyState | plain | icon + title + description + action slot |
| Divider | plain | spacing: sm/md/lg |
| ProgressBar | plain | animated; label + current/max |
| Skeleton / CardSkeleton | plain | pulse animation |
| ErrorCard | plain | error display with optional retry |
| ComingSoon | plain | placeholder page |
| GlobalLoadingIndicator | plain | app-wide loading overlay |

**base-ui data attributes used for styling:**
- `data-[active]` — Tabs.Tab when selected
- `data-[highlighted]` — Menu.Item when keyboard-focused
- `data-[popup-open]` — Menu/Tooltip Trigger when open

### New shared component
1. Place in `core/ui/` (primitive) or `core/layout/` (structural)
2. Use design token Tailwind classes only — no hex values
3. Export as named export from `core/ui/index.ts`
4. Add `aria-label` / semantic HTML
5. Prefer `@base-ui/react` primitives for interactive/overlay components

### Connecting a form
1. Define Zod schema
2. Wire `useForm({ resolver: zodResolver(schema) })`
3. Define mutation in `app/<feature>/queries/` using `mutationOptions`
4. Call mutation in `handleSubmit`

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Hardcoded hex in className | Use token class (`text-primary`, `bg-surface-low`) |
| `useQuery` with manual loading state | Use `useSuspenseQuery` + Suspense boundary |
| Form with raw `useState` | Use React Hook Form + Zod |
| Axios call directly in component | Move to `app/<feature>/apis/` |
| English string hardcoded in JSX | Use `t('key')` |
| Page component outside module | Move to `app/<feature>/pages/` |
| Wrong diacritics (ş ţ) | Use correct Romanian chars (ș ț) |
| Imports from wrong path | Use `@core/*` for engine/ui, `@app/*` for features |
