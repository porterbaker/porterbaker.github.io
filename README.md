# porterbaker.github.io

Personal site. Plain HTML/CSS/JS, no build step. 1-bit pixel style: paper + ink, greys via dithering.

- `index.html`: resume content (work, skills, education)
- `projects.js`: project write-ups, hidden repos, offline snapshot
- `main.js`: pixel-font name, Snake mini-game, live GitHub fetch, pixel cursor, optional 8-bit SFX
- `styles.css`: everything visual

Projects load live from the GitHub API. Repos with stars are promoted to the top automatically.
Add a write-up for a repo in `CURATED`, or hide one via `HIDDEN`.

Snake: click the box (or tap on mobile), steer with arrows/WASD (swipe on mobile), Esc to pause.
High score is saved in the visitor's browser.

Preview locally: `python3 -m http.server` and open http://localhost:8000
