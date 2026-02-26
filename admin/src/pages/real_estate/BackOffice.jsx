import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  FaUser, FaPlus, FaClipboard, FaPrint,
  FaSearch, FaTimes, FaArrowRight, FaFileExport,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';

const API = '/api/students';

// ── helpers ──────────────────────────────────────────────────
const token = () => localStorage.getItem('adminToken') || '';

// ── Component ─────────────────────────────────────────────────
const BackOffice = () => {
  const navigate = useNavigate();

  // state
  const [students,    setStudents]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [pages,       setPages]       = useState(1);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [statesList,  setStatesList]  = useState([]);

  // search fields (mirrors backend query params)
  const [search,      setSearch]      = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [inputVal,    setInputVal]    = useState('');
  const [emailInput,  setEmailInput]  = useState('');
  const [idInput,     setIdInput]     = useState('');
  const [phoneInput,  setPhoneInput]  = useState('');

  const LIMIT = 25;

  // ── fetch students ─────────────────────────────────────────
  const fetchStudents = useCallback(async (pg = 1, srch = search, st = stateFilter) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT });
      if (srch) params.set('search', srch);
      if (st)   params.set('state', st);

      const res = await fetch(`${API}?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data.students);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, stateFilter]);

  // ── fetch state list for dropdown ─────────────────────────
  useEffect(() => {
    fetch(`${API}/states`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(setStatesList)
      .catch(() => {});
  }, []);

  // initial load
  useEffect(() => { fetchStudents(1, '', ''); }, []); // eslint-disable-line

  // ── search handlers ────────────────────────────────────────
  const handleSearch = () => {
    setSearch(inputVal);
    fetchStudents(1, inputVal, stateFilter);
  };

  const handleStateChange = (val) => {
    setStateFilter(val);
    fetchStudents(1, search, val);
  };

  const handleClear = () => {
    setInputVal('');
    setEmailInput('');
    setIdInput('');
    setPhoneInput('');
    setSearch('');
    setStateFilter('');
    fetchStudents(1, '', '');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  // ── export CSV ─────────────────────────────────────────────
  const handleExport = () => {
    const params = new URLSearchParams();
    if (search)      params.set('search', search);
    if (stateFilter) params.set('state', stateFilter);
    const url = `${API}/export?${params}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_export.csv';
    // need auth header — open in new tab as fallback
    window.open(url, '_blank');
  };

  // ── pagination ─────────────────────────────────────────────
  const goToPage = (pg) => {
    if (pg < 1 || pg > pages) return;
    fetchStudents(pg, search, stateFilter);
  };

  const pageNumbers = () => {
    const nums = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(pages, page + 2);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  // ── render ─────────────────────────────────────────────────
  return (
    <AppLayout>
      <div style={S.page}>

        {/* Breadcrumb */}
        <Breadcrumb crumbs={[
          { label: 'Dashboard',         to: '/admin' },
          { label: 'Real Estate',       to: '/admin/real-estate' },
          { label: 'Online Exam System' },
          { label: 'BackOffice' },
        ]} />

        {/* Page Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>Student BackOffice</h1>
            <p style={S.subtitle}>Search, manage and update student records in the exam system.</p>
          </div>
          <button style={S.backBtn} onClick={() => navigate('/admin/real-estate')}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <FaChevronLeft style={{ fontSize: '0.7rem' }} /> Back To Real Estate
          </button>
        </div>

        <hr style={S.divider} />

        {/* What you can do */}
        <div style={S.capabilityBox}>
          <p style={S.capabilityLabel}>WHAT YOU CAN DO ON THIS PAGE</p>
          <div style={S.capabilityBtns}>
            {[
              { icon: FaUser,      label: 'List / Edit Existing Student Contact Info' },
              { icon: FaPlus,      label: 'Add New Student Records' },
              { icon: FaClipboard, label: 'Add Exams To Student Records' },
              { icon: FaPrint,     label: 'Print Exam Certificates For Selected Students' },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
              <button key={item.label} style={S.capBtn}
                onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d1d5db'; }}>
                <ItemIcon style={{ color: '#2563eb', fontSize: '0.8rem' }} />
                {item.label}
              </button>
              );
            })}
          </div>
        </div>

        {/* Stats bar */}
        <div style={S.statsBar}>
          <div style={S.statsLeft}>
            <span style={S.statsCount}>{total.toLocaleString()}</span>
            <span style={S.statsLabel}>Total Student Records</span>
          </div>
          <div style={S.statsRight}>
            <p style={S.statsShowing}>
              Showing <strong>all {total.toLocaleString()} records.</strong><br />
              Use a search below to filter.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {(search || stateFilter) && (
                <button style={S.clearBtn} onClick={handleClear}>
                  <FaTimes style={{ fontSize: '0.7rem' }} /> Clear Filters
                </button>
              )}
              <button style={S.exportBtn} onClick={handleExport}>
                <FaFileExport style={{ fontSize: '0.75rem' }} /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Search section */}
        <div style={S.searchBox}>
          <div style={S.searchHeader}>
            <h3 style={S.searchTitle}>Search Student Records</h3>
            <p style={S.searchSub}>Use any of the methods below to find a student</p>
          </div>

          <div style={S.searchGrid}>

            {/* BY LAST NAME */}
            <div style={S.searchRow}>
              <span style={S.searchLabel}>BY LAST NAME</span>
              <input style={S.searchInput} placeholder="" value={inputVal}
                onChange={e => setInputVal(e.target.value)} onKeyDown={handleKeyDown} />
              <button style={S.searchBtn} onClick={handleSearch}
                onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
                Filter Student Name List
              </button>
            </div>

            {/* BY EMAIL */}
            <div style={S.searchRow}>
              <span style={S.searchLabel}>BY EMAIL</span>
              <input style={S.searchInput} placeholder="" value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSearch(emailInput); fetchStudents(1, emailInput, stateFilter); }}} />
              <button style={S.searchBtn}
                onClick={() => { setSearch(emailInput); fetchStudents(1, emailInput, stateFilter); }}
                onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
                Filter by Email Address
              </button>
            </div>

            {/* STUDENT ID / DRE # */}
            <div style={S.searchRow}>
              <span style={S.searchLabel}>STUDENT ID / DRE #</span>
              <input style={S.searchInput} placeholder="" value={idInput}
                onChange={e => setIdInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSearch(idInput); fetchStudents(1, idInput, stateFilter); }}} />
              <button style={S.searchBtn}
                onClick={() => { setSearch(idInput); fetchStudents(1, idInput, stateFilter); }}
                onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
                Lookup Student ID / DRE #
              </button>
            </div>

            {/* TELEPHONE */}
            <div style={S.searchRow}>
              <span style={S.searchLabel}>TELEPHONE</span>
              <input style={S.searchInput} placeholder="" value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSearch(phoneInput); fetchStudents(1, phoneInput, stateFilter); }}} />
              <button style={S.searchBtn}
                onClick={() => { setSearch(phoneInput); fetchStudents(1, phoneInput, stateFilter); }}
                onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
                Lookup Telephone
              </button>
            </div>

            {/* BY STATE */}
            <div style={S.searchRow}>
              <span style={S.searchLabel}>BY STATE</span>
              <select style={{ ...S.searchInput, cursor: 'pointer' }}
                value={stateFilter} onChange={e => handleStateChange(e.target.value)}>
                <option value="">All States</option>
                {statesList.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <button style={S.searchBtn} onClick={() => fetchStudents(1, search, stateFilter)}
                onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
                Filter by State
              </button>
            </div>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={S.errorBox}>⚠ {error}</div>
        )}

        {/* Table */}
        <div style={S.tableWrap}>
          {loading ? (
            <div style={S.loadingWrap}>
              <div style={S.spinner} />
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 12 }}>Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div style={S.emptyWrap}>
              <FaSearch style={{ fontSize: '2rem', color: '#d1d5db' }} />
              <p style={{ color: '#6b7280', marginTop: 8 }}>No students found matching your search.</p>
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['Student ID', 'Name', 'Email', 'Phone', 'DRE #', 'State', 'Courses', ''].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s._id}
                    style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f9fafb'}>
                    <td style={S.td}><span style={S.idBadge}>{s.studentId}</span></td>
                    <td style={{ ...S.td, fontWeight: 600, color: '#111827' }}>{s.name || '—'}</td>
                    <td style={{ ...S.td, color: '#2563eb', fontSize: '0.8rem' }}>{s.email || '—'}</td>
                    <td style={{ ...S.td, fontSize: '0.8rem', color: '#4b5563' }}>{s.workPhone || s.mobilePhone || '—'}</td>
                    <td style={{ ...S.td, fontSize: '0.8rem', color: '#4b5563' }}>{s.dreNumber || '—'}</td>
                    <td style={S.td}>
                      {s.state ? <span style={S.stateBadge}>{s.state}</span> : '—'}
                    </td>
                    <td style={{ ...S.td, textAlign: 'center' }}>
                      <span style={S.coursePill}>{s.courseCount}</span>
                    </td>
                    <td style={S.td}>
                      <button style={S.viewBtn}
                        onClick={() => navigate(`/admin/students/${s.studentId}`)}
                        onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                        onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}>
                        View <FaArrowRight style={{ fontSize: '0.65rem' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div style={S.pagination}>
            <span style={S.pageInfo}>
              Page {page} of {pages} &nbsp;·&nbsp; {total.toLocaleString()} total records
            </span>
            <div style={S.pageBtns}>
              <button style={S.pageBtn} onClick={() => goToPage(page - 1)} disabled={page === 1}>
                <FaChevronLeft style={{ fontSize: '0.7rem' }} />
              </button>
              {pageNumbers().map(n => (
                <button key={n} style={{ ...S.pageBtn, ...(n === page ? S.pageBtnActive : {}) }}
                  onClick={() => goToPage(n)}>
                  {n}
                </button>
              ))}
              <button style={S.pageBtn} onClick={() => goToPage(page + 1)} disabled={page === pages}>
                <FaChevronRight style={{ fontSize: '0.7rem' }} />
              </button>
            </div>
          </div>
        )}

        {/* Add New Student CTA */}
        <div style={S.addStudentBar}>
          <div>
            <h3 style={S.addStudentTitle}>Need To Add A New Student?</h3>
            <p style={S.addStudentSub}>Create a new student record in the system. You can add exam data after the record is created.</p>
          </div>
          <button style={S.addStudentBtn}
            onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
            onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}>
            <FaPlus /> Add New Student Records
          </button>
        </div>

      </div>
    </AppLayout>
  );
};

