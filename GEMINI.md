# Gemini CLI Project Context: my-link

This project is a personal profile/portfolio site built with Next.js, located in the `my-profile` directory.

## Project Overview

- **Core Framework**: [Next.js 16.2.3](https://nextjs.org/) (App Router)
- **UI Library**: [React 19.2.4](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Architecture**: Standard Next.js App Router structure within the `my-profile` subdirectory.

## Building and Running

Commands should be executed within the `my-profile` directory:

| Task | Command |
| :--- | :--- |
| **Development** | `npm run dev` |
| **Production Build** | `npm run build` |
| **Start Production** | `npm run start` |
| **Linting** | `npm run lint` |

## Development Conventions

- **Next.js 16 Warning**: This version of Next.js contains breaking changes and differs from typical training data for APIs and file structures. Refer to `my-profile/node_modules/next/dist/docs/` for updated guidance.
- **Styling**: Uses Tailwind CSS 4 with `@tailwindcss/postcss`. Configuration is minimal as Tailwind 4 is mostly CSS-first.
- **Font**: Utilizes Geist and Geist Mono via `next/font`.
- **Layout**: The root layout (`my-profile/app/layout.tsx`) sets up basic HTML structure with Geist fonts and antialiasing.

## Key Files & Directories

- `my-profile/app/`: Contains the application routes and components (Next.js App Router).
- `my-profile/public/`: Static assets like SVG icons and logos.
- `my-profile/next.config.ts`: Next.js configuration.
- `my-profile/package.json`: Project dependencies and scripts.
- `my-profile/AGENTS.md`: Specific instructions for AI agents regarding Next.js 16 conventions.

## AI Agent Behavior Rules

To ensure seamless collaboration, any AI Agent working on this repository must strictly adhere to the following rules:

1. **Language**: Always respond and communicate in Korean (**항상 한국어로 답변할 것**).
2. **Artifacts in Korean**: All planning, tracking, and walkthrough documents (`implementation_plan.md`, `task.md`, `walkthrough.md`) must be written in Korean (**계획서, 태스크 보드, 작업 완료 보고서는 반드시 한국어로 작성할 것**).
3. **Post-Development Validation**: After finishing any development/modification, always run the production build command inside `my-profile` to verify there are no compilation or type errors (**개발 완료 후 반드시 `npm run build` 명령어로 빌드 및 타입 검증을 수행할 것**).
4. **Minimize User Interaction**: Minimize the actions that require manual user approval. Achieve this by:
   - Grouping or chaining related shell commands together (e.g., using `;` or `&&`).
   - Using dedicated file editing tools instead of terminal-based commands (like `cat` or `echo`) to modify files.
   - Taking proactive actions within safe boundaries, only requesting confirmation when strictly necessary or when architectural decisions are required.

## Project Coding Conventions

- **Component Organization**: Place reusable UI components under `my-profile/components/` using PascalCase (e.g., `ProfileCard.tsx`).
- **Styling**: Prioritize Tailwind CSS 4 utility classes.
- **Commit Messages**: Follow the Conventional Commits specification (e.g., `feat: ...`, `fix: ...`, `chore: ...`).

