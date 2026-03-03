# Architecture

## High-level Diagram

```
Browser (React SPA)
    |
    v
App.js (phase router)
    |
    +--> HomeSelect (landing + quiz entry)
    +--> Features/quiz/*.js (question flows)
    +--> Components (AuthForm, FeedbackForm, etc.)
    |
    +--> Services (firebase.js, authHandlers.js)

Firebase: Auth, Realtime DB, Firestore
EmailJS + reCAPTCHA: Contact form
LocalStorage: quiz history, wrong answers, UI cache
```

## Modules

- **src/index.js** boots CRA and renders `App.js`.
- **App.js** controls phase-driven UI (home, quiz, contact, feedback, wrong answers) and listens to `onAuthStateChanged`.
- **pages/HomeSelect.js** hosts the landing UI, language switcher, and navigation to quiz phases.
- **features/quiz/** includes `LebenInDeutschland.js`, `MixedTest.js`, and `UnansweredQuestions.js`, each building a quiz mode and reusing shared helpers.
- **components/index.js** exports UI pieces such as `LoginModal`, `ContactForm`, `FeedbackForm`, and `WrongList` so the app reuses them without deep prop drilling.
- **services/** compose Firebase providers, persistence helpers, and auth flows.
- **utils/wrongAnswers.js** abstracts reading/writing the `wrongAnswers` key and other localStorage helpers.

## Authentication Flow

1. User triggers `LoginModal`, which delegates to `AuthForm` providers.
2. `authHandlers.js` executes the Firebase provider, handles errors, and passes the user back to `App.js`.
3. `App.js` subscribes to `onAuthStateChanged`, caches the user, and updates UI state.
4. Firebase Realtime Database/Firestore track progress and feedback based on `auth.uid`.

## Data Flow

- Question sets are static JSON (`public/questions`, `public/bundesland`). Quiz components fetch them at startup and cache the results in memory.
- Quiz answers update component state and persist to localStorage (`wrongAnswers`, `quiz_history`, `mixed_test_results`, `lebide_ui_state`).
- Review flows (wrong answers + mixed test) read from those keys and rehydrate UI state.
- Contact and feedback forms submit through EmailJS and Firestore, respectively, with reCAPTCHA tokens for spam protection.
- Firebase Hosting rewrites everything to `build/index.html`, ensuring the SPA handles client-side routing.
