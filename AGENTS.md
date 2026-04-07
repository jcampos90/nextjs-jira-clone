# Project-Specific Guidance

## Stack
- Next.js 16.2.2 (beta) + React 19 + TypeScript 5
- Tailwind CSS v4 (no `tailwind.config.js` - uses CSS-first config)
- ESLint v9 with flat config (`eslint.config.mjs`)

## Commands
- `npm run dev` - Start dev server at http://localhost:3000
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- No separate typecheck script - run `npx tsc --noEmit` if needed

## Tailwind CSS v4 Notes
- Config is in CSS via `@theme` directive in `app/globals.css`
- Do NOT create `tailwind.config.js` - it will conflict

## Next.js 16 Notes
- App Router with `app/` directory
- Use `node_modules/next/dist/docs/` for current API reference
- Server Actions in `app/actions.ts` (if used) are async by default
