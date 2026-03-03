import React, { useMemo } from "react";
import { getWrongAnswerIds } from "../../utils/wrongAnswers";

export default function UnansweredQuestions({
  allQuestions = [],
  generalQuestions = [],
  bundeslandQuestions = [],
  language = "de"
}) {
  // IDs of all answered questions (wrong or right) from localStorage (history, mixed, wrongAnswers)
  const answeredIds = useMemo(() => {
    let answered = [];
    try {
      const wrong = getWrongAnswerIds();
      const history = JSON.parse(localStorage.getItem("quiz_history") || "[]");
      const mixed = JSON.parse(localStorage.getItem("mixed_test_results") || "[]");
      answered = [
        ...wrong,
        ...history.flatMap(entry => entry.questions?.map(q => q.id) || []),
        ...mixed.flatMap(entry => entry.questions?.map(q => q.id) || [])
      ].map(String);
    } catch {}
    return [...new Set(answered)];
  }, []);

  // Filter all unanswered questions
  const unanswered = allQuestions.filter(q => !answeredIds.includes(String(q.id)));
  // Only general
  const unansweredGeneral = unanswered.filter(q =>
    generalQuestions.some(gq => String(gq.id) === String(q.id))
  );
  // Only BL
  const unansweredBL = unanswered.filter(q =>
    bundeslandQuestions.some(bq => String(bq.id) === String(q.id))
  );
  return (
    <div className="w-full flex flex-col items-center mt-8">
      {/* DASHBOARD */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex gap-4 justify-between items-center bg-pink-50 rounded-2xl p-4 shadow">
          <div className="flex-1 text-center">
            <div className="text-3xl font-extrabold text-pink-600">{unanswered.length}</div>
            <div className="text-xs text-gray-600 font-semibold">Unbeantwortete insgesamt</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-yellow-500">{unansweredGeneral.length}</div>
            <div className="text-xs text-gray-600 font-semibold">Allgemeine Fragen</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-blue-600">{unansweredBL.length}</div>
            <div className="text-xs text-gray-600 font-semibold">Bundesländer Fragen</div>
          </div>
        </div>
      </div>
      {/* HEADER */}
      <h2 className="text-2xl font-bold mb-8 text-center text-pink-500">Noch nicht beantwortete Fragen</h2>
      {/* QUESTION CARDS */}
      <div className="w-full flex flex-col gap-7 items-center">
        {unanswered.map((q, idx) => (
          <div key={q.id} className="w-full max-w-2xl bg-white rounded-3xl p-7 shadow mb-3">
            <div className="font-bold text-pink-600 text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">{idx + 1}.</span>
              {q.question?.[language] || q.question?.de}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {Object.entries(q.options || {}).map(([key, value]) => (
                <div key={key} className="p-3 rounded-xl bg-gray-50 border mb-1 font-medium text-gray-900">
                  <span className="font-bold mr-2">{key.toUpperCase()}.</span>
                  {value?.[language] || value?.de}
                </div>
              ))}
            </div>
          </div>
        ))}
        {unanswered.length === 0 && (
          <div className="text-lg text-gray-400 mt-8">Alle Fragen beantwortet! 🎉</div>
        )}
      </div>
    </div>
  );
}
