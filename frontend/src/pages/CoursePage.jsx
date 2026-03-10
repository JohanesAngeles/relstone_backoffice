// src/pages/CoursePage.jsx
// Coursera-style course reader — student reads sections + completes quizzes
// before the final exam unlocks.
//
// Route: /course/:bundleId/:examName
// Add to App.jsx:
//   import CoursePage from './pages/CoursePage';
//   <Route path="/course/:bundleId/:examName" element={<CoursePage />} />
//
// In BundleOverviewPage, replace the Start Exam button navigation with:
//   navigate(`/course/${bundleId}/${encodeURIComponent(examName)}`)

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate }       from 'react-router-dom';
import DashboardLayout                  from '../components/common/MycoursesLayout';
import {
  FaCheckCircle, FaLock, FaChevronRight, FaChevronLeft,
  FaBookOpen, FaClock, FaCheck, FaTimes,
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem('token');

const formatCountdown = (date) => {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h/24)}d ${h%24}h`;
  if (h > 0)  return `${h}h ${m}m`;
  return `${m}m`;
};

// ── CoursePage ────────────────────────────────────────────────────────────────
export default function CoursePage() {
  const { bundleId, examName } = useParams();
  const navigate               = useNavigate();
  const user                   = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId              = user?.studentId || '';

  const [course,          setCourse]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [activeSection,   setActiveSection]   = useState(0); // index into sections[]
  const [quizMode,        setQuizMode]        = useState(false);
  const [quizAnswers,     setQuizAnswers]      = useState({});
  const [quizResult,      setQuizResult]      = useState(null); // null | { results[], allQuizzesDone, examAvailableAt }
  const [submittingQuiz,  setSubmittingQuiz]  = useState(false);
  const [markingRead,     setMarkingRead]     = useState(false);
  const contentRef                            = useRef(null);

  // ── Fetch course content ──────────────────────────────────────────────────
  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res  = await fetch(
        `${API}/course-content/student/${encodeURIComponent(examName)}?studentId=${studentId}&bundleId=${bundleId}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to load course.'); return; }
      setCourse(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourse(); }, [examName, bundleId]);

  // Reset quiz state when switching sections
  useEffect(() => {
    setQuizMode(false);
    setQuizAnswers({});
    setQuizResult(null);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  // ── Mark section as read ──────────────────────────────────────────────────
  const markRead = async (sectionNumber) => {
    if (markingRead) return;
    setMarkingRead(true);
    try {
      await fetch(`${API}/course-content/student/${encodeURIComponent(examName)}/mark-read`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ studentId, bundleId, sectionNumber }),
      });
      fetchCourse(); // refresh progress
    } catch { /* empty */ }
    setMarkingRead(false);
  };

  // ── Submit quiz ───────────────────────────────────────────────────────────
  const submitQuiz = async () => {
    const section = course.sections[activeSection];
    setSubmittingQuiz(true);
    try {
      const res  = await fetch(`${API}/course-content/student/${encodeURIComponent(examName)}/submit-quiz`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({
          studentId,
          bundleId,
          sectionNumber: section.sectionNumber,
          answers: quizAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || 'Failed to submit quiz.'); return; }
      setQuizResult(data);
      fetchCourse(); // refresh progress
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const sections         = course?.sections || [];
  const currentSection   = sections[activeSection];
  const totalSections    = sections.length;
  const completedSections= sections.filter(s => s.quizCompleted).length;
  const allDone          = completedSections === totalSections && totalSections > 0;
  const examUnlocked     = course?.examUnlocked;
  const availableAt      = course?.availableAt;
  const countdown        = formatCountdown(availableAt);
  const canStartExam     = allDone && examUnlocked;

  const sectionUnlocked = (idx) => {
    if (idx === 0) return true;
    return sections[idx - 1]?.quizCompleted;
  };

  const isLastSection = activeSection === totalSections - 1;
  const quizAnswered  = currentSection
    ? Object.keys(quizAnswers).length === (currentSection.quizQuestions?.length || 0)
    : false;

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <DashboardLayout>
      <div style={S.centered}>
        <div style={S.spinner} />
        <p style={{ color: '#94a3b8', marginTop: 12, fontFamily: "'Poppins', sans-serif" }}>Loading course...</p>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div style={{ ...S.centered, flexDirection: 'column', gap: 12 }}>
        <FaTimes style={{ fontSize: 32, color: '#ef4444' }} />
        <p style={{ color: '#ef4444', fontFamily: "'Poppins', sans-serif" }}>{error}</p>
        <button style={S.backBtn} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </DashboardLayout>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .course-content h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 14px; }
        .course-content h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 20px 0 10px; }
        .course-content h3 { font-size: 14px; font-weight: 700; color: #1e40af; margin: 16px 0 8px; }
        .course-content p  { font-size: 14px; color: #374151; line-height: 1.85; margin: 0 0 14px; }
        .course-content ul, .course-content ol { padding-left: 22px; margin: 0 0 14px; }
        .course-content li { font-size: 14px; color: #374151; line-height: 1.8; margin-bottom: 4px; }
        .course-content blockquote { border-left: 3px solid #2EABFE; padding: 8px 16px; background: #f0f9ff; border-radius: 0 8px 8px 0; margin: 14px 0; color: #0369a1; font-size: 13px; }
        .course-content strong { color: #0f172a; }
      `}</style>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginBottom: 20, fontFamily: "'Poppins', sans-serif" }}>
        <span style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/my-courses')}>My Courses</span>
        <span>›</span>
        <span style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate(-1)}>{bundleId}</span>
        <span>›</span>
        <span style={{ color: '#374151', fontWeight: 600 }}>{course?.courseName || examName}</span>
      </div>

      {/* ── Main layout: sidebar + content ── */}
      <div style={S.layout}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={S.sidebar}>

          {/* Course title */}
          <div style={S.sideHead}>
            <FaBookOpen style={{ color: '#2EABFE', fontSize: 16, flexShrink: 0 }} />
            <div>
              <div style={S.sideCourseTitle}>{course?.courseName || examName}</div>
              <div style={S.sideProgress}>{completedSections}/{totalSections} sections done</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={S.sideProgressBar}>
            <div style={{ ...S.sideProgressFill, width: `${totalSections > 0 ? (completedSections/totalSections)*100 : 0}%` }} />
          </div>

          {/* Section list */}
          <nav style={S.sideNav}>
            {sections.map((sec, idx) => {
              const unlocked  = sectionUnlocked(idx);
              const isActive  = activeSection === idx;
              const isDone    = sec.quizCompleted;
              return (
                <button
                  key={sec.sectionNumber}
                  disabled={!unlocked}
                  onClick={() => { if (unlocked) setActiveSection(idx); }}
                  style={{
                    ...S.sideItem,
                    background:   isActive ? '#eff6ff' : 'transparent',
                    borderLeft:   isActive ? '3px solid #2563eb' : '3px solid transparent',
                    color:        !unlocked ? '#cbd5e1' : isActive ? '#2563eb' : '#374151',
                    cursor:       !unlocked ? 'not-allowed' : 'pointer',
                    opacity:      !unlocked ? 0.5 : 1,
                  }}
                >
                  <div style={{ ...S.sideItemIcon, background: isDone ? '#f0fdf4' : isActive ? '#dbeafe' : '#f1f5f9' }}>
                    {isDone
                      ? <FaCheckCircle style={{ color: '#16a34a', fontSize: 13 }} />
                      : !unlocked
                      ? <FaLock style={{ color: '#cbd5e1', fontSize: 11 }} />
                      : <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#2563eb' : '#94a3b8' }}>{idx + 1}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sec.title || `Section ${sec.sectionNumber}`}
                    </div>
                    {sec.pageRange && (
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{sec.pageRange}</div>
                    )}
                  </div>
                  {isDone && <FaCheckCircle style={{ color: '#16a34a', fontSize: 11, flexShrink: 0 }} />}
                </button>
              );
            })}

            {/* Final exam item */}
            <div style={{
              ...S.sideItem,
              background:  canStartExam ? '#f0fdf4' : '#f8fafc',
              borderLeft:  canStartExam ? '3px solid #16a34a' : '3px solid transparent',
              color:        canStartExam ? '#15803d' : '#94a3b8',
              cursor:       'default',
              opacity:      1,
              marginTop: 8,
              borderTop: '1px solid #e5e7eb',
              paddingTop: 12,
            }}>
              <div style={{ ...S.sideItemIcon, background: canStartExam ? '#f0fdf4' : '#f1f5f9' }}>
                {canStartExam
                  ? <FaCheckCircle style={{ color: '#16a34a', fontSize: 13 }} />
                  : <FaLock style={{ color: '#cbd5e1', fontSize: 11 }} />
                }
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Final Exam</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                  {canStartExam ? 'Ready!' : allDone && countdown ? `Unlocks in ${countdown}` : 'Complete all sections first'}
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* ── CONTENT PANEL ── */}
        <div style={S.contentPanel} ref={contentRef}>

          {/* Section header */}
          <div style={S.contentHeader}>
            <div>
              <div style={S.contentTag}>
                {currentSection?.pageRange || `Section ${currentSection?.sectionNumber}`}
              </div>
              <h1 style={S.contentTitle}>
                {currentSection?.title || `Section ${currentSection?.sectionNumber}`}
              </h1>
            </div>
            {currentSection?.quizCompleted && (
              <span style={S.doneBadge}><FaCheckCircle style={{ fontSize: 12 }} /> Completed</span>
            )}
          </div>

          {/* ── READING MODE ── */}
          {!quizMode && (
            <>
              {/* Reading content */}
              <div
                className="course-content"
                style={S.contentBody}
                dangerouslySetInnerHTML={{ __html: currentSection?.content || '<p>Content coming soon.</p>' }}
              />

              {/* Bottom action */}
              <div style={S.contentFooter}>
                <button
                  style={S.prevBtn}
                  disabled={activeSection === 0}
                  onClick={() => setActiveSection(p => p - 1)}
                >
                  <FaChevronLeft style={{ fontSize: 11 }} /> Previous
                </button>

                {currentSection?.quizCompleted ? (
                  // Already done — go next or start exam
                  isLastSection ? (
                    canStartExam ? (
                      <button
                        style={S.examBtn}
                        onClick={() => navigate(`/exam/${bundleId}/${encodeURIComponent(examName)}`)}
                      >
                        Start Final Exam <FaChevronRight style={{ fontSize: 11 }} />
                      </button>
                    ) : (
                      <div style={S.waitingBadge}>
                        <FaClock style={{ fontSize: 12 }} />
                        {countdown ? `Exam unlocks in ${countdown}` : 'Exam unlocked — all sections complete!'}
                      </div>
                    )
                  ) : (
                    <button style={S.nextBtn} onClick={() => setActiveSection(p => p + 1)}>
                      Next Section <FaChevronRight style={{ fontSize: 11 }} />
                    </button>
                  )
                ) : !currentSection?.isRead ? (
                  // Mark as read first
                  <button
                    style={S.primaryBtn}
                    onClick={async () => {
                      await markRead(currentSection.sectionNumber);
                      setQuizMode(true);
                    }}
                    disabled={markingRead}
                  >
                    {markingRead ? 'Marking...' : 'Mark as Read & Take Quiz'} <FaChevronRight style={{ fontSize: 11 }} />
                  </button>
                ) : (
                  // Read but quiz not done
                  <button style={S.primaryBtn} onClick={() => setQuizMode(true)}>
                    Take Section Quiz <FaChevronRight style={{ fontSize: 11 }} />
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── QUIZ MODE ── */}
          {quizMode && (
            <div style={S.quizWrap}>

              {/* Quiz header */}
              <div style={S.quizHeader}>
                <div>
                  <div style={S.contentTag}>Section Quiz</div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '4px 0 0', fontFamily: "'Poppins', sans-serif" }}>
                    {currentSection?.title} — Quiz
                  </h2>
                </div>
                {!quizResult && (
                  <button style={S.backToReadBtn} onClick={() => setQuizMode(false)}>
                    <FaChevronLeft style={{ fontSize: 11 }} /> Back to Reading
                  </button>
                )}
              </div>

              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', fontFamily: "'Poppins', sans-serif" }}>
                Answer True or False for each statement. You can review your answers before submitting.
              </p>

              {/* ── Questions ── */}
              {!quizResult && (
                <>
                  {currentSection?.quizQuestions?.map((q, idx) => (
                    <div key={q._id} style={S.questionCard}>
                      <div style={S.questionNum}>Q{idx + 1}</div>
                      <div style={{ flex: 1 }}>
                        <p style={S.questionText}>{q.question}</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          {[true, false].map(val => {
                            const selected = quizAnswers[idx] === val;
                            return (
                              <button
                                key={String(val)}
                                onClick={() => setQuizAnswers(p => ({ ...p, [idx]: val }))}
                                style={{
                                  ...S.answerBtn,
                                  background: selected ? (val ? '#f0fdf4' : '#fef2f2') : '#f8fafc',
                                  color:      selected ? (val ? '#15803d' : '#b91c1c') : '#64748b',
                                  border:     selected ? `2px solid ${val ? '#86efac' : '#fca5a5'}` : '2px solid #e5e7eb',
                                  fontWeight: selected ? 700 : 500,
                                }}
                              >
                                {val ? 'TRUE' : 'FALSE'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Submit */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      style={{ ...S.primaryBtn, opacity: (!quizAnswered || submittingQuiz) ? 0.5 : 1 }}
                      disabled={!quizAnswered || submittingQuiz}
                      onClick={submitQuiz}
                    >
                      {submittingQuiz ? 'Submitting...' : 'Submit Quiz'} <FaCheck style={{ fontSize: 11 }} />
                    </button>
                  </div>
                </>
              )}

              {/* ── Quiz Results ── */}
              {quizResult && (
                <div>
                  {/* Score summary */}
                  <div style={S.resultSummary}>
                    <FaCheckCircle style={{ color: '#16a34a', fontSize: 22 }} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
                        Quiz Complete!
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2, fontFamily: "'Poppins', sans-serif" }}>
                        {quizResult.results?.filter(r => r.isCorrect).length} / {quizResult.results?.length} correct
                      </div>
                    </div>
                    {quizResult.allQuizzesDone && quizResult.examAvailableAt && (
                      <div style={S.unlockInfo}>
                        <FaClock style={{ fontSize: 12 }} />
                        Exam unlocks: {new Date(quizResult.examAvailableAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Per-question results */}
                  {quizResult.results?.map((r, idx) => (
                    <div key={idx} style={{ ...S.resultRow, borderLeft: `3px solid ${r.isCorrect ? '#86efac' : '#fca5a5'}` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                        {r.isCorrect
                          ? <FaCheckCircle style={{ color: '#16a34a', fontSize: 14, flexShrink: 0, marginTop: 2 }} />
                          : <FaTimes      style={{ color: '#ef4444', fontSize: 14, flexShrink: 0, marginTop: 2 }} />
                        }
                        <p style={{ fontSize: 13, color: '#374151', margin: 0, fontFamily: "'Poppins', sans-serif", lineHeight: 1.6 }}>{r.question}</p>
                      </div>
                      {!r.isCorrect && (
                        <div style={{ marginLeft: 24, fontSize: 12, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>
                          Your answer: <strong style={{ color: '#ef4444' }}>{r.studentAnswer ? 'TRUE' : 'FALSE'}</strong>
                          {' · '}Correct: <strong style={{ color: '#16a34a' }}>{r.correctAnswer ? 'TRUE' : 'FALSE'}</strong>
                          {r.pageRef && <span style={{ color: '#94a3b8' }}> · See {r.pageRef}</span>}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Continue button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    {isLastSection ? (
                      canStartExam ? (
                        <button
                          style={S.examBtn}
                          onClick={() => navigate(`/exam/${bundleId}/${encodeURIComponent(examName)}`)}
                        >
                          Start Final Exam <FaChevronRight style={{ fontSize: 11 }} />
                        </button>
                      ) : (
                        <div style={S.waitingBadge}>
                          <FaClock style={{ fontSize: 12 }} />
                          {countdown ? `Exam unlocks in ${countdown}` : 'All sections complete! Waiting for time lock...'}
                        </div>
                      )
                    ) : (
                      <button style={S.nextBtn} onClick={() => setActiveSection(p => p + 1)}>
                        Next Section <FaChevronRight style={{ fontSize: 11 }} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  centered:       { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  spinner:        { width: 36, height: 36, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', animation: 'spin 0.8s linear infinite' },
  layout:         { display: 'flex', gap: 24, alignItems: 'flex-start', fontFamily: "'Poppins', sans-serif" },

  // Sidebar
  sidebar:        { width: 260, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', position: 'sticky', top: 20 },
  sideHead:       { padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', gap: 10 },
  sideCourseTitle:{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.4 },
  sideProgress:   { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  sideProgressBar:{ height: 3, background: '#f1f5f9' },
  sideProgressFill:{ height: '100%', background: 'linear-gradient(90deg, #2563eb, #2EABFE)', borderRadius: 99, transition: 'width 0.4s' },
  sideNav:        { padding: '8px 0' },
  sideItem:       { width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', textAlign: 'left', transition: 'all 0.15s', fontFamily: "'Poppins', sans-serif" },
  sideItemIcon:   { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  // Content panel
  contentPanel:   { flex: 1, minWidth: 0 },
  contentHeader:  { background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', borderRadius: 14, padding: '24px 28px', marginBottom: 20, color: '#fff', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  contentTag:     { fontSize: 11, fontWeight: 600, color: '#2EABFE', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 },
  contentTitle:   { fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.2, fontFamily: "'Poppins', sans-serif" },
  doneBadge:      { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, background: 'rgba(22,163,74,0.2)', color: '#86efac', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 20, padding: '6px 12px', whiteSpace: 'nowrap', flexShrink: 0 },
  contentBody:    { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '28px 32px', marginBottom: 20, minHeight: 300 },
  contentFooter:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px 24px' },

  // Buttons
  primaryBtn:    { display: 'flex', alignItems: 'center', gap: 8, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  nextBtn:       { display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  prevBtn:       { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', color: '#64748b', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  examBtn:       { display: 'flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  backToReadBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#64748b', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", flexShrink: 0 },
  backBtn:       { display: 'flex', alignItems: 'center', gap: 8, background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  waitingBadge:  { display: 'flex', alignItems: 'center', gap: 8, background: '#fff7ed', color: '#c2410c', border: '1.5px solid #fed7aa', borderRadius: 10, padding: '11px 18px', fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif" },

  // Quiz
  quizWrap:      { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '28px 32px' },
  quizHeader:    { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 },
  questionCard:  { display: 'flex', gap: 14, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', marginBottom: 14 },
  questionNum:   { width: 28, height: 28, borderRadius: 8, background: '#dbeafe', color: '#1d4ed8', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Poppins', sans-serif" },
  questionText:  { fontSize: 14, color: '#0f172a', lineHeight: 1.7, margin: '0 0 12px', fontFamily: "'Poppins', sans-serif", fontWeight: 500 },
  answerBtn:     { padding: '8px 24px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Poppins', sans-serif" },
  resultSummary: { display: 'flex', alignItems: 'center', gap: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px', marginBottom: 20 },
  resultRow:     { background: '#f8fafc', borderRadius: 10, padding: '14px 16px', marginBottom: 10 },
  unlockInfo:    { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#92400e', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '6px 12px', marginLeft: 'auto', fontFamily: "'Poppins', sans-serif" },
};