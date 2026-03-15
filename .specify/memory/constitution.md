<!--
  Sync Impact Report
  ===================
  Version: 1.0.0 → 2.0.0 (MAJOR - full rewrite, compacted + restructured)
  Changes:
    - Compacted all principle descriptions (~60% shorter)
    - Added ACL page pattern with .acl and .getLayout conventions
    - Added structural patterns section (pages, views, services, hooks)
    - Merged "Frontend Patterns" into principles where relevant
    - Removed redundant rationale blocks
  Templates: all compatible (no structural changes to plan/spec/tasks)
  Follow-up TODOs: None
-->

# E-Mentor Frontend Constitution

## Core Principles

### I. TypeScript for New Code

All **new** files MUST be `.tsx` (components) or `.ts` (logic) with
explicit types for props, state, API responses, and function signatures.
`any` is forbidden in new code unless bridging untyped legacy modules
(annotate with `// TODO: type properly`).

Existing `.js` files remain as-is. Migration is optional and manual.

### II. Generated API Clients as Single Source of Truth

No direct `axios` calls to backend endpoints in new code. All API
communication goes through the three-layer client architecture:

1. **Generated layer** (`src/generated/<service>/`) — OpenAPI output,
   never hand-edited. Regenerate with `npm run generate:apis`.
2. **Client wrapper** (`src/generated/<service>-client.ts`) — singleton
   class that clones interceptors from `baseApiClient`, sets `basePath`
   via env var, exposes controllers as lazy getters.
3. **Consumer code** — imports the singleton:

```ts
import { lessonServiceClient } from 'src/generated/lesson-service-client'
const res = await lessonServiceClient.lessons.getAllLessons()
```

| Service | Base Path | Generated Dir | Singleton |
| ------- | --------- | ------------- | --------- |
| Profile (service2) | `/service2` | `profile-service-client/` | `profileServiceClient` |
| Quiz (service3) | `/service3` | `quiz-service/` | `quizServiceClient` |
| Lesson (service4) | `/service4` | `lesson-service/` | `lessonServiceClient` |
| User (service1) | `/service1/user` | legacy `apiSpec.js` | migration target |

Wrappers in `src/services/` MUST delegate to these singletons.

### III. Component Architecture

```text
src/pages/        → Thin route entry points (wire layout + guards + view)
src/views/        → Complex presentational components (receive data via props)
src/components/   → Reusable UI elements (props-driven, no Redux access)
src/hooks/        → Custom hooks (bridge between components and store/services)
src/store/        → Redux Toolkit slices (global shared state)
src/services/     → High-level wrappers over generated client singletons
```

- **Pages** MUST NOT contain business logic — delegate to hooks and views.
- **Views** MUST NOT call APIs directly.
- **Components** MUST accept data via props, MUST NOT access the store.
- **Hooks** encapsulate fetching, side effects, and state transforms.
- **New slices** MUST be TypeScript with typed selectors and thunks.

### IV. ACL & Guard System

Every page MUST declare access control and layout. The two static
properties consumed by `_app.js` → `AclGuard`:

```tsx
// Required — determines who can access the page
QuizzesPage.acl = {
  action: 'read',
  subject: 'professor-pages'   // or 'student-pages' | 'common-view'
}

// Optional — defaults to UserLayout if omitted
QuizzesPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
```

**Subjects & roles** (defined in `src/configs/acl.js`):

| Role | profileCompleted | Granted Subjects |
| ---- | ---------------- | ---------------- |
| ADMIN | any | `manage all` |
| PROFESSOR | true | `acl-page`, `professor-pages` |
| PROFESSOR | false | `professor-profile-complete-page` |
| STUDENT | true | `student-pages` |
| STUDENT | false | `student-profile-complete-page` |

**Guard hierarchy** (applied in order by `_app.js`):

1. `GuestGuard` — unauthenticated pages (`guestGuard = true`)
2. `AuthGuard` — requires valid token (`authGuard = true`, default)
3. `AclGuard` — reads `.acl` property, builds CASL ability from role
4. `ProfessorSubscriptionGuard` — auto-wrapped on `professor-pages`

**Navigation** items in `src/navigation/vertical/index.js` MUST include
`subject` and `action` — the sidebar auto-filters by the user's ability.

Role-conditional UI MUST use `<Can>` from `@casl/react`, not manual
`role ===` checks:

```tsx
<Can I="read" a="professor-pages">
  <ProfessorWidget />
</Can>
```

### V. State Management

- **Redux** (`src/store/apps/`) for data shared across routes.
- **Local state** (`useState`/`useReducer`) for component-scoped data.
- **Context** (`src/context/`) only for tree-level concerns (auth,
  WebSocket, theme) — not for new feature state.
- New thunks MUST use `createAsyncThunk<Return, Arg>` with
  `rejectWithValue` and track `loading`/`error`/`data` in the slice.
- Caching strategies MUST be documented in the slice file.

### VI. UI & Forms

