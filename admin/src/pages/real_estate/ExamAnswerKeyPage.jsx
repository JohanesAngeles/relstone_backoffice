import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import { FaChevronLeft, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ANSWER_COLORS = {
  A: { bg: '#dbeafe', color: '#1d4ed8' },
  B: { bg: '#dcfce7', color: '#15803d' },
  C: { bg: '#fef3c7', color: '#92400e' },
  D: { bg: '#fce7f3', color: '#9d174d' },
};

const ExamAnswerKeyPage = () => {
  const { bundleId } = useParams();
  const navigate     = useNavigate();

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState(null);
  const [backHovered, setBackHovered] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch(`${API}/api/exam-qanda/bundles/${decodeURIComponent(bundleId)}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Bundle not found');
        return r.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [bundleId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSearch(''); setExpanded(null); }, [activeTab]);

  const currentTab = data?.tabs?.[activeTab];

  const filteredQuestions = (currentTab?.questions || []).filter(q =>
    q.question.toLowerCase().includes(search.toLowerCase()) ||
    String(q.questionNumber).includes(search)
  );

  return (
    <AppLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');
        .ek-tab:hover { color: #2EABFE !important; }
        .ek-row:hover { background: #f8fafc !important; cursor: pointer; }
        .ek-row { transition: background 0.12s; }
      `}</style>

      <div style={S.page}>
        <Breadcrumb crumbs={[
          { label: 'Dashboard',   to: '/admin' },
          { label: 'Real Estate', to: '/admin/real-estate' },
          { label: 'RELS CMS',    to: '/admin/real-estate/online-exam/rels-cms' },
          { label: decodeURIComponent(bundleId) },
        ]} />

        {/* ── Header ── */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>{decodeURIComponent(bundleId)}</h1>
            <p style={S.subtitle}>
              {loading
                ? 'Loading...'
                : data
                  ? `${data.totalQuestions} total questions · ${data.tabs.length} exam versions`
                  : ''}
            </p>
          </div>
          <button
            style={{ ...S.backBtn, ...(backHovered ? { background: '#f3f4f6' } : {}) }}
            onClick={() => navigate('/admin/real-estate/online-exam/rels-cms')}
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
          >
            <FaChevronLeft style={{ fontSize: '0.7rem' }} />
            Back To RELS CMS
          </button>
        </div>

        <hr style={S.divider} />

        {loading && <p style={S.info}>Loading answer key...</p>}
        {error   && <p style={{ ...S.info, color: '#ef4444' }}>{error}</p>}

        {data && (
          <div style={S.card}>

            {/* ── Dropdown + Search Row ── */}
<div style={S.tabsRow}>
  <div style={S.dropdownWrap}>
    <select
      value={activeTab}
      onChange={e => setActiveTab(Number(e.target.value))}
      style={S.dropdown}
    >
      {data.tabs.map((tab, i) => (
        <option key={i} value={i}>
          {tab.examName} — {tab.version} ({tab.questions.length} Qs)
        </option>
      ))}
    </select>
    {/* Version + Count Badges */}
    <div style={S.dropdownBadges}>
      <span style={{
        ...S.vBadge,
        background: data.tabs[activeTab]?.version === 'Version A' ? '#dbeafe' : '#ede9fe',
        color:      data.tabs[activeTab]?.version === 'Version A' ? '#1d4ed8' : '#7c3aed',
      }}>
        {data.tabs[activeTab]?.version === 'Version A' ? 'Ver A' : 'Ver B'}
      </span>
      <span style={S.tabCountActive}>
        {data.tabs[activeTab]?.questions.length} Qs
      </span>
    </div>
  </div>

  {/* Search */}
  <div style={S.searchWrap}>
    <FaSearch style={{ color: '#7FA8C4', fontSize: '0.75rem' }} />
    <input
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search questions..."
      style={S.searchInput}
    />
  </div>
</div>

            {/* ── Meta Chips ── */}
            {currentTab && (
              <div style={S.metaRow}>
                <span style={S.metaChip}>{currentTab.courseGroup}</span>
                {currentTab.electiveGroup && <span style={S.metaChip}>{currentTab.electiveGroup}</span>}
                {currentTab.part         && <span style={S.metaChip}>{currentTab.part}</span>}
                <span style={{ ...S.metaChip, background: '#f0fdf4', color: '#15803d' }}>
                  {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* ── Table ── */}
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 48, textAlign: 'center' }}>#</th>
                    <th style={S.th}>QUESTION</th>
                    <th style={{ ...S.th, width: 80, textAlign: 'center' }}>ANSWER</th>
                    <th style={{ ...S.th, width: 160 }}>PAGE REF</th>
                    <th style={{ ...S.th, width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={S.emptyCell}>No questions found.</td>
                    </tr>
                  ) : filteredQuestions.map(q => {
                    const isExpanded = expanded === q._id;
                    const ac = ANSWER_COLORS[q.correctAnswer] || {};
                    return (
                      <>
                        {/* Question Row */}
                        <tr
                          key={q._id}
                          className="ek-row"
                          style={S.tr}
                          onClick={() => setExpanded(isExpanded ? null : q._id)}
                        >
                          <td style={{ ...S.td, textAlign: 'center', color: '#7FA8C4', fontWeight: 700, fontSize: '0.78rem' }}>
                            {q.questionNumber}
                          </td>
                          <td style={S.td}>
                            <p style={S.questionText}>{q.question}</p>
                          </td>
                          <td style={{ ...S.td, textAlign: 'center' }}>
                            <span style={{ ...S.answerBadge, background: ac.bg, color: ac.color }}>
                              {q.correctAnswer}
                            </span>
                          </td>
                          <td style={{ ...S.td, fontSize: '0.72rem', color: '#7FA8C4' }}>
                            {q.pageReference || '—'}
                          </td>
                          <td style={{ ...S.td, textAlign: 'center', color: '#cbd5e1' }}>
                            {isExpanded
                              ? <FaChevronUp style={{ fontSize: '0.65rem' }} />
                              : <FaChevronDown style={{ fontSize: '0.65rem' }} />}
                          </td>
                        </tr>

                        {/* Expanded Options */}
                        {isExpanded && (
                          <tr key={`${q._id}-exp`} style={{ background: '#f8fafc' }}>
                            <td />
                            <td colSpan={4} style={{ padding: '0.5rem 0.65rem 0.9rem' }}>
                              <div style={S.optionsGrid}>
                                {['A', 'B', 'C', 'D'].map(letter => {
                                  const isCorrect = q.correctAnswer === letter;
                                  const c = ANSWER_COLORS[letter];
                                  return (
                                    <div
                                      key={letter}
                                      style={{
                                        ...S.optionRow,
                                        background: isCorrect ? c.bg    : '#f1f5f9',
                                        borderLeft: isCorrect ? `3px solid ${c.color}` : '3px solid transparent',
                                      }}
                                    >
                                      <span style={{ ...S.optionLetter, background: c.bg, color: c.color }}>
                                        {letter}
                                      </span>
                                      <span style={{
                                        ...S.optionText,
                                        fontWeight: isCorrect ? 700 : 400,
                                        color:      isCorrect ? '#091925' : '#5B7384',
                                      }}>
                                        {q.options?.[letter] || '—'}
                                      </span>
                                      {isCorrect && <span style={S.correctTag}>✓ Correct</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </AppLayout>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page:     { padding: '1.5rem 2rem', fontFamily: "'Poppins', sans-serif", minHeight: '100vh' },
  header:   { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' },
  title:    { fontSize: '2rem', fontWeight: 700, color: '#000', margin: '0 0 0.3rem 0', lineHeight: 1.1, fontFamily: "'Poppins', sans-serif" },
  subtitle: { fontSize: '0.875rem', fontWeight: 500, color: '#5B7384', margin: 0 },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff',
    border: '0.5px solid #5B7384', borderRadius: '8px', padding: '0.45rem 1rem',
    fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Poppins', sans-serif",
    color: '#5B7384', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '0.35rem',
  },
  divider:  { border: 'none', borderTop: '0.5px solid #2EABFE', margin: '0 0 1.25rem 0' },
  info:     { fontSize: '0.85rem', color: '#5B7384', textAlign: 'center', marginTop: '3rem' },
  card:     { background: '#fff', borderRadius: '10px', padding: '1rem', overflow: 'hidden' },

  tabsRow:    { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' },
  tabsScroll: { display: 'flex', flexWrap: 'wrap', gap: '0.25rem', flex: 1 },
  tab: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    background: 'none', border: 'none', padding: '0.4rem 0.65rem',
    borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500,
    color: '#5B7384', cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
    transition: 'color 0.15s', whiteSpace: 'nowrap',
  },
  tabActive:      { background: '#EFF6FF', color: '#2EABFE', fontWeight: 700 },
  tabLabel:       { maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' },
  tabCount:       { background: '#e2e8f0', color: '#64748b', fontSize: '0.63rem', fontWeight: 700, padding: '1px 5px', borderRadius: '10px', flexShrink: 0 },
  tabCountActive: { background: '#bfdbfe', color: '#1d4ed8' },
  vBadge:         { fontSize: '0.63rem', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', flexShrink: 0 },

  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    background: '#f8fafc', border: '0.5px solid #e2e8f0',
    borderRadius: '6px', padding: '0.4rem 0.65rem', flexShrink: 0,
  },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8rem', color: '#091925', fontFamily: "'Poppins', sans-serif", width: 160 },

  metaRow:  { display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
  metaChip: { fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#f1f5f9', color: '#5B7384' },

  tableWrap:    { overflowX: 'auto' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { fontSize: '0.7rem', fontWeight: 700, color: '#7FA8C4', padding: '0.5rem 0.65rem', textAlign: 'left', borderBottom: '0.5px solid #e2e8f0', letterSpacing: '0.05em', whiteSpace: 'nowrap' },
  tr:           { cursor: 'pointer' },
  td:           { padding: '0.65rem 0.65rem', borderBottom: '0.5px solid #f1f5f9', verticalAlign: 'middle' },
  emptyCell:    { padding: '2rem', textAlign: 'center', color: '#7FA8C4', fontSize: '0.85rem' },
  questionText: { fontSize: '0.82rem', color: '#091925', margin: 0, lineHeight: 1.5 },
  answerBadge:  { fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' },

  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  optionRow:   { display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '6px', padding: '0.4rem 0.65rem' },
  optionLetter:{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 },
  optionText:  { fontSize: '0.8rem', flex: 1, lineHeight: 1.4 },
  correctTag:  { fontSize: '0.68rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 7px', borderRadius: '20px', flexShrink: 0 },
  dropdownWrap: {
  display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1,
  },
  dropdown: {
    flex: 1, padding: '0.5rem 0.75rem',
    border: '0.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '0.8rem', fontFamily: "'Poppins', sans-serif",
    color: '#091925', background: '#f8fafc',
    cursor: 'pointer', outline: 'none',
    maxWidth: 520,
  },
  dropdownBadges: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
  },

};


export default ExamAnswerKeyPage;