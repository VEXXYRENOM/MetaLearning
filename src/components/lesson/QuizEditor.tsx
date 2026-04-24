import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useTranslation } from "react-i18next";
import { Save, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  lesson_id: string;
  question_text: string;
  answers: {
    id: string;
    answer_text: string;
    is_correct: boolean;
  }[];
}

export function QuizEditor({ lessonId, onClose }: { lessonId: string, onClose: () => void }) {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);

  const fetchQuiz = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select(`*, answers:quiz_answers(*)`)
        .eq("lesson_id", lessonId);
      
      if (!error && data) {
        setQuestions(data as Question[]);
      }
    } catch (err) {
      console.error("Error fetching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      // Simplistic approach for UI logic: Delete all related to lesson_id, then insert new ones.
      // A more robust approach would compute deltas.
      await supabase.from("quiz_questions").delete().eq("lesson_id", lessonId);
      
      for (const q of questions) {
        const { data: insertedQuestion, error: qError } = await supabase
          .from("quiz_questions")
          .insert({ lesson_id: lessonId, question_text: q.question_text })
          .select()
          .single();

        if (insertedQuestion && !qError) {
          const newAnswers = q.answers.map(a => ({
            question_id: insertedQuestion.id,
            answer_text: a.answer_text,
            is_correct: a.is_correct
          }));
          await supabase.from("quiz_answers").insert(newAnswers);
        }
      }
      onClose();
    } catch (err) {
      console.error("Failed to save quiz", err);
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `temp_${Date.now()}`,
        lesson_id: lessonId,
        question_text: "",
        answers: [
          { id: `t_a1_${Date.now()}`, answer_text: "", is_correct: true },
          { id: `t_a2_${Date.now()}`, answer_text: "", is_correct: false }
        ]
      }
    ]);
  };

  const updateQuestionText = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].question_text = text;
    setQuestions(updated);
  };

  const updateAnswer = (qIndex: number, aIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].answers[aIndex].answer_text = text;
    setQuestions(updated);
  };

  const setCorrectAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.forEach((a, idx) => {
      a.is_correct = idx === aIndex;
    });
    setQuestions(updated);
  };

  const removeQuestion = (qIndex: number) => {
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const addAnswer = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.push({
      id: `t_a_${Date.now()}`,
      answer_text: "",
      is_correct: false
    });
    setQuestions(updated);
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    const updated = [...questions];
    // prevent removing if only 2 left
    if (updated[qIndex].answers.length > 2) {
      updated[qIndex].answers = updated[qIndex].answers.filter((_, idx) => idx !== aIndex);
      // ensure at least one is correct
      if (!updated[qIndex].answers.some(a => a.is_correct)) {
        updated[qIndex].answers[0].is_correct = true;
      }
      setQuestions(updated);
    }
  };

  if (loading) return <div style={{ color: "white", padding: "1rem" }}>{t("auth.loading")}</div>;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px", padding: "1.5rem", color: "white", width: "100%", maxWidth: "800px",
        maxHeight: "90vh", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: "1.5rem",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1.5rem" }}>{t("quiz.title", "Quiz Editor")}</h3>
        <button onClick={addQuestion} style={{
          background: "rgba(59,130,246,0.2)", border: "1px solid #3b82f6", color: "#60a5fa",
          padding: "6px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
        }}>
          <Plus size={16} /> {t("quiz.add_question", "Add Question")}
        </button>
      </div>

      {questions.length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
          {t("quiz.no_quiz", "No quiz for this lesson")}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {questions.map((q, qIndex) => (
            <div key={q.id} style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <input
                  type="text"
                  placeholder={t("quiz.question", "Question")}
                  value={q.question_text}
                  onChange={e => updateQuestionText(qIndex, e.target.value)}
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "white", padding: "10px", borderRadius: "8px"
                  }}
                />
                <button onClick={() => removeQuestion(qIndex)} style={{
                  background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", color: "#f87171",
                  padding: "10px", borderRadius: "8px", cursor: "pointer"
                }}>
                  <Trash2 size={18} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {q.answers.map((a, aIndex) => (
                  <div key={a.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button onClick={() => setCorrectAnswer(qIndex, aIndex)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: a.is_correct ? "#10b981" : "#475569"
                    }}>
                      <CheckCircle2 size={24} />
                    </button>
                    <input
                      type="text"
                      placeholder="Answer option"
                      value={a.answer_text}
                      onChange={e => updateAnswer(qIndex, aIndex, e.target.value)}
                      style={{
                        flex: 1, background: "rgba(255,255,255,0.05)", border: a.is_correct ? "1px solid #10b981" : "1px solid transparent",
                        color: "white", padding: "8px", borderRadius: "8px"
                      }}
                    />
                    <button onClick={() => removeAnswer(qIndex, aIndex)} disabled={q.answers.length <= 2} style={{
                      background: "none", border: "none", cursor: q.answers.length > 2 ? "pointer" : "not-allowed",
                      color: q.answers.length > 2 ? "#f87171" : "#475569"
                    }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {q.answers.length < 5 && (
                  <button onClick={() => addAnswer(qIndex)} style={{
                    background: "transparent", border: "1px dashed #475569", color: "#94a3b8",
                    padding: "8px", borderRadius: "8px", cursor: "pointer", marginTop: "0.5rem"
                  }}>
                    + Add Answer Option
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button onClick={onClose} style={{
          background: "transparent", border: "1px solid #475569", color: "#94a3b8",
          padding: "10px 20px", borderRadius: "8px", cursor: "pointer"
        }}>
          Cancel
        </button>
        <button onClick={saveQuiz} disabled={saving} style={{
          background: "#3b82f6", border: "none", color: "white",
          padding: "10px 20px", borderRadius: "8px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "5px"
        }}>
          <Save size={18} /> {saving ? "Saving..." : "Save Quiz"}
        </button>
      </div>
    </div>
  );
}
