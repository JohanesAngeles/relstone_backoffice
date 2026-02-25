// src/pages/RealEstate.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { getStudents, getStates, exportStudents } from '../../services/students';

// ── Icon ─────────────────────────────────────────────────────
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
  </svg>
);

// ── Skeleton row ──────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[140, 180, 130, 110, 60, 70].map((w, i) => (
      <td key={i} style={s.td}>
        <div style={{ width: w, height: 13, borderRadius: 4, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      </td>
    ))}
  </tr>
);

// ── State Badge ───────────────────────────────────────────────
const StateBadge = ({ state }) => (
  state
    ? <span style={s.stateBadge}>{state}</span>
    : <span style={{ color: '#cbd5e1', fontSize: 11 }}>—</span>
);

// ── Main ──────────────────────────────────────────────────────
const RealEstate = () => {
  const navigate = useNavigate();

  const [students,  setStudents]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [states,    setStates]    = useState([]);

  const [search, setSearch] = useState('');
  const [state,  setState]  = useState('');
  const [page,   setPage]   = useState(1);
  const LIMIT = 25;

  const searchRef  = useRef(null);
  const debounceRef = useRef(null);

  // Load state list once
  useEffect(() => {
    getStates().then(r => { if (r.ok) setStates(r.data); });
  }, []);

  const loadStudents = useCallback(async (p = page, q = search, st = state) => {
    setLoading(true);
    const res = await getStudents({ page: p, limit: LIMIT, search: q, state: st });
    if (res.ok) {
      setStudents(res.data.students);
      setTotal(res.data.total);
      setPages(res.data.pages);
    }
    setLoading(false);
  }, [page, search, state]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadStudents(page, search, state); }, [page, state]);

  // Debounce search
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadStudents(1, val, state);
    }, 400);
  };

  const handleState = (val) => {
    setState(val);
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    await exportStudents({ search, state });
    setExporting(false);
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  // Pagination range
  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <AppLayout>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .student-row:hover { background: #f8faff !important; cursor: pointer; }
        .page-btn:hover { background: #f1f5f9 !important; }
        .export-btn:hover { background: #166534 !important; }
        .clear-btn:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* ── Page Header ── */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Real Estate Students</h1>
          <p style={s.pageSub}>
            {loading ? 'Loading...' : `${total.toLocaleString()} students found`}
            {state && <span style={s.filterTag}>· Filtered: {state}</span>}
            {search && <span style={s.filterTag}>· Search: "{search}"</span>}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="export-btn"
          style={s.exportBtn}
        >
          <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" size={14} />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* ── Filters ── */}
      <div style={s.filtersRow}>
        {/* Search */}
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={14} />
          </span>
          <input
            ref={searchRef}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name, email, DRE #, license #, phone..."
            style={s.searchInput}
          />
          {search && (
            <button className="clear-btn" onClick={() => handleSearch('')} style={s.clearBtn}>✕</button>
          )}
        </div>

        {/* State filter */}
        <select
          value={state}
          onChange={e => handleState(e.target.value)}
          style={s.stateSelect}
        >
          <option value="">All States</option>
          {states.map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>

        {/* Reset */}
        {(search || state) && (
          <button
            className="clear-btn"
            onClick={() => { setSearch(''); setState(''); setPage(1); loadStudents(1, '', ''); }}
            style={s.resetBtn}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Student ID</th>
              <th style={s.th}>Name</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Phone</th>
              <th style={s.th}>DRE / License #</th>
              <th style={s.th}>State</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: LIMIT }).map((_, i) => <SkeletonRow key={i} />)
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No students found{search ? ` for "${search}"` : ''}{state ? ` in ${state}` : ''}.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student._id}
                  className="student-row"
                  style={s.tr}
                  onClick={() => navigate(`/admin/students/${student.studentId}`)}
                >
                  <td style={s.td}>
                    <span style={s.studentId}>{student.studentId}</span>
                  </td>
                  <td style={s.td}>
                    <div style={s.nameCell}>
                      <div style={s.nameAvatar}>
                        {(student.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={s.namePrimary}>{student.name || '—'}</p>
                        {student.companyName && (
                          <p style={s.nameSub}>{student.companyName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={s.emailCell}>{student.email || '—'}</span>
                  </td>
                  <td style={s.td}>
                    <span style={s.phoneCell}>
                      {student.workPhone || student.mobilePhone || '—'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {student.dreNumber && (
                        <span style={s.idTag}>DRE: {student.dreNumber}</span>
                      )}
                      {student.licenseNumber && (
                        <span style={s.idTag}>LIC: {student.licenseNumber}</span>
                      )}
                      {!student.dreNumber && !student.licenseNumber && (
                        <span style={{ color: '#cbd5e1', fontSize: 11 }}>—</span>
                      )}
                    </div>
                  </td>
                  <td style={s.td}>
                    <StateBadge state={student.state} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && pages > 1 && (
        <div style={s.pagination}>
          <span style={s.pageInfo}>
            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()} students
          </span>
          <div style={s.pageButtons}>
            {/* Prev */}
            <button
              className="page-btn"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              style={{ ...s.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
            >
              ← Prev
            </button>

            {/* First page */}
            {page > 3 && (
              <>
                <button className="page-btn" onClick={() => handlePageChange(1)} style={s.pageBtn}>1</button>
                {page > 4 && <span style={s.pageDots}>...</span>}
              </>
            )}

            {/* Range */}
            {getPaginationRange().map(p => (
              <button
                key={p}
                className="page-btn"
                onClick={() => handlePageChange(p)}
                style={{ ...s.pageBtn, ...(p === page ? s.pageBtnActive : {}) }}
              >
                {p}
              </button>
            ))}

            {/* Last page */}
            {page < pages - 2 && (
              <>
                {page < pages - 3 && <span style={s.pageDots}>...</span>}
                <button className="page-btn" onClick={() => handlePageChange(pages)} style={s.pageBtn}>{pages}</button>
              </>
            )}

            {/* Next */}
            <button
              className="page-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pages}
              style={{ ...s.pageBtn, opacity: page === pages ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

    </AppLayout>
  );
};

// ── Styles ────────────────────────────────────────────────────
const s = {
  pageHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 18, fontWeight: 700, color: '#0f172a',
    fontFamily: "'Poppins', sans-serif",
  },
  pageSub: { fontSize: 12, color: '#94a3b8', marginTop: 3 },
  filterTag: { color: '#3b82f6', marginLeft: 4 },
  exportBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 7,
    background: '#16a34a', color: '#fff',
    border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600,
    fontFamily: "'Poppins', sans-serif",
    transition: 'background 0.15s',
  },
  filtersRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 14,
  },
  searchWrap: {
    flex: 1, position: 'relative',
    display: 'flex', alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute', left: 10,
    color: '#94a3b8', display: 'flex',
  },
  searchInput: {
    width: '100%', padding: '9px 32px 9px 32px',
    borderRadius: 7, border: '1px solid #e2e8f0',
    fontSize: 13, fontFamily: "'Poppins', sans-serif",
    background: '#fff', color: '#0f172a',
    outline: 'none',
  },
  clearBtn: {
    position: 'absolute', right: 8,
    background: 'none', border: 'none',
    color: '#94a3b8', cursor: 'pointer',
    fontSize: 12, padding: '2px 6px', borderRadius: 4,
  },
  stateSelect: {
    padding: '9px 12px', borderRadius: 7,
    border: '1px solid #e2e8f0',
    fontSize: 13, fontFamily: "'Poppins', sans-serif",
    background: '#fff', color: '#0f172a',
    outline: 'none', cursor: 'pointer',
    minWidth: 130,
  },
  resetBtn: {
    padding: '8px 12px', borderRadius: 7,
    border: '1px solid #e2e8f0',
    background: '#fff', color: '#64748b',
    fontSize: 12, fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
  },
  tableWrap: {
    background: '#fff', borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden', marginBottom: 16,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: {
    padding: '11px 16px', textAlign: 'left',
    fontSize: 11, fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid #e2e8f0',
    fontFamily: "'Poppins', sans-serif",
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' },
  td: { padding: '11px 16px', fontSize: 13, verticalAlign: 'middle' },
  studentId: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11, color: '#64748b',
    background: '#f1f5f9', padding: '2px 6px', borderRadius: 4,
  },
  nameCell: { display: 'flex', alignItems: 'center', gap: 10 },
  nameAvatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
  namePrimary: { fontSize: 13, fontWeight: 500, color: '#0f172a' },
  nameSub:     { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  emailCell:   { fontSize: 12, color: '#3b82f6' },
  phoneCell:   { fontSize: 12, color: '#374151', fontFamily: "'DM Mono', monospace" },
  idTag: {
    fontSize: 10, fontWeight: 600,
    background: '#f1f5f9', color: '#475569',
    padding: '2px 6px', borderRadius: 4, display: 'inline-block',
    fontFamily: "'DM Mono', monospace",
  },
  stateBadge: {
    fontSize: 10, fontWeight: 700,
    background: 'rgba(59,130,246,0.1)', color: '#2563eb',
    padding: '3px 8px', borderRadius: 10,
    border: '1px solid rgba(59,130,246,0.2)',
    fontFamily: "'Poppins', sans-serif",
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '4px 0 16px',
  },
  pageInfo: { fontSize: 12, color: '#94a3b8' },
  pageButtons: { display: 'flex', alignItems: 'center', gap: 4 },
  pageBtn: {
    padding: '5px 10px', borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#fff', color: '#374151',
    fontSize: 12, cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'background 0.1s',
    minWidth: 34, textAlign: 'center',
  },
  pageBtnActive: {
    background: '#2563eb', color: '#fff',
    borderColor: '#2563eb', fontWeight: 600,
  },
  pageDots: { color: '#94a3b8', fontSize: 12, padding: '0 4px' },
};

export default RealEstate;