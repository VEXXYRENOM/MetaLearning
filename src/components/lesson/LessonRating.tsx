import { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";

interface LessonRatingProps {
  lessonId: string;
  studentId: string;
  onSubmitted?: () => void;
}

export function LessonRating({ lessonId, studentId, onSubmitted }: LessonRatingProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await supabase.from("lesson_ratings").insert({
        lesson_id: lessonId,
        student_id: studentId,
        rating_value: rating,
        comment_text: comment.trim() || null
      });
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error("Error submitting rating:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        background: "rgba(16, 185, 129, 0.1)",
        border: "1px solid rgba(16, 185, 129, 0.3)",
        borderRadius: "16px",
        padding: "1.5rem",
        textAlign: "center",
        color: "#6ee7b7"
      }}>
        <Star size={32} fill="#10b981" color="#10b981" style={{ marginBottom: "0.5rem" }} />
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>
          {t("rating.thanks", "Thank you for your rating!")}
        </h3>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(15, 23, 42, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "16px",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem"
    }}>
      <h3 style={{ margin: 0, color: "white", fontSize: "1.1rem" }}>
        {t("rating.title", "Rate this lesson")}
      </h3>
      
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
              transition: "transform 0.2s ease"
            }}
          >
            <Star
              size={32}
              color={(hoverRating || rating) >= star ? "#fbbf24" : "#475569"}
              fill={(hoverRating || rating) >= star ? "#fbbf24" : "transparent"}
              style={{
                transform: (hoverRating || rating) >= star ? "scale(1.1)" : "scale(1)"
              }}
            />
          </button>
        ))}
      </div>

      <textarea
        placeholder={t("rating.placeholder", "Optional comment...")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          padding: "0.75rem",
          color: "white",
          minHeight: "80px",
          resize: "vertical",
          fontFamily: "inherit"
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        style={{
          background: rating > 0 ? "linear-gradient(90deg, #3b82f6, #a855f7)" : "rgba(255, 255, 255, 0.1)",
          color: rating > 0 ? "white" : "#94a3b8",
          border: "none",
          padding: "0.75rem",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: rating > 0 ? "pointer" : "not-allowed",
          transition: "all 0.2s"
        }}
      >
        {submitting ? t("auth.loading", "Loading...") : t("quiz.submit", "Submit")}
      </button>
    </div>
  );
}
