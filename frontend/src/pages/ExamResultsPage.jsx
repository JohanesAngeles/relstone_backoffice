// src/pages/student/ExamResultsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export default function ExamResultsPage() {
  const { sessionId } = useParams();
  const { state }     = useLocation();
  const navigate      = useNavigate();

  const [result,    setResult]    = useState(state?.result   || null);
  const [examName,  setExamName]  = useState(state?.examName || '');
  const [bundleId,  setBundleId]  = useState(state?.bundleId || '');
  const [isTimeout] = useState(state?.isTimeout || false);
  const [loading,   setLoading]   = useState(!state?.result);
  const [filter,    setFilter]    = useState('all'); // 'all' | 'correct' | 'incorrect'

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // If navigated directly (no state), fetch result from session
  useEffect(() => {
    if (!state?.result && sessionId) {
      fetchResult();
    }
  }, [sessionId]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/exam-session/result/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.result);
        setExamName(data.examName);
        setBundleId(data.bundleId);
      }
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>Loading results...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!result) return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Results not found</div>
        <button onClick={() => navigate('/my-courses')} style={{ marginTop: 20, padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Back to My Courses
        </button>
      </div>
    </div>
  );

  const { score, passed, correctCount, totalCount, gradedQuestions, version, attemptNumber } = result;
  const incorrectCount = totalCount - correctCount;

  // Filter questions
  const filtered = (gradedQuestions || []).filter(q => {
    if (filter === 'correct')   return q.isCorrect;
    if (filter === 'incorrect') return !q.isCorrect;
    return true;
  });

  const scoreColor  = passed ? '#16a34a' : '#dc2626';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0.8); opacity:0; } to { transform: scale(1); opacity:1; } }
      `}</style>

      {/* ── Top Nav ── */}
      <div style={{ background: '#0f172a', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#2EABFE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 14 }}>R</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1 }}>RELSTONE</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>Real Estate License Services</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{user?.firstName} {user?.lastName?.[0]}.</span>
        </div>
      </div>

      {/* ── Hero Result Header ── */}
      <div style={{
        background: passed
          ? 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #450a0a 100%)',
        padding: '32px 40px',
        animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ flex: 1 }}>
            {/* Status label */}
            <div style={{ fontSize: 12, fontWeight: 700, color: passed ? '#4ade80' : '#f87171', letterSpacing: '0.08em', marginBottom: 6 }}>
              {passed ? '✓ Congratulations — Exam Complete' : isTimeout ? '⏰ Time Expired — Exam Submitted' : '✗ Exam Complete'}
            </div>

            {/* PASSED / FAILED */}
            <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.02em' }}>
              {passed ? 'PASSED' : 'FAILED'}
            </div>

            {/* Exam name */}
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', marginBottom: 10, fontWeight: 500 }}>
              {examName || bundleId}
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.45)', alignItems: 'center' }}>
              <span style={{ color: '#2EABFE', fontWeight: 600 }}>{version}</span>
              <span>•</span>
              <span>Attempt #{attemptNumber}</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* Failed next steps */}
            {!passed && (
              <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 14px' }}>
                <span style={{ fontSize: 12, color: '#fca5a5' }}>
                  You need <strong>70%</strong> to pass. Your next attempt will use <strong>{version === 'Version A' ? 'Version B' : 'Version A'}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Score circle */}
          <div style={{ flexShrink: 0, animation: 'scaleIn 0.5s ease 0.2s both' }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              border: `5px solid ${scoreColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
              boxShadow: `0 0 30px ${passed ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
            }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{score}%</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginTop: 2 }}>SCORE</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24, animation: 'fadeIn 0.4s ease 0.1s both' }}>
          {[
            { value: correctCount,   label: 'Correct',        color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✓' },
            { value: incorrectCount, label: 'Incorrect',      color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '✗' },
            { value: totalCount,     label: 'Total Questions', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '?' },
            { value: '70%',          label: 'Passing Score',  color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '★' },
          ].map(card => (
            <div key={card.label} style={{
              background: '#fff', border: `1px solid #e2e8f0`,
              borderTop: `3px solid ${card.color}`,
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: card.bg, border: `1px solid ${card.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: card.color, fontWeight: 900, flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 500 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Certificate banner (if passed) ── */}
        {passed && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'fadeIn 0.4s ease 0.15s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🎓</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Your Certificate is Ready!</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  You passed with {score}%. Download or print your completion certificate below.
                </div>
              </div>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
              ⬇ Download Certificate
            </button>
          </div>
        )}

        {/* ── Retake banner (if failed) ── */}
        {!passed && (
          <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'fadeIn 0.4s ease 0.15s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📋</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Don't give up!</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Review the incorrect answers below, then retake using <strong>{version === 'Version A' ? 'Version B' : 'Version A'}</strong>.
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/bundle/${bundleId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              ↺ Go to Retake
            </button>
          </div>
        )}

        {/* ── Email confirmation notice ── */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '11px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#1e40af', animation: 'fadeIn 0.4s ease 0.2s both' }}>
          <span style={{ fontSize: 16 }}>✉</span>
          <span>A confirmation email with your results has been sent to <strong>{user?.email}</strong></span>
        </div>

        {/* ── Answer Review ── */}
        <div style={{ animation: 'fadeIn 0.4s ease 0.25s both' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Answer Review</h2>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { key: 'all',       label: 'All Questions',  count: totalCount },
              { key: 'incorrect', label: 'Incorrect',      count: incorrectCount },
              { key: 'correct',   label: 'Correct',        count: correctCount },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  border: filter === tab.key ? 'none' : '1px solid #e2e8f0',
                  background: filter === tab.key
                    ? tab.key === 'incorrect' ? '#dc2626'
                    : tab.key === 'correct'   ? '#16a34a'
                    : '#0f172a'
                    : '#fff',
                  color: filter === tab.key ? '#fff' : '#374151',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Question review cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((q, i) => {
              const isCorrect = q.isCorrect;
              return (
                <div key={q._id || i} style={{
                  background: '#fff', border: '1px solid #e2e8f0',
                  borderRadius: 14, padding: '20px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  {/* Question header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: isCorrect ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800,
                        color: isCorrect ? '#16a34a' : '#dc2626',
                      }}>
                        {q.questionNumber || (i + 1)}
                      </div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.55, flex: 1 }}>
                        {q.question}
                      </p>
                    </div>

                    {/* Correct / Incorrect badge */}
                    <span style={{
                      flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 100,
                      background: isCorrect ? '#f0fdf4' : '#fef2f2',
                      color:      isCorrect ? '#16a34a' : '#dc2626',
                      border:     `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                    }}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 46 }}>
                    {OPTION_KEYS.map(key => {
                      const optText     = q.options?.[key];
                      if (!optText) return null;
                      const isStudentAns = q.studentAnswer === key;
                      const isCorrectAns = q.correctAnswer === key;

                      let bg     = '#fafafa';
                      let border = '#e2e8f0';
                      let color  = '#374151';
                      let keyBg  = '#e2e8f0';
                      let keyClr = '#374151';

                      if (isCorrectAns) {
                        bg = '#f0fdf4'; border = '#86efac'; color = '#15803d';
                        keyBg = '#16a34a'; keyClr = '#fff';
                      }
                      if (isStudentAns && !isCorrectAns) {
                        bg = '#fef2f2'; border = '#fca5a5'; color = '#b91c1c';
                        keyBg = '#dc2626'; keyClr = '#fff';
                      }

                      return (
                        <div key={key} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 10,
                          background: bg, border: `1.5px solid ${border}`,
                        }}>
                          <span style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: keyBg, color: keyClr, fontSize: 11, fontWeight: 700 }}>
                            {key}
                          </span>
                          <span style={{ fontSize: 13, color, fontWeight: isCorrectAns || isStudentAns ? 600 : 400, flex: 1 }}>
                            {optText}
                          </span>
                          {isCorrectAns && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓ Correct Answer</span>}
                          {isStudentAns && !isCorrectAns && <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, flexShrink: 0 }}>✗ Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Page reference */}
                  {q.pageReference && (
                    <div style={{ marginTop: 12, paddingLeft: 46, fontSize: 11, color: '#94a3b8' }}>
                      📖 Page Reference: {q.pageReference}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom nav ── */}
        <div style={{ marginTop: 28, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/my-courses')}
            style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Go back to <u>My Courses</u>
          </button>
        </div>

      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid #e2e8f0', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', marginTop: 20 }}>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          © Copyright 2026 <a href="#" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Real Estate License Services, Inc.</a> — A California School Established 1978.
        </span>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>RELSExSys · BackOffice · v4.1 · TLS 1.3</span>
      </div>
    </div>
  );
}