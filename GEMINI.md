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
