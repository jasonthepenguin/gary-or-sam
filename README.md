Who Posted It — Gary or Sam?

A tiny, static web app to guess whether a quote came from Sam Altman or Gary Marcus. It renders each quote like a dark-mode X post, shows a blurry question-mark avatar first, and reveals the correct avatar after your guess. You play through all quotes in the JSON, then get a final score.

Quick start

- Serve the folder with any static server (to allow `fetch` of `quotes.json`):
  - Python: `python3 -m http.server 8080` then open `http://localhost:8080/`
  - Node (if you have `npx`): `npx serve -p 8080 .`
  - VS Code Live Server works great too.

Files

- `index.html`: App shell
- `styles.css`: Dark/X-inspired UI
- `app.js`: Game logic and interactions
- `quotes.json`: Your dataset of quotes
- `sam.jpg`, `gary.jpg`: Avatars that reveal after a guess (already present)

Quote data format

`quotes.json` must be an array of objects with these fields:

[
  { "text": "Quote text...", "author": "sam" },
  { "text": "Another quote...", "author": "gary" }
]

- `author` must be `"sam"` or `"gary"`
- Keep quotes short-ish for best layout

Gameplay

- Click “Gary Marcus” or “Sam Altman” (or use ArrowLeft/ArrowRight)
- The avatar reveals, you get immediate feedback, then click Next
- Score and progress update each round; final screen shows total
- “Play Again” reshuffles and restarts

Styling notes

- Default is dark mode with an X-post card vibe
- The initial avatar is a blurred “?”; on reveal it swaps to `sam.jpg` or `gary.jpg`
- If you replace the avatar files, keep the same names or update `app.js`

Troubleshooting

- Seeing “Could not load quotes”? Make sure you’re serving over HTTP (not opening the file directly) and that `quotes.json` is valid JSON.
- If an image doesn’t appear, confirm `sam.jpg` and `gary.jpg` exist in the project root.

