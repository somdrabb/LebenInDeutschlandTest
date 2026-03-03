// src/App.js
import { useState, useEffect } from "react";
import bundeslaenderWithInfo from "./data/bundeslaender";
import HomeSelect from "./pages/HomeSelect";
import { auth, database, ref, get, child } from "./services/firebase";
import { ContactForm, FeedbackForm, Footer, LoginModal, WrongList } from "./components";
import AOS from 'aos';
import 'aos/dist/aos.css';


import {
  handleGoogleLogin,
  handleFacebookLogin,
  handleMicrosoftLogin,
  handleGithubLogin,
  handleAnonymousLogin,
  handleAuth,
  handleLogout,
  handleForgotPassword,
} from "./services/authHandlers";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", street: "", houseNumber: "", zip: "", city: "", country: "", phone: "", email: "", loginId: "", password: "", repeatPassword: "", otp: ""
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [phase, setPhase] = useState("home");
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("selectedLanguage") || "en";
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userData, setUserData] = useState({ progress: { answered: [], wrongAnswers: [], unanswered: [], lastQuestionIndex: 0 } });
  const [allQuestions, setAllQuestions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);


  // Persist language to localStorage
  useEffect(() => {
    localStorage.setItem("selectedLanguage", language);
  }, [language]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-in-out' });
  }, []);

  useEffect(() => {
    fetch("/lebide_questions_full_310.json")
      .then(res => res.json())
      .then(data => {
        setAllQuestions(data);
      });
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const displayName = user.displayName || "User";
        const userEmail = user.email || "";
        setUsername(displayName);
        setEmail(userEmail);
        setUserProfile({
          displayName,
          email: userEmail,
          photoURL: user.photoURL || "",
          providerData: user.providerData || []
        });
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `users/${user.uid}/progress`));
        if (snapshot.exists()) {
          setUserData(prev => ({ ...prev, progress: snapshot.val() }));
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
        setUserData({
          progress: {
            answered: [],
            wrongAnswers: [],
            unanswered: [],
            lastQuestionIndex: 0
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Always render Header here */}
      
  
      {/* Show Login Modal if triggered */}
      {showLoginModal && (
        <LoginModal
          setShowLoginModal={setShowLoginModal}
          authMode={authMode}
          setAuthMode={setAuthMode}
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          repeatPassword={repeatPassword}
          setRepeatPassword={setRepeatPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showRepeatPassword={showRepeatPassword}
          setShowRepeatPassword={setShowRepeatPassword}
          formData={formData}
          setFormData={setFormData}
          handleAuth={(e) => handleAuth({ e, formData, authMode, setShowLoginModal })}
          handleGoogleLogin={() => handleGoogleLogin(setShowLoginModal)}
          handleFacebookLogin={() => handleFacebookLogin(setShowLoginModal)}
          handleMicrosoftLogin={() => handleMicrosoftLogin(setShowLoginModal)}
          handleGithubLogin={() => handleGithubLogin(setShowLoginModal)}
          handleAnonymousLogin={() => handleAnonymousLogin(setShowLoginModal)}
          handleForgotPassword={() => handleForgotPassword(email)}
        />
      )}
  
      {/* Main Content */}
      <main className="flex-grow px-4 py-8">
        {phase === "home" && (
          <HomeSelect
            setPhase={setPhase}
            bundeslaenderWithInfo={bundeslaenderWithInfo}
            isLoggedIn={isLoggedIn}
            setShowLoginModal={setShowLoginModal}
            username={username}
            language={language}
            setLanguage={setLanguage}
            handleLogout={() => {
              handleLogout();
            }}
            userProfile={userProfile}
          />
        )}
  
        {phase === "contact" && (
          <section id="contact-section">
            <h1 className="text-2xl font-bold text-center mb-6 text-black uppercase tracking-wider">📬 Contact Us</h1>
            <ContactForm />
          </section>
        )}
  
        {phase === "feedback" && (
          <section>
            <h1 className="text-2xl font-bold text-center mb-6">💬 Give Feedback</h1>
            <FeedbackForm />
          </section>
        )}
  
        {phase === "wrong-list" && (
          <WrongList
            allQuestions={allQuestions}
            language={language}
            userData={userData}
          />
        )}
  
        {/* Placeholder for other legal/info sections */}
        {phase === "faq" && (
          <section>
            <h1 className="text-2xl font-bold text-center mb-6">❓ FAQ</h1>
            <p className="text-center">Coming soon...</p>
          </section>
        )}
        {phase === "privacy" && (
          <section>
            <h1 className="text-2xl font-bold text-center mb-6">🔒 Privacy Policy</h1>
            <p className="text-center">Your privacy is important to us.</p>
          </section>
        )}
        {/* Repeat same pattern for: Terms & Conditions, Cookie Policy, Legal Notice, etc. */}
      </main>
  
      {/* Always show footer */}
      <Footer setPhase={setPhase} />
    </div>
  );
  
  
}

export default App;
