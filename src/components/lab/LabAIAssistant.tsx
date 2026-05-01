import { useState, useRef, useCallback } from "react";
import { askLabAI, buildLabContext } from "../../services/labAiService";
import type { BeakerSubstance } from "../../lib/labElements";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  isLoading?: boolean;
}

interface LabAIAssistantProps {
  substances: BeakerSubstance[];
  temperature: number;
  isBoiling: boolean;
  burnerOn: boolean;
  hasStirrer: boolean;
  litmusColor?: string;
  isRTL?: boolean;
}

const QUICK_QUESTIONS_EN = [
  "What's in my beaker?",
  "Why is it changing color?",
  "What should I add next?",
  "Is this reaction safe?",
];

const QUICK_QUESTIONS_AR = [
  "ماذا يوجد في الكأس؟",
  "لماذا تغير اللون؟",
  "ماذا أضيف بعد ذلك؟",
  "هل هذا التفاعل آمن؟",
];

export function LabAIAssistant({
  substances,
  temperature,
  isBoiling,
  burnerOn,
  hasStirrer,
  litmusColor,
  isRTL = false,
}: LabAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: isRTL
        ? "👋 مرحباً! أنا مساعد المختبر الذكي. اسألني عن أي تفاعل أو مادة، وسأشرح لك بدقة علمية! 🔬"
        : "👋 Hello! I'm your Lab AI Assistant. Ask me anything about your current experiment and I'll guide you with scientific precision! 🔬",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: text.trim(),
      };
      const loadingMsg: Message = {
        id: Date.now() + "-loading",
        role: "assistant",
        text: "...",
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setInput("");
      setIsTyping(true);
      setTimeout(scrollToBottom, 50);

      try {
        const context = buildLabContext(
          substances,
          temperature,
          isBoiling,
          burnerOn,
          hasStirrer,
          litmusColor
        );

        const response = await askLabAI(text.trim(), context);

        setMessages((prev) =>
          prev
            .filter((m) => !m.isLoading)
            .concat({
              id: Date.now() + "-reply",
              role: "assistant",
              text: response.answer,
            })
        );
      } catch {
        setMessages((prev) =>
          prev
            .filter((m) => !m.isLoading)
            .concat({
              id: Date.now() + "-err",
              role: "assistant",
              text: isRTL
                ? "⚠️ حدث خطأ في الاتصال. تحقق من محتوى الكأس ودرجة الحرارة في لوحة التحليل."
                : "⚠️ Connection error. Check the Analytics HUD for substance info.",
            })
        );
      } finally {
        setIsTyping(false);
        setTimeout(scrollToBottom, 50);
      }
    },
    [substances, temperature, isBoiling, burnerOn, hasStirrer, litmusColor, isRTL, isTyping]
  );

  const quickQuestions = isRTL ? QUICK_QUESTIONS_AR : QUICK_QUESTIONS_EN;

  // Floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        title={isRTL ? "مساعد المختبر الذكي" : "Lab AI Assistant"}
        style={{
          position: "absolute",
          bottom: "90px",
          right: isRTL ? undefined : "20px",
          left: isRTL ? "20px" : undefined,
          zIndex: 40,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          border: "2px solid rgba(255,255,255,0.2)",
          boxShadow: "0 4px 24px rgba(99,102,241,0.5)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
          animation: "pulse-ai 2.5s ease-in-out infinite",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.12)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        🤖
        <style>{`
          @keyframes pulse-ai {
            0%, 100% { box-shadow: 0 4px 24px rgba(99,102,241,0.5); }
            50% { box-shadow: 0 4px 32px rgba(168,85,247,0.8); }
          }
        `}</style>
      </button>
    );
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        position: "absolute",
        bottom: "90px",
        right: isRTL ? undefined : "20px",
        left: isRTL ? "20px" : undefined,
        zIndex: 40,
        width: "340px",
        maxHeight: "480px",
        display: "flex",
        flexDirection: "column",
        background: "rgba(2,6,23,0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(99,102,241,0.4)",
        borderRadius: "20px",
        boxShadow: "0 8px 48px rgba(99,102,241,0.3)",
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.2rem" }}>🤖</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
              {isRTL ? "مساعد المختبر الذكي" : "Lab AI Assistant"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>
              {isRTL
                ? `${substances.length} مادة • ${temperature.toFixed(0)}°C`
                : `${substances.length} substance(s) • ${temperature.toFixed(0)}°C`}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            width: "28px",
            height: "28px",
            cursor: "pointer",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      </div>

      {/* Context pill */}
      {substances.length > 0 && (
        <div
          style={{
            padding: "6px 12px",
            background: "rgba(99,102,241,0.1)",
            borderBottom: "1px solid rgba(99,102,241,0.15)",
            fontSize: "0.68rem",
            color: "#a5b4fc",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flexShrink: 0,
          }}
        >
          🧪 {substances.map(s => s.elementId).join(" + ")} @ {temperature.toFixed(0)}°C
          {isBoiling ? " 🌡️♨️" : ""}
          {litmusColor ? ` 📜` : ""}
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minHeight: 0,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "8px 12px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, #6366f1, #a855f7)"
                    : "rgba(255,255,255,0.07)",
                border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none",
                color: "#f1f5f9",
                fontSize: "0.8rem",
                lineHeight: 1.5,
                animation: msg.isLoading ? "blink-ai 1s step-start infinite" : "none",
              }}
            >
              {msg.isLoading ? "⏳ " : msg.role === "assistant" ? "" : ""}
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        <style>{`
          @keyframes blink-ai { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        `}</style>
      </div>

      {/* Quick questions */}
      <div
        style={{
          padding: "6px 10px",
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={isTyping}
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "20px",
              color: "#a5b4fc",
              fontSize: "0.65rem",
              padding: "3px 8px",
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)"; }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder={isRTL ? "اسألني عن تجربتك..." : "Ask about your experiment..."}
          disabled={isTyping}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "#f1f5f9",
            padding: "8px 12px",
            fontSize: "0.8rem",
            outline: "none",
            fontFamily: "inherit",
            direction: isRTL ? "rtl" : "ltr",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isTyping || !input.trim()}
          style={{
            background:
              isTyping || !input.trim()
                ? "rgba(99,102,241,0.2)"
                : "linear-gradient(135deg, #6366f1, #a855f7)",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            width: "36px",
            height: "36px",
            cursor: isTyping || !input.trim() ? "not-allowed" : "pointer",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          {isTyping ? "⏳" : "→"}
        </button>
      </div>
    </div>
  );
}
