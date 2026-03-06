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
    {[20, 20, 80, 60, 300, 70, 80].map((w, i) => (
      <td key={i} style={{ padding: '9px 16px' }}>
        <div style={{
          height: 9, borderRadius: 4, width: w,
          background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
        }} />
      </td>
    ))}
  </tr>
);

// ── Smart pagination ──────────────────────────────────────────
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

// ── Course Type filter options (matches courseType in examqanda) ──
const TYPE_OPTIONS = [
  { label: 'All Types',   value: '' },
  { label: 'CE',          value: 'CE' },
  { label: 'RE',          value: 'RE' },
  { label: 'Pre-License', value: 'PreLicense' },
];

const PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────
// Map bundleId to a readable label  e.g. "CE-15HR" → "15 Hour C.E."
const getBundleLabel = (bundleId = '') => {
  const b = bundleId.toUpperCase();
  if (b.includes('CE-15'))  return '15 Hour C.E.';
  if (b.includes('CE-45'))  return '45 Hour C.E.';
  if (b.includes('RE-45'))  return '45 Hour R.E.';
  if (b.includes('PRE'))    return 'Pre-License';
  return bundleId;
};

// Derive credit hours from bundleId

const AddExamPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [student,        setStudent]        = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);

  // ── Bundle data ───────────────────────────────────────────
  const [bundles,        setBundles]        = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [bundlesError,   setBundlesError]   = useState('');

  // ── Filters ───────────────────────────────────────────────
  const [query,          setQuery]          = useState('');
  const [debouncedQ,     setDebouncedQ]     = useState('');
  const [typeFilter,     setTypeFilter]     = useState('');
  const [page,           setPage]           = useState(1);

  // ── Selection & save ─────────────────────────────────────
  const [selected,       setSelected]       = useState(new Set());
  const [saving,         setSaving]         = useState(false);

  // ── Load student ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const res = await getStudent(id);
      if (res.ok) setStudent(res.data);
      setStudentLoading(false);
    })();
  }, [id]);

  // ── Debounce search ───────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(query); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { setPage(1); }, [typeFilter]);

  // ── Get student's state — priority: insCertState → mailingAddress ──
  const getStudentState = (student) => {
    if (!student) return '';
    // 1. Use insCertState field directly (e.g. "CA")
    if (student.insCertState?.trim()) return student.insCertState.trim().toUpperCase();
    // 2. Fall back to extracting from mailingAddress: "..., CA 94510"
    const match = (student.mailingAddress || '').match(/,\s*([A-Z]{2})\s*\d{0,5}\s*$/i);
    return match ? match[1].toUpperCase() : '';
  };

  // ── Fetch bundles — waits for student so we have their state ─
  const fetchBundles = useCallback(async () => {
    if (studentLoading) return; // wait until student data is ready
    setBundlesLoading(true);
    setBundlesError('');
    try {
      const token        = localStorage.getItem('adminToken');
      const studentState = getStudentState(student);
      const params       = new URLSearchParams();
      if (studentState) params.set('state', studentState);

      const res = await fetch(`${API}/api/exam-qanda/bundles?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load bundles');
      setBundles(data.bundles || []);
    } catch (err) {
      setBundlesError(err.message);
      setBundles([]);
    } finally {
      setBundlesLoading(false);
    }
  }, [student, studentLoading]);

  // Re-fetch bundles once student has loaded (to apply state filter)
  useEffect(() => { fetchBundles(); }, [fetchBundles]);

  // ── Filter bundles client-side ────────────────────────────
  const filtered = bundles.filter(b => {
    const matchType  = !typeFilter || b.courseType === typeFilter;
    const matchQuery = !debouncedQ  ||
      (b._id         || '').toLowerCase().includes(debouncedQ.toLowerCase()) ||
      (b.courseType  || '').toLowerCase().includes(debouncedQ.toLowerCase()) ||
      (b.examNames   || []).some(n => n.toLowerCase().includes(debouncedQ.toLowerCase()));
    return matchType && matchQuery;
  });

  const totalFiltered = filtered.length;
  const totalPages    = Math.ceil(totalFiltered / PAGE_SIZE);
  const pageData      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageWindow    = getPageWindow(page, totalPages);
  const startRecord   = totalFiltered === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRecord     = Math.min(page * PAGE_SIZE, totalFiltered);

  // ── Toggle one row ────────────────────────────────────────
  const toggleRow = (bundleId) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(bundleId) ? next.delete(bundleId) : next.add(bundleId);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected(prev => {
      const next = new Set(prev);
      pageData.forEach(b => next.add(b._id));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  // ── Add selected bundles to student record ────────────────
  const handleAddExam = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');

      for (const bundleId of selected) {
        const bundle = bundles.find(b => b._id === bundleId);
        if (!bundle) continue;

        // Use the first examName as the courseTitle, or bundleId as fallback
        const courseTitle = bundle.examNames?.[0] || getBundleLabel(bundleId);

        const res = await fetch(`${API}/api/students/${id}/add-exam`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            examMasterID: bundleId,       // bundleId used as the course identifier
            courseTitle:  courseTitle,
            bundleId:     bundleId,
            courseType:   bundle.courseType,
            versions:     bundle.versions || [],
            examNames:    bundle.examNames || [],
            totalQuestions: bundle.totalQuestions || 0,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to add exam');
      }

      navigate(`/admin/real-estate/online-exam/backoffice/student/${id}`);
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Student display values ────────────────────────────────
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
        .ae-row.ae-selected:hover { background: rgba(46,171,254,0.13) !important; }
        .ae-fs { appearance: none; -webkit-appearance: none; }
        .ae-fs:focus { outline: none; border-color: #2EABFE !important; }
        .ae-search:focus { outline: none; }
        .ae-pg:hover:not(.ae-active):not(.ae-dots) { background: rgba(46,171,254,0.1) !important; color: #2EABFE !important; border-color: rgba(46,171,254,0.4) !important; }
        .ae-checkbox { width: 15px; height: 15px; border: 1px solid #CBD5E1; border-radius: 3px; background: #fff; appearance: none; -webkit-appearance: none; cursor: pointer; flex-shrink: 0; transition: all 0.1s; }
        .ae-checkbox:checked { background: #2EABFE; border-color: #2EABFE; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4L3.5 6.5L9 1' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: center; background-size: 10px 8px; }
        .ae-checkbox:hover { border-color: #2EABFE; }
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
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={s.filterBar}>
          <div style={s.searchWrap}>
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={13} color="#94a3b8" />
            <input
              className="ae-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by Bundle ID, Course Type, Exam Name..."
              style={s.searchInput}
            />
            {query && <button onClick={() => setQuery('')} style={s.clearX}>×</button>}
          </div>

          {/* Course Type filter */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              className="ae-fs"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              style={s.filterSelect}
            >
              {TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span style={s.chevronWrap}><ChevronDown /></span>
          </div>

          <div style={{ flex: 1 }} />

          {/* State indicator + Bundle count */}
          {(() => {
            const st = student?.insCertState?.trim()?.toUpperCase() ||
              (student?.mailingAddress || '').match(/,\s*([A-Z]{2})\s*\d{0,5}\s*$/i)?.[1]?.toUpperCase();
            return st ? (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2EABFE', fontFamily: "'Poppins', sans-serif",
                background: 'rgba(46,171,254,0.08)', border: '0.5px solid #2EABFE',
                padding: '4px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/></svg>
                Filtering for: {st}
              </span>
            ) : null;
          })()}
          <span style={{ fontSize: 12, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>
            {bundlesLoading ? 'Loading…' : `${totalFiltered} bundle${totalFiltered !== 1 ? 's' : ''} available`}
          </span>
        </div>

        {/* ── Table Card ── */}
        <div style={s.tableCard}>

          {/* Top bar */}
          <div style={s.tableTopBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={s.tableTitle}>Exam Bundles</span>
              <span style={s.countBadgeBlue}>{totalFiltered}</span>
              {selected.size > 0 && (
                <span style={s.countBadgeGreen}>{selected.size} SELECTED</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={clearSelection} style={s.clearSelBtn}>✕ Clear Selection</button>
              <button onClick={selectAllVisible} style={s.selectAllBtn}>
                <svg width={11} height={11} viewBox="0 0 12 12" fill="none">
                  <rect x="0.5" y="0.5" width="11" height="11" rx="1.5" stroke="#091925" strokeWidth="1"/>
                  <path d="M2.5 6L5 8.5L9.5 4" stroke="#091925" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Select All Visible
              </button>
            </div>
          </div>

          <div style={{ borderBottom: '0.5px solid #5B7384' }} />

          {/* Error */}
          {bundlesError && (
            <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.05)', borderBottom: '0.5px solid #fca5a5', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#dc2626', fontFamily: "'Poppins',sans-serif" }}>⚠ {bundlesError}</span>
              <button onClick={fetchBundles} style={s.clearSelBtn}>Retry</button>
            </div>
          )}

          {/* Table */}
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={{ ...s.th, width: 36 }}>#</th>
                <th style={{ ...s.th, width: 36 }}>SELECT</th>
                <th style={{ ...s.th, width: 110 }}>BUNDLE ID</th>
                <th style={{ ...s.th, width: 100 }}>COURSE TYPE</th>
                <th style={s.th}>EXAM NAMES</th>
                <th style={{ ...s.th, width: 80 }}>VERSIONS</th>
                <th style={{ ...s.th, width: 90 }}>QUESTIONS</th>
              </tr>
            </thead>
            <tbody>
              {bundlesLoading
                ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
                : pageData.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 12, fontFamily: "'Poppins',sans-serif" }}>
                        {(debouncedQ || typeFilter)
                          ? 'No bundles match your filters.'
                          : 'No exam bundles found.'}
                      </td>
                    </tr>
                  )
                  : pageData.map((bundle, i) => {
                    const rowNum     = (page - 1) * PAGE_SIZE + i + 1;
                    const isSelected = selected.has(bundle._id);

                    return (
                      <tr
                        key={bundle._id}
                        className={`ae-row${isSelected ? ' ae-selected' : ''}`}
                        onClick={() => toggleRow(bundle._id)}
                        style={{
                          ...s.tr,
                          background:   isSelected ? 'rgba(46,171,254,0.13)' : 'transparent',
                          borderTop:    isSelected ? '0.5px solid rgba(46,171,254,0.35)' : undefined,
                          borderBottom: isSelected ? '0.5px solid rgba(46,171,254,0.35)' : '0.5px solid #5B7384',
                        }}
                      >
                        {/* Row number */}
                        <td style={s.td}>
                          <span style={s.numCell}>{rowNum}</span>
                        </td>

                        {/* Checkbox */}
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            className="ae-checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(bundle._id)}
                            onClick={e => e.stopPropagation()}
                          />
                        </td>

                        {/* Bundle ID */}
                        <td style={s.td}>
                          <span style={s.codeCell}>{bundle._id}</span>
                        </td>

                        {/* Course Type */}
                        <td style={s.td}>
                          <span style={{
                            ...s.typeBadge,
                            background: bundle.courseType === 'CE'         ? 'rgba(46,171,254,0.1)'  :
                                        bundle.courseType === 'RE'         ? 'rgba(0,128,0,0.1)'     :
                                                                             'rgba(149,105,247,0.1)',
                            color:      bundle.courseType === 'CE'         ? '#1a7fc4'               :
                                        bundle.courseType === 'RE'         ? '#008000'               :
                                                                             '#7c3aed',
                            border:     bundle.courseType === 'CE'         ? '0.5px solid #2EABFE'   :
                                        bundle.courseType === 'RE'         ? '0.5px solid #008000'   :
                                                                             '0.5px solid #9569F7',
                          }}>
                            {bundle.courseType}
                          </span>
                        </td>

                        {/* Exam Names */}
                        <td style={s.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {(bundle.examNames || []).sort().map((name, ni) => (
                              <span key={ni} style={s.titleCell}>{name}</span>
                            ))}
                          </div>
                        </td>

                        {/* Versions */}
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {(bundle.versions || []).sort().map(v => (
                              <span key={v} style={{
                                fontSize: 10, fontWeight: 700,
                                padding: '2px 8px', borderRadius: 100,
                                fontFamily: "'Poppins', sans-serif",
                                background: v === 'Version A' ? 'rgba(46,171,254,0.1)'  : 'rgba(149,105,247,0.1)',
                                color:      v === 'Version A' ? '#2EABFE'               : '#9569F7',
                                border:     v === 'Version A' ? '0.5px solid #2EABFE'   : '0.5px solid #9569F7',
                              }}>
                                {v.replace('Version ', 'Ver ')}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Question count */}
                        <td style={s.td}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#091925', fontFamily: "'Poppins', sans-serif" }}>
                            {bundle.totalQuestions}
                          </span>
                          <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 3, fontFamily: "'Poppins', sans-serif" }}>
                            Qs
                          </span>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>

          <div style={{ borderTop: '0.5px solid #5B7384' }} />

          {/* Pagination */}
          {!bundlesLoading && totalFiltered > 0 && (
            <div style={s.pagination}>
              <div style={s.paginationInfo}>
                <span>Showing</span>
                <strong style={{ color: '#091925' }}>{startRecord}–{endRecord}</strong>
                <span>of</span>
                <strong style={{ color: '#091925' }}>{totalFiltered}</strong>
                <span>bundles</span>
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

          {/* Bottom Action Bar */}
          {selected.size > 0 && (
            <div style={s.bottomBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={s.selectedCountBox}>
                  <span style={s.selectedCountNum}>{selected.size}</span>
                </div>
                <span style={s.bottomBarLabel}>
                  Bundle(s) Selected To Add To Student Record
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={clearSelection} style={s.cancelBtn}>Cancel</button>
                <button onClick={handleAddExam} disabled={saving} style={{ ...s.addSelectedBtn, opacity: saving ? 0.7 : 1 }}>
                  <Icon d="M12 5v14 M5 12h14" size={13} color="#fff" />
                  {saving ? 'Adding…' : 'Add Selected Bundle(s) to Student Record'}
                </button>
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
  filterBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', borderRadius: 10,
    padding: '8px 14px', marginBottom: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 7,
    flex: 1, minWidth: 180, maxWidth: 380,
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
    minWidth: 110,
  },
  chevronWrap: {
    position: 'absolute', right: 8, top: '50%',
    transform: 'translateY(-50%)', pointerEvents: 'none',
  },
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
  table:  { width: '100%', borderCollapse: 'collapse' },
  thead:  { background: 'rgba(127,168,196,0.1)' },
  th: {
    padding: '9px 16px', textAlign: 'left',
    fontSize: 10, fontWeight: 500, color: '#5B7384',
    textTransform: 'uppercase', letterSpacing: '0.04em',
    borderTop: '0.5px solid #7FA8C4', borderBottom: '0.5px solid #7FA8C4',
    fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap',
  },
  tr:  { borderBottom: '0.5px solid #5B7384' },
  td:  { padding: '9px 16px', verticalAlign: 'middle' },
  numCell:   { fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#94a3b8' },
  typeBadge: {
    fontSize: 10, fontWeight: 700,
    padding: '3px 10px', borderRadius: 100, display: 'inline-block',
    fontFamily: "'Poppins', sans-serif",
  },
  titleCell: { fontSize: 12, color: '#091925', fontFamily: "'Poppins', sans-serif", fontWeight: 500 },
  codeCell: {
    fontSize: 11, fontFamily: "'DM Mono', monospace",
    background: '#f1f5f9', color: '#475569',
    padding: '2px 8px', borderRadius: 4, display: 'inline-block',
    fontWeight: 700,
  },
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
    fontFamily: "'Poppins', sans-serif",
  },
  cancelBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 16px', height: 36, borderRadius: 5,
    border: '0.5px solid #5B7384', background: '#fff',
    color: '#5B7384', fontSize: 12, fontWeight: 700,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
  },
  addSelectedBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '0 20px', height: 36, borderRadius: 5,
    background: '#008000', border: '0.5px solid #008000',
    color: '#fff', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
    whiteSpace: 'nowrap',
  },
};

export default AddExamPage;