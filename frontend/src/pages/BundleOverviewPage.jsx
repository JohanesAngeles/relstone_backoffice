// src/pages/student/BundleOverviewPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/common/MycoursesLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Icons ─────────────────────────────────────────────────────
const Icon = ({ path, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  check:   'M20 6L9 17l-5-5',
  clock:   'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v6l4 2',
  play:    'M5 3l14 9-14 9V3z',
  redo:    'M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15',
  lock:    'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  chevron: 'M9 18l6-6-6-6',
  book:    'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  star:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  alert:   'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
};

// ── Course hours map ──────────────────────────────────────────
const getExamHours = (examName = '') => {
  const n = examName.toLowerCase();
  if (n.includes('implicit bias'))                         return 2;
  if (n.includes('part one') || n.includes('part 1'))     return 13;
  if (n.includes('part two') || n.includes('part 2'))     return 12;
  return 3;
};

const formatHours = (h) => `${h} hr${h !== 1 ? 's' : ''}`;
const formatTimer = (h) => {
  const mins = h * 60;
  return mins >= 60 ? `${Math.floor(mins/60)}h ${mins%60 > 0 ? mins%60+'m' : ''}`.trim() : `${mins}m`;
};

// ── Mandatory exam keywords ───────────────────────────────────
const MANDATORY_KEYWORDS = ['agency','ethics','fair housing','trust fund','risk management','management and supervision','implicit bias'];
const isMandatory = (name) => MANDATORY_KEYWORDS.some(kw => name.toLowerCase().includes(kw));

const ELECTIVE_GROUPS = {
  'Mortgage Lending': ['mortgage lending'],
  'Selling Business Opportunities in California': ['selling business', 'business opportunit'],
};

const getElectiveGroup = (examName) => {
  const n = examName.toLowerCase();
  for (const [group, keywords] of Object.entries(ELECTIVE_GROUPS)) {
    if (keywords.some(kw => n.includes(kw))) return group;
  }
  return null;
};

// ── Status config ─────────────────────────────────────────────
const STATUS = {
  'not-started': { label: 'Not Started', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
  'in-progress': { label: 'In Progress', color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  'passed':      { label: 'Passed',      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  'failed':      { label: 'Failed',      color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

// ── Exam Row Component ────────────────────────────────────────
function ExamRow({ exam, index, onStart, locked = false }) {
  const [hovered, setHovered] = useState(false);
  const status  = STATUS[exam.status] || STATUS['not-started'];
  const hours   = getExamHours(exam.examName);
  const isPass  = exam.status === 'passed';
  const isFail  = exam.status === 'failed';
  const isIP    = exam.status === 'in-progress';

  const btnLabel = isIP ? 'Continue' : isFail ? 'Retake' : isPass ? 'Review' : 'Start Exam';
  const btnBg    = isIP ? '#f97316' : isFail ? '#7c3aed' : isPass ? '#fff' : '#091925';
  const btnColor = isPass ? '#16a34a' : '#fff';
  const btnBorder= isPass ? '1.5px solid #16a34a' : 'none';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 20px',
        background: locked ? '#f8fafc' : hovered ? 'rgba(46,171,254,0.03)' : '#fff',
        borderBottom: '1px solid #f1f5f9',
        transition: 'background 0.15s',
        opacity: locked ? 0.55 : 1,
      }}
    >
      {/* Number */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isPass ? '#f0fdf4' : '#f1f5f9',
        border: isPass ? '1.5px solid #bbf7d0' : '1.5px solid #e2e8f0',
        fontSize: 13, fontWeight: 700,
        color: isPass ? '#16a34a' : '#64748b',
        fontFamily: "'Poppins', sans-serif",
      }}>
        {isPass
          ? <Icon path={ICONS.check} size={14} />
          : index + 1
        }
      </div>

      {/* Exam name + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 600, color: '#0f172a',
          fontFamily: "'Poppins', sans-serif",
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {exam.examName}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon path={ICONS.clock} size={11} /> {formatHours(hours)} · Timer: {formatTimer(hours)}
          </span>
          {exam.attempts > 0 && (
            <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Poppins', sans-serif" }}>
              Attempt {exam.attempts} · {exam.latestVersion}
            </span>
          )}
          {exam.leaveCount > 0 && (
            <span style={{ fontSize: 11, color: '#f97316', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', gap: 3 }}>
              <Icon path={ICONS.alert} size={11} /> Left page {exam.leaveCount}×
            </span>
          )}
        </div>
      </div>

      {/* Score */}
      {(isPass || isFail) && exam.latestScore !== null && (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontSize: 20, fontWeight: 800, lineHeight: 1,
            color: isPass ? '#16a34a' : '#dc2626',
            fontFamily: "'Poppins', sans-serif",
          }}>
            {exam.latestScore}%
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, fontFamily: "'Poppins', sans-serif" }}>
            {isPass ? 'PASSED' : 'FAILED'}
          </div>
        </div>
      )}

      {/* Status badge */}
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100,
        background: status.bg, color: status.color, border: `1px solid ${status.border}`,
        fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {status.label}
      </span>

      {/* Action button */}
      {locked ? (
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', flexShrink: 0 }}>
          <Icon path={ICONS.lock} size={14} />
        </div>
      ) : (
        <button
          onClick={() => onStart(exam)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, flexShrink: 0,
            background: btnBg, color: btnColor, border: btnBorder,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap',
            boxShadow: !isPass ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
            transition: 'opacity 0.15s',
          }}
        >
          <Icon path={isIP ? ICONS.play : isFail ? ICONS.redo : isPass ? ICONS.book : ICONS.play} size={11} />
          {btnLabel}
        </button>
      )}
    </div>
  );
}

