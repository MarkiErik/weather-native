# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Code standards

Apply to all code and to every review (`/code-review` and `/mobile-review`).

- **No `any`.** Never use `any`, explicit or implicit. Use precise types; for external/untrusted JSON use a typed shape or `unknown` + narrowing — never `any`.
- **Small functions.** One responsibility per function; aim < ~40 lines. Extract a helper instead of growing a function.
- **Small files.** Keep files focused; aim < ~200 lines. Split large components into sub-components and move pure logic out of the component.
- **Utilitise.** Reusable/pure logic → `src/utils/`; data/API access → `src/services/` (one place knows the API). No duplicated logic — extract it.
- **Architecture / layering.** Keep layers separate and one-directional: `services` (data) · `utils` (pure helpers) · `hooks` (stateful glue) · `contexts` (shared state) · `components` (presentational UI) · `app` (routes). Components stay presentational — no business logic or raw `fetch` inline in JSX.
