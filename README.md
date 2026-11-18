# Weather Report App

React + Vite + axios + React Router. Login/sign-up, protected home page, city weather search (OpenWeatherMap), °C/°F toggle, recent searches, responsive layout.

## Run locally
1. Get a free API key at https://openweathermap.org/api (new keys can take up to ~2 hours to activate).
2. `cp .env.example .env` and put your key in `VITE_OPENWEATHER_API_KEY`.
3. `npm install && npm run dev`
4. `npm test` runs the tests (axios is mocked, no key needed).

## Deploy to GitHub Pages
1. Repo **Settings → Secrets and variables → Actions → New repository secret**: name `VITE_OPENWEATHER_API_KEY`, value = your key.
2. Repo **Settings → Pages → Source: GitHub Actions** (do not click the suggested template workflows).
3. Push to `main`; `.github/workflows/deploy.yml` tests, builds and publishes.

Notes
- Blank-page fixes: `base: "./"` in `vite.config.js` and `HashRouter` (URLs look like `/#/`).
- Because this is a static site, the API key is embedded in the built JavaScript and is visible to visitors. That is normal for a free-tier key; never use a paid or sensitive key this way.
- Login is a front-end demo (accounts stored in the browser's localStorage). A real app needs a backend.
