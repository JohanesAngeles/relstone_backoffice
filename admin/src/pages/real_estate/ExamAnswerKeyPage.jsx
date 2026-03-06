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
  const [activeTab, setActiveTab]     = useState(0);
  const [allVersions, setAllVersions] = useState(false);
  const [search, setSearch]           = useState('');
  const [expanded, setExpanded]       = useState(null);
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .ek-wrap * { font-family: 'Poppins', sans-serif !important; }
        .ek-tab:hover { color: #2EABFE !important; }
        .ek-row:hover { background: #f8fafc !important; cursor: pointer; }
        .ek-row { transition: background 0.12s; }
        .ek-dl-btn:hover { background: rgba(46,171,254,0.2) !important; }
        .ek-version-tab:hover { color: #2EABFE !important; border-color: #2EABFE !important; }
      `}</style>

      <div className="ek-wrap" style={S.page}>
        <Breadcrumb crumbs={[
          { label: 'Dashboard',   to: '/admin' },
          { label: 'Real Estate', to: '/admin/real-estate' },
          { label: 'RELS CMS',    to: '/admin/real-estate/online-exam/rels-cms' },
          { label: decodeURIComponent(bundleId) },
        ]} />

        {/* ── Banner Header (dark, matching Figma) ── */}
        <div style={S.banner}>
          <div style={S.bannerOverlay} />
          <div style={S.bannerInner}>
            <div style={S.bannerIconWrap}>
              {/* exam icon placeholder */}
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#2EABFE">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={S.bannerTitle}>{decodeURIComponent(bundleId)}</h1>
              <div style={S.bannerChips}>
                {/* Course code chip */}
                <span style={S.chipDark}>
                  {loading ? '...' : data?.courseCode || decodeURIComponent(bundleId).split(' ')[0] || '—'}
                </span>
                {/* Question count chip */}
                {data && (
                  <span style={S.chipPurple}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#9569F7" style={{ marginRight: 4 }}>
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 011-1 1.5 1.5 0 10-1.471-1.794l-1.962-.393A3.5 3.5 0 1113 13.355z"/>
                    </svg>
                    {loading ? '…' : `${data?.totalQuestions || 0} Questions`}
                  </span>
                )}
                {/* Cert expiry chip */}
                <span style={S.chipRed}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#EF4444" style={{ marginRight: 4 }}>
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
                  </svg>
                  Cert Expiry: No
                </span>
                {/* Relstone chip */}
                <span style={S.chipBlue}>Not on Relstone</span>
              </div>
            </div>
            <button
              style={{ ...S.backBtn, ...(backHovered ? { background: '#f3f4f6' } : {}) }}
              onClick={() => navigate('/admin/real-estate/online-exam/rels-cms')}
              onMouseEnter={() => setBackHovered(true)}
              onMouseLeave={() => setBackHovered(false)}
            >
              <FaChevronLeft style={{ fontSize: '0.55rem' }} />
              Back To RELS CMS
            </button>
          </div>
        </div>

        {/* ── Sub-header: Version tabs + Download + Search ── */}
        <div style={S.subHeader}>
          {/* Version tabs */}
          <div style={S.versionTabs}>
            {/* All Versions tab */}
            <button
              style={{ ...S.versionTab, ...(allVersions ? S.versionTabAllActive : {}) }}
              onClick={() => setAllVersions(true)}
            >
              All Versions
            </button>
            {data?.tabs?.map((tab, i) => {
              const isVerA = tab.version === 'Version A';
              return (
                <button
                  key={i}
                  className="ek-version-tab"
                  style={{
                    ...S.versionTab,
                    ...(!allVersions && activeTab === i ? S.versionTabActive : {}),
                  }}
                  onClick={() => setActiveTab(i)}
                >
                  {/* Short exam name */}
                  <span style={{
                    fontWeight: !allVersions && activeTab === i ? 700 : 600,
                    color: !allVersions && activeTab === i ? '#2EABFE' : '#5B7384',
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    {tab.examName.length > 10 ? tab.examName.slice(0, 10) + '…' : tab.examName}
                  </span>
                  {/* Ver A / Ver B badge */}
                  <span style={{
                    fontSize: '0.58rem', fontWeight: 700,
                    padding: '1px 5px', borderRadius: '4px',
                    background: isVerA ? '#dbeafe' : '#ede9fe',
                    color:      isVerA ? '#1d4ed8' : '#7c3aed',
                    marginLeft: '0.25rem', flexShrink: 0,
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    {isVerA ? 'Ver A' : 'Ver B'}
                  </span>
                  {/* Question count bubble */}
                  <span style={{
                    fontSize: '0.58rem', fontWeight: 700,
                    padding: '1px 5px', borderRadius: '100px',
                    background: !allVersions && activeTab === i ? 'rgba(9,25,37,0.1)' : 'rgba(91,115,132,0.1)',
                    color:      !allVersions && activeTab === i ? '#091925' : '#5B7384',
                    marginLeft: '0.15rem', flexShrink: 0,
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    {tab.questions.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Download as PDF */}
            <button
              className="ek-dl-btn"
              style={S.dlBtn}
            >
              <svg width="13" height="18" viewBox="0 0 24 24" fill="#2EABFE">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM12 17l-4-4h2.5v-3h3v3H16l-4 4z"/>
              </svg>
              Download as PDF
            </button>

            {/* Search */}
            <div style={S.searchWrap}>
              <FaSearch style={{ color: '#7FA8C4', fontSize: '0.75rem' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search within questions..."
                style={S.searchInput}
              />
            </div>
          </div>
        </div>

        {loading && <p style={S.info}>Loading answer key...</p>}
        {error   && <p style={{ ...S.info, color: '#ef4444' }}>{error}</p>}

        {data && (
          <div style={S.card}>

            {/* ── Meta Chips ── */}
            {currentTab && (
              <div style={S.metaRow}>
                <span style={S.metaChip}>{currentTab.courseGroup}</span>
                {currentTab.electiveGroup && <span style={S.metaChip}>{currentTab.electiveGroup}</span>}
                {currentTab.part         && <span style={S.metaChip}>{currentTab.part}</span>}
                <span style={{ ...S.metaChip, background: '#f0fdf4', color: '#15803d', border: '0.5px solid #15803d' }}>
                  {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* ── Questions Header ── */}
            <div style={S.questionsHeader}>
              <span style={S.questionsTitle}>Questions</span>
              <span style={S.questionsBadge}>{filteredQuestions.length}</span>
            </div>

            {/* ── Table ── */}
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr style={{ background: 'rgba(46,171,254,0.05)' }}>
                    <th style={{ ...S.th, width: 55, textAlign: 'center', borderTop: '0.5px solid #5B7384', borderBottom: '0.5px solid #5B7384' }}>#</th>
                    <th style={S.th}>QUESTION</th>
                    <th style={{ ...S.th, width: 120, textAlign: 'center' }}>ANSWER</th>
                    <th style={{ ...S.th, width: 160 }}>PAGE REF</th>
                    <th style={{ ...S.th, width: 70, textAlign: 'center' }}>EDIT</th>
                    <th style={{ ...S.th, width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={S.emptyCell}>No questions found.</td>
                    </tr>
                  ) : filteredQuestions.map(q => {
                    const isExpanded = expanded === q._id;
                    return (
                      <>
                        {/* Question Row */}
                        <tr
                          key={q._id}
                          className="ek-row"
                          style={S.tr}
                          onClick={() => setExpanded(isExpanded ? null : q._id)}
                        >
                          {/* Number badge */}
                          <td style={{ ...S.td, textAlign: 'center' }}>
                            <span style={S.numBadge}>{q.questionNumber}</span>
                          </td>
                          <td style={S.td}>
                            <p style={S.questionText}>{q.question}</p>
                          </td>
                          {/* Correct answer badge — green pill matching Figma */}
                          <td style={{ ...S.td, textAlign: 'center' }}>
                            <span style={S.correctBadge}>
                              Correct: {q.correctAnswer}
                            </span>
                          </td>
                          <td style={{ ...S.td, fontSize: '0.72rem', color: '#7FA8C4', fontFamily: "'Poppins', sans-serif" }}>
                            {q.pageReference || '—'}
                          </td>
                          {/* Edit button per row */}
                          <td style={{ ...S.td, textAlign: 'center' }}>
                            <button
                              style={S.editBtn}
                              onClick={e => { e.stopPropagation(); /* edit handler */ }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="#2EABFE">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                              Edit
                            </button>
                          </td>
                          <td style={{ ...S.td, textAlign: 'center', color: '#cbd5e1' }}>
                            {isExpanded
                              ? <FaChevronUp style={{ fontSize: '0.65rem', opacity: 0.5 }} />
                              : <FaChevronDown style={{ fontSize: '0.65rem', opacity: 0.5 }} />}
                          </td>
                        </tr>

                        {/* Expanded Options */}
                        {isExpanded && (
                          <tr key={`${q._id}-exp`} style={{ background: '#f8fafc' }}>
                            <td />
                            <td colSpan={5} style={{ padding: '0.5rem 0.65rem 0.9rem' }}>
                              <div style={S.optionsGrid}>
                                {['A', 'B', 'C', 'D'].map(letter => {
                                  const isCorrect = q.correctAnswer === letter;
                                  const c = ANSWER_COLORS[letter];
                                  return (
                                    <div
                                      key={letter}
                                      style={{
                                        ...S.optionRow,
                                        background: isCorrect ? c.bg    : 'rgba(91,115,132,0.05)',
                                        border:     isCorrect ? `0.5px solid ${c.color}` : '0.5px solid #5B7384',
                                        borderLeft: isCorrect ? `3px solid ${c.color}` : '3px solid transparent',
                                      }}
                                    >
                                      <span style={{
                                        ...S.optionLetter,
                                        background: isCorrect ? c.bg : 'rgba(91,115,132,0.1)',
                                        color:      isCorrect ? c.color : '#5B7384',
                                        border:     isCorrect ? `0.5px solid ${c.color}` : '0.5px solid #5B7384',
                                      }}>
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
  page: { padding: '1.25rem 1.75rem', fontFamily: "'Poppins', sans-serif", minHeight: '100vh' },

  // ── Dark banner header (matches Figma dark top section) ──
  banner: {
    position: 'relative',
    background: '#091925',
    borderRadius: '5px 5px 0 0',
    overflow: 'hidden',
    marginBottom: 0,
  },
  bannerOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%)',
    borderRadius: '5px 5px 0 0',
    pointerEvents: 'none',
  },
  bannerInner: {
    position: 'relative',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '1rem 1.25rem',
  },
  bannerIconWrap: {
    width: 64, height: 64, flexShrink: 0,
    background: 'rgba(46,171,254,0.1)', border: '0.5px solid #2EABFE',
    borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF',
    margin: '0 0 0.35rem 0', lineHeight: 1.2,
    fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize',
  },
  bannerChips: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' },

  // Chips
  chipDark: {
    fontSize: '0.7rem', fontWeight: 500, padding: '3px 10px',
    borderRadius: '5px', background: '#DBE0E5', border: '0.5px solid #091925',
    color: '#091925', fontFamily: "'Poppins', sans-serif",
  },
  chipPurple: {
    display: 'inline-flex', alignItems: 'center',
    fontSize: '0.7rem', fontWeight: 500, padding: '3px 10px',
    borderRadius: '5px', background: 'rgba(149,105,247,0.1)', border: '0.5px solid #9569F7',
    color: '#9569F7', fontFamily: "'Poppins', sans-serif",
  },
  chipRed: {
    display: 'inline-flex', alignItems: 'center',
    fontSize: '0.7rem', fontWeight: 500, padding: '3px 10px',
    borderRadius: '5px', background: 'rgba(239,68,68,0.1)', border: '0.5px solid #EF4444',
    color: '#EF4444', fontFamily: "'Poppins', sans-serif",
  },
  chipBlue: {
    fontSize: '0.7rem', fontWeight: 500, padding: '3px 10px',
    borderRadius: '5px', background: 'rgba(46,171,254,0.1)', border: '0.5px solid #2EABFE',
    color: '#2EABFE', fontFamily: "'Poppins', sans-serif",
  },

  backBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff',
    border: '0.5px solid #5B7384', borderRadius: '5px', padding: '0.45rem 1rem',
    fontSize: '0.7rem', fontWeight: 700, fontFamily: "'Poppins', sans-serif",
    color: '#5B7384', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 'auto',
  },

  // ── Sub header (version tabs + download + search) ──
  subHeader: {
    background: '#fff', borderRadius: '0 0 0 0',
    padding: '0.65rem 1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '0.75rem', flexWrap: 'wrap',
    marginBottom: '0.75rem',
    borderBottom: '0.5px solid #e2e8f0',
  },
  versionTabs: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  versionTab: {
    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
    padding: '0.35rem 0.75rem', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 600,
    fontFamily: "'Poppins', sans-serif", cursor: 'pointer',
    background: 'rgba(127,168,196,0.1)', border: '0.5px solid #7FA8C4',
    color: '#5B7384', transition: 'all 0.15s', whiteSpace: 'nowrap',
  },
  versionTabAllActive: {
    background: '#2EABFE', border: '0.5px solid #2EABFE', color: '#091925',
  },
  versionTabActive: {
    background: 'rgba(46,171,254,0.1)', border: '0.5px solid #2EABFE', color: '#2EABFE',
  },

  dlBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    background: 'rgba(46,171,254,0.1)', border: '0.5px solid #2EABFE',
    borderRadius: '5px', padding: '0.45rem 0.85rem',
    fontSize: '0.7rem', fontWeight: 700, color: '#2EABFE',
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
    transition: 'background 0.15s',
  },

  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    background: 'rgba(127,168,196,0.1)', border: '0.5px solid #7FA8C4',
    borderRadius: '5px', padding: '0.4rem 0.65rem',
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: '0.72rem', color: '#091925', fontFamily: "'Poppins', sans-serif",
    width: 180,
  },

  info:     { fontSize: '0.85rem', color: '#5B7384', textAlign: 'center', marginTop: '3rem' },

  // ── Content card ──
  card: { background: '#fff', borderRadius: '5px', padding: '1rem', overflow: 'hidden' },

  // ── Exam tab bar ──
  tabsRow:    { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.6rem', flexWrap: 'wrap' },
  tabsScroll: { display: 'flex', flexWrap: 'wrap', gap: '0.25rem', flex: 1 },
  tab: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    background: 'none', border: 'none', padding: '0.35rem 0.55rem',
    borderRadius: '5px', fontSize: '0.7rem', fontWeight: 500,
    color: '#5B7384', cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
    transition: 'color 0.15s', whiteSpace: 'nowrap',
  },
  tabActive:      { background: '#EFF6FF', color: '#2EABFE', fontWeight: 700 },
  tabLabel:       { maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' },
  tabCount:       { background: 'rgba(91,115,132,0.1)', color: '#64748b', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '100px', flexShrink: 0 },
  tabCountActive: { background: '#bfdbfe', color: '#1d4ed8' },
  vBadge:         { fontSize: '0.6rem', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', flexShrink: 0 },

  // ── Meta chips row ──
  metaRow:  { display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.6rem' },
  metaChip: {
    fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '100px',
    background: '#f1f5f9', color: '#5B7384', border: '0.5px solid #e2e8f0',
    fontFamily: "'Poppins', sans-serif",
  },

  // ── "Questions" section header ──
  questionsHeader: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.4rem 0', marginBottom: '0.35rem',
  },
  questionsTitle: {
    fontSize: '1rem', fontWeight: 500, color: '#091925',
    fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize',
  },
  questionsBadge: {
    background: 'rgba(26,122,184,0.1)', color: '#1A7AB8',
    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
    borderRadius: '100px', fontFamily: "'Poppins', sans-serif",
  },

  // ── Table ──
  tableWrap: { overflowX: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontSize: '0.65rem', fontWeight: 500, color: '#5B7384',
    padding: '0.5rem 0.65rem', textAlign: 'left',
    borderTop: '0.5px solid #5B7384', borderBottom: '0.5px solid #5B7384',
    letterSpacing: '0.05em', whiteSpace: 'nowrap',
    fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase',
    background: 'rgba(46,171,254,0.05)',
  },
  tr:       { cursor: 'pointer', transition: 'background 0.12s' },
  td:       { padding: '0.65rem 0.65rem', borderBottom: '0.5px solid #5B7384', verticalAlign: 'middle' },
  emptyCell:{ padding: '2rem', textAlign: 'center', color: '#7FA8C4', fontSize: '0.85rem', fontFamily: "'Poppins', sans-serif" },

  // Number badge (blue outlined box like Figma)
  numBadge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: '5px',
    background: 'rgba(46,171,254,0.1)', border: '0.5px solid #2EABFE',
    color: '#2EABFE', fontSize: '0.7rem', fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
  },

  questionText: { fontSize: '0.85rem', fontWeight: 500, color: '#091925', margin: 0, lineHeight: 1.5, fontFamily: "'Poppins', sans-serif" },

  // Green "Correct: X" pill (matching Figma)
  correctBadge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.72rem', fontWeight: 400, color: '#008000',
    background: 'rgba(0,128,0,0.1)', border: '0.5px solid #008000',
    borderRadius: '5px', padding: '4px 10px', whiteSpace: 'nowrap',
    fontFamily: "'Poppins', sans-serif",
  },

  // Edit button per row (blue outlined)
  editBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    background: 'rgba(46,171,254,0.1)', border: '0.5px solid #2EABFE',
    borderRadius: '5px', padding: '4px 10px',
    fontSize: '0.7rem', fontWeight: 700, color: '#2EABFE',
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
  },

  // ── Expanded options ──
  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  optionRow:   {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    borderRadius: '5px', padding: '0.4rem 0.65rem',
  },
  optionLetter: {
    width: 24, height: 24, borderRadius: '2px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
    fontFamily: "'Poppins', sans-serif",
  },
  optionText:  { fontSize: '0.82rem', fontWeight: 500, flex: 1, lineHeight: 1.4, fontFamily: "'Poppins', sans-serif" },
  correctTag:  {
    fontSize: '0.65rem', fontWeight: 700, color: '#15803d',
    background: '#dcfce7', border: '0.5px solid #15803d',
    padding: '2px 7px', borderRadius: '100px', flexShrink: 0,
    fontFamily: "'Poppins', sans-serif",
  },
};

export default ExamAnswerKeyPage;
