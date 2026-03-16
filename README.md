# Pay Day New Tab

A Chrome Extension that replaces your New Tab page with a custom dashboard featuring a live clock and payday countdown.

## Features

- **Live Clock** - Large, customizable clock displaying current time
- **Payday Countdown** - Shows days remaining until your next payday
- **Detailed Countdown** - Days, hours, minutes, and seconds breakdown
- **Customizable Themes** - 10 color palettes to choose from
- **Dark/Light Mode** - Toggle between themes
- **Clock Customization** - Multiple fonts, adjustable size, show/hide seconds

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the project directory

## Usage

- Open a new tab to see the Pay Day dashboard
- Click the **gear icon** to access settings
- Set your payday day-of-month (1-31)
- Right-click the clock to cycle through font styles
- Use the control buttons to adjust clock size and toggle seconds

## Project Structure

```
├── manifest.json      # Chrome extension manifest (v3)
├── newtab.html       # Main New Tab page
├── newtab.js         # Application logic
├── newtab.css        # Main stylesheet
├── newtab-themes.css # Theme definitions
└── prompt.md        # Original specification
```

## License

MIT
