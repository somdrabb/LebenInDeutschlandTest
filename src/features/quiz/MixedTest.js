import React, { useState, useEffect, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import { FaRegClock, FaRegFilePdf, FaTimes } from "react-icons/fa";

function getRandomQuestions(source, count, excludeIds = []) {
  const available = source.filter(q => !excludeIds.includes(String(q.id)));
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
const MIXED_TOTAL = 33;
const MIXED_BUNDESLAND = 10;
const MIXED_GENERAL = MIXED_TOTAL - MIXED_BUNDESLAND;
const PASS_MIN = 17;

export default function MixedTest({
  language,
  generalQuestions,
  bundeslaenderWithInfo,
  show,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [mixedTest, setMixedTest] = useState(null);
  const [mixedTestResult, setMixedTestResult] = useState(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [showReviewList, setShowReviewList] = useState(false);

  // History modal
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const timerInterval = useRef();

  // --- Submit ---
  const handleMixedSubmit = useCallback(() => {
    if (!mixedTest) return;
    const end = Date.now();
    const { questions, answers, start } = mixedTest;
    let correct = 0;
    let correctIds = [];
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
        correctIds.push(q.id);
      }
    });
    const result = {
      score: correct,
      correctIds,
      duration: Math.round((end - start) / 1000),
      passed: correct >= PASS_MIN,
      when: new Date().toISOString(),
      questions: questions.map(q => ({
        id: q.id,
        user: answers[q.id],
        correct: q.correctAnswer,
        question: q.question?.[language] || q.question?.de
      }))
    };
    setMixedTestResult(result);
    setShowResultPopup(true);
    // Save history
    const history = JSON.parse(localStorage.getItem('mixed_test_results') || '[]');
    history.unshift(result);
    localStorage.setItem('mixed_test_results', JSON.stringify(history.slice(0, 15)));
    setHistoryList(history.slice(0, 15));
  }, [language, mixedTest]);

  // --- Start Test ---
  const startMixedTest = async () => {
    setLoading(true);
    const bundeslandKey = localStorage.getItem("selectedBundesland");
    if (!bundeslandKey) {
      alert("Bitte wählen Sie zuerst ein Bundesland aus!");
      setLoading(false);
      return;
    }
    let blQuestions = [];
    try {
      const res = await fetch(`/bundesland/${bundeslandKey}`);
      blQuestions = await res.json();
    } catch {
      alert("Fehler beim Laden der Bundesland-Fragen.");
      setLoading(false);
      return;
    }
    const selectedBL = getRandomQuestions(blQuestions, MIXED_BUNDESLAND);
    const selectedBLIds = selectedBL.map(q => String(q.id));
    const selectedGeneral = getRandomQuestions(generalQuestions, MIXED_GENERAL, selectedBLIds);
    const mixedQs = [...selectedBL, ...selectedGeneral].sort(() => Math.random() - 0.5);
    const answers = {};
    mixedQs.forEach(q => (answers[q.id] = null));
    setMixedTest({
      questions: mixedQs,
      answers,
      start: Date.now(),
      timer: 60 * 60, // 60 minutes
    });
    setMixedTestResult(null);
    setShowReviewList(false);
    setShowResultPopup(false);
    setLoading(false);
  };

  // --- Timer logic ---
  useEffect(() => {
    if (mixedTest && mixedTest.timer > 0) {
      timerInterval.current = setInterval(() => {
        setMixedTest(mt => mt && mt.timer > 0 ? { ...mt, timer: mt.timer - 1 } : mt);
      }, 1000);
      return () => clearInterval(timerInterval.current);
    }
    if (mixedTest && mixedTest.timer === 0) handleMixedSubmit();
  }, [mixedTest, handleMixedSubmit]);

  const handleMixedAnswer = (qid, value) => {
    setMixedTest(mt => ({
      ...mt,
      answers: { ...mt.answers, [qid]: value }
    }));
  };

  const handleMixedRestart = () => {
    setMixedTest(null);
    setMixedTestResult(null);
    setShowResultPopup(false);
    setShowReviewList(false);
  };

  const handleShowReviewList = () => {
    setShowResultPopup(false);
    setShowReviewList(true);
  };

  const formatTime = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Export PDF ---
  const exportHistoryPDF = () => {
    const history = JSON.parse(localStorage.getItem('mixed_test_results') || '[]');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Mixed Test History", 14, 15);
    doc.setFontSize(11);

    let y = 25;
    history.forEach((h, idx) => {
      doc.text(`${idx + 1}. Date: ${new Date(h.when).toLocaleString()}`, 14, y);
      doc.text(`Score: ${h.score}/${MIXED_TOTAL} | Duration: ${h.duration}s | Passed: ${h.passed ? "Yes" : "No"}`, 14, y + 6);
      y += 15;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("mixed_test_history.pdf");
  };

  // --- Load history on show ---
  useEffect(() => {
    if (showHistory) {
      const h = JSON.parse(localStorage.getItem('mixed_test_results') || '[]');
      setHistoryList(h);
    }
  }, [showHistory]);

  // --- Do not render if not shown ---
  if (!show) return null;

  return (
    <section className="w-full max-w-3xl mx-auto flex flex-col items-center mt-8 animate-fadeIn relative">
      {/* START PANEL */}
      {!mixedTest && !showReviewList && (
        <>
          <h2 className="text-3xl font-extrabold mb-7 text-center tracking-tight">
            MIXED TEST MODE <span className="text-gray-500 uppercase text-lg">({language})</span>
          </h2>
          <button
            className="px-10 py-5 rounded-full bg-gradient-to-r from-pink-400 to-yellow-400 text-white font-bold text-xl shadow-xl hover:scale-105 transition mb-8 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            onClick={startMixedTest}
            disabled={loading}
            aria-busy={loading}
            style={{ letterSpacing: 0.5 }}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Lädt…
              </span>
            ) : (
              "Start Mixed Test (33 Fragen)"
            )}
          </button>
          <div className="text-center text-gray-700 mt-1 mb-6 text-lg font-medium">
            Test besteht aus <b>10 Landes-</b> und <b>23 allgemeinen</b> Fragen.<br />
            <span className="font-semibold text-pink-600 block mt-2 text-base">Mind. 17 richtig für Bestehen!</span>
          </div>
          <button
            className="mt-2 mb-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-full shadow-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setShowHistory(true)}
            style={{ boxShadow: "0 3px 10px 0 #6EA1F6" }}
          >
            <FaRegClock className="text-white text-2xl" /> Verlauf & Ergebnisse ansehen
          </button>
          <button
            className="underline text-blue-600 font-medium mt-3"
            onClick={onClose}
          >Zurück</button>
        </>
      )}

      {/* History Panel/Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-auto relative">
            <button
              className="absolute top-5 right-6 text-gray-400 hover:text-pink-500 text-2xl focus:outline-none"
              onClick={() => setShowHistory(false)}
              title="Schließen"
            >
              <FaTimes />
            </button>
            <h3 className="text-2xl font-extrabold mb-6 text-pink-600 flex items-center gap-2">
              <FaRegClock /> Verlauf & Ergebnisse
            </h3>
            {historyList.length === 0 ? (
              <div className="text-gray-400 text-center mb-8">Noch keine Tests durchgeführt.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border rounded-2xl overflow-hidden bg-white">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-3 py-2 font-bold text-gray-700 text-sm rounded-tl-2xl">Datum</th>
                      <th className="px-3 py-2 font-bold text-gray-700 text-sm">Uhrzeit</th>
                      <th className="px-3 py-2 font-bold text-gray-700 text-sm">Score</th>
                      <th className="px-3 py-2 font-bold text-gray-700 text-sm">Ergebnis</th>
                      <th className="px-3 py-2 text-right rounded-tr-2xl"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyList.map((entry, idx) => {
                      const dt = new Date(entry.when);
                      return (
                        <tr key={idx} className="border-b last:border-b-0 hover:bg-yellow-50">
                          <td className="px-3 py-2 text-base">{dt.toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-base">{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="px-3 py-2 text-base font-bold">{entry.score} / {MIXED_TOTAL}</td>
                          <td className="px-3 py-2">
                            <span className={`px-3 py-1 rounded-full font-semibold text-sm ${entry.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {entry.passed ? "Bestanden" : "Nicht bestanden"}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right">
                            {/* you can add a details button here */}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-row justify-between items-center gap-4 mt-8">
              <button
                className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-full shadow hover:scale-105 transition"
                onClick={exportHistoryPDF}
              >
                <FaRegFilePdf className="text-lg" /> Export als PDF
              </button>
              <button
                className="underline text-blue-600 font-medium"
                onClick={() => setShowHistory(false)}
              >Schließen</button>
            </div>
          </div>
        </div>
      )}

      {/* The rest (Test panel, Review list, Result popup) ... remain unchanged */}
      {mixedTest && !mixedTestResult && (
        <>
          <div className="w-full sticky top-0 bg-white/80 shadow-md z-20 flex justify-between items-center px-6 py-4 rounded-b-2xl mb-6 border-b">
            <div className="text-pink-700 font-bold text-xl">⏱️ {formatTime(mixedTest.timer)}</div>
            <div className="text-lg text-gray-600">Noch {mixedTest.questions.length} Fragen</div>
          </div>
          <form className="flex flex-col gap-7 w-full">
            {mixedTest.questions.map((q, i) => (
              <div key={q.id} className="rounded-2xl bg-white/90 shadow-lg p-6 border border-gray-200 flex flex-col gap-3">
                <div className="text-base font-bold mb-1 text-gray-800 flex items-center gap-2">
                  <span className="text-pink-500 font-black text-lg">{i + 1}.</span>
                  {q.question?.[language] || q.question?.de}
                </div>
                <div className="flex flex-col gap-3">
                  {Object.entries(q.options || {}).map(([key, val]) => (
                    <label key={key} className={`
                      flex items-center gap-2 py-1.5 px-3 rounded-lg border cursor-pointer
                      ${mixedTest.answers[q.id] === key
                        ? "bg-pink-100 border-pink-400 font-bold"
                        : "bg-white border-gray-300 hover:bg-yellow-50"}
                    `}>
                      <input
                        type="radio"
                        name={`answer-${q.id}`}
                        checked={mixedTest.answers[q.id] === key}
                        onChange={() => handleMixedAnswer(q.id, key)}
                        className="form-radio accent-pink-500"
                      />
                      <span className="font-semibold">{key.toUpperCase()}.</span>
                      <span>{val?.[language] || val?.de}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </form>
          <div className="flex justify-center mt-8">
            <button
              type="button"
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-pink-600 text-white rounded-full text-lg font-extrabold shadow-lg hover:scale-105 transition"
              onClick={handleMixedSubmit}
            >
              Test Abgeben & Auswerten
            </button>
          </div>
        </>
      )}

      {/* PASS/FAIL POPUP */}
      {showResultPopup && mixedTestResult && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto text-center">
            <h3 className={`text-3xl font-extrabold mb-4 ${mixedTestResult.passed ? "text-green-600" : "text-red-600"}`}>
              {mixedTestResult.passed ? "Bestanden! 🎉" : "Nicht Bestanden"}
            </h3>
            <div className="text-xl font-bold mb-2">Richtig: {mixedTestResult.score} / {MIXED_TOTAL}</div>
            <div className="text-base text-gray-600 mb-6">Mindestanzahl: {PASS_MIN}</div>
            <div className="flex gap-3 justify-center mb-3">
              <button
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold rounded-full shadow hover:scale-105 transition"
                onClick={handleMixedRestart}
              >
                Wiederholen
              </button>
              <button
                className="px-8 py-3 bg-gray-200 text-gray-900 font-bold rounded-full shadow hover:bg-gray-300 transition"
                onClick={handleShowReviewList}
              >
                Ergebnisse ansehen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW LIST */}
      {showReviewList && mixedTestResult && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-7 rounded-3xl shadow-2xl max-w-2xl w-full mx-auto overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-extrabold mb-6 text-pink-700">Ergebnisübersicht</h3>
            <ul className="space-y-4">
              {mixedTest.questions.map((q, idx) => (
                <li
                  key={q.id}
                  className={`
                    border-l-4 p-4 rounded-xl
                    ${mixedTestResult.correctIds.includes(q.id)
                      ? "border-green-400 bg-green-50"
                      : "border-red-400 bg-red-50"}
                  `}
                >
                  <div className="font-bold mb-1">{idx + 1}. {q.question?.[language] || q.question?.de}</div>
                  <div>
                    <span className="font-semibold">Ihre Antwort:</span>{" "}
                    <span className={mixedTestResult.correctIds.includes(q.id) ? "text-green-700" : "text-red-700"}>
                      {q.options[mixedTest.answers[q.id]]?.[language] || q.options[mixedTest.answers[q.id]]?.de || <em>Keine Antwort</em>}
                    </span>
                    {!mixedTestResult.correctIds.includes(q.id) && (
                      <>
                        <br />
                        <span className="font-semibold">Richtig:</span>{" "}
                        <span className="text-green-700">
                          {q.options[q.correctAnswer]?.[language] || q.options[q.correctAnswer]?.de}
                        </span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-6">
              <button
                className="px-7 py-3 bg-pink-500 text-white font-bold rounded-full shadow hover:bg-pink-600 transition"
                onClick={handleMixedRestart}
              >
                Zurück zum Test Start
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
export { MixedTest };
