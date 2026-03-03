// src/LebenInDeutschland.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import languages from "../../data/languages";
import Confetti from "react-confetti";
import Particles from "react-tsparticles";
import { WrongList } from "../../components";
import { MixedTest } from "./MixedTest";
import UnansweredQuestions from "./UnansweredQuestions";
import { addWrongAnswer, removeWrongAnswer } from "../../utils/wrongAnswers";

// Utility functions
const calculateCurrentStreak = (history) => {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].selected === history[i].correct) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const calculateSuccessRate = (answerHistory) => {
  const correctAnswers = answerHistory.filter(a => a.selected === a.correct).length;
  const totalAnswers = Math.max(answerHistory.length, 1);
  return Math.round((correctAnswers / totalAnswers) * 100);
};

const tabs = [
  { key: "General", label: "Allgemeine Fragen" },
  { key: "Bundesland", label: "Bundesländer" },
  { key: "TestMixed", label: "Test" },
  { key: "Unanswered", label: "Offene Fragen" },
  { key: "WrongAnswers", label: "Falsche Antworten" },
];

const LebenInDeutschland = ({
  setPhase,
  bundeslaenderWithInfo,
  goBack,
  language,
  setLanguage,
  userData = {}
}) => {
  const [activeTab, setActiveTab] = useState("Bundesland");
  const [searchTerm, setSearchTerm] = useState("");
  const [generalQuestions, setGeneralQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [pendingTab, setPendingTab] = useState(null);
  const [showTabConfirm, setShowTabConfirm] = useState(false);
  const [showBundeslandPopup, setShowBundeslandPopup] = useState(false);
  const [pendingBundesland, setPendingBundesland] = useState(null);
  const [selectedBLQuestions, setSelectedBLQuestions] = useState([]);
  const [wrongListVersion, setWrongListVersion] = useState(0);
  const quizSectionRef = useRef(null);
  const totalQuestions = questions.length;
  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex] || {},
    [questions, currentQuestionIndex]
  );
  const successRate = calculateSuccessRate(answerHistory);

  // Load all questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      const bundeslandFiles = [
        "BadenWuerttemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
        "Hamburg", "Hessen", "MecklenburgVorpommern", "Niedersachsen",
        "NordrheinWestfalen", "RheinlandPfalz", "Saarland", "Sachsen",
        "SachsenAnhalt", "SchleswigHolstein", "Thueringen"
      ].map(bl => `/bundesland/${bl}.json`);

      try {
        const responses = await Promise.all([
          fetch("/lebide_questions_full_310.json"),
          ...bundeslandFiles.map(file => fetch(file))
        ]);

        const data = await Promise.all(responses.map(res => res.json()));
        setAllQuestions(data.flat());
      } catch (error) {
        console.error("Error loading questions:", error);
      }
    };

    loadQuestions();
  }, []);

  // Load general questions when tab changes
  useEffect(() => {
    if ((activeTab === "General" || activeTab === "TestMixed") && generalQuestions.length === 0) {
      setLoading(true);
      fetch("/lebide_questions_full_310.json")
        .then(res => res.json())
        .then(data => {
          setGeneralQuestions(data);
          setLoading(false);
        });
    }
  }, [activeTab, generalQuestions.length]);

  // Load Bundesland-specific unanswered questions
  useEffect(() => {
    if (activeTab === "Unanswered") {
      const blFile = localStorage.getItem("selectedBundesland");
      if (blFile) {
        fetch(`/bundesland/${blFile}`)
          .then(res => res.json())
          .then(data => setSelectedBLQuestions(data));
      }
    }
  }, [activeTab]);

  // Persist UI state
  useEffect(() => {
    const saveState = () => {
      localStorage.setItem("lebide_ui_state", JSON.stringify({
        activeTab,
        showQuiz,
        showSummary,
        currentQuestionIndex,
        scrollY: window.scrollY
      }));
    };

    saveState();
    window.addEventListener("beforeunload", saveState);
    return () => window.removeEventListener("beforeunload", saveState);
  }, [activeTab, showQuiz, showSummary, currentQuestionIndex]);

  // Restore UI state
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("lebide_ui_state") || "{}");
    if (saved) {
      setActiveTab(saved.activeTab || "Bundesland");
      setShowQuiz(!!saved.showQuiz);
      setShowSummary(!!saved.showSummary);
      setCurrentQuestionIndex(saved.currentQuestionIndex || 0);
      setTimeout(scrollToQuizSection, 300);
    }
  }, []);

  // Quiz progress persistence
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`quiz_progress_${activeTab}`) || "{}");
    if (saved?.questions?.length > 0) {
      setQuestions(saved.questions);
      setCurrentQuestionIndex(saved.currentQuestionIndex ?? 0);
      setAnswerHistory(saved.answerHistory || []);
      setShowQuiz(true);
      setShowSummary(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (showQuiz && questions.length > 0) {
      localStorage.setItem(`quiz_progress_${activeTab}`, JSON.stringify({
        quizType: activeTab,
        questions,
        currentQuestionIndex,
        answerHistory,
        wrongAnswers: JSON.parse(localStorage.getItem("wrongAnswers") || "[]")
      }));
    }
    if (showSummary) {
      localStorage.removeItem(`quiz_progress_${activeTab}`);
    }
  }, [questions, currentQuestionIndex, answerHistory, activeTab, showQuiz, showSummary]);

  // Keyboard navigation
  const scrollToQuizSection = () => {
    setTimeout(() => {
      if (quizSectionRef.current) {
        const header = document.getElementById("main-header");
        const nav = document.getElementById("main-nav");
        const headerHeight = header?.offsetHeight || 0;
        const navHeight = nav?.offsetHeight || 0;
        const totalOffset = headerHeight + navHeight + 250;

        const y = quizSectionRef.current.getBoundingClientRect().top +
          window.pageYOffset - totalOffset;

        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  const handleStartQuiz = (data) => {
    setQuestions(data);
    setCurrentQuestionIndex(0);
    setShowQuiz(true);
    setShowAnswer(false);
    setSelectedAnswer(null);
    scrollToQuizSection();
  };

  const handleQuizBack = () => {
    setShowQuiz(false);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = useCallback((key) => {
    if (showAnswer) return;

    setSelectedAnswer(key);
    setShowAnswer(true);

    if (key === currentQuestion.correctAnswer) {
      removeWrongAnswer(currentQuestion.id);
    } else {
      addWrongAnswer(currentQuestion.id);
    }

    setAnswerHistory(prev => [
      ...prev,
      {
        question: currentQuestion,
        selected: key,
        correct: currentQuestion.correctAnswer
      }
    ]);

    // Visual feedback
    if (key === currentQuestion.correctAnswer) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    } else {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 800);
    }

    setWrongListVersion(v => v + 1);
  }, [currentQuestion, showAnswer]);

  const handleNextQuestion = useCallback(() => {
    setShowAnswer(false);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(idx => idx + 1);
    } else {
      setShowQuiz(false);
      setShowSummary(true);
    }
  }, [currentQuestionIndex, questions.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!showQuiz) return;

    const handleKey = (e) => {
      if (showAnswer && ["Enter", "ArrowRight"].includes(e.key)) {
        handleNextQuestion();
        return;
      }

      if (!showAnswer && ["a", "b", "c", "d"].includes(e.key.toLowerCase())) {
        const key = e.key.toLowerCase();
        if (Object.keys(currentQuestion.options || {}).includes(key)) {
          handleAnswer(key);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showQuiz, showAnswer, currentQuestion, handleAnswer, handleNextQuestion]);

  const handleTabChange = (tabKey) => {
    if (showQuiz || showSummary) {
      setPendingTab(tabKey);
      setShowTabConfirm(true);
    } else {
      setActiveTab(tabKey);
      scrollToQuizSection();
    }
  };

  const confirmBundeslandChange = () => {
    if (pendingBundesland) {
      localStorage.setItem("selectedBundesland", pendingBundesland.file);
      fetch(`/bundesland/${pendingBundesland.file}`)
        .then(res => res.json())
        .then(data => handleStartQuiz(data));
    }
    setShowBundeslandPopup(false);
    setPendingBundesland(null);
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Orange Sub Navigation Bar */}
      <header className="w-full bg-orange-400 text-white sticky top-[36px] z-30 shadow-sm border-b border-orange-500">
        <div className="flex justify-center items-center w-full h-14 px-4 space-x-6 overflow-x-auto custom-scrollbar">
          {/* Navigation Tabs */}
          <nav>
            <ul className="flex items-center space-x-1" role="tablist">
              {tabs.map((tab) => (
                <li key={tab.key}>
                  <button
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap
                      transition-all duration-200
                      ${activeTab === tab.key ? 
                        "bg-white text-orange-600 font-semibold" : 
                        "hover:bg-orange-300"}
                      relative group
                    `}
                    onClick={() => handleTabChange(tab.key)}
                  >
                    <span>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language Selector */}
          <div className="flex space-x-1 bg-white/30 rounded-lg p-1 ml-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`
                  w-7 h-7 rounded flex items-center justify-center text-sm
                  transition-all
                  ${language === lang.code ? 
                    "bg-white text-orange-500 font-bold" : 
                    "hover:bg-white/40"}
                `}
                title={lang.label}
              >
                <span>{lang.flag}</span>
              </button>
            ))}
          </div>
        </div>
      </header>


      <div className="max-w-5xl mx-auto p-4 pt-20">
        {/* Quiz Section */}
        <div ref={quizSectionRef} className="w-full flex flex-col items-center">
          {showQuiz ? (
            <section
              role="main"
              aria-label={`Frage ${currentQuestionIndex + 1} von ${totalQuestions}`}
              className="w-full flex flex-col items-center"
            >
              {/* Visual Feedback */}
              {showConfetti && (
                <Confetti
                  width={window.innerWidth}
                  height={window.innerHeight}
                  numberOfPieces={80}
                  recycle={false}
                />
              )}
              {showParticles && (
                <Particles
                  options={{
                    particles: {
                      number: { value: 50 },
                      size: { value: 4 },
                      move: { speed: 2 },
                      color: { value: ["#FFD700", "#FF69B4", "#00FFFF"] },
                      shape: { type: "star" },
                    },
                  }}
                />
              )}

              {/* Quiz Card */}
              <div className={`fixed inset-0 z-50 ${showQuiz ? 'backdrop-blur-md bg-black/30' : 'hidden'}`}>
                {showConfetti && (
                  <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    numberOfPieces={150}
                    recycle={false}
                    gravity={0.2}
                    colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B']}
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                <div className={`absolute inset-0 flex items-center justify-center p-4 ${showAnswer && selectedAnswer !== currentQuestion.correctAnswer ? 'animate-shake' : ''}`}>
                  <div className="w-full h-full max-w-6xl bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex transform transition-all duration-300">
                    {/* Left side - Main quiz content */}
                    <div className="flex-1 overflow-y-fix max-h-[90vh] relative">
                      {/* Header Section */}
                      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-indigo-500 to-red-500 p-2 rounded-lg shadow-sm">
                          </div>
                          <div>
                            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Question</h2>
                            <p className="text-lg font-bold text-gray-800">
                              <span className="text-green-600">{currentQuestionIndex + 1}</span>
                              <span className="text-gray-400">/{totalQuestions}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="bg-white px-3 py-1 rounded-full shadow-xs border border-gray-200">
                            <span className="text-xs font-bold text-gray-700">
                              Success: <span className="text-green-600 font-mono">{successRate}%</span>
                            </span>
                          </div>
                          <button
                            onClick={handleQuizBack}
                            className="text-gray-500 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                            aria-label="Close quiz"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Scrollable Content Area */}
                      <div className="overflow-y-auto p-6">
                        {/* Question Content */}
                        <div className="mb-8">
                          <div className="mb-6">
                            <p className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                              {currentQuestion?.question?.de || <span className="italic text-gray-400">Question not available</span>}
                            </p>
                            {language !== "de" && currentQuestion?.question?.[language] && (
                              <p className="text-sm text-gray-500 italic">{currentQuestion.question[language]}</p>
                            )}
                          </div>

                          {/* Difficulty & Streak */}
                          <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500">Difficulty:</span>
                              <div className="flex space-x-1">
                                {[1, 2, 3].map((level) => (
                                  <span
                                    key={level}
                                    className={`w-3 h-3 rounded-full transition-all ${level <= (currentQuestion.difficulty || 1)
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                                        : 'bg-gray-200'
                                      }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 rounded-full border border-amber-200">
                              <span className="text-xs font-bold text-amber-800 flex items-center">
                                <span className="text-orange-500 mr-1">🔥</span> Streak: {calculateCurrentStreak(answerHistory)}
                              </span>
                            </div>
                          </div>

                          {/* Answer Options */}
                          <div className="space-y-4 mb-8">
                            {Object.entries(currentQuestion.options || {}).map(([key, value]) => {
                              const isCorrect = key === currentQuestion.correctAnswer;
                              const isSelected = selectedAnswer === key;
                              const showResult = showAnswer && (isCorrect || isSelected);

                              return (
                                <button
                                  key={key}
                                  className={`
                                    w-full text-left p-5 rounded-xl border-2
                                    transition-all duration-200 transform
                                    ${showResult ?
                                      (isCorrect ?
                                        "bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-green-900 shadow-green-sm" :
                                        (isSelected ? 
                                          "bg-gradient-to-br from-red-50 to-red-100 border-red-300 text-red-900 shadow-red-sm" :
                                          "border-gray-200 bg-white text-gray-800"))
                                      : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-gray-800 hover:shadow-md"}
                                    ${showAnswer && !isSelected && !isCorrect ? "opacity-70" : ""}
                                    focus:outline-none focus:ring-2 focus:ring-indigo-300/50
                                    relative overflow-hidden
                                    hover:scale-[1.01]
                                  `}
                                  onClick={() => handleAnswer(key)}
                                  disabled={showAnswer}
                                >
                                  <div className="flex items-center">
                                    <span className={`
                                      inline-flex items-center justify-center w-8 h-8 rounded-full mr-4 font-bold shadow-sm
                                      ${showResult ?
                                        (isCorrect ? 
                                          "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-xs" :
                                          (isSelected ? 
                                            "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-xs" : 
                                            "bg-gray-200 text-gray-700"))
                                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700"}
                                    `}>
                                      {key.toUpperCase()}
                                    </span>

                                    <span>
                                      <span className="block font-medium text-gray-900">{value?.de}</span>
                                      {language !== "de" && value?.[language] && (
                                        <span className="text-xs text-gray-500 italic">{value[language]}</span>
                                      )}
                                    </span>
                                  </div>

                                  {showResult && (
                                    <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-2xl">
                                      {isCorrect ? "🎉" : "❌"}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Footer Section */}
                      <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white">
                        {/* Navigation Controls */}
                        <div className="flex justify-between space-x-4">
                          <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
                            disabled={currentQuestionIndex === 0}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg disabled:opacity-50 transition-all flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                          </button>
                          <button
                            onClick={handleNextQuestion}
                            disabled={!showAnswer && selectedAnswer === null}
                            className={`flex-1 py-3 font-medium rounded-lg transition-all flex items-center justify-center ${
                              showAnswer 
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-sm hover:shadow-indigo-md" 
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {showAnswer ? 'Next Question' : 'Skip'}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Question Navigator */}
                    <div className="w-72 border-l border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5 overflow-y-auto" 
                      style={{ maxHeight: 'calc(90vh - 48px)' }}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-5 sticky top-0 bg-white/90 backdrop-blur-sm py-3 z-10 flex items-center">
                        Question Navigator
                      </h3>
                      <div className="grid grid-cols-5 gap-3 pb-2">
                        {questions.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all transform hover:scale-105 ${
                              index === currentQuestionIndex
                                ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md"
                                : answerHistory[index]
                                  ? answerHistory[index].selected === answerHistory[index].correct
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>

                      {/* Result Feedback */}
                      {showAnswer && (
                        <div className={`p-5 rounded-xl mt-8 transition-all ${
                          selectedAnswer === currentQuestion.correctAnswer
                            ? "bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
                            : "bg-gradient-to-br from-red-50 to-red-100 border border-red-200"
                        }`}>
                          <p className="font-medium text-gray-900 flex items-center mb-3">
                            {selectedAnswer === currentQuestion.correctAnswer ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Correct Answer!
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Correct: {currentQuestion.correctAnswer.toUpperCase()}
                              </>
                            )}
                          </p>

                          {currentQuestion.explanation && (
                            <div className="text-sm text-gray-600 mt-3 p-3 bg-white/70 rounded-lg">
                              <p className="font-medium text-gray-700 mb-1">Explanation:</p>
                              <p>{currentQuestion.explanation[language] || currentQuestion.explanation.de}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : showSummary ? (
            <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-12 mb-16 animate-fadeIn" aria-live="polite">
              <h2 className="text-2xl font-extrabold mb-4 text-center text-pink-600">
                Quiz Summary
              </h2>
              <div className="flex justify-center gap-8 mb-8">
                <div className="text-lg font-bold text-green-600">
                  ✅ Correct: {answerHistory.filter(a => a.selected === a.correct).length}
                </div>
                <div className="text-lg font-bold text-red-600">
                  ❌ Wrong: {answerHistory.filter(a => a.selected !== a.correct).length}
                </div>
              </div>
              <ol className="space-y-6">
                {answerHistory.map((entry, i) => (
                  <li
                    key={i}
                    className="border-l-4 pl-4 py-2"
                    style={{
                      borderColor: entry.selected === entry.correct ? "#22c55e" : "#ef4444",
                      background: entry.selected === entry.correct ? "#f0fdf4" : "#fef2f2"
                    }}
                  >
                    <div className="font-bold mb-1">{i + 1}. {entry.question.question.de}</div>
                    {entry.question.question[language] && (
                      <div className="text-gray-500 italic mb-1">{entry.question.question[language]}</div>
                    )}
                    <div>
                      <span className="font-semibold">Your answer:</span>{" "}
                      <span className={entry.selected === entry.correct ? "text-green-700" : "text-red-700"}>
                        {entry.selected
                          ? (entry.question.options[entry.selected]?.de || entry.selected)
                          : "—"}
                      </span>
                      {entry.selected !== entry.correct && (
                        <>
                          <br />
                          <span className="font-semibold">Correct answer:</span>{" "}
                          <span className="text-green-700">
                            {entry.question.options[entry.correct]?.de || entry.correct}
                          </span>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-10 text-center">
                <button
                  className="bg-gradient-to-r from-pink-500 to-yellow-500 px-8 py-3 rounded-full text-white font-bold text-lg shadow-lg hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-pink-300"
                  onClick={() => {
                    setShowSummary(false);
                    setAnswerHistory([]);
                    setActiveTab("Bundesland");
                    scrollToQuizSection();
                  }}
                  aria-label="Zurück zum Start"
                >
                  Back to Start
                </button>
              </div>
            </section>
          ) : (
            <>
              {/* Bundesländer Selection */}
              {activeTab === "Bundesland" && (
                <section className="animate-fadeIn" aria-label="Bundesländer Auswahl">
                  <h2 className="text-xl font-bold mb-4 text-center uppercase mt-6">
                    Choose Your Bundesland
                    <span className="block text-sm font-normal text-pink-500 mt-2">
                      ({languages.find(l => l.code === language)?.label})
                    </span>
                  </h2>
                  <div className="relative mb-6 max-w-md mx-auto">
                    <input
                      type="text"
                      placeholder="Search Bundesland..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                      className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      aria-label="Suche Bundesland"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" aria-hidden="true">🔍</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {bundeslaenderWithInfo.filter(
                      bl => bl.name.toLowerCase().includes(searchTerm) || bl.desc.toLowerCase().includes(searchTerm)
                    ).length === 0 && (
                        <div className="col-span-full text-center text-gray-400 py-6">
                          Kein Bundesland gefunden.
                        </div>
                      )}
                    {bundeslaenderWithInfo
                      .filter(bl => bl.name.toLowerCase().includes(searchTerm) || bl.desc.toLowerCase().includes(searchTerm))
                      .map((bl) => (
                        <div
                          key={bl.name}
                          className="p-[1px] bg-gradient-to-r from-red-500 via-black to-yellow-400 rounded-xl shadow-md"
                        >
                          <button
                            onClick={() => {
                              const saved = localStorage.getItem("selectedBundesland");
                              if (!saved || saved === bl.file) {
                                localStorage.setItem("selectedBundesland", bl.file);
                                fetch(`/bundesland/${bl.file}`)
                                  .then(res => res.json())
                                  .then(data => handleStartQuiz(data));
                              } else {
                                setPendingBundesland(bl);
                                setShowBundeslandPopup(true);
                              }
                            }}
                            className={`
                              w-full h-full bg-white text-black p-2 rounded-xl flex flex-col items-center 
                              hover:scale-105 transition uppercase tracking-wider focus:outline-none 
                              focus:ring-2 focus:ring-blue-400
                              ${localStorage.getItem("selectedBundesland") === bl.name ? "ring-2 ring-pink-500" : ""}
                            `}
                            aria-label={`Starte Quiz für ${bl.name}`}
                          >
                            <img src={bl.image} alt={bl.name} className="h-16 mb-2" />
                            <span className="font-bold mb-1 text-[13px]">{bl.name}</span>
                            <p className="text-[10px] text-yellow-700 text-center uppercase tracking-wider">{bl.desc}</p>
                            {localStorage.getItem("selectedBundesland") === bl.name && (
                              <span className="mt-2 text-xs text-pink-500 font-semibold">Ausgewählt</span>
                            )}
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Bundesland Change Confirmation */}
                  {showBundeslandPopup && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-auto text-center">
                        <h2 className="text-lg font-bold mb-3">Bundesland wechseln?</h2>
                        <p className="mb-6">Möchten Sie das Bundesland wirklich wechseln? Ihre gespeicherte Auswahl wird überschrieben.</p>
                        <div className="flex justify-center gap-4">
                          <button
                            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-semibold"
                            onClick={confirmBundeslandChange}
                          >
                            Ja
                          </button>
                          <button
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-full font-semibold"
                            onClick={() => {
                              setShowBundeslandPopup(false);
                              setPendingBundesland(null);
                            }}
                          >
                            Nein
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* General Questions */}
              {activeTab === "General" && !showQuiz && (
                <section className="flex flex-col items-center mt-8 animate-fadeIn" aria-label="Allgemeine Fragen">
                  <h2 className="text-lg font-bold mb-6 text-center uppercase">
                    General Questions ({languages.find(l => l.code === language)?.label})
                  </h2>
                  <button
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition mb-8 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    onClick={() => handleStartQuiz(generalQuestions)}
                    disabled={loading || generalQuestions.length === 0}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Lädt…
                      </span>
                    ) : (
                      "Start General Quiz"
                    )}
                  </button>
                </section>
              )}

              {/* Mixed Test */}
              {activeTab === "TestMixed" && generalQuestions.length > 0 && (
                <MixedTest
                  show={true}
                  language={language}
                  generalQuestions={generalQuestions}
                  bundeslaenderWithInfo={bundeslaenderWithInfo}
                  onClose={() => setActiveTab("none")}
                />
              )}

              {activeTab === "TestMixed" && generalQuestions.length === 0 && (
                <div className="w-full flex justify-center items-center py-12">
                  <span className="text-pink-500 font-bold text-xl">Lädt Fragen…</span>
                </div>
              )}

              {/* Wrong Answers */}
              {activeTab === "WrongAnswers" && allQuestions.length > 0 && (
                <WrongList
                  allQuestions={allQuestions}
                  language={language}
                  userData={userData}
                  wrongListVersion={wrongListVersion}
                  startQuizWithQuestions={(qs) => {
                    if (!qs.length) {
                      alert("Keine falschen Fragen gefunden!");
                      return;
                    }
                    setQuestions(qs);
                    setCurrentQuestionIndex(0);
                    setShowQuiz(true);
                    setShowSummary(false);
                    setShowAnswer(false);
                    setSelectedAnswer(null);
                    setActiveTab("WrongAnswers");
                  }}
                />
              )}

              {/* Unanswered Questions */}
              {activeTab === "Unanswered" && (
                <UnansweredQuestions
                  allQuestions={[...generalQuestions, ...selectedBLQuestions]}
                  generalQuestions={generalQuestions}
                  bundeslandQuestions={selectedBLQuestions}
                  language={language}
                />
              )}
            </>
          )}
        </div>

        {/* Tab Change Confirmation */}
        {showTabConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-auto text-center">
              <h2 className="text-lg font-bold mb-3">Quiz verlassen?</h2>
              <p className="mb-6">Möchtest du wirklich den laufenden Test verlassen? Dein Fortschritt geht verloren.</p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-semibold"
                  onClick={() => {
                    setActiveTab(pendingTab);
                    setShowQuiz(false);
                    setShowSummary(false);
                    setQuestions([]);
                    setCurrentQuestionIndex(0);
                    setAnswerHistory([]);
                    setShowTabConfirm(false);
                    setPendingTab(null);
                  }}
                >
                  Ja
                </button>
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-full font-semibold"
                  onClick={() => {
                    setShowTabConfirm(false);
                    setPendingTab(null);
                  }}
                >
                  Nein
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="w-full flex justify-center items-center py-8 animate-pulse text-pink-500">
            <svg className="animate-spin h-6 w-6 mr-2 text-pink-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading…
          </div>
        )}
      </div>
    </div>
  );
};

export default LebenInDeutschland;