// ── Elective Picker ───────────────────────────────────────────
function ElectivePicker({ onChoose, saving }) {
  const [hovered, setHovered] = useState(null);

  const options = [
    {
      key:   'Mortgage Lending',
      label: 'Mortgage Lending',
      desc:  'Part 1 (13 hrs) + Part 2 (12 hrs) · 25 credit hours total',
      icon:  ICONS.book,
      color: '#2563eb',
    },
    {
      key:   'Selling Business Opportunities in California',
      label: 'Selling Business Opportunities',
      desc:  'Part 1 (13 hrs) + Part 2 (12 hrs) · 25 credit hours total',
      icon:  ICONS.star,
      color: '#7c3aed',
    },
  ];

  return (
    <div style={{ padding: '24px 20px' }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif", marginBottom: 6 }}>
          Choose Your 25-Hour Elective
        </div>
        <div style={{ fontSize: 12, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>
          You must complete both parts of your chosen elective. This choice cannot be changed once selected.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {options.map(opt => (
          <button
            key={opt.key}
            disabled={saving}
            onMouseEnter={() => setHovered(opt.key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChoose(opt.key)}
            style={{
              padding: '20px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              border: `2px solid ${hovered === opt.key ? opt.color : '#e2e8f0'}`,
              background: hovered === opt.key ? `${opt.color}08` : '#fff',
              transition: 'all 0.18s', boxShadow: hovered === opt.key ? `0 4px 20px ${opt.color}20` : '0 1px 3px rgba(0,0,0,0.06)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10, marginBottom: 12,
              background: `${opt.color}15`, color: opt.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon path={opt.icon} size={18} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif", marginBottom: 4 }}>
              {opt.label}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>
              {opt.desc}
            </div>
            <div style={{
              marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 700, color: opt.color,
              fontFamily: "'Poppins', sans-serif",
            }}>
              Select this elective <Icon path={ICONS.chevron} size={11} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function BundleOverviewPage() {
  const { bundleId }  = useParams();
  const navigate      = useNavigate();

  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [bundle,    setBundle]    = useState(null);
  const [savingElective, setSavingElective] = useState(false);

  // Get studentId from localStorage (set on login)
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user?.studentId || '';

  useEffect(() => {
    if (!studentId) { setError('Not logged in.'); setLoading(false); return; }
    fetchBundle();
  }, [studentId, bundleId]);

  const fetchBundle = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/exam-session/bundle/${studentId}/${bundleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setBundle(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseElective = async (elective) => {
  setSavingElective(true);
  try {
    const token = localStorage.getItem('token');
    const res   = await fetch(`${API}/exam-session/choose-elective`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ studentId, bundleId, elective }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    // Update bundle state directly without refetching (avoids scroll reset)
    setBundle(prev => ({ ...prev, chosenElective: elective }));
  } catch (err) {
    alert(`❌ ${err.message}`);
  } finally {
    setSavingElective(false);
  }
};

  const handleStartExam = (exam) => {
    navigate(`/course/${bundleId}/${encodeURIComponent(exam.examName)}`);
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: "'Poppins', sans-serif" }}>Loading course...</div>
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

  // ── Separate exams into mandatory + elective groups ───────
  const allExamNames     = bundle.examNames || [];
  const mandatoryExams   = allExamNames.filter(isMandatory);
  const electiveExamNames= allExamNames.filter(n => !isMandatory(n));
  const chosenElective   = bundle.chosenElective;

  // Filter elective exams to only show chosen group
  const visibleElectives = chosenElective
    ? electiveExamNames.filter(n => {
        const grp = getElectiveGroup(n);
        return grp === chosenElective;
      })
    : [];

  // Build exam rows with status from examSummary
  const buildExamRow = (examName) => ({
    examName,
    status:        bundle.examSummary?.[examName]?.status       || 'not-started',
    latestScore:   bundle.examSummary?.[examName]?.latestScore  ?? null,
    latestVersion: bundle.examSummary?.[examName]?.latestVersion || 'Version A',
    attempts:      bundle.examSummary?.[examName]?.attempts     || 0,
    leaveCount:    bundle.examSummary?.[examName]?.leaveCount   || 0,
  });

  // Count passed mandatory
  const mandatoryPassed  = mandatoryExams.filter(n => bundle.examSummary?.[n]?.passed).length;
  const electivePassed   = visibleElectives.filter(n => bundle.examSummary?.[n]?.passed).length;
  const totalRequired    = mandatoryExams.length + (chosenElective ? 2 : 0); // 2 parts
  const totalPassed      = mandatoryPassed + electivePassed;
  const overallPct       = totalRequired > 0 ? Math.round((totalPassed / totalRequired) * 100) : 0;

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginBottom: 20, fontFamily: "'Poppins', sans-serif" }}>
        <span style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/my-courses')}>
          My Courses
        </span>
        <span>›</span>
        <span style={{ color: '#374151', fontWeight: 600 }}>{bundleId}</span>
      </div>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 24, color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(46,171,254,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(46,171,254,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#2EABFE', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Poppins', sans-serif" }}>
              {bundle.courseType} · {bundleId}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2, fontFamily: "'Poppins', sans-serif" }}>
                {bundleId === 'CE-45HR' ? '45 Hour C.E. Package'
                : bundleId === 'CE-15HR' ? '15 Hour C.E. Package'
                : bundleId === 'CE-36HR' ? '36 Hour C.E. Package'
                : bundle.courseTitle || bundleId}
                </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, fontFamily: "'Poppins', sans-serif" }}>
              Complete all mandatory courses + your chosen elective to earn your certificate.
            </p>
          </div>

          {/* Progress circle */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `conic-gradient(#2EABFE ${overallPct * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 3px rgba(46,171,254,0.2)',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#0f172a',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: "'Poppins', sans-serif" }}>{overallPct}%</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: "'Poppins', sans-serif" }}>DONE</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontFamily: "'Poppins', sans-serif" }}>
              {totalPassed} / {totalRequired} passed
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${overallPct}%`, background: 'linear-gradient(90deg, #2EABFE, #00d4ff)', transition: 'width 0.5s' }} />
          </div>
        </div>
      </div>

      {/* ── Mandatory Section ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, marginBottom: 20, overflow: 'hidden' }}>
        {/* Section header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
              Mandatory Courses
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: "'Poppins', sans-serif" }}>
              All 7 courses required · 20 credit hours
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100,
            background: mandatoryPassed === mandatoryExams.length ? '#f0fdf4' : '#f8fafc',
            color:      mandatoryPassed === mandatoryExams.length ? '#16a34a' : '#64748b',
            border:     `1px solid ${mandatoryPassed === mandatoryExams.length ? '#bbf7d0' : '#e2e8f0'}`,
            fontFamily: "'Poppins', sans-serif",
          }}>
            {mandatoryPassed} / {mandatoryExams.length} Passed
          </span>
        </div>

        {/* Mandatory exam rows */}
        {mandatoryExams.map((examName, i) => (
          <ExamRow
            key={examName}
            exam={buildExamRow(examName, i)}
            index={i}
            onStart={handleStartExam}
          />
        ))}
      </div>

      {/* ── Elective Section ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        {/* Section header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
              Elective — Consumer Protection
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: "'Poppins', sans-serif" }}>
              Choose one · 25 credit hours (Part 1 + Part 2)
            </div>
          </div>
          {chosenElective && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100,
              background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
              fontFamily: "'Poppins', sans-serif", maxWidth: 200,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {chosenElective}
            </span>
          )}
        </div>

        {/* Elective picker or exam rows */}
        {!chosenElective ? (
          <ElectivePicker onChoose={handleChooseElective} saving={savingElective} />
        ) : (
          visibleElectives.map((examName, i) => (
            <ExamRow
              key={examName}
              exam={buildExamRow(examName, i)}
              index={i}
              onStart={handleStartExam}
            />
          ))
        )}
      </div>

      {/* ── Bottom note ── */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Icon path={ICONS.alert} size={14} />
        <p style={{ fontSize: 12, color: '#92400e', margin: 0, fontFamily: "'Poppins', sans-serif", lineHeight: 1.5 }}>
          <strong>Passing score is 70%.</strong> If you fail Version A, you will retake with Version B. All exams are timed based on credit hours. Leaving the exam page will be recorded.
        </p>
      </div>

    </DashboardLayout>
  );
}