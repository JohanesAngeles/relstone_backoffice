import { useState, useEffect } from 'react';
import AppLayout from '../../layouts/AppLayout';

const API = 'http://localhost:5000';

// ── SVG Icon ──────────────────────────────────────────────────
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
  </svg>
);

// ── Badge ─────────────────────────────────────────────────────
const Badge = ({ text, color = '#64748b', bg = '#f1f5f9' }) => (
  <span style={{
    display: 'inline-block', padding: '2px 8px', borderRadius: 20,
    fontSize: 10, fontWeight: 600, color, background: bg,
    fontFamily: "'DM Mono', monospace", letterSpacing: '0.03em',
  }}>{text}</span>
);

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div style={{
    background: '#fff', borderRadius: 10, padding: '14px 18px',
    border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14,
    flex: 1, minWidth: 0,
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: 9,
      background: `${color}18`, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0, color,
    }}>
      <Icon d={icon} size={16} />
    </div>
    <div>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
        {value?.toLocaleString() ?? '—'}
      </p>
      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{label}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────
const ExamData = () => {
  const [view, setView]                     = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [stats, setStats]                   = useState({ courses: 0, qa: 0 });
  const [courses, setCourses]               = useState([]);
  const [courseSearch, setCourseSearch]     = useState('');
  const [coursePage, setCoursePage]         = useState(1);
  const [courseTotal, setCourseTotal]       = useState(0);
  const [courseLoading, setCourseLoading]   = useState(false);
  const LIMIT = 25;

  // ── Fetch stats ──────────────────────────────────────────
  useEffect(() => {
    const run = async () => {
      try {
        const [c, q] = await Promise.all([
          fetch(`${API}/api/exams/courses?limit=1`).then(r => r.json()),
          fetch(`${API}/api/exams/qa?limit=1`).then(r => r.json()),
        ]);
        setStats({ courses: c.total || 0, qa: q.total || 0 });
      } catch { /* empty */ }
    };
    run();
  }, []);

  // ── Fetch courses ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setCourseLoading(true);
      try {
        const params = new URLSearchParams({
          page: coursePage, limit: LIMIT,
          ...(courseSearch && { search: courseSearch }),
        });
        const res  = await fetch(`${API}/api/exams/courses?${params}`);
        const data = await res.json();
        if (!cancelled) {
          setCourses(data.courses || []);
          setCourseTotal(data.total || 0);
        }
      } catch { /* empty */ }
      if (!cancelled) setCourseLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [coursePage, courseSearch]);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setView('questions');
  };

  const handleBack = () => {
    setView('courses');
    setSelectedCourse(null);
  };

  return (
    <AppLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        .exam-row:hover { background: #f0f7ff !important; cursor: pointer; }
        .exam-search:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .page-btn:hover:not(:disabled) { background: #2563eb !important; color: #fff !important; }
        .back-btn:hover { background: #e2e8f0 !important; }
        .q-row:hover { background: #f8fafc !important; }
        @keyframes examFade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        .exam-fade { animation: examFade 0.2s ease forwards; }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(37,99,235,0.1)', color: '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" size={15} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>Exam Data</h1>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              {view === 'courses'
                ? 'All Courses — click a course to view its questions'
                : `Viewing questions for: ${selectedCourse?.courseTitle}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards (courses view only) ── */}
      {view === 'courses' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <StatCard label="Total Courses"    value={stats.courses} color="#2563eb" icon="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5" />
          <StatCard label="Total Questions"  value={stats.qa}      color="#0891b2" icon="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          <StatCard label="Avg Q per Course" value={stats.courses ? Math.round(stats.qa / stats.courses) : 0} color="#7c3aed" icon="M18 20V10 M12 20V4 M6 20v-6" />
        </div>
      )}

      {/* ══════════════════════════════════
          VIEW 1 — COURSES LIST
      ══════════════════════════════════ */}
      {view === 'courses' && (
        <div className="exam-fade">
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={14} />
              </span>
              <input
                className="exam-search"
                placeholder="Search by title or ExamMasterID..."
                value={courseSearch}
                onChange={e => { setCourseSearch(e.target.value); setCoursePage(1); }}
                style={{
                  width: '100%', padding: '8px 12px 8px 32px',
                  borderRadius: 8, border: '1px solid #e2e8f0',
                  fontSize: 13, fontFamily: "'Poppins', sans-serif",
                  background: '#fff', color: '#0f172a', transition: 'all 0.15s',
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{courseTotal.toLocaleString()} courses</span>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '130px 1fr 100px 40px',
              padding: '10px 16px', background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: 10, fontWeight: 700, color: '#94a3b8',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: "'DM Mono', monospace",
            }}>
              <span>Master ID</span>
              <span>Course Title</span>
              <span style={{ textAlign: 'center' }}>Relstone</span>
              <span />
            </div>

            {courseLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Loading courses...</div>
            ) : courses.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No courses found</div>
            ) : courses.map((c, i) => (
              <div
                key={c._id}
                className="exam-row"
                onClick={() => handleSelectCourse(c)}
                style={{
                  display: 'grid', gridTemplateColumns: '130px 1fr 100px 40px',
                  padding: '12px 16px', alignItems: 'center',
                  borderBottom: i < courses.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.1s',
                }}
              >
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#2563eb', fontWeight: 600 }}>
                  {c.examMasterID}
                </span>
                <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, paddingRight: 16 }}>
                  {c.courseTitle}
                </span>
                <div style={{ textAlign: 'center' }}>
                  {c.relstoneItem === 'YES'
                    ? <Badge text="YES" color="#16a34a" bg="#dcfce7" />
                    : <Badge text="NO"  color="#dc2626" bg="#fee2e2" />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#94a3b8' }}>
                  <Icon d="M9 18l6-6-6-6" size={15} />
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={coursePage}
            total={Math.ceil(courseTotal / LIMIT)}
            onChange={setCoursePage}
          />
        </div>
      )}

      {/* ══════════════════════════════════
          VIEW 2 — QUESTIONS FOR COURSE
      ══════════════════════════════════ */}
      {view === 'questions' && selectedCourse && (
        <QuestionsView course={selectedCourse} onBack={handleBack} />
      )}
    </AppLayout>
  );
};

// ─────────────────────────────────────────────────────────────
//  QUESTIONS VIEW
// ─────────────────────────────────────────────────────────────
const QuestionsView = ({ course, onBack }) => {
  const [qa, setQA]             = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        // Parse ExamSubTestID from qa_url for precise per-course filtering
        const urlParams = new URLSearchParams(course.qaUrl?.split('?')[1] || '');
        const subTestID = urlParams.get('ExamSubTestID') || '';
        const params    = new URLSearchParams({ limit: 500 });
        if (subTestID) params.set('examSubTestID', subTestID);

        const res  = await fetch(`${API}/api/exams/qa/${course.examMasterID}?${params}`);
        const data = await res.json();
        if (!cancelled) {
          setQA(data.qa || []);
          setFiltered(data.qa || []);
        }
      } catch { /* empty */ }
      if (!cancelled) setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [course.examMasterID, course.qaUrl]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!search.trim()) { setFiltered(qa); return; }
    const s = search.toLowerCase();
    setFiltered(qa.filter(q =>
      q.question?.toLowerCase().includes(s) ||
      q.optionA?.toLowerCase().includes(s) ||
      q.optionB?.toLowerCase().includes(s) ||
      q.optionC?.toLowerCase().includes(s) ||
      q.optionD?.toLowerCase().includes(s)
    ));
  }, [search, qa]);

  return (
    <div className="exam-fade">
      {/* Back + Course info bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <button className="back-btn" onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 14px', borderRadius: 8,
          border: '1px solid #e2e8f0', background: '#fff',
          fontSize: 13, fontWeight: 600, color: '#475569',
          cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
          transition: 'background 0.15s', flexShrink: 0,
        }}>
          <Icon d="M19 12H5 M12 19l-7-7 7-7" size={14} />
          Back to Courses
        </button>

        <div style={{
          flex: 1, background: '#fff', borderRadius: 10,
          border: '1px solid #e2e8f0', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600,
            color: '#2563eb', background: 'rgba(37,99,235,0.08)',
            padding: '4px 10px', borderRadius: 7,
          }}>
            {course.examMasterID}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', flex: 1 }}>
            {course.courseTitle}
          </span>
          {!loading && (
            <Badge
              text={`${filtered.length} question${filtered.length !== 1 ? 's' : ''}`}
              color="#0891b2" bg="rgba(8,145,178,0.08)"
            />
          )}
          {course.relstoneItem === 'YES'
            ? <Badge text="Relstone ✓" color="#16a34a" bg="#dcfce7" />
            : <Badge text="Not on Relstone" color="#dc2626" bg="#fee2e2" />}
        </div>
      </div>

      {/* Search within questions */}
      <div style={{ position: 'relative', maxWidth: 420, marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
          <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={14} />
        </span>
        <input
          className="exam-search"
          placeholder="Search within questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px 8px 32px',
            borderRadius: 8, border: '1px solid #e2e8f0',
            fontSize: 13, fontFamily: "'Poppins', sans-serif",
            background: '#fff', color: '#0f172a', transition: 'all 0.15s',
          }}
        />
      </div>

      {/* Questions */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
          Loading questions...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
          No questions found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(q => <QuestionCard key={q._id} q={q} />)}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  QUESTION CARD (expandable)
// ─────────────────────────────────────────────────────────────
const QuestionCard = ({ q }) => {
  const [expanded, setExpanded] = useState(false);
  const options = [
    { key: 'A', val: q.optionA },
    { key: 'B', val: q.optionB },
    { key: 'C', val: q.optionC },
    { key: 'D', val: q.optionD },
    { key: 'E', val: q.optionE },
  ].filter(o => o.val);

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Question header */}
      <div onClick={() => setExpanded(!expanded)} style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 16px', cursor: 'pointer',
      }}>
        {/* Number */}
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: 'rgba(37,99,235,0.08)', color: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
        }}>
          {q.questionNum || '?'}
        </div>

        {/* Question text */}
        <p style={{ flex: 1, fontSize: 13, color: '#1e293b', fontWeight: 500, lineHeight: 1.5 }}>
          {q.question}
        </p>

        {/* Correct answer + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {q.correctAnswer && (
            <span style={{
              padding: '3px 10px', borderRadius: 20,
              background: '#dcfce7', color: '#16a34a',
              fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
            }}>✓ {q.correctAnswer}</span>
          )}
          <span style={{
            color: '#94a3b8', display: 'flex',
            transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
          }}>
            <Icon d="M6 9l6 6 6-6" size={14} />
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '12px 16px 14px 56px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: q.explanation ? 12 : 0 }}>
            {options.map(o => {
              const correct = q.correctAnswer?.trim().toUpperCase() === o.key;
              return (
                <div key={o.key} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '7px 10px', borderRadius: 7,
                  background: correct ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${correct ? '#86efac' : '#e2e8f0'}`,
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    background: correct ? '#22c55e' : '#e2e8f0',
                    color: correct ? '#fff' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace",
                  }}>{o.key}</span>
                  <span style={{ fontSize: 12, color: correct ? '#15803d' : '#475569', lineHeight: 1.5 }}>
                    {o.val}
                  </span>
                </div>
              );
            })}
          </div>

          {q.explanation && (
            <div style={{
              padding: '8px 12px', borderRadius: 7,
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <span style={{ color: '#d97706', flexShrink: 0 }}>
                <Icon d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z M12 8v4 M12 16h.01" size={14} />
              </span>
              <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>{q.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  PAGINATION
// ─────────────────────────────────────────────────────────────
const Pagination = ({ page, total, onChange }) => {
  if (total <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(total, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, justifyContent: 'center' }}>
      <PBtn disabled={page === 1}     onClick={() => onChange(page - 1)} label="←" />
      {start > 1 && <><PBtn onClick={() => onChange(1)} label="1" /><span style={{ color: '#94a3b8' }}>…</span></>}
      {pages.map(p => <PBtn key={p} onClick={() => onChange(p)} label={p} active={p === page} />)}
      {end < total && <><span style={{ color: '#94a3b8' }}>…</span><PBtn onClick={() => onChange(total)} label={total} /></>}
      <PBtn disabled={page === total} onClick={() => onChange(page + 1)} label="→" />
    </div>
  );
};

const PBtn = ({ label, onClick, disabled, active }) => (
  <button className="page-btn" onClick={onClick} disabled={disabled} style={{
    width: 32, height: 32, borderRadius: 7, border: '1px solid #e2e8f0',
    background: active ? '#2563eb' : '#fff',
    color:      active ? '#fff' : disabled ? '#cbd5e1' : '#475569',
    fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s',
  }}>{label}</button>
);

export default ExamData;