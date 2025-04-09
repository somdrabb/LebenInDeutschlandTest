# LebiDE - Project Schema

This document explains how the project is structured and how the frontend and backend pieces fit together.

## Overview
LebiDE is a React (Create React App) web app for learning and practicing the “Leben in Deutschland” and “Einbürgerungstest” questions. It is a frontend-heavy project with Firebase services for authentication and data storage, plus EmailJS for contact forms and Firestore for feedback.

## Architecture (High Level)
- Frontend: React + Tailwind + Framer Motion
- Backend services: Firebase (Auth, Realtime Database, Firestore)
- Static data: JSON question files in `public/`
- Hosting: Firebase Hosting (config in `firebase.json`)

## Frontend Structure
The app is organized into feature and page modules with a single components module export.

```
src/
  App.js                       # App shell + phase-based routing
  index.js                     # React entry
  index.css                    # Tailwind + global styles

  pages/
    HomeSelect.js              # Landing + navigation + main entry UI

  features/
    quiz/
      LebenInDeutschland.js    # Quiz engine + tabs + UI
      MixedTest.js             # Mixed test logic
      UnansweredQuestions.js   # Unanswered questions view

  components/
    index.js                   # All UI components in one file

  data/
    bundeslaender.js           # Bundesland metadata
    languages.js               # Language config

  services/
    firebase.js                # Firebase app + providers
    authHandlers.js            # Auth helpers

  utils/
    wrongAnswers.js            # LocalStorage helpers for wrong answers
```

## Backend / Services
Firebase is used for authentication and storing user progress/reviews.

- Firebase Auth (providers: Google, Facebook, Microsoft, GitHub, anonymous, email)
- Firebase Realtime Database (user progress)
- Firestore (reviews/feedback)

Relevant files:
- `src/services/firebase.js`
- `src/services/authHandlers.js`

## Static Assets and Data
- Question JSON files are in `public/` and loaded via fetch.
- Bundesland-specific JSON files are in `public/bundesland/`.
- UI assets (icons, images, PDFs) are in `public/assets/`.

## Runtime Flow (App Phases)
`App.js` controls the phase-based UI:
- `home` -> `HomeSelect` page
- `contact` -> `ContactForm`
- `feedback` -> `FeedbackForm`
- `wrong-list` -> `WrongList`

The quiz UI is handled by `LebenInDeutschland` in the `features/quiz` folder.

## Data Flow (Key Flows)

### Auth
- User signs in via `LoginModal` and `AuthForm`.
- `authHandlers.js` triggers Firebase Auth flows.
- `App.js` listens to auth changes via `onAuthStateChanged`.

### Quiz
- Questions are fetched from static JSON in `public/`.
- Quiz state is stored in component state and localStorage.
- Wrong answers are persisted via `src/utils/wrongAnswers.js`.

### Feedback
- Reviews stored in Firestore (`reviews` collection).
- `FeedbackForm` reads/writes reviews via Firestore API.

### Contact
- `ContactForm` uses EmailJS to send messages.
- Uses reCAPTCHA for spam protection.

## Local Storage Keys
- `wrongAnswers`: array of question IDs
- `quiz_history`: quiz history
- `mixed_test_results`: mixed test results
- `selectedBundesland`: active Bundesland file
- `lebide_ui_state`: UI state cache

## Firebase Hosting
`firebase.json` config:
- Uses `build` as public directory
- Rewrites all routes to `index.html`

## Scripts
```sh
npm start       # run dev server
npm run build   # production build
npm run build-deploy  # build + firebase deploy
```

## Notes / Setup
- Install dependencies: `npm install`
- The current React setup is Create React App.
- Firebase keys are in `src/services/firebase.js` (public config).

## Getting Started

### Setup steps
1. `cp .env.example .env` and fill in each value with the credentials for your Firebase, EmailJS, and reCAPTCHA accounts.
2. `npm ci` to install locked dependencies from `package-lock.json`.
3. `npm start` to run the dev server and `npm run build` to verify a production bundle.
4. `npm run build-deploy` (after connecting to Firebase) when you are ready to build and host the project.

### Environment variables
- Keep your secrets in `.env` (which is ignored via `.gitignore`); the committed `.env.example` lists every supported key.
- Replace all `REACT_APP_...` placeholders with live values: Firebase config, EmailJS service/template/public keys, and the reCAPTCHA site key.
- Never commit `.env`; rotate the values whenever there is a suspected leak.

### Firebase hosting deploy
1. Authenticate: `firebase login`.
2. Build + deploy: `npm run build-deploy` (it runs `npm run build` and then `firebase deploy --only hosting`).
3. The Firebase config in `firebase.json` rewrites all routes to `build/index.html`, so the SPA is handled client-side.

## Features
- Phase-driven React UI (home, quiz, contact, feedback phases) with Tailwind/Twind styling.
- Firebase Auth providers (Google, Facebook, Microsoft, GitHub, anonymous, email/password) plus Realtime Database/Firestore helpers.
- EmailJS + reCAPTCHA contact form with client-side file uploads, templates, and user-friendly feedback status.
- Feedback list with Firestore persistence, emoji reactions, and admin moderation helpers.
- LocalStorage helpers for quiz history, wrong answers, and UI state caching (see `src/utils`).

## Component Module (Single File)
All UI components are combined in `src/components/index.js` and exported as named exports:
- `AuthForm`
- `ContactForm`
- `FeedbackForm`
- `Footer`
- `LanguageSelector`
- `LoginModal`
- `ShareCard`
- `WrongList`

If you want these split again later, we can re-extract them into separate files.
