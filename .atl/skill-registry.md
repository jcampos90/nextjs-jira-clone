# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When writing, reviewing, or refactoring React/Next.js code | vercel-react-best-practices | /home/jcampos/.agents/skills/vercel-react-best-practices/SKILL.md |
| Review UI, check accessibility, audit design, review UX | web-design-guidelines | /home/jcampos/.agents/skills/web-design-guidelines/SKILL.md |
| Writing prose for humans — docs, commits, messages, UI text | writing-clearly-and-concisely | /home/jcampos/.agents/skills/writing-clearly-and-concisely/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### vercel-react-best-practices
- Server Components by default — add 'use client' only for interactivity/hooks
- Use Promise.all() for independent async operations — avoid waterfalls
- Import directly from packages, avoid barrel files (bundle-barrel-imports)
- Use React.cache() for server-side request deduplication
- Hoist static I/O (fonts, images) to module level (server-hoist-static-io)
- Use Suspense to stream content — start promises early, await late
- Use startTransition for non-urgent updates (rerender-transitions)
- Use toSorted() for immutability — avoid mutating arrays in place
- Use Map/Set for repeated lookups — O(1) vs O(n)
- Check array length before expensive operations (js-length-check-first)
- Derive state during render, not in effects (rerender-derived-state-no-effect)
- Use passive event listeners for scroll (client-passive-event-listeners)
- Use content-visibility for long lists (rendering-content-visibility)
- Return early from functions (js-early-exit)

### web-design-guidelines
- Ensure all interactive elements are keyboard accessible
- Provide proper focus indicators — visible focus ring for keyboard navigation
- Use semantic HTML elements (button, nav, main, article)
- Ensure color contrast meets WCAG AA minimum (4.5:1 for text)
- Add alt text for all meaningful images
- Ensure touch targets are at least 44x44px
- Support prefers-reduced-motion for animations
- Use proper heading hierarchy (h1 → h2 → h3)

### writing-clearly-and-concisely
- Use active voice — "the user clicked" not "the button was clicked by the user"
- Put statements in positive form — say what IS, not what IS NOT
- Use definite, specific, concrete language — not vague/generic
- Omit needless words — every word must earn its place
- Keep related words together — don't split subject and verb
- Place emphatic words at end of sentence
- One paragraph per topic, begin with topic sentence
- Avoid AI patterns: pivotal, crucial, vital, delve, leverage, showcase, foster

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | /home/jcampos/Code/NextJs/jira-clone/AGENTS.md | Project-specific guidance including stack, commands, testing status |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
