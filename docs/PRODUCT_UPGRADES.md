# Product Upgrades

## 1. Progressive Web App (PWA)

Installable + offline-ready experience:

1. Install Workbox

```bash
npm install workbox-webpack-plugin
```

2. Update `public/manifest.json` with the standard PWA metadata:

```json
{
  "name": "LebiDE",
  "short_name": "LebiDE",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ff6b00",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

3. Register the service worker from `src/index.js`:

```diff
- serviceWorker.unregister();
+ serviceWorker.register();
```

After these steps the SPA will cache assets, serve while offline, and prompt users to install it to their home screens.

## 2. AI explanations for questions 🤖

Add an “Explain with AI” CTA below each question. When clicked, call an LLM endpoint with a prompt such as:

"Explain why the correct answer is correct for a German citizenship test question. Question: In Germany people may criticize the government because... Correct answer: Freedom of opinion. Explain simply for immigrants learning German civics."

Example button:

```jsx
<button onClick={explainQuestion}>Explain with AI</button>
```

Example API call:

```js
const response = await fetch('/api/explain', {
  method: 'POST',
  body: JSON.stringify({ question, correctAnswer }),
});
```

Return the answer text and render it below the question so learners see context drawn from the Grundgesetz.

## 3. Spaced repetition learning (Anki-style)

Track each question per user:

```
users
  userId
    questionProgress
      q23
        correct: 3
        wrong: 1
        lastSeen: timestamp
```

Calculate a priority score such as `wrongCount * 3 + daysSinceSeen - correctCount`. Sort the question queue by descending score so mistakes, forgotten topics, and weak areas surface first.

## 4. Real exam simulation mode

Create a dedicated mode featuring:

- 60-minute timer
- Exactly 33 randomized questions
- Locked navigation until the test completes
- Official scoring and instant summary

Reuse the existing quiz shell, add the timer hooks, and keep navigation disabled when this mode is active so the experience mirrors the real exam.
