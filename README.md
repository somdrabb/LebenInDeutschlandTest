# 🇩🇪 LebiDE — Leben in Deutschland Test Trainer

![LebiDE Preview](docs/screenshots/home.png)
![React](https://img.shields.io/badge/React-18-blue) ![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange) ![License](https://img.shields.io/badge/License-MIT-green) ![CI](https://github.com/somdrabb/LebenInDeutschlandTest/actions/workflows/ci.yml/badge.svg) ![Questions](https://img.shields.io/badge/questions-300-blue)

Interactive learning platform to prepare for the official German citizenship tests (Leben in Deutschland & Einbürgerungstest).

Practice all 300 official BAMF questions (plus translated variants), train weak areas, and simulate the real exam with smart quiz modes, Firebase persistence, and a responsive Tailwind + Framer Motion UI.

💡 **Why LebiDE?**

- Complete official question catalogue
- Smart mistake-focused learning
- Realistic exam simulation
- Multilingual support for immigrants

## 📑 Table of Contents

- [Live Demo](#-live-demo)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Learning Modes](#-learning-modes)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Docs](#-docs)
- [Contributing](#-contributing)
- [Security](#-security)
- [License](#-license)

---

## 🚀 Live Demo

🌐 **Try the app:**  
https://lebide.web.app

---

## ✨ Features

### 📚 Question System

- All 300 official questions
- Bundesland-specific questions
- Mixed exam simulation (33 questions)
- Open questions trainer

### 🧠 Smart Learning

- Wrong answers trainer
- Exam history & statistics
- PDF export of results

### 🌍 Multi-language Support

- German
- English
- Bengali

### 🔐 Authentication

Firebase Authentication with:

- Google
- GitHub
- Microsoft
- Facebook
- Email
- Anonymous

### ☁️ Cloud Persistence

- Firebase Realtime Database
- Firebase Firestore

### 🎨 Modern UI

- TailwindCSS
- Framer Motion animations
- Fully responsive layout

---

## 🖼 Screenshots

### Homepage

![Home](docs/screenshots/home.png)

### Quiz Mode

![Quiz](docs/screenshots/quiz.png)

### Mixed Test

![Mixed Test](docs/screenshots/mixed-test.png)

### Wrong Answers Trainer

![Wrong Answers](docs/screenshots/wrong-answers.png)

---

## 🧠 Learning Modes

| Mode              | Description                            |
| ----------------- | -------------------------------------- |
| General Questions | Practice the official 300 questions    |
| Bundesland Mode   | State-specific questions               |
| Mixed Test        | Simulates the real exam (33 questions) |
| Wrong Answers     | Train the questions you answered wrong |
| Open Questions    | Practice unanswered questions          |

---

## 🏗 Tech Stack

**Frontend**

- React (Create React App)
- TailwindCSS
- Framer Motion

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

docs/
├── ARCHITECTURE.md
├── DATASETS.md
├── PRODUCT_UPGRADES.md
└── SECURITY.md
```

---

## ⚙️ Installation

Clone repository

```bash
git clone https://github.com/somdrabb/LebenInDeutschlandTest.git
cd LebenInDeutschlandTest
```

Install dependencies

```bash
npm install
```

Start development server

```bash
npm start
```

Build production bundle

```bash
npm run build
```

---

## 🔐 Environment Variables

Create `.env` with your credentials. Never commit `.env`.

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

```bash
npm run build-deploy
```

Deploys the SPA to Firebase Hosting.

---

## 🧭 Roadmap

- Progressive Web App (PWA)
- AI explanations for questions
- Spaced repetition learning system
- Leaderboards
- Advanced analytics
- Mobile application

For ideas and implementation notes see [docs/PRODUCT_UPGRADES.md](docs/PRODUCT_UPGRADES.md).

---

## 📚 Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Datasets](docs/DATASETS.md)
- [Security](docs/SECURITY.md)
- [Product upgrades](docs/PRODUCT_UPGRADES.md)
- [Changelog](CHANGELOG.md)

---

## 🤝 Contributing

Contributions are welcome—see [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.

---

## 🔒 Security

Please report vulnerabilities privately and avoid committing secrets (Firebase keys, OAuth secrets, EmailJS private keys, `.env` files). See [docs/SECURITY.md](docs/SECURITY.md) for details.

---

## 📜 License

MIT License

---

## 👨‍💻 Author

Somdrabb | LebiDE — Kompetenz für Integration
