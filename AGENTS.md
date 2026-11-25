# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Idioma e acentuação

Todo texto em português neste repositório — títulos e corpos de PR/issues, comentários, README, docs e mensagens de commit — deve usar português brasileiro com acentuação e cedilha corretas. Nunca remova acentos para contornar problemas de encoding do shell ou da API.

- Ao criar ou editar textos no GitHub com `gh`, grave o conteúdo em um arquivo UTF-8 e use `--body-file`; para títulos e JSON, use `gh api` com `-F campo=@arquivo`.
- Prefixos de Conventional Commits (`feat:`, `fix:`, `docs:`, `ci:`, `test:`) podem permanecer em inglês; o restante do texto deve ser acentuado quando estiver em português.
- Antes de publicar, confira o texto renderizado no GitHub para garantir que os acentos não foram corrompidos.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.
