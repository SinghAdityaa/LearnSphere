export function completionEligibility(allLessonIds, completedLessonIds, passed) {
  const finished = new Set(completedLessonIds.map(String));
  return Boolean(passed) && allLessonIds.length > 0 && allLessonIds.every(id => finished.has(String(id)));
}
export function scoreAnswers(questions, answers, passPercentage) {
  if (!questions.length || answers.length !== questions.length) throw new Error('Invalid answers');
  const score = questions.reduce((sum, q, i) => sum + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const percentage = Math.round(score * 100 / questions.length);
  return { score, total: questions.length, percentage, passed: percentage >= passPercentage };
}
