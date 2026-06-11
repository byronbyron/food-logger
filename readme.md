# Food Log

A lightweight, single-file food diary. No account, no server, no install — just open the HTML file in a browser and start logging.

## Features

- **Daily logging** — log food entries with a time and free-text quantity (e.g. "1 bowl", "200g", "large")
- **Quick-add buttons** — save your most common meals as one-tap shortcuts that pre-fill the form
- **Day navigation** — browse backwards and forwards through your history using the arrow controls
- **Export to CSV** — download your full log across all days as a spreadsheet-ready CSV file
- **Light & dark mode** — automatically follows your system preference
- **Works offline** — after the first load, no internet connection is needed (icons are cached by the browser)

## Getting started

1. Download `food-log.html`
2. Open it in any modern browser (Chrome, Firefox, Safari, Edge)
3. Start logging

No installation, no dependencies to install, no build step.

## How to use

### Logging food

Fill in the **Time**, **Food**, and **Quantity** fields and click **Log entry** (or press Enter). Time defaults to the current time if left blank. Entries are sorted chronologically automatically.

To remove an entry, hover over it and click the × button that appears on the right.

### Quick-add buttons

Click **New button** to save a common food item. Give it a label (shown on the button), a food name, and a default quantity. Clicking the button later pre-fills the form — you can adjust anything before logging.

To edit or delete a button, hover over it and click the pencil icon.

### Navigating days

Use the **‹** and **›** arrows to move between days, or click **Today** to jump back to the current date.

### Exporting your data

Click **Export CSV** in the top-right corner to download a `food-log.csv` file containing all entries across every day, with columns for Date, Time, Food, and Quantity.

## Data storage

All data is saved to your browser's `localStorage`. This means:

- Data is stored locally on your device — nothing is sent anywhere
- Data persists between sessions as long as you use the same browser on the same device
- Clearing your browser's site data will erase your log
- Data does not sync between devices or browsers

If you want to back up your data, use the **Export CSV** button regularly.

## Browser support

Works in any modern browser. Requires an internet connection on first load to fetch the icon font from jsDelivr CDN. After that, icons are cached and the app works fully offline.

| Browser | Support |
|---------|---------|
| Chrome / Edge | ✓ |
| Firefox | ✓ |
| Safari | ✓ |
| Mobile (iOS / Android) | ✓ |