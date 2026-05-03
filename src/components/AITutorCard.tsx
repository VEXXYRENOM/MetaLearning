import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Star, X, Loader2, Save, Target, RefreshCcw } from 'lucide-react';
import { showToast } from './Toast';

interface AITutorCardProps {
  studentId: string;
  lessonId: string;
  sessionId: string;
  onClose: () => void;
}

interface Insight {
  weakness: string;
  suggestion: string;
  encouragement: string;
}

export function AITutorCard({ studentId, lessonId, sessionId, onClose }: AITutorCardProps) {
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [scorePct, setScorePct] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, lessonId, sessionId })
      });
      
      if (!res.ok) throw new Error('Network response was not ok');
      
      const data = await res.json();
      if (data.insight) {
        setInsight(data.insight);
        setScorePct(data.scorePct ?? null);
      } else {
        throw new Error('Invalid insight format');
      }
    } catch (err) {
      console.error("AI Tutor error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [studentId, lessonId, sessionId]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight, retryCount]);

  const handleSaveToDashboard = useCallback(() => {
    setSaved(true);
    showToast({ 
      type: 'success', 
      title: 'Saved!', 
      message: 'This insight has been added to your dashboard history.' 
    });
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutor-title"
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem', paddingBottom: '2rem'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '460px',
            background: 'rgba(15,23,42,0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(168,85,247,0.4)',
            boxShadow: '0 -10px 50px rgba(168,85,247,0.2)',
            borderRadius: '28px',
            padding: '1.75rem',
            color: 'white',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c084fc' }}>
              <Brain size={26} />
              <h3 id="tutor-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                AI Personal Tutor
              </h3>
            </div>
            <button 
              onClick={onClose} 
              aria-label="Close insight"
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
            >
              <X size={20} />
            </button>
          </div>

          <div aria-live="polite" aria-busy={loading}>
            {loading ? (
              <div style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', color: '#94a3b8' }}>
                <Loader2 size={36} className="animate-spin" style={{ color: '#a855f7' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>Connecting to AI Brain...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ color: '#f87171', marginBottom: '1rem' }}>Analysis currently unavailable.</div>
                <button 
                  onClick={() => setRetryCount(prev => prev + 1)}
                  style={{ 
                    background: 'rgba(168,85,247,0.2)', border: '1px solid #a855f7', 
                    color: 'white', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <RefreshCcw size={16} /> Try Again
                </button>
              </div>
            ) : insight ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {scorePct !== null && (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '14px', 
                    background: 'rgba(168,85,247,0.1)', padding: '14px', borderRadius: '16px',
                    border: '1px solid rgba(168,85,247,0.2)'
                  }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: `conic-gradient(#a855f7 ${scorePct}%, rgba(255,255,255,0.1) ${scorePct}%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <div style={{ width: '44px', height: '44px', background: '#0f172a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', fontWeight: 800 }}>
                        {scorePct}%
                      </div>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: '1rem', fontWeight: 700 }}>Performance Analysis</h4>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Based on your spatial and quiz data</p>
                    </div>
                  </div>
                )}

                <div style={{ background: 'rgba(239,68,68,0.08)', borderLeft: '4px solid #ef4444', padding: '14px 18px', borderRadius: '4px 14px 14px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Target size={16} /> What to work on
                  </div>
                  <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.5, color: '#f8fafc' }}>{insight.weakness}</p>
                </div>

                <div style={{ background: 'rgba(59,130,246,0.08)', borderLeft: '4px solid #3b82f6', padding: '14px 18px', borderRadius: '4px 14px 14px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <ArrowRight size={16} /> Next step
                  </div>
                  <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.5, color: '#f8fafc' }}>{insight.suggestion}</p>
                </div>

                <div style={{ background: 'rgba(16,185,129,0.08)', borderLeft: '4px solid #10b981', padding: '14px 18px', borderRadius: '4px 14px 14px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Star size={16} /> Keep going
                  </div>
                  <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.5, color: '#f8fafc' }}>{insight.encouragement}</p>
                </div>

                <button 
                  onClick={handleSaveToDashboard}
                  disabled={saved || loading}
                  style={{
                    marginTop: '0.75rem', width: '100%', padding: '14px',
                    background: saved ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                    border: 'none', borderRadius: '14px', color: 'white',
                    fontWeight: 700, cursor: saved ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: saved ? 0.7 : 1,
                    transform: saved ? 'scale(0.98)' : 'scale(1)',
                    boxShadow: saved ? 'none' : '0 4px 15px rgba(168,85,247,0.4)'
                  }}
                >
                  {saved ? 'Added to Profile' : <><Save size={20} /> Save to Dashboard</>}
                </button>

              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