- All UI MUST use MUI v5. Styling priority: theme overrides >
  `sx` prop > `styled()`. No custom CSS in new code.
- Forms MUST use `react-hook-form` + `yup` + `yupResolver`.
  Infer form types from the schema via `InferType`.
  Bind MUI inputs via `Controller`.

### VII. Simplicity & Incremental Delivery

YAGNI. Start simple. Justify abstractions in the Complexity Tracking
table. Each user story MUST be independently deployable. Split large PRs.

## Frontend Patterns

### Page Pattern

```tsx
const QuizzesPage = () => {
  const { quizzes, loading, error } = useQuizzes()
  return <QuizzesListView quizzes={quizzes} loading={loading} error={error} />
}
QuizzesPage.acl = { action: 'read', subject: 'student-pages' }
QuizzesPage.getLayout = (page: ReactNode) => <UserLayout>{page}</UserLayout>
export default QuizzesPage
```

### Hook Pattern

```tsx
interface UseQuizzesReturn {
  quizzes: Quiz[]
  loading: boolean
  error: string | null
  refetch: () => void
}
export const useQuizzes = (): UseQuizzesReturn => { /* ... */ }
```

Split hooks beyond ~100 lines into composable sub-hooks.

### Props Pattern

Every component declares a named `Props` interface at file top:

```tsx
interface QuizCardProps {
  quiz: Quiz
  onStart: (quizId: string) => void
  isDisabled?: boolean
}
const QuizCard = ({ quiz, onStart, isDisabled = false }: QuizCardProps) => { /* ... */ }
```

### Error / Loading / Empty States

Every data-driven view MUST handle three states: loading (skeleton or
spinner), empty (message + CTA), error (`Alert` + retry).

### Co-location

Files used by one feature live with that feature. Shared across
features → `src/components/` or `src/hooks/`.

```text
pages/quizzes/
├── index.tsx
├── components/QuizCard.tsx
└── hooks/useQuizFilters.ts
```

### Imports

Use the `src/` alias for cross-directory imports. Relative paths MUST
NOT span more than one parent level. Co-located files MAY use `./`.

## Technology Stack

- **Framework**: Next.js 13.3.2 (Pages Router), React 18.2.0
- **Language**: TypeScript 5.8.3 (mixed codebase, new code only)
- **UI**: MUI v5, Apple Design System tokens
- **State**: Redux Toolkit 1.9.5, redux-persist
- **Forms**: react-hook-form 7.43.9, yup 1.1.1
- **Auth**: Keycloak (OIDC) + CASL 6.5.0
- **HTTP**: axios 1.4.0 via generated OpenAPI clients
- **i18n**: i18next 23.3.0
- **Monitoring**: Elastic APM (production)
- **Payments**: Stripe

### Microservices

| # | Service | Path | Purpose |
| - | ------- | ---- | ------- |
| 1 | User | `/service1/user` | User management, Keycloak |
| 2 | Profile | `/service2` | Profiles, events, payments, orgs |
| 3 | Quiz | `/service3/quiz` | Quiz CRUD, attempts, grading |
| 4 | Lesson | `/service4/lesson` | Lesson CRUD, student progress |
| - | Notifications | `/service5/notifications` | WebSocket (STOMP/SockJS) |

### Project Structure

```text
src/
├── @core/          # Framework: layouts, theme, auth guards, axios
├── @fake-db/       # Mock API layer (dev/test)
├── components/     # Shared reusable components
├── configs/        # Auth, ACL, theme, i18n config
├── context/        # React context (Auth, WebSocket, AppBar)
├── generated/      # OpenAPI clients + client wrappers (DO NOT EDIT generated/)
├── hooks/          # Custom React hooks
├── layouts/        # Layout wrappers + ACL components
├── navigation/     # Sidebar menu definitions (role-aware)
├── pages/          # Next.js routes
├── services/       # Service wrappers over generated singletons
├── store/          # Redux Toolkit slices
├── types/          # Shared TypeScript types
└── views/          # Complex view components
```

## Development Workflow

### Branch Naming

`SERVICE-00-FRONTEND-SERVICE/<descriptive-name>`

### Pre-Merge Checklist

1. `npm run build` passes
2. `npm run lint` — no errors (warnings OK during migration)
3. No new `any` types (unless annotated)
4. New pages have `.acl` + `.getLayout` (if non-default)
5. No manual edits in `src/generated/<service>/`
6. No hardcoded URLs — use `NEXT_PUBLIC_PROD_HOST`
7. No secrets in client code

### JS-to-TSX Migration (Optional)

When chosen, follow these steps atomically (no feature changes in same
commit): rename → add types → replace PropTypes → update imports →
verify build.

## Governance

This constitution supersedes informal conventions. Amendments require:
version bump (MAJOR/MINOR/PATCH per semver), updated date, and
consistency check against speckit templates.

All PRs MUST verify compliance. Deviations MUST be justified in the PR.

**Version**: 2.0.0 | **Ratified**: 2026-03-15 | **Last Amended**: 2026-03-15
