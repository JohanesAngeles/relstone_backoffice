// src/pages/student/ExamPortalPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Format seconds to HH:MM:SS or MM:SS ──────────────────────
const formatTime = (secs) => {
  if (secs <= 0) return '00:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

const OPTION_KEYS = ['A','B','C','D'];

export default function ExamPortalPage() {
  const { bundleId, examName } = useParams();
  const navigate = useNavigate();

  // ── Session ───────────────────────────────────────────────
  const [sessionId,   setSessionId]   = useState(null);
  const [questions,   setQuestions]   = useState([]);
  const [answers,     setAnswers]     = useState({});
  const [timeLeft,    setTimeLeft]    = useState(0);
  const [,   setTotalTime]   = useState(0);
  const [version,     setVersion]     = useState('');
  const [attemptNum,  setAttemptNum]  = useState(1);
  const [leaveCount,  setLeaveCount]  = useState(0);
  const [resuming,    setResuming]    = useState(false);

  // ── UI ────────────────────────────────────────────────────
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [activeQ,     setActiveQ]     = useState(0);
  const [submitting,  setSubmitting]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timedOut,    setTimedOut]    = useState(false);

  // ── Refs (for event listeners that need latest values) ────
  const sessionIdRef = useRef(null);
  const answersRef   = useRef({});
  const timeLeftRef  = useRef(0);
  const timerRef     = useRef(null);
  const autoSaveRef  = useRef(null);
  const questionRefs = useRef([]);

  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user?.studentId || '';
  const token     = localStorage.getItem('token');

  // Keep refs in sync with state
  useEffect(() => { answersRef.current   = answers;   }, [answers]);
  useEffect(() => { timeLeftRef.current  = timeLeft;  }, [timeLeft]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // ── Load session on mount ─────────────────────────────────
  useEffect(() => {
    if (!studentId) { setError('Not logged in.'); setLoading(false); return; }
    loadSession();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(autoSaveRef.current);
    };
  }, []);

  const loadSession = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        studentId,
        bundleId,
        examName: decodeURIComponent(examName),
      });
      const res  = await fetch(`${API}/exam-session/start?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setAnswers(data.answers || {});
      setTimeLeft(data.secondsRemaining);
      setTotalTime(data.totalSeconds);
      setVersion(data.version);
      setAttemptNum(data.attemptNumber);
      setLeaveCount(data.leaveCount || 0);
      setResuming(data.resuming);

      // Init question refs array
      questionRefs.current = data.questions.map(() => null);

      // Start timer and auto-save after state is set
      setTimeout(() => {
        startTimer();
        startAutoSave();
      }, 100);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Timer ─────────────────────────────────────────────────
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          clearInterval(timerRef.current);
          clearInterval(autoSaveRef.current);
          handleTimedOut();
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const handleTimedOut = async () => {
    setTimedOut(true);
    // Auto-submit on timeout
    await submitExam(true);
  };

  // ── Auto-save every 30 seconds ────────────────────────────
  const startAutoSave = () => {
    clearInterval(autoSaveRef.current);
    autoSaveRef.current = setInterval(() => {
      saveProgress();
    }, 30000);
  };

  const saveProgress = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    try {
      await fetch(`${API}/exam-session/save`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sessionId:        sid,
          answers:          answersRef.current,
          secondsRemaining: timeLeftRef.current,
        }),
      });
    } catch { /* empty */ }
  }, [token]);

  // ── Page leave/return detection ───────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      if (document.hidden) {
        // Student left — save + record leave
        fetch(`${API}/exam-session/leave`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            sessionId:        sid,
            answers:          answersRef.current,
            secondsRemaining: timeLeftRef.current,
          }),
        }).catch(() => {});
        setLeaveCount(prev => prev + 1);
      } else {
        // Student returned
        fetch(`${API}/exam-session/return`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sessionId: sid }),
        }).catch(() => {});
      }
    };

    const handleBeforeUnload = (e) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      // Save on tab close (best effort with sendBeacon)
      const payload = JSON.stringify({
        sessionId:        sid,
        answers:          answersRef.current,
        secondsRemaining: timeLeftRef.current,
      });
      navigator.sendBeacon(`${API}/exam-session/leave`, new Blob([payload], { type: 'application/json' }));
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [token]);

  // ── Answer selection ──────────────────────────────────────
  const selectAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  // ── Scroll to question ────────────────────────────────────
  const scrollToQuestion = (index) => {
    setActiveQ(index);
    const el = questionRefs.current[index];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ── Submit ────────────────────────────────────────────────
  const submitExam = async (isTimeout = false) => {
    const sid = sessionIdRef.current || sessionId;
    if (!sid) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(autoSaveRef.current);
    try {
      const res  = await fetch(`${API}/exam-session/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sessionId:        sid,
          answers:          answersRef.current,
          secondsRemaining: timeLeftRef.current,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Navigate to results page
      navigate(`/exam-results/${sid}`, { state: { result: data, examName: decodeURIComponent(examName), bundleId, isTimeout } });
    } catch (err) {
      alert(`❌ Failed to submit: ${err.message}`);
      setSubmitting(false);
    }
  };

  // ── Derived values ────────────────────────────────────────
  const answeredCount  = Object.keys(answers).length;
  const totalCount     = questions.length;
  const unanswered     = totalCount - answeredCount;
  const progressPct    = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const timeWarning    = timeLeft > 0 && timeLeft <= 300; // last 5 min
  const timeCritical   = timeLeft > 0 && timeLeft <= 60;  // last 1 min
  const decodedExam    = decodeURIComponent(examName);

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Loading your exam...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 32, maxWidth: 400, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8, fontFamily: "'Poppins', sans-serif" }}>Failed to Load Exam</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24, fontFamily: "'Poppins', sans-serif" }}>{error}</div>
        <button onClick={() => navigate(-1)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column', fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .opt-btn:hover { border-color: #2563eb !important; background: #eff6ff !important; }
        .opt-btn.selected { border-color: #2563eb !important; background: #eff6ff !important; }
        .nav-btn:hover { background: #e2e8f0 !important; }
        .nav-btn.answered { background: #2563eb !important; color: #fff !important; border-color: #2563eb !important; }
        .nav-btn.active { outline: 2.5px solid #0f172a !important; outline-offset: 2px; }
      `}</style>

      {/* ── Top Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        color: '#fff', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo + title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: '#2EABFE', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              RELSTONE · {bundleId}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 500 }}>
              {decodedExam}
            </div>
          </div>

          {/* Center meta */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0, padding: '0 24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{version}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{totalCount} Questions</div>
            </div>
            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Passing</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>70%</div>
            </div>
            {attemptNum > 1 && (
              <>
                <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Attempt</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>#{attemptNum}</div>
                </div>
              </>
            )}
          </div>

          {/* Timer */}
          <div style={{
            background: timeCritical ? '#ef4444' : timeWarning ? '#f97316' : 'rgba(255,255,255,0.1)',
            border: `1px solid ${timeCritical ? '#ef4444' : timeWarning ? '#f97316' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: 10, padding: '8px 16px', textAlign: 'center', flexShrink: 0,
            animation: timeCritical ? 'pulse 1s infinite' : 'none',
            transition: 'background 0.3s',
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Time Remaining</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.05em', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', marginBottom: 0 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #2EABFE, #00d4ff)', width: `${progressPct}%`, transition: 'width 0.3s' }} />
        </div>

        {/* Sub-header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
          <span>Progress: {answeredCount} / {totalCount} answered ({progressPct}%)</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {resuming && <span style={{ color: '#f97316' }}>⚡ Resumed from saved session</span>}
            {leaveCount > 0 && <span style={{ color: '#f97316' }}>⚠ Left page {leaveCount}×</span>}
            <span style={{ color: '#2EABFE' }}>Auto-saves every 30s</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '24px 16px', gap: 20, alignItems: 'flex-start' }}>

        {/* ── Left Sidebar — Question Navigator ── */}
        <div style={{
          width: 220, flexShrink: 0,
          background: '#fff', borderRadius: 14,
          border: '1px solid #e2e8f0',
          padding: '16px', position: 'sticky', top: 88,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Question Navigator
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, padding: '10px 12px', background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#64748b' }}>Answered</span>
              <span style={{ fontWeight: 700, color: '#2563eb' }}>{answeredCount} / {totalCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#64748b' }}>Remaining</span>
              <span style={{ fontWeight: 700, color: unanswered > 0 ? '#f97316' : '#16a34a' }}>{unanswered}</span>
            </div>
          </div>

          {/* Number grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
            {questions.map((q, i) => {
              const isAnswered = !!answers[q._id];
              const isActive   = activeQ === i;
              return (
                <button
                  key={q._id}
                  className={`nav-btn${isAnswered ? ' answered' : ''}${isActive ? ' active' : ''}`}
                  onClick={() => scrollToQuestion(i)}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: isAnswered ? '#2563eb' : '#fff',
                    color: isAnswered ? '#fff' : '#374151',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#64748b' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: '#2563eb' }} />
              Answered
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#64748b' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: '#fff', border: '1px solid #e2e8f0' }} />
              Not Yet Answered
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#64748b' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: '#fff', border: '2.5px solid #0f172a' }} />
              Current / Active
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            style={{
              width: '100%', marginTop: 20, padding: '11px 0',
              background: '#16a34a', color: '#fff', border: 'none',
              borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {submitting ? 'Submitting...' : '✓ Submit Exam'}
          </button>
        </div>

        {/* ── Main — Questions ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Resume banner */}
          {resuming && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 16px', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <span><strong>Session Resumed</strong> — Your previous answers and remaining time have been restored.</span>
            </div>
          )}

          {/* Timed out banner */}
          {timedOut && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>
              ⏰ Time's up! Your exam has been automatically submitted.
            </div>
          )}

          {/* Question cards */}
          {questions.map((q, i) => {
            const selected = answers[q._id];
            return (
              <div
                key={q._id}
                ref={el => { questionRefs.current[i] = el; }}
                onClick={() => setActiveQ(i)}
                style={{
                  background: '#fff',
                  border: `1px solid ${activeQ === i ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: 14,
                  padding: '20px 24px',
                  boxShadow: activeQ === i ? '0 0 0 3px rgba(37,99,235,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  scrollMarginTop: 100,
                }}
              >
                {/* Question header */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: selected ? '#2563eb' : activeQ === i ? '#0f172a' : '#f1f5f9',
                    color: selected || activeQ === i ? '#fff' : '#374151',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, transition: 'all 0.15s',
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.6, flex: 1 }}>
                    {q.question}
                  </p>
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 50 }}>
                  {OPTION_KEYS.map(key => {
                    const optText  = q.options?.[key];
                    if (!optText) return null;
                    const isSelected = selected === key;
                    return (
                      <button
                        key={key}
                        className={`opt-btn${isSelected ? ' selected' : ''}`}
                        onClick={(e) => { e.stopPropagation(); selectAnswer(q._id.toString(), key); setActiveQ(i); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                          border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                          background: isSelected ? '#eff6ff' : '#fafafa',
                          textAlign: 'left', transition: 'all 0.12s',
                        }}
                      >
                        {/* Key badge */}
                        <span style={{
                          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isSelected ? '#2563eb' : '#e2e8f0',
                          color: isSelected ? '#fff' : '#374151',
                          fontSize: 12, fontWeight: 700, transition: 'all 0.12s',
                        }}>
                          {key}
                        </span>
                        <span style={{ fontSize: 13, color: '#0f172a', fontWeight: isSelected ? 600 : 400, lineHeight: 1.45 }}>
                          {optText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Bottom submit */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              <strong style={{ color: answeredCount === totalCount ? '#16a34a' : '#f97316' }}>
                {answeredCount} / {totalCount}
              </strong> questions answered
              {unanswered > 0 && <span style={{ color: '#f97316', marginLeft: 8 }}>· {unanswered} remaining</span>}
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: 10, padding: '12px 28px',
                fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              ✓ Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* ── Submit Confirmation Modal ── */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: unanswered > 0 ? '#fff7ed' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
              {unanswered > 0 ? '⚠️' : '✅'}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', fontFamily: "'Poppins', sans-serif" }}>
              {unanswered > 0 ? 'Unanswered Questions' : 'Ready to Submit?'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 8px', lineHeight: 1.6, fontFamily: "'Poppins', sans-serif" }}>
              {unanswered > 0
                ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Unanswered questions will be marked incorrect.`
                : `You've answered all ${totalCount} questions. Once submitted, you cannot change your answers.`
              }
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 24px', fontFamily: "'Poppins', sans-serif" }}>
              Time remaining: <strong style={{ color: timeCritical ? '#ef4444' : '#0f172a' }}>{formatTime(timeLeft)}</strong>
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ padding: '10px 24px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
              >
                Continue Exam
              </button>
              <button
                onClick={() => { setShowConfirm(false); submitExam(false); }}
                disabled={submitting}
                style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: "'Poppins', sans-serif" }}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}