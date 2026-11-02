# @rektinasub/web

The Rektina.sub web app: Next.js (App Router), Tailwind CSS v4 and shadcn/ui.

Run it from the repo root with `bun dev`, or from this folder with `bun run dev`. It serves on http://localhost:3000.

- Routes live in `src/app`.
- App-specific components go in `src/components`, and helpers go in `src/lib`.
- Shared shadcn components come from `@rektinasub/ui`. Add new ones from this folder with `bunx --bun shadcn@latest add <component>`, and the CLI writes them into `packages/ui`.
