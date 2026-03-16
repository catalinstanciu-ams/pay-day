# Chrome New Tab Extension Plan

## Goal

Build a Chrome extension that replaces the default New Tab page with a custom dashboard showing:

- a large live clock
- a payday countdown
- a compact secondary countdown with days, hours, minutes, and seconds

The extension should feel clean, fast, and minimal, with the countdown aimed at the user’s recurring monthly payday.

## Product Requirements

- Override Chrome's New Tab page using the extension manifest.
- Show the current local time prominently in the center or upper section.
- Let the user set a recurring payday day-of-month, such as the 10th of every month.
- Show the number of days left until the next payday.
- Show a more detailed live countdown below it with days, hours, minutes, and seconds.
- Persist the selected payday locally so it survives browser restarts.
- Handle short months correctly:
  - if the user selects 29, 30, or 31, clamp to the last valid day of that month
- On the payday date itself, show a special state such as `Payday today`.
- Keep the first version local-only with no sync, no backend, and no accounts.

## Technical Direction

- Use Manifest V3.
- Use a simple static extension structure:
  - `manifest.json`
  - `newtab.html`
  - `newtab.css`
  - `newtab.js`
  - optional `assets/` for icons
- Use the `chrome_url_overrides` field to replace the New Tab page.
- Use `chrome.storage.local` for storing the payday day-of-month.
- Use a timer in the new tab page to refresh:
  - the clock every second
  - the detailed countdown every second
  - the days-left value when the countdown changes
- Keep all date logic in a dedicated JS module or isolated functions so it is easy to test and maintain.

## UI Plan

- Full-page layout with a calm dashboard look.
- Large digital clock as the primary visual element.
- Payday section below the clock:
  - headline with `X days left` or `Payday today`
  - detailed countdown in separate blocks for days, hours, minutes, seconds
- Small settings area:
  - input for payday day-of-month
  - save action
  - helper text explaining short-month behavior
- Prefer a clean, intentional visual style rather than default browser-looking controls.

## Logic Plan

- Read the saved payday day-of-month from `chrome.storage.local` on load.
- Default to day `10` if no setting exists yet.
- Compute the next payday based on the current local date:
  - if the payday this month is still ahead, target this month
  - if today is payday, show `Payday today`
  - if the payday has passed, target next month
- For the detailed countdown:
  - when it is payday today, either show zeros or switch to the next payday countdown with a special headline
  - use one explicit behavior consistently in the UI
- Re-render the page state every second from a single update loop.

## Build Steps

1. Create the Manifest V3 extension scaffold.
2. Add the New Tab override page.
3. Build the base layout for the clock, countdown, and settings area.
4. Implement local storage for the recurring payday value.
5. Implement payday date calculation and short-month clamping.
6. Implement live clock updates.
7. Implement live countdown updates.
8. Add the payday-today display state.
9. Polish styling for desktop Chrome.
10. Test by loading the unpacked extension in Chrome.

## Acceptance Criteria

- Opening a new tab shows the custom dashboard instead of Chrome’s default page.
- The current time updates live every second.
- The user can save a recurring payday day-of-month.
- The countdown remains correct across month boundaries.
- Selecting 31 behaves correctly in shorter months.
- The saved payday persists after closing and reopening Chrome.
- The page is readable and visually intentional on a normal desktop display.

## Out of Scope for V1

- Multiple countdowns
- Cloud sync
- Notifications
- Funny money suggestions
- Theme switching
- Authentication
- Backend services
