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
    <div style={{ minHeight: '100vh', background: '#091925', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(96,195,255,0.2)', borderTopColor: '#2EABFE', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, color: '#7FA8C4', fontFamily: "'Poppins', sans-serif" }}>Loading your exam...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#091925', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0C2436', border: '0.5px solid #60C3FF', borderRadius: 5, padding: 32, maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: "'Poppins', sans-serif" }}>Failed to Load Exam</div>
        <div style={{ fontSize: 13, color: '#7FA8C4', marginBottom: 24, fontFamily: "'Poppins', sans-serif" }}>{error}</div>
        <button onClick={() => navigate(-1)} style={{ background: '#2EABFE', color: '#091925', border: 'none', borderRadius: 5, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column', fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        .opt-btn { transition: all 0.12s; }
        .opt-btn:hover { border-color: #2EABFE !important; background: rgba(46,171,254,0.08) !important; }
        .opt-btn:hover .opt-key { background: rgba(46,171,254,0.2) !important; border-color: #2EABFE !important; color: #2EABFE !important; }
        .opt-btn.selected { border-color: #2EABFE !important; background: rgba(46,171,254,0.1) !important; }
        .opt-btn.selected .opt-key { background: #2EABFE !important; border-color: #2EABFE !important; color: #091925 !important; }

        .nav-btn { transition: all 0.12s; }
        .nav-btn:hover { background: rgba(127,168,196,0.2) !important; border-color: #7FA8C4 !important; }
        .nav-btn.answered { background: #2EABFE !important; color: #091925 !important; border-color: #2EABFE !important; }
        .nav-btn.active { background: #091925 !important; color: #fff !important; border-color: #091925 !important; outline: none !important; }

        .submit-btn:hover { background: #007a00 !important; }
      `}</style>

      {/* ── Top Header ── */}
      <div style={{
        background: '#091925',
        color: '#fff',
        position: 'sticky', top: 0, zIndex: 100,
      }}>

        {/* ── Row 1: Logo bar ── */}
        <div style={{
          background: '#091925',
          padding: '0 30px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 58,
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }}>
          {/* Relstone logo — image from assets */}
          <img
            src="/src/assets/images/RelsLogo.png"
            alt="Relstone"
            style={{ height: 30, objectFit: 'contain' }}
          />

          {/* Right: user avatar + leave exam */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* User pill — name/initials pulled from localStorage user object */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#091925', border: '0.5px solid #60C3FF',
              borderRadius: 154, padding: '4px 12px 4px 4px',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#F59E0B',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#091925',
                fontFamily: "'Poppins', sans-serif",
                flexShrink: 0,
              }}>
                {/* Build initials: first letter of first name + first letter of last name if available, else first 2 chars */}
                {(() => {
                  const name = user?.name || user?.fullName || '';
                  if (name) {
                    const parts = name.trim().split(/\s+/);
                    return parts.length >= 2
                      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                      : name.slice(0, 2).toUpperCase();
                  }
                  return (user?.studentId || 'ST').slice(0, 2).toUpperCase();
                })()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>
                {/* Display last name, first initial — e.g. "Adami, M." — or fall back to studentId */}
                {(() => {
                  const name = user?.name || user?.fullName || '';
                  if (name) {
                    const parts = name.trim().split(/\s+/);
                    return parts.length >= 2
                      ? `${parts[parts.length - 1]}, ${parts[0][0]}.`
                      : name;
                  }
                  return user?.studentId || 'Student';
                })()}
              </span>
            </div>
            {/* Leave Exam button */}
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'transparent', border: '0.5px solid #60C3FF',
                borderRadius: 6, padding: '6px 12px',
                color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16 17 21 12 16 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Leave Exam
            </button>
          </div>
        </div>

        {/* ── Row 2: Exam title + meta blocks + timer (gradient bg) ── */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.22) 100%)',
          padding: '16px 30px 0 30px',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            {/* Title + meta */}
            <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.25, fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize', marginBottom: 4 }}>
                {decodedExam}
              </div>
              <div style={{ fontSize: 14, color: '#7FA8C4', fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
                {version && <span>{version} · </span>}
                {totalCount} Questions · Passing: 70%
                {attemptNum > 1 && <span> · Attempt #{attemptNum}</span>}
              </div>
            </div>

            {/* Right side: VERSION A | PASSING | TIME REMAINING */}
            <div style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0, borderRadius: 5, overflow: 'hidden', border: '0.5px solid rgba(96,195,255,0.4)' }}>
              {/* Version block */}
              <div style={{ padding: '10px 20px', textAlign: 'center', background: 'rgba(9,25,37,0.5)', borderRight: '0.5px solid rgba(96,195,255,0.4)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#7FA8C4', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Poppins', sans-serif", marginBottom: 4 }}>{version || 'VERSION A'}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'Poppins', sans-serif" }}>{totalCount} Questions</div>
              </div>
              {/* Passing block */}
              <div style={{ padding: '10px 20px', textAlign: 'center', background: 'rgba(9,25,37,0.5)', borderRight: '0.5px solid rgba(96,195,255,0.4)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#7FA8C4', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Poppins', sans-serif", marginBottom: 4 }}>PASSING</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'Poppins', sans-serif" }}>70%</div>
              </div>
              {/* Timer block */}
              <div style={{
                padding: '10px 18px',
                background: `${timeCritical ? 'rgba(239,68,68,0.15)' : '#0C2436'}`,
                display: 'flex', alignItems: 'center', gap: 8,
                animation: timeCritical ? 'pulse 1s infinite' : 'none',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="#7FA8C4" strokeWidth="1.5"/>
                  <path d="M12 7v5l3 3" stroke="#7FA8C4" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#7FA8C4', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Poppins', sans-serif", marginBottom: 2 }}>TIME REMAINING</div>
                  <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.04em', color: timeCritical ? '#ef4444' : timeWarning ? '#f97316' : '#fff', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#fff', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>Progress</span>
            <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.2)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#2EABFE', width: `${progressPct}%`, borderRadius: 100, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#2EABFE', fontFamily: "'Poppins', sans-serif", flexShrink: 0 }}>{progressPct}%</span>
          </div>

          {/* Sub-info strip */}
          {(resuming || leaveCount > 0) && (
            <div style={{ display: 'flex', gap: 20, fontSize: 11, color: '#7FA8C4', fontFamily: "'Poppins', sans-serif", paddingBottom: 8 }}>
              {resuming && <span style={{ color: '#f97316' }}>⚡ Resumed from saved session</span>}
              {leaveCount > 0 && <span style={{ color: '#f97316' }}>⚠ Left page {leaveCount}×</span>}
              <span style={{ color: '#2EABFE', marginLeft: 'auto' }}>Auto-saves every 30s</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '24px 16px', gap: 20, alignItems: 'flex-start' }}>

        {/* ── Left Sidebar ── */}
        <div style={{
          width: 290,
          flexShrink: 0,
          background: '#fff',
          border: '0.5px solid #e2e8f0',
          borderRadius: 5,
          position: 'sticky',
          top: 120,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ padding: '20px 20px', flex: 1 }}>

            {/* Section: Question Navigator label */}
            <div style={{ fontSize: 13, fontWeight: 500, color: '#7FA8C4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, fontFamily: "'Poppins', sans-serif" }}>
              QUESTION NAVIGATOR
            </div>

            {/* Stats box */}
            <div style={{ background: 'rgba(127,168,196,0.1)', borderRadius: 5, padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>Dashboard</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#091925', fontFamily: "'Poppins', sans-serif" }}>{answeredCount} / {totalCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>Flagged</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#091925', fontFamily: "'Poppins', sans-serif" }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>Remaining</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: unanswered > 0 ? '#f97316' : '#16a34a', fontFamily: "'Poppins', sans-serif" }}>{unanswered}</span>
              </div>
            </div>

            {/* Number grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
              {questions.map((q, i) => {
                const isAnswered = !!answers[q._id];
                const isActive   = activeQ === i;
                return (
                  <button
                    key={q._id}
                    className={`nav-btn${isAnswered ? ' answered' : ''}${isActive ? ' active' : ''}`}
                    onClick={() => scrollToQuestion(i)}
                    style={{
                      width: '100%', aspectRatio: '1',
                      borderRadius: 5,
                      border: `0.5px solid ${isAnswered ? '#2EABFE' : '#7FA8C4'}`,
                      background: isAnswered ? '#2EABFE' : 'rgba(127,168,196,0.1)',
                      color: isAnswered ? '#091925' : '#5B7384',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ height: 0, border: '0.5px solid #7FA8C4', margin: '0 0 16px' }} />

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(46,171,254,0.1)', border: '0.5px solid #2EABFE', flexShrink: 0 }} />
                Answered
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: '#091925', border: '0.5px solid #091925', flexShrink: 0 }} />
                Current / Active
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(127,168,196,0.1)', border: '0.5px solid #7FA8C4', flexShrink: 0 }} />
                Not yet Answered
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 0, border: '0.5px solid #7FA8C4', margin: '0 20px' }} />

          {/* Submit button */}
          <div style={{ padding: '16px 20px' }}>
            <button
              className="submit-btn"
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              style={{
                width: '100%', padding: '14px 0',
                background: '#008000',
                border: '0.5px solid #008000',
                borderRadius: 5,
                color: '#fff', fontSize: 16, fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Poppins', sans-serif",
                textTransform: 'capitalize',
              }}
            >
              <svg width="17" height="13" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 6.5L6 11L15.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Resume banner */}
          {resuming && (
            <div style={{ background: '#fff7ed', border: '0.5px solid #fed7aa', borderRadius: 5, padding: '12px 18px', fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Poppins', sans-serif" }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <span><strong>Session Resumed</strong> — Your previous answers and remaining time have been restored.</span>
            </div>
          )}

          {/* Timed out banner */}
          {timedOut && (
            <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: 5, padding: '12px 18px', fontSize: 13, color: '#b91c1c', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
              ⏰ Time's up! Your exam has been automatically submitted.
            </div>
          )}

          {/* Question cards */}
          {questions.map((q, i) => {
            const selected = answers[q._id];
            const isActive = activeQ === i;
            return (
              <div
                key={q._id}
                ref={el => { questionRefs.current[i] = el; }}
                onClick={() => setActiveQ(i)}
                style={{
                  background: '#fff',
                  borderRadius: 5,
                  padding: '16px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  scrollMarginTop: 120,
                  border: '1px solid transparent',
                }}
              >
                {/* Question header */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 5, flexShrink: 0,
                    background: selected ? '#2EABFE' : isActive ? '#091925' : 'rgba(127,168,196,0.1)',
                    border: `0.5px solid ${selected ? '#2EABFE' : isActive ? '#091925' : '#7FA8C4'}`,
                    color: selected || isActive ? '#fff' : '#5B7384',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    fontFamily: "'Poppins', sans-serif",
                    transition: 'all 0.15s',
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#091925', margin: 0, lineHeight: 1.5, flex: 1, fontFamily: "'Poppins', sans-serif" }}>
                    {q.question}
                  </p>
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingLeft: 48 }}>
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
                          padding: '0 14px', height: 48, borderRadius: 5, cursor: 'pointer',
                          border: `0.5px solid ${isSelected ? '#2EABFE' : '#5B7384'}`,
                          background: isSelected ? 'rgba(46,171,254,0.1)' : 'rgba(91,115,132,0.05)',
                          textAlign: 'left',
                        }}
                      >
                        {/* Key badge */}
                        <span
                          className="opt-key"
                          style={{
                            width: 22, height: 22, borderRadius: 2, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isSelected ? 'rgba(46,171,254,0.1)' : 'rgba(91,115,132,0.1)',
                            border: `0.5px solid ${isSelected ? '#2EABFE' : '#5B7384'}`,
                            color: isSelected ? '#2EABFE' : '#5B7384',
                            fontSize: 12, fontWeight: 700,
                            fontFamily: "'Poppins', sans-serif",
                            transition: 'all 0.12s',
                          }}
                        >
                          {key}
                        </span>
                        <span style={{ fontSize: 13, color: '#091925', fontWeight: 500, lineHeight: 1.4, fontFamily: "'Poppins', sans-serif" }}>
                          {optText.replace(/^[a-dA-D]\.\s*/, '')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Bottom submit */}
          <div style={{ background: '#fff', borderRadius: 5, padding: '20px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>
              <strong style={{ color: answeredCount === totalCount ? '#008000' : '#f97316', fontWeight: 700 }}>
                {answeredCount} / {totalCount}
              </strong> questions answered
              {unanswered > 0 && <span style={{ color: '#f97316', marginLeft: 8 }}>· {unanswered} remaining</span>}
            </div>
            <button
              className="submit-btn"
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#008000', color: '#fff',
                border: '0.5px solid #008000',
                borderRadius: 5, padding: '12px 28px',
                fontSize: 15, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                fontFamily: "'Poppins', sans-serif",
                textTransform: 'capitalize',
              }}
            >
              <svg width="17" height="13" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 6.5L6 11L15.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '0.5px solid #7FA8C4', padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'rgba(9,25,37,0.5)', fontFamily: "'Poppins', sans-serif" }}>
              © Copyright 2026 Real Estate License Services, Inc. — A California School Established 1978. All Rights Reserved.
            </span>
            <span style={{ fontSize: 13, color: 'rgba(9,25,37,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>
              RELSExSys BackOffice v4.1 · TLS 1.3
            </span>
          </div>
        </div>
      </div>

      {/* ── Submit Confirmation Modal ── */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,25,37,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 5, padding: '32px 28px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center', border: '0.5px solid #60C3FF' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: unanswered > 0 ? '#fff7ed' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
              {unanswered > 0 ? '⚠️' : '✅'}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#091925', margin: '0 0 10px', fontFamily: "'Poppins', sans-serif" }}>
              {unanswered > 0 ? 'Unanswered Questions' : 'Ready to Submit?'}
            </h2>
            <p style={{ fontSize: 14, color: '#5B7384', margin: '0 0 8px', lineHeight: 1.6, fontFamily: "'Poppins', sans-serif" }}>
              {unanswered > 0
                ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Unanswered questions will be marked incorrect.`
                : `You've answered all ${totalCount} questions. Once submitted, you cannot change your answers.`
              }
            </p>
            <p style={{ fontSize: 13, color: '#7FA8C4', margin: '0 0 24px', fontFamily: "'JetBrains Mono', monospace" }}>
              Time remaining: <strong style={{ color: timeCritical ? '#ef4444' : '#091925' }}>{formatTime(timeLeft)}</strong>
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ padding: '10px 24px', borderRadius: 5, border: '0.5px solid #7FA8C4', background: '#fff', color: '#5B7384', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
              >
                Continue Exam
              </button>
              <button
                onClick={() => { setShowConfirm(false); submitExam(false); }}
                disabled={submitting}
                style={{ padding: '10px 24px', borderRadius: 5, border: '0.5px solid #008000', background: '#008000', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: "'Poppins', sans-serif" }}
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
