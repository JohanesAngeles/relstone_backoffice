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

  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!state?.result && sessionId) fetchResult();
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

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#091925', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(96,195,255,0.2)', borderTopColor: '#2EABFE', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, color: '#7FA8C4', fontFamily: "'Poppins', sans-serif" }}>Loading results...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Not found ── */
  if (!result) return (
    <div style={{ minHeight: '100vh', background: '#091925', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0C2436', border: '0.5px solid #60C3FF', borderRadius: 5, padding: 32, maxWidth: 400, textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Results not found</div>
        <button onClick={() => navigate('/my-courses')} style={{ marginTop: 20, padding: '10px 24px', background: '#2EABFE', color: '#091925', border: 'none', borderRadius: 5, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Back to My Courses
        </button>
      </div>
    </div>
  );

  const { score, passed, correctCount, totalCount, gradedQuestions, version, attemptNumber } = result;
  const incorrectCount = totalCount - correctCount;

  const filtered = (gradedQuestions || []).filter(q => {
    if (filter === 'correct')   return q.isCorrect;
    if (filter === 'incorrect') return !q.isCorrect;
    return true;
  });

  /* ── Initials / display name helpers (identical to ExamPortalPage) ── */
  const getInitials = () => {
    const name = user?.name || user?.fullName || '';
    if (name) {
      const parts = name.trim().split(/\s+/);
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
    }
    return ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')) || (user?.studentId || 'ST').slice(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    const name = user?.name || user?.fullName || '';
    if (name) {
      const parts = name.trim().split(/\s+/);
      return parts.length >= 2 ? `${parts[parts.length - 1]}, ${parts[0][0]}.` : name;
    }
    if (user?.lastName) return `${user.lastName}, ${user?.firstName?.[0] || ''}.`;
    return user?.studentId || 'Student';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column', fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { transform:scale(0.85); opacity:0; } to { transform:scale(1); opacity:1; } }
      `}</style>

      {/* ════════════════════════════════
          HEADER  — mirrors ExamPortalPage exactly
      ════════════════════════════════ */}
      <div style={{ background: '#091925', color: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>

        {/* Row 1 — Logo bar: height 58, padding 0 30px, borderBottom */}
        <div style={{
          background: '#091925',
          padding: '0 30px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 58,
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        }}>
          <img
            src="/src/assets/images/RelsLogo.png"
            alt="Relstone"
            style={{ height: 30, objectFit: 'contain' }}
          />

          {/* User pill — identical to ExamPortalPage */}
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
              fontFamily: "'Poppins', sans-serif", flexShrink: 0,
            }}>
              {getInitials()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>
              {getDisplayName()}
            </span>
          </div>
        </div>

        {/* Row 2 — Gradient info bar: same gradient, padding 16px 30px 10px 30px */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.22) 100%)',
          padding: '16px 30px 10px 30px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: 10 }}>

            {/* Left — status / PASSED|FAILED / exam name / meta */}
            <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>

              {/* Status label — 13px Poppins 500, same as portal sub-labels */}
              <div style={{ fontSize: 13, fontWeight: 500, color: passed ? '#00FF09' : '#f87171', marginBottom: 4 }}>
                {passed
                  ? '✓ Congratulations — Exam Complete'
                  : isTimeout
                    ? '⏰ Time Expired — Exam Submitted'
                    : '✗ Exam Complete'}
              </div>

              {/* PASSED / FAILED — 32px 700, textTransform capitalize */}
              <div style={{
                fontSize: 32, fontWeight: 700, color: '#fff',
                lineHeight: 1.15, marginBottom: 6,
                letterSpacing: '-0.01em', textTransform: 'capitalize',
                fontFamily: "'Poppins', sans-serif",
              }}>
                {passed ? 'Passed' : 'Failed'}
              </div>

              {/* Exam name — 14px 500, same weight as portal exam title sub-line */}
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 6, fontWeight: 500 }}>
                {examName || bundleId}
              </div>

              {/* Meta — JetBrains Mono 14px #7FA8C4, version in #2EABFE */}
              <div style={{ display: 'flex', gap: 8, fontSize: 14, color: '#7FA8C4', alignItems: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
                <span style={{ color: '#2EABFE', fontWeight: 600 }}>{version}</span>
                <span>•</span>
                <span>#{attemptNumber}</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              {/* Failed next-attempt notice */}
              {!passed && (
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 5, padding: '7px 14px' }}>
                  <span style={{ fontSize: 12, color: '#fca5a5' }}>
                    You need <strong>70%</strong> to pass. Your next attempt will use <strong>{version === 'Version A' ? 'Version B' : 'Version A'}</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Score circle — 100×100, matching portal timer-block proportions */}
            <div style={{ flexShrink: 0, animation: 'scaleIn 0.45s ease 0.2s both' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                border: `4px solid ${passed ? '#008000' : '#dc2626'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: '#091925',
                boxShadow: `0 0 24px ${passed ? 'rgba(0,255,9,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>{score}%</div>
                <div style={{ fontSize: 10, color: '#7FA8C4', letterSpacing: '0.1em', marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>SCORE</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          BODY — flex col, gap 14, padding 24px 16px (ExamPortalPage body)
      ════════════════════════════════ */}
      <div style={{
        flex: 1,
        maxWidth: 1400, width: '100%', margin: '0 auto',
        padding: '24px 16px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, animation: 'fadeIn 0.35s ease both' }}>
          {[
            { value: correctCount,   label: 'Correct',         accent: '#008000', iconBg: 'rgba(0,128,0,0.1)',    iconBorder: '#008000', icon: '✓' },
            { value: incorrectCount, label: 'Incorrect',       accent: '#EF4444', iconBg: 'rgba(239,68,68,0.1)', iconBorder: '#EF4444', icon: '✗' },
            { value: totalCount,     label: 'Total Questions', accent: '#2EABFE', iconBg: 'rgba(46,171,254,0.1)',iconBorder: '#2EABFE', icon: '?' },
            { value: '70%',          label: 'Passing Score',   accent: '#F59E0B', iconBg: 'rgba(245,158,11,0.1)',iconBorder: '#F59E0B', icon: '★' },
          ].map(card => (
            <div key={card.label} style={{
              background: '#fff',
              borderTop: `3px solid ${card.accent}`,
              borderLeft: '0.5px solid #e2e8f0',
              borderRight: '0.5px solid #e2e8f0',
              borderBottom: '0.5px solid #e2e8f0',
              borderRadius: 5,
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              {/* Icon box */}
              <div style={{
                width: 44, height: 44, borderRadius: 5, flexShrink: 0,
                background: card.iconBg,
                border: `0.5px solid ${card.iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: card.accent, fontWeight: 900,
              }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 600, color: '#091925', lineHeight: 1.1, fontFamily: "'Poppins', sans-serif" }}>{card.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(9,25,37,0.7)', marginTop: 3, fontWeight: 500 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Certificate banner (passed) ── */}
        {passed && (
          <div style={{
            background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 5,
            padding: '0 16px', height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: 'fadeIn 0.35s ease 0.05s both',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'rgba(0,128,0,0.1)', border: '0.5px solid #008000', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎓</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#091925', fontFamily: "'Poppins', sans-serif" }}>Your Certificate is Ready!</div>
                <div style={{ fontSize: 12, color: 'rgba(9,25,37,0.7)', marginTop: 2, fontWeight: 500 }}>
                  You passed with {score}%. Download or print your completion certificate below.
                </div>
              </div>
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#008000', color: '#fff',
              border: '0.5px solid #008000', borderRadius: 5,
              padding: '9px 20px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
              fontFamily: "'Poppins', sans-serif",
            }}>
              ⬇ Download Certificate
            </button>
          </div>
        )}

        {/* ── Retake banner (failed) ── */}
        {!passed && (
          <div style={{
            background: '#fff', border: '0.5px solid #fecaca', borderRadius: 5,
            padding: '0 16px', height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: 'fadeIn 0.35s ease 0.05s both',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'rgba(239,68,68,0.1)', border: '0.5px solid #EF4444', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📋</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#091925', fontFamily: "'Poppins', sans-serif" }}>Don't give up!</div>
                <div style={{ fontSize: 12, color: 'rgba(9,25,37,0.7)', marginTop: 2, fontWeight: 500 }}>
                  Review the incorrect answers below, then retake using <strong>{version === 'Version A' ? 'Version B' : 'Version A'}</strong>.
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/bundle/${bundleId}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#7c3aed', color: '#fff',
                border: '0.5px solid #7c3aed', borderRadius: 5,
                padding: '9px 20px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              ↺ Go to Retake
            </button>
          </div>
        )}

        {/* ── Email notice — height 50, matching Figma strip ── */}
        <div style={{
          background: 'rgba(26,122,184,0.1)', border: '0.5px solid #1A7AB8',
          borderRadius: 5, height: 50,
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px',
          animation: 'fadeIn 0.35s ease 0.1s both',
        }}>
          <span style={{ fontSize: 16, color: '#1A7AB8' }}>✉</span>
          <span style={{ fontSize: 13, color: '#1A7AB8', fontWeight: 500, fontFamily: "'Poppins', sans-serif" }}>
            A confirmation email with your results has been sent to <strong>{user?.email}</strong>
          </span>
        </div>

        {/* ── Answer Review ── */}
        <div style={{ animation: 'fadeIn 0.35s ease 0.15s both' }}>

          {/* Section header + horizontal divider rule */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <h2 style={{ fontSize: 22, fontWeight: 400, color: '#091925', margin: 0, whiteSpace: 'nowrap', fontFamily: "'Poppins', sans-serif" }}>
              Answer Review
            </h2>
            <div style={{ flex: 1, height: 0, borderTop: '0.5px solid #7FA8C4' }} />
          </div>

          {/* Filter tabs — same shape/palette as ExamPortalPage nav-btn */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { key: 'all',       label: 'All Questions', count: totalCount },
              { key: 'incorrect', label: 'Incorrect',     count: incorrectCount },
              { key: 'correct',   label: 'Correct',       count: correctCount },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '9px 18px', borderRadius: 5, cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, border: 'none',
                  background: filter === tab.key ? '#2EABFE' : 'rgba(127,168,196,0.1)',
                  outline: filter === tab.key ? 'none' : '0.5px solid #7FA8C4',
                  color: filter === tab.key ? '#091925' : '#7FA8C4',
                  transition: 'all 0.12s',
                  fontFamily: "'Poppins', sans-serif",
                  textTransform: 'capitalize',
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Question cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((q, i) => {
              const isCorrect = q.isCorrect;
              return (
                <div key={q._id || i} style={{
                  background: '#fff',
                  border: '0.5px solid #e2e8f0',  // same as ExamPortalPage question card border
                  borderRadius: 5,
                  padding: '16px 20px',             // same card padding as ExamPortalPage
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  {/* Question row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
                      {/* Number badge — 50×50 Figma spec, 5px radius, same as ExamPortalPage question badge */}
                      <div style={{
                        width: 50, height: 50, borderRadius: 5, flexShrink: 0,
                        background: isCorrect ? 'rgba(0,128,0,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `0.5px solid ${isCorrect ? '#008000' : '#EF4444'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700,
                        color: isCorrect ? '#008000' : '#EF4444',
                        fontFamily: "'Poppins', sans-serif",
                      }}>
                        {q.questionNumber || (i + 1)}
                      </div>
                      {/* Question text — 14px 500 same as ExamPortalPage */}
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#091925', margin: 0, lineHeight: 1.5, flex: 1, fontFamily: "'Poppins', sans-serif" }}>
                        {q.question}
                      </p>
                    </div>

                    {/* Correct / Incorrect pill */}
                    <span style={{
                      flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 14, fontWeight: 700, padding: '8px 14px', borderRadius: 5,
                      background: isCorrect ? 'rgba(0,128,0,0.1)' : 'rgba(239,68,68,0.1)',
                      color:      isCorrect ? '#008000' : '#EF4444',
                      border:     `0.5px solid ${isCorrect ? '#008000' : '#EF4444'}`,
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  {/* Options — height 48, same as ExamPortalPage opt-btn */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingLeft: 62 }}>
                    {OPTION_KEYS.map(key => {
                      const optText      = q.options?.[key];
                      if (!optText) return null;
                      const isStudentAns = q.studentAnswer === key;
                      const isCorrectAns = q.correctAnswer === key;

                      let bg     = 'rgba(91,115,132,0.05)';
                      let border = '0.5px solid #5B7384';
                      let keyBg  = 'rgba(91,115,132,0.1)';
                      let keyClr = '#5B7384';

                      if (isCorrectAns) {
                        bg = 'rgba(0,128,0,0.1)'; border = '0.5px solid #008000';
                        keyBg = 'rgba(0,128,0,0.1)'; keyClr = '#008000';
                      }
                      if (isStudentAns && !isCorrectAns) {
                        bg = 'rgba(239,68,68,0.1)'; border = '0.5px solid #EF4444';
                        keyBg = 'rgba(239,68,68,0.1)'; keyClr = '#EF4444';
                      }

                      return (
                        <div key={key} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '0 14px', height: 48, borderRadius: 5,
                          background: bg, border,
                        }}>
                          {/* Key badge — 24×24 matching Figma */}
                          <span style={{
                            width: 24, height: 24, borderRadius: 2, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: keyBg,
                            border: `0.5px solid ${isCorrectAns ? '#008000' : isStudentAns ? '#EF4444' : '#5B7384'}`,
                            color: keyClr,
                            fontSize: 14, fontWeight: 700,
                            fontFamily: "'Poppins', sans-serif",
                          }}>
                            {key}
                          </span>
                          <span style={{ fontSize: 13, color: '#091925', fontWeight: 500, flex: 1, fontFamily: "'Poppins', sans-serif" }}>
                            {optText.replace(/^[a-dA-D]\.\s*/, '')}
                          </span>
                          {isCorrectAns && (
                            <span style={{ fontSize: 12, color: '#008000', fontWeight: 700, flexShrink: 0 }}>✓ Correct Answer</span>
                          )}
                          {isStudentAns && !isCorrectAns && (
                            <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 700, flexShrink: 0 }}>✗ Your Answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Page reference */}
                  {q.pageReference && (
                    <div style={{ marginTop: 10, paddingLeft: 62, fontSize: 11, color: '#7FA8C4', fontFamily: "'JetBrains Mono', monospace" }}>
                      📖 Page Reference: {q.pageReference}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom nav — same blue strip as Figma ── */}
        <div style={{
          background: 'rgba(46,171,254,0.1)', border: '0.5px solid #2EABFE',
          borderRadius: 5, height: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <button
            onClick={() => navigate('/my-courses')}
            style={{
              fontSize: 14, fontWeight: 700, color: '#2EABFE',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            ← Go back to My Courses
          </button>
        </div>

      </div>

      {/* ── Footer — identical to ExamPortalPage footer ── */}
      <div style={{ borderTop: '0.5px solid #7FA8C4', padding: '10px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'rgba(9,25,37,0.5)', fontFamily: "'Poppins', sans-serif" }}>
          © Copyright 2026 Real Estate License Services, Inc. — A California School Established 1978. All Rights Reserved.
        </span>
        <span style={{ fontSize: 13, color: 'rgba(9,25,37,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>
          RELSExSys BackOffice v4.1 · TLS 1.3
        </span>
      </div>
    </div>
  );
}
