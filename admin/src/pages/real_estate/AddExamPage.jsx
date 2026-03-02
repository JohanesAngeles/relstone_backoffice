// src/pages/real_estate/AddExamPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import { getStudent } from '../../services/students';

// ── Icons ─────────────────────────────────────────────────────
const Icon = ({ d, size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
  </svg>
);

const ChevronDown = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
    stroke="#5B7384" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── Skeleton rows ─────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[36, 90, 340].map((w, i) => (
      <td key={i} style={{ padding: '11px 16px' }}>
        <div style={{
          height: 10, borderRadius: 4, width: w,
          background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }} />
      </td>
    ))}
  </tr>
);

// ── Smart pagination: 1 … 12 13 [14] 15 16 … 98 ──────────────
const getPageWindow = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  const left  = Math.max(2, current - 2);
  const right = Math.min(total - 1, current + 2);
  pages.push(1);
  if (left > 2)          pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('...');
  pages.push(total);
  return pages;
};

// ── Type filter: keyword → courseTitle substring match ────────
const TYPE_OPTIONS = [
  { label: 'All Type',    keyword: '' },
  { label: 'Pre-license', keyword: 'pre-license' },
  { label: 'R.E.',        keyword: 'r.e.' },
  { label: 'Exam Prep',   keyword: 'exam prep' },
];

// ── Hours filter: keyword → courseTitle substring match ───────
const HOURS_OPTIONS = [
  { label: 'All Hours', keyword: '' },
  { label: '3 Hour',    keyword: '3 hour' },
  { label: '8 Hour',    keyword: '8 hour' },
  { label: '12 Hour',   keyword: '12 hour' },
  { label: '15 Hour',   keyword: '15 hour' },
  { label: '45 Hour',   keyword: '45 hour' },
];

const PAGE_SIZE = 10;

// Custom Select component (styled, no native ugliness)
const FilterSelect = ({ value, onChange, options }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={s.filterSelect}
      >
        {options.map(o => (
          <option key={o.label} value={o.label}>{o.label}</option>
        ))}
      </select>
      <span style={s.chevronWrap}><ChevronDown /></span>
    </div>
  );
};

const AddExamPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  // ── Student ───────────────────────────────────────────────
  const [student,        setStudent]        = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);

  // ── Exam list (full page from API) ────────────────────────
  const [exams,        setExams]        = useState([]);    // raw from API
  const [total,        setTotal]        = useState(0);     // total in DB (for search)
  const [examsLoading, setExamsLoading] = useState(false);
  const [examsError,   setExamsError]   = useState('');

  // ── Filters ───────────────────────────────────────────────
  const [query,       setQuery]       = useState('');
  const [debouncedQ,  setDebouncedQ]  = useState('');
  const [typeFilter,  setTypeFilter]  = useState('All Type');
  const [hoursFilter, setHoursFilter] = useState('All Hours');
  const [emailOptOut, setEmailOptOut] = useState('No');

  // ── Selection & pagination ────────────────────────────────
  const [selected, setSelected] = useState(null);
  const [page,     setPage]     = useState(1);
  const [saving,   setSaving]   = useState(false);

  // ── Load student ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const res = await getStudent(id);
      if (res.ok) setStudent(res.data);
      setStudentLoading(false);
    })();
  }, [id]);

  // ── Debounce search 400ms ─────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(query); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset page when frontend filters change
  useEffect(() => { setPage(1); }, [typeFilter, hoursFilter]);

  // ── Fetch from API (search only — type/hours filtered FE) ─
  const fetchExams = useCallback(async () => {
    setExamsLoading(true);
    setExamsError('');
    try {
      // Fetch a larger batch so frontend type/hours filters have data to work with.
      // When no search, fetch 200 at a time; when searching, just fetch 50.
      const batchSize = debouncedQ ? 50 : 200;
      const params = new URLSearchParams({ page: 1, limit: batchSize });
      if (debouncedQ) params.set('search', debouncedQ);
      const res  = await fetch(`/api/exams/courses?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load courses');
      setExams(data.courses || []);
      setTotal(data.total   || 0);
    } catch (err) {
      setExamsError(err.message);
      setExams([]);
      setTotal(0);
    } finally {
      setExamsLoading(false);
    }
  }, [debouncedQ]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  // ── Frontend filter + paginate ────────────────────────────
  const typeKeyword  = TYPE_OPTIONS.find(o => o.label === typeFilter)?.keyword  || '';
  const hoursKeyword = HOURS_OPTIONS.find(o => o.label === hoursFilter)?.keyword || '';

  const filtered = exams.filter(exam => {
    const title = (exam.courseTitle || '').toLowerCase();
    const matchType  = !typeKeyword  || title.includes(typeKeyword);
    const matchHours = !hoursKeyword || title.includes(hoursKeyword);
    return matchType && matchHours;
  });

  const totalFiltered = filtered.length;
  const totalPages    = Math.ceil(totalFiltered / PAGE_SIZE);
  const pageWindow    = getPageWindow(page, totalPages);
  const pageData      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startRecord   = totalFiltered === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRecord     = Math.min(page * PAGE_SIZE, totalFiltered);

  // ── Add exam to student ───────────────────────────────────
  const handleAddExam = async () => {
    if (!selected) return;
    const exam = exams.find(e => e.examMasterID === selected);
    setSaving(true);
    try {
      const res = await fetch(`/api/students/${id}/add-exam`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ examMasterID: exam.examMasterID, courseTitle: exam.courseTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add exam');
      navigate(`/admin/real-estate/online-exam/backoffice/student/${id}`);
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Derived student info ──────────────────────────────────
  const name       = student?.name           || '—';
  const studentId  = student?.studentId      || id;
  const city       = student?.state          || '';
  const registered = student?.firstOrderDate || '';
  const email      = student?.email          || '';

  return (
    <AppLayout>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .ae-row { transition: background 0.12s; }
        .ae-row:hover { background: rgba(46,171,254,0.05) !important; cursor: pointer; }
        .ae-fs { appearance: none; -webkit-appearance: none; }
        .ae-fs:focus { outline: none; border-color: #2EABFE !important; }
        .ae-search:focus { outline: none; }
        .ae-pg:hover:not(.ae-active):not(.ae-dots) { background: rgba(46,171,254,0.1) !important; color: #2EABFE !important; border-color: rgba(46,171,254,0.4) !important; }
      `}</style>

      <div style={{ padding: '1.5rem 2rem' }}>

        {/* Breadcrumb + Back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Breadcrumb crumbs={[
            { label: 'Dashboard',    to: '/admin' },
            { label: 'Real Estate',  to: '/admin/real-estate' },
            { label: 'BackOffice',   to: '/admin/real-estate/online-exam/backoffice' },
            { label: `Student Info — ${name}`, to: `/admin/real-estate/online-exam/backoffice/student/${id}` },
            { label: 'Add Exam' },
          ]} />
          <button
            onClick={() => navigate(`/admin/real-estate/online-exam/backoffice/student/${id}`)}
            style={s.backBtn}
          >
            <Icon d="M19 12H5 M12 19l-7-7 7-7" size={12} />
            Back To Student Record
          </button>
        </div>

        {/* Dark Header Card */}
        <div style={s.headerCard}>
          <div style={s.headerLeft}>
            <div style={s.bigAvatar}>
              {studentLoading ? '…' : (name[0] || '?').toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={s.studentName}>{studentLoading ? 'Loading…' : name}</h1>
                {!studentLoading && (
                  <span style={s.activeBadge}>
                    <svg width={7} height={7} viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#10B981"/></svg>
                    Active
                  </span>
                )}
              </div>
              <div style={s.headerMeta}>
                {city && (
                  <span style={s.metaItem}>
                    <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0" size={11} color="#2EABFE" />
                    <span style={s.metaLabel}>City:</span>
                    <span style={s.metaValue}>{city}</span>
                  </span>
                )}
                {registered && (
                  <span style={s.metaItem}>
                    <Icon d="M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={11} color="#2EABFE" />
                    <span style={s.metaLabel}>Registered:</span>
                    <span style={s.metaValue}>{registered}</span>
                  </span>
                )}
                {email && (
                  <span style={s.metaItem}>
                    <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" size={11} color="#2EABFE" />
                    <span style={s.metaValue}>{email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={s.headerRight}>
            <p style={s.studentIdLabel}>Student ID</p>
            <p style={s.studentIdValue}>[{studentId}]</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={s.filterBar}>
          {/* Search */}
          <div style={s.searchWrap}>
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={14} color="#94a3b8" />
            <input
              className="ae-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search Courses By Title, Code, Type..."
              style={s.searchInput}
            />
            {query && (
              <button onClick={() => setQuery('')} style={s.clearX}>×</button>
            )}
          </div>

          {/* All Type */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              className="ae-fs"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={s.filterSelect}
            >
              {TYPE_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
            </select>
            <span style={s.chevronWrap}><ChevronDown /></span>
          </div>

          {/* All Hours */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              className="ae-fs"
              value={hoursFilter}
              onChange={e => setHoursFilter(e.target.value)}
              style={s.filterSelect}
            >
              {HOURS_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
            </select>
            <span style={s.chevronWrap}><ChevronDown /></span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Email Opt Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={s.optOutLabel}>Email Opt Out:</span>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select
                className="ae-fs"
                value={emailOptOut}
                onChange={e => setEmailOptOut(e.target.value)}
                style={{ ...s.filterSelect, minWidth: 68 }}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
              <span style={s.chevronWrap}><ChevronDown /></span>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div style={s.tableCard}>

          {/* Top bar */}
          <div style={s.tableTopBar}>
            <span style={s.tableTitle}>Search Results</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {selected && (
                <button
                  onClick={handleAddExam}
                  disabled={saving}
                  style={{ ...s.addBtn, opacity: saving ? 0.7 : 1 }}
                >
                  <Icon d="M12 5v14 M5 12h14" size={12} color="#fff" />
                  {saving ? 'Adding…' : 'Add Selected Exam'}
                </button>
              )}
              <button onClick={() => setSelected(null)} style={s.clearSelBtn}>
                ✕ Clear Selection
              </button>
            </div>
          </div>

          {/* Error */}
          {examsError && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.05)', borderBottom: '0.5px solid #fca5a5', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#dc2626', fontFamily: "'Poppins',sans-serif" }}>⚠ {examsError}</span>
              <button onClick={fetchExams} style={s.clearSelBtn}>Retry</button>
            </div>
          )}

          {/* Table */}
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={{ ...s.th, width: 40 }}>#</th>
                <th style={{ ...s.th, width: 130 }}>Exam Master ID</th>
                <th style={s.th}>Course Title</th>
              </tr>
            </thead>
            <tbody>
              {examsLoading
                ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
                : pageData.length === 0
                  ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13, fontFamily: "'Poppins',sans-serif" }}>
                        {(debouncedQ || typeKeyword || hoursKeyword)
                          ? 'No courses match your filters.'
                          : 'No courses found.'
                        }
                      </td>
                    </tr>
                  )
                  : pageData.map((exam, i) => {
                    const rowNum     = (page - 1) * PAGE_SIZE + i + 1;
                    const isSelected = selected === exam.examMasterID;
                    return (
                      <tr
                        key={exam._id}
                        className="ae-row"
                        onClick={() => setSelected(isSelected ? null : exam.examMasterID)}
                        style={{ ...s.tr, background: isSelected ? 'rgba(46,171,254,0.08)' : 'transparent' }}
                      >
                        <td style={s.td}>
                          {isSelected
                            ? <Icon d="M20 6L9 17l-5-5" size={13} color="#2EABFE" />
                            : <span style={s.numCell}>{rowNum}</span>
                          }
                        </td>
                        <td style={s.td}>
                          <span style={s.codeCell}>{exam.examMasterID || '—'}</span>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.titleCell, fontWeight: isSelected ? 600 : 500 }}>
                            {exam.courseTitle || '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>

          {/* Smart Pagination */}
          {!examsLoading && totalFiltered > 0 && (
            <div style={s.pagination}>
              <div style={s.paginationInfo}>
                <span>Showing</span>
                <strong style={{ color: '#091925' }}>{startRecord}–{endRecord}</strong>
                <span>Of</span>
                <strong style={{ color: '#091925' }}>{totalFiltered}</strong>
                <span>Records</span>
                {(typeKeyword || hoursKeyword) && total !== totalFiltered && (
                  <span style={{ color: '#94a3b8', marginLeft: 4 }}>
                    (filtered from {total})
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* Prev */}
                <button
                  className="ae-pg"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{ ...s.pageBtn, opacity: page === 1 ? 0.35 : 1 }}
                >‹</button>

                {pageWindow.map((p, i) =>
                  p === '...'
                    ? <span key={`d${i}`} className="ae-pg ae-dots"
                        style={{ ...s.pageBtn, border: 'none', background: 'none', color: '#94a3b8', cursor: 'default' }}>
                        …
                      </span>
                    : <button
                        key={p}
                        className={`ae-pg${page === p ? ' ae-active' : ''}`}
                        onClick={() => setPage(p)}
                        style={{
                          ...s.pageBtn,
                          background:  page === p ? '#2EABFE' : 'transparent',
                          color:       page === p ? '#091925' : '#5B7384',
                          fontWeight:  page === p ? 700 : 500,
                          borderColor: page === p ? '#2EABFE' : '#E2E8F0',
                        }}
                      >{p}</button>
                )}

                {/* Next */}
                <button
                  className="ae-pg"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{ ...s.pageBtn, opacity: page === totalPages ? 0.35 : 1 }}
                >›</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
};

// ── Styles ────────────────────────────────────────────────────
const s = {
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 7,
    border: '0.5px solid #CBD5E1', background: '#fff',
    color: '#091925', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', whiteSpace: 'nowrap',
  },
  headerCard: {
    background: '#091925',
    backgroundImage: 'linear-gradient(135deg, rgba(9,25,37,0.92) 0%, rgba(46,171,254,0.18) 100%)',
    borderRadius: 10, padding: '16px 22px', marginBottom: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 14 },
  bigAvatar: {
    width: 46, height: 46, borderRadius: '50%',
    background: 'linear-gradient(135deg,#2EABFE,#1a7fc4)',
    color: '#091925', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700, flexShrink: 0,
  },
  studentName: {
    fontSize: 22, fontWeight: 700, color: '#fff',
    fontFamily: "'Poppins', sans-serif", margin: 0,
  },
  activeBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 700,
    background: 'rgba(16,185,129,0.15)', color: '#10B981',
    border: '0.5px solid rgba(16,185,129,0.4)',
    padding: '3px 10px', borderRadius: 100,
    fontFamily: "'Poppins', sans-serif",
  },
  headerMeta: { display: 'flex', alignItems: 'center', gap: 18, marginTop: 7, flexWrap: 'wrap' },
  metaItem:   { display: 'inline-flex', alignItems: 'center', gap: 5 },
  metaLabel:  { fontSize: 12, color: '#fff',    fontWeight: 400, fontFamily: "'Poppins', sans-serif" },
  metaValue:  { fontSize: 12, color: '#2EABFE', fontWeight: 600, fontFamily: "'Poppins', sans-serif" },
  headerRight:    { textAlign: 'right', flexShrink: 0 },
  studentIdLabel: { fontSize: 11, color: '#7FA8C4', fontFamily: "'Poppins', sans-serif", marginBottom: 2 },
  studentIdValue: { fontSize: 17, fontWeight: 700, color: '#fff', fontFamily: "'DM Mono', monospace" },

  filterBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', borderRadius: 10,
    padding: '10px 16px', marginBottom: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    flexWrap: 'wrap',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    flex: 1, minWidth: 200, maxWidth: 360,
    border: '0.5px solid #CBD5E1', borderRadius: 7,
    padding: '7px 12px', background: '#F8FAFC',
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 12, color: '#091925', flex: 1,
    fontFamily: "'Poppins', sans-serif",
  },
  clearX: {
    border: 'none', background: 'transparent',
    color: '#94a3b8', cursor: 'pointer', fontSize: 17, lineHeight: 1, padding: '0 2px',
  },
  filterSelect: {
    border: '0.5px solid #CBD5E1', borderRadius: 7,
    padding: '7px 28px 7px 11px',
    fontSize: 12, fontWeight: 500, color: '#091925',
    background: '#fff', cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    appearance: 'none', WebkitAppearance: 'none',
    minWidth: 110,
  },
  chevronWrap: {
    position: 'absolute', right: 9, top: '50%',
    transform: 'translateY(-50%)', pointerEvents: 'none',
  },
  optOutLabel: {
    fontSize: 12, fontWeight: 500, color: '#5B7384',
    fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap',
  },

  tableCard: {
    background: '#fff', borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  tableTopBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderBottom: '0.5px solid #E2E8F0',
  },
  tableTitle: { fontSize: 13, fontWeight: 600, color: '#091925', fontFamily: "'Poppins', sans-serif" },
  addBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 7,
    background: '#2EABFE', color: '#fff',
    border: 'none', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
  },
  clearSelBtn: {
    padding: '6px 12px', borderRadius: 7,
    border: '0.5px solid #CBD5E1', background: '#fff',
    color: '#5B7384', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
  },

  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'rgba(127,168,196,0.08)' },
  th: {
    padding: '9px 16px', textAlign: 'left',
    fontSize: 10, fontWeight: 700, color: '#5B7384',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '0.5px solid #E2E8F0',
    fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '0.5px solid #F1F5F9' },
  td: { padding: '10px 16px', verticalAlign: 'middle' },
  numCell:  { fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#94a3b8' },
  codeCell: {
    fontSize: 11, fontFamily: "'DM Mono', monospace",
    background: '#F1F5F9', color: '#475569',
    padding: '2px 7px', borderRadius: 4, display: 'inline-block',
  },
  titleCell: { fontSize: 12, color: '#091925', fontFamily: "'Poppins', sans-serif" },

  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderTop: '0.5px solid #E2E8F0',
    flexWrap: 'wrap', gap: 10,
  },
  paginationInfo: {
    display: 'flex', gap: 5, alignItems: 'center',
    fontSize: 12, color: '#5B7384', fontFamily: "'Poppins', sans-serif",
  },
  pageBtn: {
    minWidth: 32, height: 32, borderRadius: 6,
    border: '0.5px solid #E2E8F0', fontSize: 12,
    fontFamily: "'Poppins', sans-serif", cursor: 'pointer',
    transition: 'all 0.15s', background: 'transparent',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 6px',
  },
};

export default AddExamPage;