# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` (see `src/README.md` for details).
- Routing/UI: `src/app/` (Next.js App Router), shared UI in `src/components/` with feature folders (e.g., `Admin/`, `Forms/`, `Map/`).
- Logic: `src/services/` (domain services), `src/utils/` (helpers), `src/hooks/` (custom hooks), `src/types/` (TypeScript types), `src/config/` (env/config).
- Assets: `public/`.
- Barrel exports: prefer `index.ts` per folder for re-exports.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server at `http://localhost:3000`.
- `npm run build`: Production build (Next.js).
- `npm start`: Serve the production build.
- `npm run lint`: Lint the codebase using ESLint. Fix issues before committing.

## Coding Style & Naming Conventions
- Language: TypeScript + React (Next.js 15).
- Linting: ESLint with Next/TypeScript config; import ordering enforced. Run `npm run lint`.
- Components/files: PascalCase for React components (e.g., `ModernPricingTable.tsx`).
- Hooks: `use*` naming (e.g., `useGooglePlaces.ts`).
- Types: PascalCase interfaces/types in `src/types/`.
- Exports: Use barrel files (`index.ts`) for feature folders.

## Testing Guidelines
- No test runner is configured yet. For additions, co-locate tests under `src/**/__tests__` or alongside files (`*.test.ts[x]`).
- Prefer component tests (React Testing Library) and service-level unit tests. Keep tests deterministic and fast.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits (e.g., `feat(form): add range slider`, `chore(project-setup): ...`).
- PRs: Provide a clear description, link issues (e.g., `Closes #123`), and include screenshots/GIFs for UI changes.
- Scope: Keep PRs small and focused. Ensure `npm run lint` passes.

## Security & Configuration Tips
- Environment: copy `.env.example` to `.env`. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and other required vars (`src/config/environment.ts`).
- Do not commit secrets. `.env` is ignored by Git.
- External APIs: URLs managed via `src/config/`. Keep secrets client-safe (only `NEXT_PUBLIC_*` on client).

## Agent-Specific Instructions
- Align changes with existing structure and barrel exports.
- Avoid unrelated refactors; prefer incremental, well-scoped patches.
- When adding modules, mirror naming and placement patterns shown in `src/components/`, `src/services/`, and `src/utils/`.
