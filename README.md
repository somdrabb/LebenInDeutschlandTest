# 🇩🇪 LebiDE — Leben in Deutschland Test Trainer

Interactive learning platform to prepare for the official German citizenship test (Leben in Deutschland & Einbürgerungstest).

Practice all 300 official BAMF questions, train weak areas, and simulate the real exam using smart modes, Firebase persistence, and a modern Tailwind + Framer Motion UI.

🚀 Live Demo

https://lebide.web.app

---

## ✨ Features

✔ All 300 official questions
✔ Bundesland-specific questions
✔ Mixed exam simulation (33 questions)
✔ Wrong answers trainer
✔ Open questions practice mode
✔ Exam history & statistics
✔ PDF export of results
✔ Multi-language support

- German
- English
- Bengali

✔ Firebase authentication

- Google
- GitHub
- Microsoft
- Facebook
- Email
- Anonymous

✔ Cloud persistence

- Firebase Realtime DB
- Firestore

✔ Modern UI

- TailwindCSS
- Framer Motion
- Responsive layout

---

## 🖼 Screenshots

### Homepage

![Home](public/screenshots/home.png)

### Quiz Mode

![Quiz](public/screenshots/quiz.png)

### Mixed Test

![Mixed Test](public/screenshots/mixed-test.png)

### Wrong Answers Trainer

![Wrong Answers](public/screenshots/wrong-answers.png)

---

## 🧠 Learning Modes

| Mode            | Description                            |
| --------------- | -------------------------------------- |
| General         | Practice the official 300 questions    |
| Bundesland Mode | State-specific questions               |
| Mixed Test      | Simulates the real exam (33 questions) |
| Wrong Answers   | Train the questions you answered wrong |
| Open Questions  | Learn the unanswered/unsure questions  |

---

## 🏗 Tech Stack

**Frontend**

- React (Create React App)
- TailwindCSS + Framer Motion

**Backend Services**

- Firebase Authentication
- Firebase Realtime Database
- Firebase Firestore

**Hosting**

- Firebase Hosting

---

## 📁 Project Structure

```
src/
├── components
├── features
│   └── quiz
├── pages
├── services
├── utils
└── data

public/
├── bundesland
├── assets
└── questions.json
```

---

## ⚙️ Installation

Clone repository

```bash
git clone https://github.com/somdrabb/LebenInDeutschlandTest.git
```

Install dependencies

```bash
npm install
```

Start development server

```bash
npm start
```

Build production version

```bash
npm run build
```

---

## 🔐 Environment Variables

Create `.env` with live credentials. Never commit `.env`.

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=

REACT_APP_EMAILJS_SERVICE_ID=
REACT_APP_EMAILJS_TEMPLATE_ID=
REACT_APP_EMAILJS_PUBLIC_KEY=

REACT_APP_RECAPTCHA_SITE_KEY=
```

---

## 🚀 Deployment

Deploy to Firebase Hosting

```bash
npm run build-deploy
```

---

## 🧭 Roadmap

- Progressive Web App (installable)
- AI explanations for questions
- Spaced repetition learning system
- Leaderboards
- Advanced analytics
- Mobile app / wrappers

---

## 🛠 Product Upgrades

### 2️⃣ Progressive Web App (PWA)

Installable + offline-ready experience:

1. Install Workbox

```bash
npm install workbox-webpack-plugin
```

2. Update `manifest.json`

```json
{
  "name": "LebiDE",
  "short_name": "LebiDE",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ff6b00",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

3. Register the service worker (in `src/index.js` or entry file):

```diff
- serviceWorker.unregister();
+ serviceWorker.register();
```

With these steps the app caches assets, loads fast, and can be installed to home screens.

### 3️⃣ AI explanations for questions 🤖

Add an “Explain with AI” button in the quiz UI:

```jsx
<button onClick={explainQuestion}>Explain with AI</button>
```

When the user clicks the button, call an API that uses an LLM prompt like:

```
Explain why the correct answer is correct for a German citizenship test question.

Question:
In Germany people may criticize the government because...

Correct answer:
Freedom of opinion.

Explain simply for immigrants learning German civics.
```

Example backend call:

```js
const response = await fetch('/api/explain', {
  method: 'POST',
  body: JSON.stringify({
    question,
    correctAnswer,
  }),
});
```

The API returns a short paragraph linking the correct answer to the Grundgesetz so learners receive context in their own language.

### 4️⃣ Spaced Repetition Learning (Anki-style)

Priority = `wrongCount * 3 + daysSinceSeen - correctCount`. Firestore stores a progress object per user:

```
users
  userId
    questionProgress
      q23
        correct: 3
        wrong: 1
        lastSeen: timestamp
```

Track `difficulty`, `lastSeen`, `correctCount`, and `wrongCount`. When you fetch the next quiz, sort by the highest priority so the system cycles through weak, forgotten, or recent mistakes.

### 5️⃣ Real exam simulation mode

Build a dedicated mode with:

- 60-minute timer
- 33 randomized questions
- Locked navigation until the timer stops
- Official scoring + instant summary sheet

The current quiz shell already renders questions and results, so add the timer/hooks and restrict navigation when this mode is active.

---

## 📜 License

MIT License

---

## 👨‍💻 Author

Created by **Somdrabb** | Project: **LebiDE — Kompetenz für Integration**
