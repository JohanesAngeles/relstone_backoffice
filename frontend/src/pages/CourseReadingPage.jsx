// src/pages/CourseReadingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate }       from 'react-router-dom';
import DashboardLayout                  from '../components/common/MycoursesLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 16, fill = 'none', stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const ICONS = {
  check:    'M20 6L9 17l-5-5',
  lock:     'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  clock:    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v6l4 2',
  book:     'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  chevronR: 'M9 18l6-6-6-6',
  chevronL: 'M15 18l-6-6 6-6',
  play:     'M5 3l14 9-14 9V3z',
  alert:    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  refresh:  'M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15',
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const token  = () => localStorage.getItem('token');
const getUser = () => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } };

function formatCountdown(ms) {
  if (ms <= 0) return 'Unlocked';
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

// ── Quiz Component ────────────────────────────────────────────────────────────
function SectionQuiz({ questions, sectionNumber, onComplete, alreadyDone }) {
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results,   setResults]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [retrying,  setRetrying]  = useState(false);

  const user      = getUser();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { bundleId, examName } = useParams ? useParams() : {};

  // Reset when section changes
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setResults(null);
    setRetrying(false);
  }, [sectionNumber]);

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const hasMistakes = results?.some(r => !r.isCorrect);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/course-content/student/${encodeURIComponent(examName)}/submit-quiz`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          studentId:     user.studentId,
          bundleId,
          sectionNumber,
          answers: questions.map((_, i) => answers[i]),
        }),
      });
      const data = await res.json();
      setResults(data.results);
      setSubmitted(true);
      if (!data.results?.some(r => !r.isCorrect)) {
        // All correct — notify parent after short delay
        setTimeout(() => onComplete(data), 800);
      }
    } catch {
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    // Clear only wrong answers
    const newAnswers = { ...answers };
    results?.forEach((r, i) => { if (!r.isCorrect) delete newAnswers[i]; });
    setAnswers(newAnswers);
    setSubmitted(false);
    setResults(null);
    setRetrying(true);
  };

  if (alreadyDone) {
    return (
      <div style={{ padding: '20px 24px', background: '#f0fdf4', borderTop: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon path={ICONS.check} size={16} stroke="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', fontFamily: "'Poppins', sans-serif" }}>Quiz Completed</div>
          <div style={{ fontSize: 11, color: '#16a34a', fontFamily: "'Poppins', sans-serif" }}>You've already passed this section's quiz.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderTop: '2px solid #e0f2fe', background: '#f8fbff' }}>
      {/* Quiz header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2EABFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon path={ICONS.star} size={14} stroke="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
            Section {sectionNumber} Quiz
          </div>
          <div style={{ fontSize: 11, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>
            {questions.length} True/False question{questions.length !== 1 ? 's' : ''} — answer all to proceed
          </div>
        </div>
        {retrying && (
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#f97316', background: '#fff7ed', border: '1px solid #fed7aa', padding: '3px 10px', borderRadius: 100, fontFamily: "'Poppins', sans-serif" }}>
            Retry — fix incorrect answers
          </span>
        )}
      </div>

      {/* Questions */}
      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.map((q, i) => {
          const ans       = answers[i];
          const result    = results?.[i];
          const isCorrect = result?.isCorrect;
          const isWrong   = submitted && result && !isCorrect;
          const isDone    = submitted && isCorrect;

          return (
            <div key={i} style={{
              background: isDone ? '#f0fdf4' : isWrong ? '#fef2f2' : '#fff',
              border: `1.5px solid ${isDone ? '#86efac' : isWrong ? '#fca5a5' : '#e2e8f0'}`,
              borderRadius: 10, padding: '14px 16px',
              transition: 'all 0.2s',
            }}>
              {/* Question text */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                  background: isDone ? '#dcfce7' : isWrong ? '#fee2e2' : '#f1f5f9',
                  color: isDone ? '#16a34a' : isWrong ? '#dc2626' : '#64748b',
                  fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Poppins', sans-serif",
                }}>
                  {isDone ? '✓' : isWrong ? '✗' : i + 1}
                </span>
                <p style={{ margin: 0, fontSize: 13, color: '#0f172a', lineHeight: 1.6, fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
                  {q.question}
                </p>
              </div>

              {/* True / False buttons */}
              {(!submitted || isWrong) && (
                <div style={{ display: 'flex', gap: 8, paddingLeft: 32 }}>
                  {[true, false].map(val => {
                    const isSelected = ans === val;
                    const label      = val ? 'TRUE' : 'FALSE';
                    return (
                      <button
                        key={String(val)}
                        onClick={() => !submitted && setAnswers(p => ({ ...p, [i]: val }))}
                        disabled={submitted && !isWrong}
                        style={{
                          padding: '7px 20px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                          cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
                          transition: 'all 0.15s',
                          background: isSelected
                            ? (val ? '#dcfce7' : '#fee2e2')
                            : '#f8fafc',
                          color: isSelected
                            ? (val ? '#15803d' : '#dc2626')
                            : '#94a3b8',
                          border: isSelected
                            ? `2px solid ${val ? '#16a34a' : '#dc2626'}`
                            : '2px solid #e2e8f0',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Wrong answer feedback */}
              {isWrong && result?.pageRef && (
                <div style={{ marginTop: 10, paddingLeft: 32, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon path={ICONS.alert} size={12} stroke="#f97316" />
                  <span style={{ fontSize: 11, color: '#92400e', fontFamily: "'Poppins', sans-serif" }}>
                    Review <strong>{result.pageRef}</strong> and try again.
                  </span>
                </div>
              )}
              {isWrong && !result?.pageRef && (
                <div style={{ marginTop: 10, paddingLeft: 32, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon path={ICONS.alert} size={12} stroke="#f97316" />
                  <span style={{ fontSize: 11, color: '#92400e', fontFamily: "'Poppins', sans-serif" }}>
                    Incorrect — please review the section and try again.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Retry footer */}
      <div style={{ padding: '12px 24px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            style={{
              padding: '10px 28px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: allAnswered ? '#2EABFE' : '#e2e8f0',
              color: allAnswered ? '#fff' : '#94a3b8',
              border: 'none', cursor: allAnswered ? 'pointer' : 'not-allowed',
              fontFamily: "'Poppins', sans-serif",
              opacity: submitting ? 0.7 : 1,
              transition: 'all 0.15s',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        ) : hasMistakes ? (
          <button
            onClick={handleRetry}
            style={{
              padding: '10px 28px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif",
              display: 'flex', alignItems: 'center', gap: 7,
            }}
          >
            <Icon path={ICONS.refresh} size={13} /> Fix & Resubmit
          </button>
        ) : null}
        {!allAnswered && !submitted && (
          <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Poppins', sans-serif" }}>
            Answer all questions to submit
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CourseReadingPage() {
  const { bundleId, examName } = useParams();
  const navigate = useNavigate();

  const [courseData,    setCourseData]    = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [activeSection, setActiveSection] = useState(0);  // index into sections array
  const [countdown,     setCountdown]     = useState(null);
  const contentRef = useRef(null);

  const user      = getUser();
  const studentId = user?.studentId || '';

  useEffect(() => {
    if (!studentId) { setError('Not logged in.'); setLoading(false); return; }
    fetchCourse();
  }, [studentId, examName]);

  // Countdown timer for exam unlock
  useEffect(() => {
    if (!courseData?.availableAt) return;
    const tick = () => {
      const ms = new Date(courseData.availableAt) - new Date();
      setCountdown(ms);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [courseData?.availableAt]);

  const fetchCourse = async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(
        `${API}/course-content/student/${encodeURIComponent(examName)}?studentId=${studentId}&bundleId=${bundleId}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load course');
      setCourseData(data);

      // Auto-advance to first incomplete section
      const firstIncomplete = data.sections?.findIndex(s => !s.quizCompleted);
      setActiveSection(firstIncomplete === -1 ? 0 : firstIncomplete);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (sectionNumber) => {
    try {
      await fetch(`${API}/course-content/student/${encodeURIComponent(examName)}/mark-read`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ studentId, bundleId, sectionNumber }),
      });
    } catch { /* silent */ }
  };

  const handleQuizComplete = () => {
    // Refresh course data to get updated progress + availableAt
    fetchCourse();
  };

  const handleSectionChange = (idx) => {
    const section = courseData?.sections?.[idx];
    if (!section) return;
    // Can only navigate to completed sections or the next unlocked one
    const prevDone = idx === 0 || courseData.sections[idx - 1]?.quizCompleted;
    if (!prevDone) return;
    setActiveSection(idx);
    // Mark as read when they open it
    if (!section.isRead) markRead(section.sectionNumber);
    // Scroll content to top
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  // ── Loading ──
  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#2EABFE', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: "'Poppins', sans-serif" }}>Loading course content...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 20, color: '#b91c1c', fontSize: 13, fontFamily: "'Poppins', sans-serif" }}>
        {error}
      </div>
    </DashboardLayout>
  );

  const sections       = courseData?.sections || [];
  const allQuizzesDone = courseData?.allQuizzesDone;
  const examUnlocked   = courseData?.examUnlocked;
  const availableAt    = courseData?.availableAt;
  const currentSection = sections[activeSection];
  const completedCount = sections.filter(s => s.quizCompleted).length;

  const canAccessSection = (idx) => {
    if (idx === 0) return true;
    return sections[idx - 1]?.quizCompleted;
  };

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .course-content h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 14px; font-family: 'Poppins', sans-serif; }
        .course-content h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 24px 0 10px; font-family: 'Poppins', sans-serif; }
        .course-content h3 { font-size: 14px; font-weight: 600; color: #334155; margin: 18px 0 8px; font-family: 'Poppins', sans-serif; }
        .course-content p  { font-size: 14px; color: #374151; line-height: 1.8; margin: 0 0 14px; font-family: 'Poppins', sans-serif; }
        .course-content ul, .course-content ol { padding-left: 22px; margin: 0 0 14px; }
        .course-content li { font-size: 14px; color: #374151; line-height: 1.7; margin-bottom: 6px; font-family: 'Poppins', sans-serif; }
        .course-content strong { color: #0f172a; font-weight: 700; }
        .course-content em { color: #475569; }
        .course-content blockquote { border-left: 3px solid #2EABFE; padding-left: 14px; color: #475569; margin: 14px 0; }
        .section-nav-btn:hover { background: rgba(46,171,254,0.08) !important; }
      `}</style>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginBottom: 20, fontFamily: "'Poppins', sans-serif" }}>
        <span style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/my-courses')}>My Courses</span>
        <span>›</span>
        <span style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate(`/bundle/${bundleId}`)}>{bundleId}</span>
        <span>›</span>
        <span style={{ color: '#374151', fontWeight: 600 }}>{decodeURIComponent(examName)}</span>
      </div>

      {/* ── Top header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #091925 0%, #0f2d45 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 20,
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(46,171,254,0.07)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#2EABFE', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Poppins', sans-serif" }}>
              Course Reading
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', fontFamily: "'Poppins', sans-serif" }}>
              {decodeURIComponent(examName)}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon path={ICONS.book} size={12} /> {sections.length} sections
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon path={ICONS.check} size={12} /> {completedCount} / {sections.length} completed
              </span>
            </div>
          </div>

          {/* Exam unlock status */}
          <div style={{ flexShrink: 0 }}>
            {examUnlocked ? (
              <button
                onClick={() => navigate(`/exam/${bundleId}/${encodeURIComponent(examName)}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: '0 4px 16px rgba(22,163,74,0.4)',
                  animation: 'fadeIn 0.4s ease',
                }}
              >
                <Icon path={ICONS.play} size={13} /> Take Exam Now
              </button>
            ) : allQuizzesDone && availableAt ? (
              <div style={{
                background: 'rgba(46,171,254,0.12)', border: '1px solid rgba(46,171,254,0.3)',
                borderRadius: 10, padding: '10px 18px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: '#2EABFE', fontWeight: 600, letterSpacing: '0.08em', fontFamily: "'Poppins', sans-serif", marginBottom: 4 }}>
                  EXAM UNLOCKS IN
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}>
                  {formatCountdown(countdown)}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 18px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.08em', fontFamily: "'Poppins', sans-serif", marginBottom: 4 }}>
                  EXAM STATUS
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: "'Poppins', sans-serif" }}>
                  Complete all quizzes to unlock
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 18, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
          <div style={{
            height: '100%', borderRadius: 99,
            width: `${sections.length > 0 ? (completedCount / sections.length) * 100 : 0}%`,
            background: 'linear-gradient(90deg, #2EABFE, #00d4ff)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* ── Section tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {sections.map((s, idx) => {
          const accessible = canAccessSection(idx);
          const isActive   = activeSection === idx;
          const isDone     = s.quizCompleted;

          return (
            <button
              key={s.sectionNumber}
              className="section-nav-btn"
              onClick={() => handleSectionChange(idx)}
              disabled={!accessible}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                fontFamily: "'Poppins', sans-serif", cursor: accessible ? 'pointer' : 'not-allowed',
                border: isActive ? '2px solid #2EABFE' : `2px solid ${isDone ? '#86efac' : '#e2e8f0'}`,
                background: isActive ? 'rgba(46,171,254,0.08)' : isDone ? '#f0fdf4' : '#fff',
                color: isActive ? '#2EABFE' : isDone ? '#16a34a' : accessible ? '#374151' : '#cbd5e1',
                opacity: accessible ? 1 : 0.5,
                transition: 'all 0.15s',
              }}
            >
              {isDone ? (
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon path={ICONS.check} size={10} stroke="#fff" />
                </span>
              ) : !accessible ? (
                <Icon path={ICONS.lock} size={13} />
              ) : (
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: isActive ? '#2EABFE' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: isActive ? '#fff' : '#64748b', flexShrink: 0 }}>
                  {idx + 1}
                </span>
              )}
              {s.title || `Section ${s.sectionNumber}`}
              {s.pageRange && (
                <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>{s.pageRange}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Section content card ── */}
      {currentSection && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>

          {/* Section header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: currentSection.quizCompleted ? '#dcfce7' : 'rgba(46,171,254,0.1)',
              border: `1.5px solid ${currentSection.quizCompleted ? '#86efac' : '#2EABFE'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: currentSection.quizCompleted ? '#16a34a' : '#2EABFE',
            }}>
              {currentSection.quizCompleted
                ? <Icon path={ICONS.check} size={16} />
                : <Icon path={ICONS.book} size={15} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#2EABFE', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'Poppins', sans-serif" }}>
                Section {currentSection.sectionNumber}
                {currentSection.pageRange && ` · ${currentSection.pageRange}`}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
                {currentSection.title}
              </div>
            </div>
            {currentSection.quizCompleted && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontFamily: "'Poppins', sans-serif" }}>
                ✓ Complete
              </span>
            )}
          </div>

          {/* Reading content */}
          <div
            ref={contentRef}
            style={{ padding: '24px 28px', maxHeight: 520, overflowY: 'auto' }}
          >
            {currentSection.content ? (
              <div
                className="course-content"
                dangerouslySetInnerHTML={{ __html: currentSection.content }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <Icon path={ICONS.book} size={36} />
                <p style={{ marginTop: 12, fontSize: 13, fontFamily: "'Poppins', sans-serif" }}>Content not yet available for this section.</p>
              </div>
            )}
          </div>

          {/* Quiz */}
          {currentSection.quizQuestions?.length > 0 && (
            <SectionQuiz
              questions={currentSection.quizQuestions}
              sectionNumber={currentSection.sectionNumber}
              onComplete={handleQuizComplete}
              alreadyDone={currentSection.quizCompleted}
            />
          )}
        </div>
      )}

      {/* ── All done banner ── */}
      {allQuizzesDone && (
        <div style={{
          marginTop: 20, padding: '20px 24px',
          background: examUnlocked ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          border: `1px solid ${examUnlocked ? '#86efac' : '#bfdbfe'}`,
          borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: examUnlocked ? '#16a34a' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon path={examUnlocked ? ICONS.play : ICONS.clock} size={20} stroke="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
                {examUnlocked ? '🎉 Exam is now unlocked!' : 'All quizzes complete!'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>
                {examUnlocked
                  ? 'You can now take the exam whenever you\'re ready.'
                  : `Exam unlocks in ${formatCountdown(countdown)}. Come back when it's time.`}
              </div>
            </div>
          </div>
          {examUnlocked && (
            <button
              onClick={() => navigate(`/exam/${bundleId}/${encodeURIComponent(examName)}`)}
              style={{
                padding: '12px 28px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
              }}
            >
              <Icon path={ICONS.play} size={13} /> Take Exam
            </button>
          )}
        </div>
      )}

    </DashboardLayout>
  );
}