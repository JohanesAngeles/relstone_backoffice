import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// ── Course Type Tab config ─────────────────────────────────────
const TABS = [
  { key: 'CE',         label: 'Continuing Education', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  { key: 'RE',         label: 'Real Estate',          color: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
  { key: 'PreLicense', label: 'Pre-License',          color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
];

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────
const ExamData = () => {
  const [activeTab, setActiveTab]           = useState('CE');
  const [view, setView]                     = useState('exams');       // 'exams' | 'questions'
  const [selectedExam, setSelectedExam]     = useState(null);

  // Summary data (grouped by examName)
  const [summary, setSummary]               = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Stats per tab
  const [tabStats, setTabStats]             = useState({});

  // Search / pagination for exam list
  const [examSearch, setExamSearch]         = useState('');
  const [examPage, setExamPage]             = useState(1);
  const LIMIT = 25;

  const activeTabConfig = TABS.find(t => t.key === activeTab);

  // ── Fetch summary for active tab ──────────────────────────
  const fetchSummary = useCallback(async (courseType) => {
    setSummaryLoading(true);
    try {
      const res  = await fetch(`${API}/api/exams/qanda/summary?courseType=${courseType}`);
      const data = await res.json();
      const group = data.summary?.find(s => s._id === courseType);
      setSummary(group?.exams || []);
      setTabStats(prev => ({
        ...prev,
        [courseType]: {
          exams:     group?.exams?.length || 0,
          questions: group?.totalQuestions || 0,
        },
      }));
    } catch { /* empty */ }
    setSummaryLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView('exams');
    setSelectedExam(null);
    setExamSearch('');
    setExamPage(1);
    fetchSummary(activeTab);
  }, [activeTab, fetchSummary]);

  // ── Filtered + paginated exam list ───────────────────────
  const filteredExams = summary.filter(e =>
    !examSearch || e.examName?.toLowerCase().includes(examSearch.toLowerCase())
  );
  const totalPages  = Math.ceil(filteredExams.length / LIMIT);
  const pagedExams  = filteredExams.slice((examPage - 1) * LIMIT, examPage * LIMIT);

  const stats = tabStats[activeTab] || { exams: 0, questions: 0 };

  return (
    <AppLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        .exam-row:hover  { background: #f0f7ff !important; cursor: pointer; }
        .exam-search:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .page-btn:hover:not(:disabled) { background: #2563eb !important; color: #fff !important; }
        .back-btn:hover  { background: #e2e8f0 !important; }
        .tab-btn:hover   { opacity: 0.85; }
        @keyframes examFade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        .exam-fade { animation: examFade 0.2s ease forwards; }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${activeTabConfig.color}18`, color: activeTabConfig.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" size={15} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>Exam Question Bank</h1>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              {view === 'exams'
                ? 'Select a course type, then click an exam to view its questions'
                : `Viewing: ${selectedExam?.examName}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Course Type Tabs ── */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20,
        background: '#f8fafc', borderRadius: 10, padding: 6,
        border: '1px solid #e2e8f0', width: 'fit-content',
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          const ts     = tabStats[tab.key];
          return (
            <button
              key={tab.key}
              className="tab-btn"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: active ? tab.color : 'transparent',
                color:      active ? '#fff' : '#64748b',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                transition: 'all 0.15s',
                boxShadow: active ? `0 2px 8px ${tab.color}40` : 'none',
              }}
            >
              {tab.label}
              {ts && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: active ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color:      active ? '#fff' : '#64748b',
                  borderRadius: 20, padding: '1px 7px',
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {ts.questions}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Stat Cards ── */}
      {view === 'exams' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <StatCard
            label="Total Exams"
            value={stats.exams}
            color={activeTabConfig.color}
            icon="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5"
          />
          <StatCard
            label="Total Questions"
            value={stats.questions}
            color="#0891b2"
            icon="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
          />
          <StatCard
            label="Avg Q per Exam"
            value={stats.exams ? Math.round(stats.questions / stats.exams) : 0}
            color="#7c3aed"
            icon="M18 20V10 M12 20V4 M6 20v-6"
          />
        </div>
      )}

      {/* ══════════════════════════════════
          VIEW 1 — EXAM LIST
      ══════════════════════════════════ */}
      {view === 'exams' && (
        <div className="exam-fade">
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={14} />
              </span>
              <input
                className="exam-search"
                placeholder="Search exams..."
                value={examSearch}
                onChange={e => { setExamSearch(e.target.value); setExamPage(1); }}
                style={{
                  width: '100%', padding: '8px 12px 8px 32px',
                  borderRadius: 8, border: '1px solid #e2e8f0',
                  fontSize: 13, fontFamily: "'Poppins', sans-serif",
                  background: '#fff', color: '#0f172a', transition: 'all 0.15s',
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 110px 110px 40px',
              padding: '10px 16px', background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: 10, fontWeight: 700, color: '#94a3b8',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: "'DM Mono', monospace",
            }}>
              <span>Exam Name</span>
              <span style={{ textAlign: 'center' }}>Versions</span>
              <span style={{ textAlign: 'center' }}>Questions</span>
              <span />
            </div>

            {summaryLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Loading exams...
              </div>
            ) : pagedExams.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No exams found
                {activeTab === 'RE' || activeTab === 'PreLicense'
                  ? ' — questions for this course type have not been seeded yet.'
                  : ''}
              </div>
            ) : pagedExams.map((exam, i) => (
              <div
                key={exam.examName}
                className="exam-row"
                onClick={() => { setSelectedExam(exam); setView('questions'); }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 110px 110px 40px',
                  padding: '13px 16px', alignItems: 'center',
                  borderBottom: i < pagedExams.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.1s',
                }}
              >
                <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, paddingRight: 16 }}>
                  {exam.examName}
                </span>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {exam.versions?.sort().map(v => (
                    <Badge
                      key={v}
                      text={v.replace('Version ', 'v')}
                      color={activeTabConfig.color}
                      bg={activeTabConfig.bg}
                    />
                  ))}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Badge
                    text={exam.totalCount}
                    color="#0f172a"
                    bg="#f1f5f9"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#94a3b8' }}>
                  <Icon d="M9 18l6-6-6-6" size={15} />
                </div>
              </div>
            ))}
          </div>

          <Pagination page={examPage} total={totalPages} onChange={setExamPage} />
        </div>
      )}

      {/* ══════════════════════════════════
          VIEW 2 — QUESTIONS FOR EXAM
      ══════════════════════════════════ */}
      {view === 'questions' && selectedExam && (
        <QuestionsView
          exam={selectedExam}
          courseType={activeTab}
          tabColor={activeTabConfig.color}
          tabBg={activeTabConfig.bg}
          onBack={() => { setView('exams'); setSelectedExam(null); }}
        />
      )}
    </AppLayout>
  );
};

