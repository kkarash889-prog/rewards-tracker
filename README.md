# Rewards Tracker — Android PWA

A local-first points tracker with an Xbox-inspired dark green interface. No Microsoft account, API, or network connection is needed for tracking.

## Included
- Starting balance: **1,191** points
- Target: **55,000** points
- Daily goal: **203** points, enabled
- Add earned points and optionally label each entry
- Set your total balance without counting the adjustment as daily earnings
- Change the gift-card target and daily target
- Daily goal toggle; disabling it hides the estimate but keeps tracking
- Daily earnings are calculated from earned-point entries for the device's local calendar day
- Activity history and automatic calendar-day rollover
- LocalStorage persistence and service-worker offline cache
- Standalone PWA manifest and custom icons

## Install on a Samsung Android phone
A PWA must be served from **HTTPS** (or localhost) for service workers and installation. It cannot be properly installed by opening `index.html` directly from the Files app.

1. Upload the contents of this folder to an HTTPS static host, keeping the file structure intact. GitHub Pages, Cloudflare Pages, or Netlify can host it.
2. Open the deployed HTTPS address in **Chrome** on your Samsung phone.
3. Open Chrome's ⋮ menu and choose **Install app** or **Add to Home screen** (wording varies).
4. Launch **Rewards Tracker** from the home screen. It opens in standalone mode.
5. Open it once while online so the service worker can cache the app. After that, the tracker works offline.

## Data and privacy
All tracker data is stored in this browser's localStorage on this device. It is not synced or backed up. Clearing Chrome site data, uninstalling in some circumstances, or using a different browser/profile may remove or separate the data. Export/backup is not currently included.

## Daily earnings behavior
Only entries created with **Add points** count toward daily earnings. **Set balance** changes the total balance and is logged as an adjustment, but does not change the daily earned-points total. A new local calendar date automatically starts a fresh daily total; older entries remain in History.
