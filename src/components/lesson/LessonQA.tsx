import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useTranslation } from "react-i18next";
import { MessageCircle, Send, Check } from "lucide-react";

interface Question {
  id: string;
  lesson_id: string;
  student_id: string;
  question_text: string;
  is_answered: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface LessonQAProps {
  lessonId: string;
  studentId: string; // The current user ID (could be teacher or student)
  isTeacher: boolean;
}

export function LessonQA({ lessonId, studentId, isTeacher }: LessonQAProps) {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false); // Slide-out panel state

  useEffect(() => {
    fetchQuestions();

    // Subscribe to new questions
    const channel = supabase.channel(`lesson_qa_${lessonId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_questions", filter: `lesson_id=eq.${lessonId}` },
        () => {
          fetchQuestions(); // Simplest sync logic
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("lesson_questions")
        .select(`
          id, lesson_id, student_id, question_text, is_answered, created_at,
          profiles(full_name)
        `)
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: true });
        
      if (!error && data) {
        setQuestions(data as unknown as Question[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      await supabase.from("lesson_questions").insert({
        lesson_id: lessonId,
        student_id: studentId,
        question_text: newQuestion.trim()
      });
      setNewQuestion("");
    } catch (err) {
      console.error(err);
    }
  };

  const markAnswered = async (qId: string) => {
    if (!isTeacher) return;
    try {
      await supabase.from("lesson_questions")
        .update({ is_answered: true })
        .eq("id", qId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed", bottom: "20px", right: "20px", zIndex: 90,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          color: "white", padding: "16px", borderRadius: "50%",
          border: "none", cursor: "pointer", boxShadow: "0 10px 25px rgba(59,130,246,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, right: 0, width: "350px", height: "100vh",
          background: "rgba(15,23,42,0.98)", backdropFilter: "blur(10px)",
          borderLeft: "1px solid rgba(255,255,255,0.1)", zIndex: 100,
          display: "flex", flexDirection: "column", color: "white",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease"
        }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <MessageCircle size={20} color="#3b82f6" /> {t("qa.title", "Live Q&A")}
            </h2>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem" }}>
              &times;
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {questions.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b", marginTop: "2rem" }}>
                {t("qa.no_questions", "No questions yet")}
              </p>
            ) : (
              questions.map(q => (
                <div key={q.id} style={{
                  background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "12px",
                  borderLeft: q.is_answered ? "4px solid #10b981" : "4px solid #3b82f6"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#bfdbfe" }}>
                      {q.profiles?.full_name || "Student"}
                    </span>
                    {q.is_answered && <span title="Answered"><Check size={16} color="#10b981" /></span>}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.4" }}>{q.question_text}</p>
                  
                  {isTeacher && !q.is_answered && (
                    <button onClick={() => markAnswered(q.id)} style={{
                      background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid #10b981",
                      padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer",
                      marginTop: "10px", width: "100%"
                    }}>
                      {t("qa.mark_answered", "Mark Answered")}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {!isTeacher && (
            <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
              <form onSubmit={handleAsk} style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder={t("qa.placeholder", "Type your question...")}
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  style={{
                    flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px", padding: "10px", color: "white"
                  }}
                />
                <button type="submit" disabled={!newQuestion.trim()} style={{
                  background: "#3b82f6", color: "white", border: "none", borderRadius: "8px",
                  padding: "10px 14px", cursor: newQuestion.trim() ? "pointer" : "default",
                  opacity: newQuestion.trim() ? 1 : 0.5
                }}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
