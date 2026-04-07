# Project-Specific Guidance

## Stack
- Next.js 16.2.2 (beta) + React 19 + TypeScript 5
- Tailwind CSS v4 (CSS-first config via `@theme` in `globals.css`)
- ESLint v9 with flat config (`eslint.config.mjs`)

## Commands
- `npm run dev` - Dev server at http://localhost:3000
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Type checking (no separate script)

## Tailwind CSS v4
- Config is in `app/globals.css` via `@theme` and `@layer` directives
- DO NOT create `tailwind.config.js` - it will conflict
- PostCSS uses `@tailwindcss/postcss` plugin

## Next.js 16
- App Router (`app/` directory)
- Fonts: Playfair Display (display) + DM Sans (body) via `next/font/google`
- State: React Context (`app/context/JiraContext.tsx`)
- No Server Actions in this project

## Project Structure
- Entry point: `app/page.tsx`
- Components: `app/components/`
- Types: `app/types/index.ts`
- Layout: `app/layout.tsx` wraps everything in `JiraProvider`

## Testing
- No test framework installed
- No tests exist in the repo

## Configuration Files
- `next.config.ts` - minimal, no custom settings
- `postcss.config.mjs` - only Tailwind plugin
- `tsconfig.json` - strict mode, bundler module resolution, path alias `@/*`