// src/pages/real_estate/AddExamPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import { getStudent } from '../../services/students';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api/admin', '');

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

// ── Skeleton ──────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
<<<<<<< HEAD
    {[20, 20, 70, 60, 280, 50, 90, 80].map((w, i) => (
      <td key={i} style={{ padding: '9px 16px' }}>
=======
    {[30, 50, 90, 260, 70, 110, 200, 100].map((w, i) => (
      <td key={i} style={{ padding: '11px 14px' }}>
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
        <div style={{
          height: 9, borderRadius: 4, width: w,
          background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
        }} />
      </td>
    ))}
  </tr>
);

<<<<<<< HEAD
// ── Smart pagination ──────────────────────────────────────────
=======
// ── Pagination ────────────────────────────────────────────────
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
const getPageWindow = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  const left  = Math.max(2, current - 2);
  const right = Math.min(total - 1, current + 2);
  pages.push(1);
  if (left > 2) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('...');
  pages.push(total);
  return pages;
};

<<<<<<< HEAD
// ── Type filter ───────────────────────────────────────────────
const TYPE_OPTIONS = [
  { label: 'All Type',    keyword: '' },
  { label: 'Pre-license', keyword: 'pre-license' },
  { label: 'R.E.',        keyword: 'r.e.' },
  { label: 'Exam Prep',   keyword: 'exam prep' },
];

// ── Hours filter ──────────────────────────────────────────────
const HOURS_OPTIONS = [
  { label: 'All Hours', keyword: '' },
  { label: '3 Hour',    keyword: '3 hour' },
  { label: '8 Hour',    keyword: '8 hour' },
  { label: '12 Hour',   keyword: '12 hour' },
  { label: '15 Hour',   keyword: '15 hour' },
  { label: '45 Hour',   keyword: '45 hour' },
];

const PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────
const getTypeLabel = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('pre-license') || t.includes('pre license')) return 'Pre-License';
  if (t.includes('r.e.') || t.includes('real estate principles')) return 'R.E.';
  if (t.includes('exam prep')) return 'Exam Prep';
  if (t.includes('c.e.') || t.includes('continuing')) return 'C.E.';
  return 'Course';
};

const getHours = (title = '') => {
  const m = title.match(/(\d+)\s*hour/i);
  return m ? `${m[1]} hrs` : '—';
=======
// ── Filter options ────────────────────────────────────────────
const TYPE_OPTIONS  = ['All Type', 'Pre-license', 'R.E.'];
const HOURS_OPTIONS = ['All Hours', '2 hrs', '3 hrs', '8 hrs', '12 hrs', '15 hrs', '45 hrs'];

const TYPE_BADGE = {
  'Pre-license': { bg: 'rgba(46,171,254,0.12)', color: '#1a7fc4', border: 'rgba(46,171,254,0.3)' },
  'R.E.':        { bg: 'rgba(16,185,129,0.12)', color: '#059669', border: 'rgba(16,185,129,0.3)' },
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
};

const PAGE_SIZE = 15;

const AddExamPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [student,        setStudent]        = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);
<<<<<<< HEAD
  const [exams,          setExams]          = useState([]);
  const [total,          setTotal]          = useState(0);
  const [examsLoading,   setExamsLoading]   = useState(false);
  const [examsError,     setExamsError]     = useState('');
=======
  const [courses,        setCourses]        = useState([]);
  const [,          setTotal]          = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
  const [query,          setQuery]          = useState('');
  const [debouncedQ,     setDebouncedQ]     = useState('');
  const [typeFilter,     setTypeFilter]     = useState('All Type');
  const [hoursFilter,    setHoursFilter]    = useState('All Hours');
<<<<<<< HEAD
  const [emailOptOut,    setEmailOptOut]    = useState('No');
=======
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
  const [selected,       setSelected]       = useState(new Set());
  const [page,           setPage]           = useState(1);
  const [saving,         setSaving]         = useState(false);

<<<<<<< HEAD
=======
  // Load student
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
  useEffect(() => {
    (async () => {
      const res = await getStudent(id);
      if (res.ok) setStudent(res.data);
      setStudentLoading(false);
    })();
  }, [id]);

<<<<<<< HEAD
=======
  // Debounce
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(query); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { setPage(1); }, [typeFilter, hoursFilter]);

