# AGENTS.md - Pay Day New Tab

## Project Overview

A Chrome Extension (Manifest V3) that replaces the New Tab page with a custom dashboard featuring a live clock, payday countdown, bookmarks, and theme customization.

**Tech stack:** Vanilla HTML/CSS/JavaScript (ES modules). No frameworks, no build tools, no bundler, no TypeScript.

## Build / Run / Test Commands

There is no build system or package manager. The project is a static Chrome extension loaded as unpacked.

- **Run:** Load unpacked in `chrome://extensions/` with Developer mode enabled, point at the project root.
- **Lint:** No linter configured (no ESLint, Prettier, etc.).
- **Test:** No test framework configured. Manual testing only by loading the extension in Chrome.
- **Typecheck:** None - this is plain JavaScript with no TypeScript.

No `package.json` exists. Do not create one unless the user explicitly asks.

## Architecture

```
manifest.json          # Chrome extension manifest (v3)
newtab.html            # Entry point HTML, loads newtab.js as ES module
newtab.js              # Main orchestrator: wires up event listeners, calls initialize()
newtab.css             # Main layout and component styles
newtab-themes.css      # CSS custom property palettes (10 dark + 10 light)
js/shared.js           # Shared state, constants, DOM element refs, storage wrapper, formatters
js/clock.js            # Clock rendering, payday countdown logic, date calculations
js/theme.js            # Theme/palette/font/size toggling and persistence
js/bookmarks.js        # Chrome bookmarks API integration and DOM rendering
```

## Code Style Guidelines

### Language & Modules
- Pure vanilla JavaScript using ES modules (`import`/`export`).
- All JS files use `.js` extension. Import paths include the extension (e.g., `import { foo } from "./shared.js"`).
- Chrome APIs (`chrome.storage.local`, `chrome.bookmarks`) are used directly, wrapped in `shared.js` `storage` object for promises.

### Imports
- Named exports only; no default exports.
- Import only what is needed from `shared.js` (state, constants, elements, formatters).
- Group imports by module, one `import` block per source file.

### Naming Conventions
- **Constants:** `UPPER_SNAKE_CASE` for exported configuration values and defaults (e.g., `DEFAULT_PAYDAY`, `MAX_CLOCK_SIZE_STEP`).
- **Functions:** `camelCase`, verb-first for actions (`renderTheme`, `toggleTheme`, `savePaydayDay`, `clampPaydayDay`).
- **Normalize helpers:** Prefix with `normalize` for value validation/coercion (`normalizeClockFontIndex`, `normalizeHideSeconds`).
- **Render helpers:** Prefix with `render` for DOM update functions (`renderPalette`, `renderClockAndCountdown`).
- **DOM elements:** Collected in `elements` object in `shared.js` using `document.getElementById`.

### Functions
- Pure logic functions are synchronous and return values (e.g., `clampPaydayDay`, `getCountdownParts`, `daysInMonth`).
- Functions that persist state are `async` and `await` storage operations.
- One clear responsibility per function. Rendering and side effects are kept separate from calculation.

### State Management
- Single mutable `appState` object in `shared.js` holds all runtime state.
- State is modified directly (`appState.paydayDay = value`) then persisted via `storage.set()`.
- No reactive framework; DOM is updated imperatively by calling render functions.

### Error Handling
- Try/catch around async Chrome API calls (see `bookmarks.js:loadAndRenderBookmarks`).
- Invalid inputs are normalized to defaults using `normalize*` and `clamp*` helpers rather than throwing.
- User-facing messages use `setSaveMessage()` or inline `.textContent` updates.

### CSS
- CSS custom properties (variables) defined in `:root` and overridden per `data-theme` + `data-palette` body attributes.
- Use `color-mix(in srgb, ...)` for dynamic color blending.
- Mobile-first responsive breakpoints at 980px, 900px, 640px.
- No CSS preprocessor (no Sass/Less). Plain CSS only.
- BEM-like class naming with descriptive kebab-case (e.g., `bookmark-folder-dropdown`, `countdown-card`).

### HTML
- Semantic HTML with `main`, `section`, `aside`, `article`.
- ARIA attributes for accessibility (`aria-label`, `aria-live`, `aria-expanded`, `aria-controls`).
- Settings panel toggled via `hidden` attribute, not CSS `display`.

### General Conventions
- No comments in code unless absolutely necessary for clarity.
- No trailing semicolons missing - all statements use semicolons.
- Use `String()` for number-to-string conversion, `Number.parseInt(value, 10)` for parsing.
- Prefer `===` and `!==` over loose equality.
- Keep functions short and focused; the orchestrator (`newtab.js`) is the only file that wires everything together.
