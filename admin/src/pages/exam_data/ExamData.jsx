import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../layouts/AppLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── SVG Icon ──────────────────────────────────────────────────
const Icon = ({ d, size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
  </svg>
);

// ── Badge ─────────────────────────────────────────────────────
const Badge = ({ text, color = '#64748b', bg = '#f1f5f9', border }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '3px 10px', borderRadius: 5,
    fontSize: 10, fontWeight: 700, color, background: bg,
    fontFamily: "'Poppins', sans-serif",
    border: border || `0.5px solid ${color}`,
    minWidth: 36,
  }}>{text}</span>
);

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ label, value, icon }) => (
  <div style={{
    background: '#fff',
    borderRadius: 5,
    padding: '10px 16px',
    border: '0.5px solid #2EABFE',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 3, background: '#2EABFE', borderRadius: '0 0 5px 5px',
    }} />
    <div style={{
      width: 50, height: 50,
      background: 'rgba(46,171,254,0.10)',
      border: '0.5px solid #2EABFE',
      borderRadius: 5,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon d={icon} size={24} color="#2EABFE" />
    </div>
    <div>
      <p style={{
        fontSize: 22, fontWeight: 700,
        fontFamily: "'Poppins', sans-serif",
        color: '#091925', lineHeight: 1.1, margin: 0,
      }}>
        {value?.toLocaleString() ?? '—'}
      </p>
      <p style={{
        fontSize: 11, fontWeight: 500,
        color: 'rgba(9,25,37,0.7)',
        fontFamily: "'Poppins', sans-serif",
        margin: '3px 0 0',
      }}>{label}</p>
    </div>
  </div>
);

// ── Course Type Tab config ─────────────────────────────────────
const TABS = [
  { key: 'CE',         label: 'Continuing Education', color: '#2EABFE', bg: 'rgba(46,171,254,0.08)' },
  { key: 'RE',         label: 'Real Estate',          color: '#2EABFE', bg: 'rgba(46,171,254,0.08)' },
  { key: 'PreLicense', label: 'Pre-License',          color: '#2EABFE', bg: 'rgba(46,171,254,0.08)' },
];

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────
const ExamData = () => {
  const [activeTab, setActiveTab]           = useState('CE');
  const [view, setView]                     = useState('exams');
  const [selectedExam, setSelectedExam]     = useState(null);

  const [summary, setSummary]               = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [tabStats, setTabStats]             = useState({});

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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .exam-row:hover  { background: rgba(46,171,254,0.05) !important; cursor: pointer; }
        .exam-search:focus { outline: none; border-color: #2EABFE !important; }
        .page-btn:hover:not(:disabled):not(.active) { background: rgba(46,171,254,0.1) !important; color: #2EABFE !important; border-color: rgba(46,171,254,0.4) !important; }
        .back-btn:hover  { background: #e2e8f0 !important; }
        .tab-btn:hover   { opacity: 0.85; }
        @keyframes examFade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        .exam-fade { animation: examFade 0.2s ease forwards; }
      `}</style>

      <div style={{ padding: '1.5rem 2rem' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#2EABFE', fontFamily: "'Poppins', sans-serif" }}>Dashboard</span>
            <span style={{ color: '#94a3b8', fontSize: 14 }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>Exam Data</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{
                fontSize: 22, fontWeight: 700, color: '#000',
                fontFamily: "'Poppins', sans-serif",
                lineHeight: 1.1, margin: '0 0 2px',
              }}>Exam Question Bank</h1>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#5B7384', fontFamily: "'Poppins', sans-serif", margin: 0 }}>
                {view === 'exams'
                  ? 'Select a course type, then click an exam to view its questions'
                  : `Viewing: ${selectedExam?.examName}`}
              </p>
            </div>
          </div>
        </div>

        {/* Blue divider */}
        <div style={{ height: 0.5, background: '#2EABFE', marginBottom: 16 }} />

        {/* ── Course Type Tabs ── */}
        {view === 'exams' && (
        <div style={{
          display: 'flex', gap: 4, marginBottom: 16,
          background: 'rgba(127,168,196,0.1)',
          borderRadius: 5, padding: 5,
          border: '0.5px solid #7FA8C4', width: 'fit-content',
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
                  padding: '7px 16px', borderRadius: 5,
                  border: active ? '0.5px solid #2EABFE' : 'none',
                  background: active ? '#2EABFE' : 'transparent',
                  color:      active ? '#fff' : '#5B7384',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
                {ts && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: active ? 'rgba(255,255,255,0.25)' : 'rgba(26,122,184,0.10)',
                    color:      active ? '#fff' : '#1A7AB8',
                    borderRadius: 100, padding: '1px 7px',
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    {ts.questions}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        )}

        {/* ── Stat Cards ── */}
        {view === 'exams' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <StatCard
              label="Total Exams"
              value={stats.exams}
              icon="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5"
            />
            <StatCard
              label="Total Questions"
              value={stats.questions}
              icon="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
            />
            <StatCard
              label="Avg Q per Exam"
              value={stats.exams ? Math.round(stats.questions / stats.exams) : 0}
              icon="M18 20V10 M12 20V4 M6 20v-6"
            />
          </div>
        )}

        {/* ══════════════════════════════════
            VIEW 1 — EXAM LIST
        ══════════════════════════════════ */}
        {view === 'exams' && (
          <div className="exam-fade">
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, marginTop: 14, alignItems: 'center' }}>
              <div style={{
                position: 'relative', flex: 1, maxWidth: 320,
                background: 'rgba(127,168,196,0.1)',
                border: '0.5px solid #7FA8C4',
                borderRadius: 5, display: 'flex', alignItems: 'center',
              }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13} color="#7FA8C4" />
                </span>
                <input
                  className="exam-search"
                  placeholder="Search exams..."
                  value={examSearch}
                  onChange={e => { setExamSearch(e.target.value); setExamPage(1); }}
                  style={{
                    width: '100%', padding: '8px 10px 8px 30px',
                    border: 'none', borderRadius: 5,
                    fontSize: 12, fontFamily: "'Poppins', sans-serif",
                    background: 'transparent', color: '#091925', fontWeight: 500,
                  }}
                />
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                height: 24, padding: '0 10px',
                background: 'rgba(26,122,184,0.10)', borderRadius: 100,
                fontSize: 10, fontWeight: 700, color: '#1A7AB8',
                fontFamily: "'Poppins', sans-serif",
              }}>
                {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ background: '#fff', borderRadius: 5, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 110px 110px 40px',
                padding: '9px 16px',
                background: 'rgba(127,168,196,0.1)',
                borderTop: '0.5px solid #7FA8C4',
                borderBottom: '0.5px solid #7FA8C4',
                fontSize: 10, fontWeight: 500, color: '#5B7384',
                letterSpacing: '0.04em', textTransform: 'uppercase',
                fontFamily: "'Poppins', sans-serif",
              }}>
                <span>Exam Name</span>
                <span style={{ textAlign: 'center' }}>Versions</span>
                <span style={{ textAlign: 'center' }}>Questions</span>
                <span />
              </div>

              {summaryLoading ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 12, fontFamily: "'Poppins', sans-serif" }}>
                  Loading exams...
                </div>
              ) : pagedExams.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 12, fontFamily: "'Poppins', sans-serif" }}>
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
                    padding: '9px 16px', alignItems: 'center',
                    borderBottom: i < pagedExams.length - 1 ? '0.5px solid #5B7384' : 'none',
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{ fontSize: 12, color: '#091925', fontWeight: 500, paddingRight: 16, fontFamily: "'Poppins', sans-serif" }}>
                    {exam.examName}
                  </span>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {exam.versions?.sort().map(v => (
                      <Badge
                        key={v}
                        text={v.replace('Version ', 'v')}
                        color="#1A7AB8"
                        bg="rgba(26,122,184,0.10)"
                        border="0.5px solid #1A7AB8"
                      />
                    ))}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Badge
                      text={exam.totalCount}
                      color="#5B7384"
                      bg="rgba(127,168,196,0.1)"
                      border="0.5px solid #5B7384"
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Icon d="M9 18l6-6-6-6" size={14} color="rgba(9,25,37,0.7)" />
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={examPage}
              total={totalPages}
              totalRecords={filteredExams.length}
              limit={LIMIT}
              onChange={setExamPage}
            />
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
      </div>
    </AppLayout>
  );
};

// ─────────────────────────────────────────────────────────────
//  QUESTIONS VIEW
// ─────────────────────────────────────────────────────────────
const QuestionsView = ({ exam, courseType, onBack }) => {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <button className="back-btn" onClick={onBack} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '0 14px', height: 36,
          borderRadius: 5, border: '0.5px solid #5B7384',
          background: '#fff', fontSize: 12, fontWeight: 700,
          color: '#5B7384', cursor: 'pointer',
          fontFamily: "'Poppins', sans-serif",
          transition: 'background 0.15s', flexShrink: 0,
        }}>
          <Icon d="M19 12H5 M12 19l-7-7 7-7" size={12} />
          Back
        </button>

        <div style={{
          flex: 1, background: '#fff', borderRadius: 5,
          border: '0.5px solid #E2E8F0', padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <Badge text={courseType} color="#1A7AB8" bg="rgba(26,122,184,0.10)" border="0.5px solid #1A7AB8" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#091925', flex: 1, fontFamily: "'Poppins', sans-serif" }}>
            {exam.examName}
          </span>
          {!loading && (
            <Badge
              text={`${filtered.length} question${filtered.length !== 1 ? 's' : ''}`}
              color="#1A7AB8" bg="rgba(26,122,184,0.10)" border="0.5px solid #1A7AB8"
            />
          )}
        </div>
      </div>

      {/* Version filter + search row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', ...versions].map(v => {
            const active = activeVer === v;
            return (
              <button
                key={v}
                onClick={() => setActiveVer(v)}
                style={{
                  padding: '5px 12px', borderRadius: 5,
                  border: active ? '0.5px solid #2EABFE' : '0.5px solid #CBD5E1',
                  background: active ? '#2EABFE' : '#fff',
                  color:      active ? '#fff' : '#5B7384',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s',
                }}
              >
                {v === 'all' ? 'All Versions' : v}
              </button>
            );
          })}
        </div>

        <div style={{
          position: 'relative', flex: 1, maxWidth: 320,
          background: 'rgba(127,168,196,0.1)', border: '0.5px solid #7FA8C4',
          borderRadius: 5,
        }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13} color="#7FA8C4" />
          </span>
          <input
            className="exam-search"
            placeholder="Search within questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px 8px 30px',
              border: 'none', borderRadius: 5,
              fontSize: 12, fontFamily: "'Poppins', sans-serif",
              background: 'transparent', color: '#091925', fontWeight: 500,
            }}
          />
        </div>
      </div>

      {/* Questions */}
      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 12, fontFamily: "'Poppins', sans-serif" }}>
          Loading questions...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 12, fontFamily: "'Poppins', sans-serif" }}>
          No questions found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(q => (
            <QuestionCard key={q._id} q={q} />
          ))}
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
  const options = ['A', 'B', 'C', 'D']
    .map(k => ({ key: k, val: q.options?.[k] }))
    .filter(o => o.val);

  return (
    <div style={{ background: '#fff', borderRadius: 5, border: '0.5px solid #5B7384', overflow: 'hidden' }}>
      <div onClick={() => setExpanded(!expanded)} className="exam-row" style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '10px 16px', cursor: 'pointer', transition: 'background 0.1s',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 5, flexShrink: 0,
          background: 'rgba(46,171,254,0.1)', border: '0.5px solid #2EABFE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: '#2EABFE',
        }}>
          {q.questionNumber ?? '?'}
        </div>

        <p style={{ flex: 1, fontSize: 12, color: '#091925', fontWeight: 500, lineHeight: 1.5, fontFamily: "'Poppins', sans-serif", margin: 0 }}>
          {q.question}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>
            {q.version?.replace('Version ', 'v')}
          </span>
          {q.correctAnswer && q.correctAnswer !== 'PENDING' && (
            <span style={{
              padding: '3px 10px', borderRadius: 5,
              background: 'rgba(22,163,74,0.1)', color: '#16a34a',
              border: '0.5px solid #16a34a',
              fontSize: 10, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
            }}>✓ {q.correctAnswer}</span>
          )}
          {q.correctAnswer === 'PENDING' && (
            <span style={{
              padding: '3px 10px', borderRadius: 5,
              background: 'rgba(251,191,36,0.1)', color: '#a16207',
              border: '0.5px solid #a16207',
              fontSize: 10, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
            }}>⏳ Pending</span>
          )}
          <span style={{ color: '#5B7384', display: 'flex', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <Icon d="M6 9l6 6 6-6" size={14} color="#5B7384" />
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '10px 16px 12px 56px', borderTop: '0.5px solid #5B7384' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {options.map(o => {
              const correct = q.correctAnswer?.trim().toUpperCase() === o.key;
              return (
                <div key={o.key} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '7px 10px', borderRadius: 5,
                  background: correct ? 'rgba(22,163,74,0.05)' : '#f8fafc',
                  border: `0.5px solid ${correct ? '#16a34a' : '#5B7384'}`,
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    background: correct ? '#16a34a' : '#e2e8f0',
                    color: correct ? '#fff' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                  }}>{o.key}</span>
                  <span style={{ fontSize: 12, color: correct ? '#15803d' : '#475569', lineHeight: 1.5, fontFamily: "'Poppins', sans-serif" }}>
                    {o.val}
                  </span>
                </div>
              );
            })}
          </div>

          {q.pageReference && (
            <div style={{
              marginTop: 8, padding: '6px 10px', borderRadius: 5,
              background: 'rgba(46,171,254,0.05)', border: '0.5px solid rgba(46,171,254,0.3)',
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <Icon d="M12 2H2v20h20V8z M12 2v6h8" size={12} color="#2EABFE" />
              <span style={{ fontSize: 11, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>{q.pageReference}</span>
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
const Pagination = ({ page, total, totalRecords, limit, onChange }) => {
  if (total <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(total, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const startRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord   = Math.min(page * limit, totalRecords);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px',
      background: '#fff', borderTop: '0.5px solid #5B7384',
      flexWrap: 'wrap', gap: 8,
    }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>
        Showing {startRecord}–{endRecord} of {totalRecords} records
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <PBtn disabled={page === 1}     onClick={() => onChange(page - 1)} label="‹" />
        {start > 1  && <><PBtn onClick={() => onChange(1)} label="1" /><span style={{ color: '#94a3b8', padding: '0 2px', fontSize: 12 }}>…</span></>}
        {pages.map(p => <PBtn key={p} onClick={() => onChange(p)} label={p} active={p === page} />)}
        {end < total && <><span style={{ color: '#94a3b8', padding: '0 2px', fontSize: 12 }}>…</span><PBtn onClick={() => onChange(total)} label={total} /></>}
        <PBtn disabled={page === total} onClick={() => onChange(page + 1)} label="›" />
      </div>
    </div>
  );
};

const PBtn = ({ label, onClick, disabled, active }) => (
  <button
    className={`page-btn${active ? ' active' : ''}`}
    onClick={onClick}
    disabled={disabled}
    style={{
      minWidth: 32, height: 32, borderRadius: 6,
      border: '0.5px solid #5B7384',
      background: active ? '#2EABFE' : '#fff',
      color: active ? '#091925' : disabled ? 'rgba(91,115,132,0.5)' : '#5B7384',
      fontSize: 12, fontWeight: active ? 700 : 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 6px',
    }}
  >{label}</button>
);

export default ExamData;
