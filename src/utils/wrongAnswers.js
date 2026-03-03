const STORAGE_KEY = "wrongAnswers";

const readWrongAnswerIds = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").map(String);
  } catch {
    return [];
  }
};

export const getWrongAnswerIds = () => {
  return Array.from(new Set(readWrongAnswerIds()));
};

export const addWrongAnswer = (id) => {
  const wrong = readWrongAnswerIds();
  const idStr = String(id);
  if (!wrong.includes(idStr)) {
    wrong.push(idStr);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wrong));
  }
};

export const removeWrongAnswer = (id) => {
  const wrong = readWrongAnswerIds();
  const idStr = String(id);
  if (wrong.includes(idStr)) {
    const updated = wrong.filter(wid => wid !== idStr);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