<<<<<<< HEAD
  const fetchExams = useCallback(async () => {
    setExamsLoading(true);
    setExamsError('');
    try {
      const batchSize = debouncedQ ? 50 : 200;
      const params = new URLSearchParams({ page: 1, limit: batchSize });
=======
  // Fetch courses from recatalog via /api/exams/courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: 1, limit: 300 });
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
      if (debouncedQ) params.set('search', debouncedQ);
      const token = localStorage.getItem('adminToken');
      const res   = await fetch(`${API}/api/exams/courses?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load courses');
      setCourses(data.courses || []);
      setTotal(data.total   || 0);
    } catch (err) {
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

<<<<<<< HEAD
  const typeKeyword  = TYPE_OPTIONS.find(o => o.label === typeFilter)?.keyword  || '';
  const hoursKeyword = HOURS_OPTIONS.find(o => o.label === hoursFilter)?.keyword || '';

  const filtered = exams.filter(exam => {
    const title = (exam.courseTitle || '').toLowerCase();
    return (!typeKeyword || title.includes(typeKeyword)) && (!hoursKeyword || title.includes(hoursKeyword));
=======
  // Frontend filter
  const filtered = courses.filter(c => {
    const type  = (c.type || '').toLowerCase();
    const hrs   = c.hours ? `${c.hours} hrs` : '';
    const matchType  = typeFilter  === 'All Type'  || type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchHours = hoursFilter === 'All Hours' || hrs === hoursFilter;
    return matchType && matchHours;
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageWindow = getPageWindow(page, totalPages);
  const startRec   = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRec     = Math.min(page * PAGE_SIZE, filtered.length);

<<<<<<< HEAD
  const handleAddExam = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      for (const examMasterID of selected) {
        const exam = exams.find(e => e.examMasterID === examMasterID);
        if (!exam) continue;
        const res = await fetch(`/api/students/${id}/add-exam`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ examMasterID: exam.examMasterID, courseTitle: exam.courseTitle }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to add exam');
=======
  // Selection helpers
  const toggleOne = (courseCode) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(courseCode) ? next.delete(courseCode) : next.add(courseCode);
      return next;
    });
  };

  const selectAllVisible = () => {
    const allCodes = pageData.map(c => c.examMasterID || c.courseCode);
    const allSelected = allCodes.every(code => selected.has(code));
    setSelected(prev => {
      const next = new Set(prev);
      allCodes.forEach(code => allSelected ? next.delete(code) : next.add(code));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  // Add selected to student
  const handleAdd = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const toAdd = courses.filter(c => selected.has(c.examMasterID || c.courseCode));
      for (const course of toAdd) {
        await fetch(`${API}/api/students/${id}/add-exam`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({
            examMasterID: course.examMasterID || course.courseCode,
            courseTitle:  course.courseTitle,
          }),
        });
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
      }
      navigate(`/admin/real-estate/online-exam/backoffice/student/${id}`);
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

<<<<<<< HEAD
  // ── Toggle one row ────────────────────────────────────────
  const toggleRow = (examMasterID) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(examMasterID) ? next.delete(examMasterID) : next.add(examMasterID);
      return next;
    });
  };

  // ── Select all visible on current page ───────────────────
  const selectAllVisible = () => {
    setSelected(prev => {
      const next = new Set(prev);
      pageData.forEach(e => next.add(e.examMasterID));
      return next;
    });
  };

  // ── Clear all ─────────────────────────────────────────────
  const clearSelection = () => setSelected(new Set());

  const name       = student?.name           || '—';
  const studentId  = student?.studentId      || id;
  const city       = student?.state          || '';
  const registered = student?.firstOrderDate || '';
  const email      = student?.email          || '';
=======
  const name      = student?.name           || '—';
  const studentId = student?.studentId      || id;
  const city      = student?.state          || '';
  const registered= student?.firstOrderDate || '';
  const email     = student?.email          || '';

  const allVisibleSelected = pageData.length > 0 && pageData.every(c => selected.has(c.examMasterID || c.courseCode));
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)

  return (
    <AppLayout>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
<<<<<<< HEAD
        .ae-row { transition: background 0.12s; }
        .ae-row:hover { background: rgba(46,171,254,0.05) !important; cursor: pointer; }
        .ae-row.ae-selected:hover { background: rgba(46,171,254,0.13) !important; }
        .ae-fs { appearance: none; -webkit-appearance: none; }
        .ae-fs:focus { outline: none; border-color: #2EABFE !important; }
        .ae-search:focus { outline: none; }
        .ae-pg:hover:not(.ae-active):not(.ae-dots) { background: rgba(46,171,254,0.1) !important; color: #2EABFE !important; border-color: rgba(46,171,254,0.4) !important; }
        .ae-checkbox { width: 15px; height: 15px; border: 1px solid #CBD5E1; border-radius: 3px; background: #fff; appearance: none; -webkit-appearance: none; cursor: pointer; flex-shrink: 0; transition: all 0.1s; }
        .ae-checkbox:checked { background: #2EABFE; border-color: #2EABFE; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4L3.5 6.5L9 1' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: center; background-size: 10px 8px; }
        .ae-checkbox:hover { border-color: #2EABFE; }
=======
        .ae-row { transition: background 0.1s; cursor: pointer; }
        .ae-row:hover { background: rgba(46,171,254,0.04) !important; }
        .ae-row.selected { background: rgba(46,171,254,0.08) !important; }
        .ae-pg:hover:not(.ae-active):not(.ae-dots) { background: rgba(46,171,254,0.08) !important; color: #2EABFE !important; border-color: rgba(46,171,254,0.3) !important; }
        select { appearance: none; -webkit-appearance: none; }
        select:focus { outline: none; border-color: #2EABFE !important; }
        input:focus { outline: none; }
        .cb-custom { width:16px; height:16px; border-radius:4px; border:1.5px solid #CBD5E1; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.12s; flex-shrink:0; }
        .cb-custom.checked { background:#2EABFE; border-color:#2EABFE; }
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
      `}</style>

      <div style={{ padding: '1.5rem 2rem', paddingBottom: selected.size > 0 ? '100px' : '1.5rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Breadcrumb crumbs={[
            { label: 'Dashboard',   to: '/admin' },
            { label: 'Real Estate', to: '/admin/real-estate' },
            { label: 'BackOffice',  to: '/admin/real-estate/online-exam/backoffice' },
            { label: `Student Info — ${name}`, to: `/admin/real-estate/online-exam/backoffice/student/${id}` },
            { label: 'Add Exam' },
          ]} />
          <button onClick={() => navigate(`/admin/real-estate/online-exam/backoffice/student/${id}`)} style={s.backBtn}>
            <Icon d="M19 12H5 M12 19l-7-7 7-7" size={12} />
            Back To Student Record
          </button>
        </div>

<<<<<<< HEAD
        {/* ── Dark Header Card ── */}
        <div style={s.headerCard}>
          <div style={s.headerInner}>
            <div style={s.headerLeft}>
              <div style={s.bigAvatar}>
                {studentLoading ? '…' : (name[0] || '?').toUpperCase()}
              </div>
              <div>
                <div style={s.headerTags}>
                  <span style={s.idBadge}>ID: {studentId}</span>
                  {city && (
                    <span style={s.stateBadge}>
                      <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0" size={10} color="#2EABFE" />
                      {city}
                    </span>
                  )}
                  {registered && (
                    <span style={s.regBadge}>
                      <Icon d="M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={10} color="#2EABFE" />
                      Registered: {registered}
                    </span>
                  )}
                  {email && (
                    <span style={s.emailBadge}>
                      <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" size={10} color="#2EABFE" />
                      {email}
                    </span>
                  )}
                </div>
                <h1 style={s.studentName}>{studentLoading ? 'Loading…' : name}</h1>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              {!studentLoading && (
                <span style={s.activeBadge}>
                  <svg width={7} height={7} viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#00FF09"/></svg>
                  Active
                </span>
              )}
              <p style={s.studentIdLabel}>Student ID</p>
              <p style={s.studentIdValue}>[{studentId}]</p>
            </div>
=======
        {/* Header Card */}
        <div style={s.headerCard}>
          <div style={s.headerLeft}>
            <div style={s.avatar}>{studentLoading ? '…' : (name[0] || '?').toUpperCase()}</div>
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
              <div style={s.metaRow}>
                {city && <span style={s.metaItem}><Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0" size={11} color="#2EABFE" /><span style={s.metaLabel}>City:</span><span style={s.metaVal}>{city}</span></span>}
                {registered && <span style={s.metaItem}><Icon d="M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={11} color="#2EABFE" /><span style={s.metaLabel}>Registered:</span><span style={s.metaVal}>{registered}</span></span>}
                {email && <span style={s.metaItem}><Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" size={11} color="#2EABFE" /><span style={s.metaVal}>{email}</span></span>}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={s.idLabel}>Student ID</p>
            <p style={s.idValue}>[{studentId}]</p>
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={s.filterBar}>
          <div style={s.searchWrap}>
<<<<<<< HEAD
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13} color="#94a3b8" />
            <input
              className="ae-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search Courses By Title, Code, Type..."
              style={s.searchInput}
            />
            {query && <button onClick={() => setQuery('')} style={s.clearX}>×</button>}
          </div>

          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select className="ae-fs" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={s.filterSelect}>
              {TYPE_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
            </select>
            <span style={s.chevronWrap}><ChevronDown /></span>
          </div>

          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select className="ae-fs" value={hoursFilter} onChange={e => setHoursFilter(e.target.value)} style={s.filterSelect}>
              {HOURS_OPTIONS.map(o => <option key={o.label}>{o.label}</option>)}
            </select>
            <span style={s.chevronWrap}><ChevronDown /></span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={s.optOutLabel}>Email Opt Out:</span>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select className="ae-fs" value={emailOptOut} onChange={e => setEmailOptOut(e.target.value)} style={{ ...s.filterSelect, minWidth: 60 }}>
                <option>No</option>
                <option>Yes</option>
=======
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={14} color="#94a3b8" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Courses By Title, Code, Type..." style={s.searchInput} />
            {query && <button onClick={() => setQuery('')} style={s.clearX}>×</button>}
          </div>

          {[{ val: typeFilter, set: setTypeFilter, opts: TYPE_OPTIONS },
            { val: hoursFilter, set: setHoursFilter, opts: HOURS_OPTIONS }].map((f, i) => (
            <div key={i} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select value={f.val} onChange={e => f.set(e.target.value)} style={s.filterSelect}>
                {f.opts.map(o => <option key={o}>{o}</option>)}
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
              </select>
              <span style={s.chevron}><ChevronDown /></span>
            </div>
          ))}
        </div>

        {/* ── Table Card ── */}
        <div style={s.tableCard}>

          {/* Top bar */}
          <div style={s.tableTopBar}>
<<<<<<< HEAD
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={s.tableTitle}>Available Courses</span>
              <span style={s.countBadgeBlue}>{totalFiltered}</span>
              {selected.size > 0 && <span style={s.countBadgeGreen}>{selected.size} SELECTED</span>}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={clearSelection} style={s.clearSelBtn}>✕ Clear Selection</button>
              <button onClick={selectAllVisible} style={s.selectAllBtn}>
                <svg width={11} height={11} viewBox="0 0 12 12" fill="none">
                  <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke="#091925" strokeWidth="1"/>
                  <path d="M2.5 6L5 8.5L9.5 4" stroke="#091925" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Select All Visible
=======
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={s.tableTitle}>Available Courses</span>
              <span style={s.totalBadge}>{loading ? '…' : filtered.length}</span>
              {selected.size > 0 && (
                <span style={s.selectedBadge}>{selected.size} SELECTED</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={selectAllVisible} style={s.selectAllBtn}>
                <Icon d="M20 6L9 17l-5-5" size={11} color="#2EABFE" />
                {allVisibleSelected ? 'Deselect All Visible' : 'Select All Visible'}
              </button>
              <button onClick={clearSelection} style={s.clearSelBtn}>
                ✕ Clear Selection
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
              </button>
            </div>
          </div>

<<<<<<< HEAD
          <div style={{ borderBottom: '0.5px solid #5B7384' }} />

          {/* Error */}
          {examsError && (
            <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.05)', borderBottom: '0.5px solid #fca5a5', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#dc2626', fontFamily: "'Poppins',sans-serif" }}>⚠ {examsError}</span>
              <button onClick={fetchExams} style={s.clearSelBtn}>Retry</button>
=======
          {error && (
            <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.05)', borderBottom: '0.5px solid #fca5a5' }}>
              <span style={{ fontSize: 12, color: '#dc2626', fontFamily: "'Poppins',sans-serif" }}>⚠ {error}</span>
              <button onClick={fetchCourses} style={{ ...s.clearSelBtn, marginLeft: 10 }}>Retry</button>
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
            </div>
          )}

          {/* Table */}
<<<<<<< HEAD
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={{ ...s.th, width: 36 }}>#</th>
                <th style={{ ...s.th, width: 36 }}>SELECT</th>
                <th style={{ ...s.th, width: 100 }}>TYPE</th>
                <th style={s.th}>COURSE TITLE</th>
                <th style={{ ...s.th, width: 70 }}>HOURS</th>
                <th style={{ ...s.th, width: 110 }}>COURSE CODE</th>
                <th style={{ ...s.th, width: 210 }}>REF / STATE CERT INFO</th>
                <th style={{ ...s.th, width: 90 }}>CERT EXPIRY</th>
              </tr>
            </thead>
            <tbody>
              {examsLoading
                ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
                : pageData.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 12, fontFamily: "'Poppins',sans-serif" }}>
                        {(debouncedQ || typeKeyword || hoursKeyword) ? 'No courses match your filters.' : 'No courses found.'}
                      </td>
                    </tr>
                  )
                  : pageData.map((exam, i) => {
                    const rowNum     = (page - 1) * PAGE_SIZE + i + 1;
                    const isSelected = selected.has(exam.examMasterID);
                    const typeLabel  = getTypeLabel(exam.courseTitle);
                    const hours      = getHours(exam.courseTitle);
                    return (
                      <tr
                        key={exam._id}
                        className={`ae-row${isSelected ? ' ae-selected' : ''}`}
                        onClick={() => toggleRow(exam.examMasterID)}
                        style={{ ...s.tr, background: isSelected ? 'rgba(46,171,254,0.13)' : 'transparent', borderTop: isSelected ? '0.5px solid rgba(46,171,254,0.35)' : undefined, borderBottom: isSelected ? '0.5px solid rgba(46,171,254,0.35)' : '0.5px solid #5B7384' }}
                      >
                        <td style={s.td}><span style={s.numCell}>{rowNum}</span></td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            className="ae-checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(exam.examMasterID)}
                            onClick={e => e.stopPropagation()}
                          />
                        </td>
                        <td style={s.td}><span style={s.typeBadge}>{typeLabel}</span></td>
                        <td style={s.td}>
                          <span style={{ ...s.titleCell, fontWeight: isSelected ? 600 : 500 }}>
                            {exam.courseTitle || '—'}
                          </span>
=======
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={{ ...s.th, width: 40 }}>#</th>
                  <th style={{ ...s.th, width: 50 }}>SELECT</th>
                  <th style={{ ...s.th, width: 110 }}>TYPE</th>
                  <th style={s.th}>COURSE TITLE</th>
                  <th style={{ ...s.th, width: 80 }}>HOURS</th>
                  <th style={{ ...s.th, width: 120 }}>COURSE CODE</th>
                  <th style={{ ...s.th, width: 220 }}>REF / STATE CERT INFO</th>
                  <th style={{ ...s.th, width: 110 }}>CERT EXPIRY</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
                  : pageData.length === 0
                    ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13, fontFamily: "'Poppins',sans-serif" }}>
                          No courses match your filters.
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
                        </td>
                        <td style={s.td}><span style={s.hoursCell}>{hours}</span></td>
                        <td style={s.td}><span style={s.codeCell}>{exam.examMasterID || '—'}</span></td>
                        <td style={s.td}><span style={s.refCell}>ref: — / [state cert: —]</span></td>
                        <td style={s.td}><span style={s.expiryCell}>—</span></td>
                      </tr>
                    )
                    : pageData.map((course, i) => {
                      const code       = course.examMasterID || course.courseCode;
                      const isSelected = selected.has(code);
                      const rowNum     = (page - 1) * PAGE_SIZE + i;
                      const badge      = TYPE_BADGE[course.type] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
                      const refInfo    = [course.refNumber && `ref: ${course.refNumber}`, course.stateCert && `[state cert: ${course.stateCert}]`].filter(Boolean).join(' / ');

<<<<<<< HEAD
          <div style={{ borderTop: '0.5px solid #5B7384' }} />

          {/* Pagination */}
          {!examsLoading && totalFiltered > 0 && (
            <div style={s.pagination}>
              <div style={s.paginationInfo}>
                <span>Showing</span>
                <strong style={{ color: '#091925' }}>{startRecord}–{endRecord}</strong>
                <span>Of</span>
                <strong style={{ color: '#091925' }}>{totalFiltered}</strong>
                <span>Records</span>
                {(typeKeyword || hoursKeyword) && total !== totalFiltered && (
                  <span style={{ color: '#94a3b8', marginLeft: 4 }}>(filtered from {total})</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="ae-pg" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  style={{ ...s.pageBtn, opacity: page === 1 ? 0.35 : 1 }}>‹</button>
                {pageWindow.map((p, i) =>
                  p === '...'
                    ? <span key={`d${i}`} className="ae-pg ae-dots" style={{ ...s.pageBtn, border: 'none', background: 'none', color: '#94a3b8', cursor: 'default' }}>…</span>
                    : <button key={p} className={`ae-pg${page === p ? ' ae-active' : ''}`} onClick={() => setPage(p)}
                        style={{ ...s.pageBtn, background: page === p ? '#2EABFE' : '#fff', color: page === p ? '#091925' : '#5B7384', fontWeight: page === p ? 700 : 500, borderColor: page === p ? '#2EABFE' : '#5B7384' }}>{p}</button>
                )}
                <button className="ae-pg" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  style={{ ...s.pageBtn, opacity: page === totalPages ? 0.35 : 1 }}>›</button>
              </div>
              <button onClick={clearSelection} style={s.clearSelBtn}>✕ Clear Selection</button>
            </div>
          )}
          {selected.size > 0 && (
            <div style={s.bottomBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={s.selectedCountBox}><span style={s.selectedCountNum}>{selected.size}</span></div>
                <span style={s.bottomBarLabel}>Course(s) Selected To Add To Student Record</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={clearSelection} style={s.cancelBtn}>Cancel</button>
                <button onClick={handleAddExam} disabled={saving} style={{ ...s.addSelectedBtn, opacity: saving ? 0.7 : 1 }}>
                  <Icon d="M12 5v14 M5 12h14" size={13} color="#fff" />
                  {saving ? 'Adding…' : 'Add Selected Exam(s) to Student Record'}
                </button>
=======
                      return (
                        <tr
                          key={course._id}
                          className={`ae-row${isSelected ? ' selected' : ''}`}
                          onClick={() => toggleOne(code)}
                          style={{ ...s.tr }}
                        >
                          <td style={s.td}>
                            <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#94a3b8' }}>{rowNum}</span>
                          </td>
                          <td style={{ ...s.td, textAlign: 'center' }}>
                            <div className={`cb-custom${isSelected ? ' checked' : ''}`}>
                              {isSelected && (
                                <svg width={9} height={9} viewBox="0 0 12 12" fill="none">
                                  <polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </td>
                          <td style={s.td}>
                            <span style={{ ...s.typeBadge, background: badge.bg, color: badge.color, borderColor: badge.border }}>
                              {course.type || '—'}
                            </span>
                          </td>
                          <td style={s.td}>
                            <span style={{ fontSize: 12, color: '#091925', fontFamily: "'Poppins',sans-serif", fontWeight: isSelected ? 600 : 500 }}>
                              {course.courseTitle || '—'}
                            </span>
                          </td>
                          <td style={s.td}>
                            <span style={{ fontSize: 12, color: '#2EABFE', fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>
                              {course.hours ? `${course.hours} hrs` : '—'}
                            </span>
                          </td>
                          <td style={s.td}>
                            <span style={s.codeTag}>{code || '—'}<span style={s.codeStar}>*</span></span>
                          </td>
                          <td style={s.td}>
                            <span style={{ fontSize: 11, color: '#5B7384', fontFamily: "'Poppins',sans-serif" }}>
                              {refInfo || '—'}
                            </span>
                          </td>
                          <td style={s.td}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: course.certExpiry && course.certExpiry !== 'N/A' ? '#dc2626' : '#94a3b8', fontFamily: "'Poppins',sans-serif" }}>
                              {course.certExpiry || '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div style={s.pagination}>
              <span style={s.paginInfo}>
                Showing <strong style={{ color: '#091925' }}>{startRec}–{endRec}</strong> Of <strong style={{ color: '#091925' }}>{filtered.length}</strong> Records
              </span>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="ae-pg" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ ...s.pageBtn, opacity: page === 1 ? 0.35 : 1 }}>‹</button>
                {pageWindow.map((p, i) =>
                  p === '...'
                    ? <span key={`d${i}`} style={{ ...s.pageBtn, border: 'none', background: 'none', color: '#94a3b8', cursor: 'default' }}>…</span>
                    : <button key={p} className={`ae-pg${page === p ? ' ae-active' : ''}`} onClick={() => setPage(p)}
                        style={{ ...s.pageBtn, background: page === p ? '#2EABFE' : 'transparent', color: page === p ? '#091925' : '#5B7384', fontWeight: page === p ? 700 : 500, borderColor: page === p ? '#2EABFE' : '#E2E8F0' }}>
                        {p}
                      </button>
                )}
                <button className="ae-pg" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ ...s.pageBtn, opacity: page === totalPages ? 0.35 : 1 }}>›</button>
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
              </div>
            </div>
          )}
        </div>
      </div>

<<<<<<< HEAD

=======
      {/* Bottom Action Bar */}
      {selected.size > 0 && (
        <div style={s.actionBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={s.actionCount}>{selected.size}</div>
            <span style={s.actionLabel}>Course(S) Selected To Add To Student Record</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={clearSelection} style={s.cancelBtn}>Cancel</button>
            <button onClick={handleAdd} disabled={saving} style={{ ...s.addBtn, opacity: saving ? 0.7 : 1 }}>
              <Icon d="M12 5v14 M5 12h14" size={13} color="#091925" />
              {saving ? 'Adding…' : 'Add Selected Exam(s) to Student Record'}
            </button>
          </div>
        </div>
      )}
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
    </AppLayout>
  );
};

// ── Styles — sized to match StudentDetail.jsx ─────────────────
const s = {
<<<<<<< HEAD
  // ── Back button ──
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 7,
    border: '0.5px solid #CBD5E1', background: '#fff',
    color: '#091925', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', whiteSpace: 'nowrap',
  },

  // ── Header card — mirrors sr.headerCard exactly ──
  headerCard: {
    background: '#091925',
    backgroundImage: 'linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%)',
    borderRadius: 10, padding: '14px 20px 12px', marginBottom: 12,
  },
  headerInner: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  bigAvatar: {
    width: 42, height: 42, borderRadius: '50%',
    background: 'linear-gradient(135deg,#2EABFE,#1a7fc4)',
    color: '#091925', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 700, flexShrink: 0,
  },
  headerTags:  { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 },
  idBadge:     { fontSize: 12, fontFamily: "'Poppins', monospace", fontWeight: 700, color: '#2EABFE' },
  stateBadge:  { fontSize: 12, fontWeight: 700, color: '#2EABFE', display: 'inline-flex', alignItems: 'center', gap: 3 },
  regBadge:    { fontSize: 12, fontWeight: 700, color: '#2EABFE', display: 'inline-flex', alignItems: 'center', gap: 3 },
  emailBadge:  { fontSize: 12, fontWeight: 400, color: '#2EABFE', display: 'inline-flex', alignItems: 'center', gap: 3 },
  studentName: {
    fontSize: 22, fontWeight: 700, color: '#fff',
    fontFamily: "'Poppins', sans-serif", margin: '3px 0 0',
    textTransform: 'capitalize', letterSpacing: '-0.2px',
  },
  activeBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 700,
    background: 'rgba(0,255,9,0.10)', color: '#00FF09',
    border: '0.5px solid #00FF09',
    padding: '3px 10px', borderRadius: 100,
    fontFamily: "'Poppins', sans-serif",
  },
  studentIdLabel: { fontSize: 11, color: '#7FA8C4', fontFamily: "'Poppins', sans-serif", margin: '2px 0 0', textAlign: 'right' },
  studentIdValue: { fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' },

  // ── Filter bar ──
  filterBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', borderRadius: 10,
    padding: '8px 14px', marginBottom: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 7,
    flex: 1, minWidth: 180, maxWidth: 340,
    border: '0.5px solid #CBD5E1', borderRadius: 7,
    padding: '6px 11px', background: '#F8FAFC',
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 12, color: '#091925', flex: 1,
    fontFamily: "'Poppins', sans-serif",
  },
  clearX: {
    border: 'none', background: 'transparent',
    color: '#94a3b8', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px',
  },
  filterSelect: {
    border: '0.5px solid #CBD5E1', borderRadius: 7,
    padding: '6px 26px 6px 10px',
    fontSize: 12, fontWeight: 500, color: '#091925',
    background: '#fff', cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    appearance: 'none', WebkitAppearance: 'none',
    minWidth: 100,
  },
  chevronWrap: {
    position: 'absolute', right: 8, top: '50%',
    transform: 'translateY(-50%)', pointerEvents: 'none',
  },
  optOutLabel: {
    fontSize: 12, fontWeight: 500, color: '#5B7384',
    fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap',
  },

  // ── Table card ──
  tableCard: {
    background: '#fff', borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
    border: '0.5px solid #E2E8F0',
  },
  tableTopBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px',
  },
  tableTitle: { fontSize: 13, fontWeight: 600, color: '#091925', fontFamily: "'Poppins', sans-serif" },
  countBadgeBlue: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 36, height: 22, borderRadius: 100,
    background: 'rgba(26,122,184,0.10)',
    fontSize: 10, fontWeight: 700, color: '#1A7AB8',
    fontFamily: "'Poppins', sans-serif", padding: '0 8px',
  },
  countBadgeGreen: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 70, height: 22, borderRadius: 100,
    background: 'rgba(0,128,0,0.10)', border: '0.5px solid #008000',
    fontSize: 10, fontWeight: 700, color: '#008000',
    fontFamily: "'Poppins', sans-serif", padding: '0 8px',
  },
  selectAllBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: 7,
    border: '0.5px solid #CBD5E1', background: '#fff',
    color: '#091925', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
  },
  clearSelBtn: {
    padding: '6px 12px', borderRadius: 7,
    border: '0.5px solid #CBD5E1', background: '#fff',
    color: '#5B7384', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
  },

  // ── Table — mirrors sr.table / sr.th / sr.td ──
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'rgba(127,168,196,0.1)' },
  th: {
    padding: '9px 16px', textAlign: 'left',
    fontSize: 10, fontWeight: 500, color: '#5B7384',
    textTransform: 'uppercase', letterSpacing: '0.04em',
    borderTop: '0.5px solid #7FA8C4', borderBottom: '0.5px solid #7FA8C4',
    fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '0.5px solid #5B7384' },
  td: { padding: '9px 16px', verticalAlign: 'middle' },

  numCell:   { fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#94a3b8' },
  typeBadge: {
    fontSize: 10, fontWeight: 700,
    background: 'rgba(0,128,0,0.10)', color: '#008000',
    border: '0.5px solid #008000',
    padding: '3px 10px', borderRadius: 100, display: 'inline-block',
    fontFamily: "'Poppins', sans-serif",
  },
  titleCell:  { fontSize: 12, color: '#091925', fontFamily: "'Poppins', sans-serif", fontWeight: 500 },
  hoursCell:  { fontSize: 12, color: '#091925', fontFamily: "'Poppins', sans-serif", fontWeight: 500 },
  codeCell: {
    fontSize: 11, fontFamily: "'DM Mono', monospace",
    background: '#f1f5f9', color: '#475569',
    padding: '2px 6px', borderRadius: 4, display: 'inline-block',
  },
  refCell:    { fontSize: 12, color: '#5B7384', fontFamily: "'Poppins', sans-serif", fontWeight: 400 },
  expiryCell: { fontSize: 12, color: '#EF4444', fontFamily: "'Poppins', sans-serif", fontWeight: 500 },

  // ── Pagination ──
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', flexWrap: 'wrap', gap: 8,
  },
  paginationInfo: {
    display: 'flex', gap: 5, alignItems: 'center',
    fontSize: 12, color: '#5B7384', fontFamily: "'Poppins', sans-serif",
  },
  pageBtn: {
    minWidth: 32, height: 32, borderRadius: 6,
    border: '0.5px solid #5B7384', fontSize: 12,
    fontFamily: "'Poppins', sans-serif", cursor: 'pointer',
    transition: 'all 0.15s', background: '#fff',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 6px',
  },

  // ── Bottom action bar — inside table card ──
  bottomBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#091925',
    backgroundImage: 'linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%)',
    borderRadius: '0 0 10px 10px',
  },
  selectedCountBox: {
    minWidth: 35, height: 35, borderRadius: 5,
    background: 'rgba(46,171,254,0.1)', border: '0.5px solid #2EABFE',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 8px',
  },
  selectedCountNum: {
    fontSize: 14, fontWeight: 700, color: '#2EABFE',
    fontFamily: "'Poppins', sans-serif",
  },
  bottomBarLabel: {
    fontSize: 13, fontWeight: 500, color: '#fff',
    fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize',
  },
  cancelBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 16px', height: 36, borderRadius: 5,
    border: '0.5px solid #5B7384', background: '#fff',
    color: '#5B7384', fontSize: 12, fontWeight: 700,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
    textTransform: 'capitalize',
  },
  addSelectedBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '0 20px', height: 36, borderRadius: 5,
    background: '#008000', border: '0.5px solid #008000',
    color: '#fff', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
    whiteSpace: 'nowrap',
  },

=======
  backBtn: { display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:7, border:'0.5px solid #CBD5E1', background:'#fff', color:'#091925', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif", boxShadow:'0 1px 3px rgba(0,0,0,0.06)', whiteSpace:'nowrap' },
  headerCard: { background:'#091925', backgroundImage:'linear-gradient(135deg,rgba(9,25,37,0.92) 0%,rgba(46,171,254,0.18) 100%)', borderRadius:10, padding:'16px 22px', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' },
  headerLeft: { display:'flex', alignItems:'center', gap:14 },
  avatar: { width:46, height:46, borderRadius:'50%', background:'linear-gradient(135deg,#2EABFE,#1a7fc4)', color:'#091925', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, flexShrink:0 },
  studentName: { fontSize:22, fontWeight:700, color:'#fff', fontFamily:"'Poppins',sans-serif", margin:0 },
  activeBadge: { display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, background:'rgba(16,185,129,0.15)', color:'#10B981', border:'0.5px solid rgba(16,185,129,0.4)', padding:'3px 10px', borderRadius:100, fontFamily:"'Poppins',sans-serif" },
  metaRow: { display:'flex', alignItems:'center', gap:18, marginTop:7, flexWrap:'wrap' },
  metaItem: { display:'inline-flex', alignItems:'center', gap:5 },
  metaLabel: { fontSize:12, color:'#fff', fontWeight:400, fontFamily:"'Poppins',sans-serif" },
  metaVal: { fontSize:12, color:'#2EABFE', fontWeight:600, fontFamily:"'Poppins',sans-serif" },
  idLabel: { fontSize:11, color:'#7FA8C4', fontFamily:"'Poppins',sans-serif", marginBottom:2 },
  idValue: { fontSize:17, fontWeight:700, color:'#fff', fontFamily:"'DM Mono',monospace" },

  filterBar: { display:'flex', alignItems:'center', gap:8, background:'#fff', borderRadius:10, padding:'10px 16px', marginBottom:10, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', flexWrap:'wrap' },
  searchWrap: { display:'flex', alignItems:'center', gap:8, flex:1, minWidth:200, maxWidth:360, border:'0.5px solid #CBD5E1', borderRadius:7, padding:'7px 12px', background:'#F8FAFC' },
  searchInput: { border:'none', outline:'none', background:'transparent', fontSize:12, color:'#091925', flex:1, fontFamily:"'Poppins',sans-serif" },
  clearX: { border:'none', background:'transparent', color:'#94a3b8', cursor:'pointer', fontSize:17, lineHeight:1, padding:'0 2px' },
  filterSelect: { border:'0.5px solid #CBD5E1', borderRadius:7, padding:'7px 28px 7px 11px', fontSize:12, fontWeight:500, color:'#091925', background:'#fff', cursor:'pointer', fontFamily:"'Poppins',sans-serif", minWidth:110 },
  chevron: { position:'absolute', right:9, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' },

  tableCard: { background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' },
  tableTopBar: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'0.5px solid #E2E8F0', flexWrap:'wrap', gap:8 },
  tableTitle: { fontSize:13, fontWeight:600, color:'#091925', fontFamily:"'Poppins',sans-serif" },
  totalBadge: { fontSize:11, fontWeight:700, background:'#F1F5F9', color:'#5B7384', padding:'2px 8px', borderRadius:20, fontFamily:"'Poppins',sans-serif" },
  selectedBadge: { fontSize:11, fontWeight:700, background:'rgba(46,171,254,0.12)', color:'#2EABFE', padding:'2px 8px', borderRadius:20, fontFamily:"'Poppins',sans-serif", border:'0.5px solid rgba(46,171,254,0.3)' },
  selectAllBtn: { display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:7, border:'0.5px solid rgba(46,171,254,0.4)', background:'rgba(46,171,254,0.06)', color:'#2EABFE', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif" },
  clearSelBtn: { padding:'6px 12px', borderRadius:7, border:'0.5px solid #CBD5E1', background:'#fff', color:'#5B7384', fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:"'Poppins',sans-serif" },

  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'rgba(127,168,196,0.08)' },
  th: { padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#5B7384', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'0.5px solid #E2E8F0', fontFamily:"'Poppins',sans-serif", whiteSpace:'nowrap' },
  tr: { borderBottom:'0.5px solid #F1F5F9' },
  td: { padding:'10px 14px', verticalAlign:'middle' },
  typeBadge: { fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, border:'0.5px solid', fontFamily:"'Poppins',sans-serif", whiteSpace:'nowrap' },
  codeTag: { fontSize:11, fontFamily:"'DM Mono',monospace", background:'#F1F5F9', color:'#475569', padding:'2px 7px', borderRadius:4, display:'inline-flex', alignItems:'center', gap:1 },
  codeStar: { color:'#dc2626', fontSize:10, lineHeight:1 },

  pagination: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderTop:'0.5px solid #E2E8F0', flexWrap:'wrap', gap:10 },
  paginInfo: { fontSize:12, color:'#5B7384', fontFamily:"'Poppins',sans-serif", display:'flex', gap:5, alignItems:'center' },
  pageBtn: { minWidth:32, height:32, borderRadius:6, border:'0.5px solid #E2E8F0', fontSize:12, fontFamily:"'Poppins',sans-serif", cursor:'pointer', transition:'all 0.15s', background:'transparent', display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'0 6px' },

  actionBar: { position:'fixed', bottom:0, left:0, right:0, background:'#091925', padding:'16px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 -4px 24px rgba(0,0,0,0.25)', zIndex:100, flexWrap:'wrap', gap:12 },
  actionCount: { width:32, height:32, borderRadius:'50%', background:'#2EABFE', color:'#091925', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, flexShrink:0 },
  actionLabel: { fontSize:14, fontWeight:500, color:'#fff', fontFamily:"'Poppins',sans-serif" },
  cancelBtn: { padding:'9px 20px', borderRadius:7, border:'0.5px solid rgba(255,255,255,0.2)', background:'transparent', color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:"'Poppins',sans-serif" },
  addBtn: { display:'inline-flex', alignItems:'center', gap:7, padding:'9px 22px', borderRadius:7, background:'#2EABFE', color:'#091925', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Poppins',sans-serif" },
>>>>>>> ff631aa (feat: Johan - Add Exam Alteration)
};

export default AddExamPage;
