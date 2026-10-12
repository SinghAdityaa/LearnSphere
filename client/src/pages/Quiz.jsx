import { Award, CheckCircle2, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

export default function Quiz() {
  const { courseId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/quizzes/course/${courseId}`)
      .then(({ data }) => {
        setQuiz(data.quiz);
        setAnswers(Array(data.quiz.questions.length).fill(null));
      })
      .catch(err => setError(err.response?.data?.message || 'Assessment is not available yet.'));
  }, [courseId]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (answers.some(answer => answer === null)) return setError('Answer every question before submitting.');
    try {
      const { data } = await api.post(`/quizzes/${quiz._id}/submit`, { answers });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit assessment.');
    }
  };

  if (error && !quiz) return <div className="page-center">{error}</div>;
  if (!quiz) return <div className="page-center">Loading assessment…</div>;

  if (result) {
    return <section className="section-shell auth-page"><div className="result-card">
      <span className={result.attempt.passed ? 'result-icon pass' : 'result-icon fail'}>{result.attempt.passed ? <Award /> : <RotateCcw />}</span>
      <span className="eyebrow">Assessment complete</span>
      <h1>{result.attempt.percentage}%</h1>
      <p>You answered {result.attempt.score} of {result.attempt.total} questions correctly.</p>
      <div className={result.attempt.passed ? 'alert success' : 'alert error'}>{result.attempt.passed ? (result.certificate ? 'You passed. Your certificate is ready.' : result.certificateMessage || 'You passed. Complete every lesson to unlock your certificate.') : `You need ${quiz.passPercentage}% to pass. Review the lessons and try again.`}</div>
      <div className="hero-actions">{result.certificate && <Link className="button primary" to={`/certificate/${result.certificate._id}`}><Award size={18} /> View certificate</Link>}<Link className="button secondary" to={`/learn/${courseId}`}>Back to course</Link></div>
    </div></section>;
  }

  return (
    <section className="section-shell page-section quiz-shell">
      <div className="section-heading narrow"><span className="eyebrow">Final assessment</span><h1>{quiz.title}</h1><p>Pass mark: {quiz.passPercentage}%. Your score is calculated by the server.</p></div>
      {error && <div className="alert error">{error}</div>}
      <form className="quiz-form" onSubmit={submit}>
        {quiz.questions.map((question, index) => <article className="question-card" key={question._id}><div className="question-number">Question {index + 1}</div><h3>{question.text}</h3><div className="option-list">{question.options.map((option, optionIndex) => <label key={optionIndex} className={answers[index] === optionIndex ? 'quiz-option selected' : 'quiz-option'}><input type="radio" name={`q-${index}`} checked={answers[index] === optionIndex} onChange={() => setAnswers(prev => prev.map((value, i) => i === index ? optionIndex : value))} /><span>{option}</span>{answers[index] === optionIndex && <CheckCircle2 size={18} />}</label>)}</div></article>)}
        <button className="button primary" type="submit">Submit assessment</button>
      </form>
    </section>
  );
}
