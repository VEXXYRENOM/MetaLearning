import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle } from "lucide-react";

interface Answer {
  id: string;
  answer_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question_text: string;
  answers: Answer[];
}

export function QuizOverlay({ lessonId, onClose, onComplete }: { lessonId: string, onClose: () => void, onComplete: (score: number) => void }) {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);

  const fetchQuiz = async () => {
    if (!lessonId || lessonId.length < 20 || !lessonId.includes("-")) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select(`*, answers:quiz_answers(*)`)
        .eq("lesson_id", lessonId);
      
      if (!error && data && data.length > 0) {
        setQuestions(data as Question[]);
      } else {
        setQuestions([]);
        setFinished(true); // Complete immediately if no questions
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (finished || questions.length === 0) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(15,23,42,0.95)", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", color: "white", zIndex: 100, backdropFilter: "blur(10px)"
      }}>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "3rem", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
          <CheckCircle size={64} color="#10b981" style={{ marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{t("quiz.complete", "Quiz Completed!")}</h2>
          {questions.length > 0 && <p style={{ fontSize: "1.2rem", color: "#94a3b8" }}>{t("quiz.score", "Your Score")}: {score} / {questions.length}</p>}
          <button onClick={() => { onComplete(score); onClose(); }} style={{
            background: "#3b82f6", color: "white", border: "none", padding: "12px 24px",
            borderRadius: "12px", fontSize: "1.1rem", marginTop: "2rem", cursor: "pointer"
          }}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedA = currentQ.answers.find(a => a.id === selectedAnswer);
  const isCorrect = selectedA?.is_correct;

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    setShowResult(true);
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15,23,42,0.9)", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", color: "white", zIndex: 100, backdropFilter: "blur(5px)"
    }}>
      <div style={{
        background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px",
        padding: "2.5rem", maxWidth: "600px", width: "90%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", marginBottom: "2rem" }}>
          <span>{t("quiz.question", "Question")} {currentIndex + 1} / {questions.length}</span>
          <span>{t("quiz.score", "Score")}: {score}</span>
        </div>

        <h2 style={{ fontSize: "1.5rem", lineHeight: "1.4", marginBottom: "2rem" }}>{currentQ.question_text}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {currentQ.answers.map(a => (
            <button
              key={a.id}
              disabled={showResult}
              onClick={() => setSelectedAnswer(a.id)}
              style={{
                background: selectedAnswer === a.id ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                border: selectedAnswer === a.id ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                color: "white", padding: "16px", borderRadius: "12px", textAlign: "left", fontSize: "1.1rem",
                cursor: showResult ? "default" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "all 0.2s"
              }}
            >
              {a.answer_text}
              {showResult && a.is_correct && <CheckCircle color="#10b981" />}
              {showResult && selectedAnswer === a.id && !a.is_correct && <XCircle color="#ef4444" />}
            </button>
          ))}
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {showResult && (
              <strong style={{ color: isCorrect ? "#10b981" : "#ef4444", fontSize: "1.1rem" }}>
                {isCorrect ? t("quiz.correct", "Correct!") : t("quiz.incorrect", "Incorrect")}
              </strong>
            )}
          </div>
          {!showResult ? (
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer}
              style={{
                background: selectedAnswer ? "#3b82f6" : "rgba(255,255,255,0.1)",
                color: selectedAnswer ? "white" : "#94a3b8",
                border: "none", padding: "12px 24px", borderRadius: "12px", fontSize: "1.1rem",
                cursor: selectedAnswer ? "pointer" : "not-allowed"
              }}
            >
              {t("quiz.submit", "Submit Answer")}
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                background: "#10b981", color: "white",
                border: "none", padding: "12px 24px", borderRadius: "12px", fontSize: "1.1rem", cursor: "pointer"
              }}
            >
              {t("quiz.next", "Next")} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