// ── Styles ────────────────────────────────────────────────────
const S = {
  page:       { padding: '1.5rem 2rem' },
  header:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' },
  title:      { fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' },
  subtitle:   { fontSize: '0.875rem', color: '#6b7280', margin: 0 },
  backBtn:    { display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 500, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 4 },
  divider:    { border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 1.25rem 0' },

  capabilityBox:  { background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.25rem' },
  capabilityLabel:{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', marginBottom: '0.6rem', margin: '0 0 0.6rem 0' },
  capabilityBtns: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  capBtn:         { display: 'flex', alignItems: 'center', gap: 6, padding: '0.45rem 0.9rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8rem', fontWeight: 500, color: '#374151', cursor: 'pointer', transition: 'all 0.15s' },

  statsBar:    { background: '#0f172a', borderRadius: 8, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  statsLeft:   { display: 'flex', alignItems: 'baseline', gap: 10 },
  statsCount:  { fontSize: '2rem', fontWeight: 800, color: '#38bdf8', fontFamily: "'DM Mono', monospace" },
  statsLabel:  { fontSize: '0.8rem', color: '#94a3b8' },
  statsRight:  { display: 'flex', alignItems: 'center', gap: 12 },
  statsShowing:{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'right', margin: 0, lineHeight: 1.5 },
  clearBtn:    { display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.9rem', background: 'transparent', border: '1px solid #334155', borderRadius: 6, color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer' },
  exportBtn:   { display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.9rem', background: 'transparent', border: '1px solid #334155', borderRadius: 6, color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer' },

  searchBox:    { border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.25rem', marginBottom: '1.25rem', background: '#fff' },
  searchHeader: { marginBottom: '1rem' },
  searchTitle:  { fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.2rem 0' },
  searchSub:    { fontSize: '0.78rem', color: '#6b7280', margin: 0 },
  searchGrid:   { display: 'flex', flexDirection: 'column', gap: 10 },
  searchRow:    { display: 'grid', gridTemplateColumns: '160px 1fr auto', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' },
  searchLabel:  { fontSize: '0.75rem', fontWeight: 700, color: '#374151', letterSpacing: '0.05em' },
  searchInput:  { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', color: '#111827', outline: 'none', background: '#fff' },
  searchBtn:    { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s' },

  errorBox:   { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' },

  tableWrap:  { border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: '1.25rem', background: '#fff' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { padding: '0.65rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textAlign: 'left', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  td:         { padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#374151', borderBottom: '1px solid #f1f5f9' },
  idBadge:    { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 7px', fontSize: '0.75rem', fontFamily: "'DM Mono', monospace", color: '#475569' },
  stateBadge: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 4, padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700 },
  coursePill: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 10, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700 },
  viewBtn:    { display: 'flex', alignItems: 'center', gap: 5, padding: '0.35rem 0.8rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 5, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' },

  loadingWrap:{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' },
  spinner:    { width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyWrap:  { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', color: '#6b7280' },

  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  pageInfo:   { fontSize: '0.8rem', color: '#6b7280' },
  pageBtns:   { display: 'flex', gap: 4 },
  pageBtn:    { padding: '0.35rem 0.65rem', border: '1px solid #d1d5db', borderRadius: 5, background: '#fff', color: '#374151', fontSize: '0.8rem', cursor: 'pointer' },
  pageBtnActive: { background: '#2563eb', color: '#fff', borderColor: '#2563eb' },

  addStudentBar:  { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  addStudentTitle:{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.2rem 0' },
  addStudentSub:  { fontSize: '0.78rem', color: '#6b7280', margin: 0 },
  addStudentBtn:  { display: 'flex', alignItems: 'center', gap: 7, padding: '0.65rem 1.25rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s' },
};

export default BackOffice;