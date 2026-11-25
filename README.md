# Abyss Development website

The public website of Abyss Development: static HTML and CSS, with TypeScript for the browser-side scripting. There is no framework and no bundler. The generated `script.js` is committed, so deploying the site needs no build step: a plain checkout works on any static host. Compiling the TypeScript is only needed when you change the browser script.

## Requirements

- Node.js 22.13 or newer (see `.nvmrc`)
- npm

Node.js is only needed to compile and check the TypeScript, not to serve the site.

## Installation

```bash
npm install
```

## Development

1. Edit the browser logic in `src/script.ts`.
2. Run `npm run build`. It compiles `src/script.ts` to `script.js` in the repository root.
3. Open the site in the browser and test.

The HTML pages load `script.js` with a plain `<script src>` tag, as a classic browser script rather than an ES module. Keep `src/script.ts` free of `import` and `export`, or the output stops working in the browser.

`script.js` is generated but committed, so the site keeps working without a build step. Never edit it directly: your changes are overwritten on the next build. Commit it together with the `src/script.ts` change it was built from.

VS Code Live Server (or any other static server) only serves the files; it does not compile TypeScript. Run `npm run build` after changing `src/script.ts` and before testing in the browser.

## Checks

| Command | What it does |
|---|---|
| `npm run lint` | ESLint over `src/script.ts` and the tooling config. The generated `script.js` is not linted |
| `npm run typecheck` | Type-checks `src/script.ts` with strict TypeScript, without writing `script.js` |
| `npm run check` | Runs `lint`, then `typecheck`. It does not build |
| `npm run build` | Compiles `src/script.ts` to `script.js` |

## Project structure

| Path | What |
|---|---|
| `src/script.ts` | Source of the browser script: scroll reveal, background currents, expandable panels, gallery lightbox, mobile menu and active-section navigation |
| `script.js` | Generated from `src/script.ts` by `npm run build`; loaded by every page |
| `index.html` | Homepage |
| `impressum/`, `privacy/`, `terms/` | Legal pages, each an `index.html` |
| `style.css` | Styles for all pages |
| `assets/` | Images and the web font |