// ─────────────────────────────────────────────────────────────
//  QUESTIONS VIEW
// ─────────────────────────────────────────────────────────────
const QuestionsView = ({ exam, courseType, tabColor, tabBg, onBack }) => {
  const [questions, setQuestions]   = useState([]);
  const [filtered,  setFiltered]    = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [search,    setSearch]      = useState('');
  const [activeVer, setActiveVer]   = useState('all');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const encodedName = encodeURIComponent(exam.examName);
        const res  = await fetch(
          `${API}/api/exams/qanda/${encodedName}?courseType=${courseType}`
        );
        const data = await res.json();
        if (!cancelled) {
          setQuestions(data.questions || []);
          setFiltered(data.questions  || []);
        }
      } catch { /* empty */ }
      if (!cancelled) setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [exam.examName, courseType]);

  // Filter by version + search
  useEffect(() => {
    let result = questions;
    if (activeVer !== 'all') result = result.filter(q => q.version === activeVer);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(q =>
        q.question?.toLowerCase().includes(s) ||
        q.options?.A?.toLowerCase().includes(s) ||
        q.options?.B?.toLowerCase().includes(s) ||
        q.options?.C?.toLowerCase().includes(s) ||
        q.options?.D?.toLowerCase().includes(s)
      );
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiltered(result);
  }, [search, questions, activeVer]);

  const versions = [...new Set(questions.map(q => q.version))].sort();

  return (
    <div className="exam-fade">
      {/* Back + info bar */}
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
          Back
        </button>

        <div style={{
          flex: 1, background: '#fff', borderRadius: 10,
          border: '1px solid #e2e8f0', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <Badge text={courseType} color={tabColor} bg={tabBg} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', flex: 1 }}>
            {exam.examName}
          </span>
          {!loading && (
            <Badge
              text={`${filtered.length} question${filtered.length !== 1 ? 's' : ''}`}
              color="#0891b2" bg="rgba(8,145,178,0.08)"
            />
          )}
        </div>
      </div>

      {/* Version filter + search row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Version pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', ...versions].map(v => {
            const active = activeVer === v;
            return (
              <button
                key={v}
                onClick={() => setActiveVer(v)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: '1px solid #e2e8f0',
                  background: active ? tabColor : '#fff',
                  color:      active ? '#fff' : '#64748b',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s',
                }}
              >
                {v === 'all' ? 'All Versions' : v}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
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
          {filtered.map(q => (
            <QuestionCard key={q._id} q={q} tabColor={tabColor} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  QUESTION CARD (expandable)
// ─────────────────────────────────────────────────────────────
const QuestionCard = ({ q, tabColor }) => {
  const [expanded, setExpanded] = useState(false);
  const options = ['A', 'B', 'C', 'D']
    .map(k => ({ key: k, val: q.options?.[k] }))
    .filter(o => o.val);

  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <div onClick={() => setExpanded(!expanded)} style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 16px', cursor: 'pointer',
      }}>
        {/* Question number */}
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: `${tabColor}14`, color: tabColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
        }}>
          {q.questionNumber ?? '?'}
        </div>

        {/* Question text */}
        <p style={{ flex: 1, fontSize: 13, color: '#1e293b', fontWeight: 500, lineHeight: 1.5 }}>
          {q.question}
        </p>

        {/* Version badge + correct answer + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#94a3b8',
            fontFamily: "'DM Mono', monospace",
          }}>
            {q.version?.replace('Version ', 'v')}
          </span>
          {q.correctAnswer && q.correctAnswer !== 'PENDING' && (
            <span style={{
              padding: '3px 10px', borderRadius: 20,
              background: '#dcfce7', color: '#16a34a',
              fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
            }}>✓ {q.correctAnswer}</span>
          )}
          {q.correctAnswer === 'PENDING' && (
            <span style={{
              padding: '3px 10px', borderRadius: 20,
              background: '#fef9c3', color: '#a16207',
              fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
            }}>⏳ Pending</span>
          )}
          <span style={{
            color: '#94a3b8', display: 'flex',
            transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
          }}>
            <Icon d="M6 9l6 6 6-6" size={14} />
          </span>
        </div>
      </div>

      {/* Expanded options */}
      {expanded && (
        <div style={{ padding: '12px 16px 14px 56px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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

          {/* Page reference */}
          {q.pageReference && (
            <div style={{
              marginTop: 10, padding: '6px 12px', borderRadius: 7,
              background: `${tabColor}08`, border: `1px solid ${tabColor}20`,
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <Icon d="M12 2H2v20h20V8z M12 2v6h8" size={12} />
              <span style={{ fontSize: 11, color: '#475569' }}>{q.pageReference}</span>
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
      {start > 1  && <><PBtn onClick={() => onChange(1)}     label="1"     /><span style={{ color: '#94a3b8' }}>…</span></>}
      {pages.map(p => <PBtn key={p}   onClick={() => onChange(p)} label={p} active={p === page} />)}
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