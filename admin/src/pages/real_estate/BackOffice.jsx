import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  FaUser, FaPlus, FaClipboard, FaPrint,
  FaSearch, FaTimes, FaFileExport,
  FaChevronLeft, FaChevronRight, FaEye, FaPhone, FaEnvelope,
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
  const [ssInput,     setSsInput]     = useState('');
  const [selectStudent, setSelectStudent] = useState('');

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
    setSsInput('');
    setSelectStudent('');
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .bo-page * { font-family: 'Poppins', sans-serif; box-sizing: border-box; }

        /* — big number in stats bar — */
        .bo-big-num {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 2rem;          /* was 2.6rem */
          color: #2EABFE;
          line-height: 1;
        }

        /* — spinner — */
        .bo-spinner {
          width: 28px; height: 28px;   /* was 32px */
          border: 3px solid rgba(46,171,254,0.2);
          border-top: 3px solid #2EABFE;
          border-radius: 50%;
          animation: bo-spin 0.8s linear infinite;
        }
        @keyframes bo-spin { to { transform: rotate(360deg); } }

        /* — search inputs — */
        .bo-search-input {
          width: 100%;
          padding: 6px 10px;          /* was 0.6rem 0.85rem */
          background: rgba(127, 168, 196, 0.1);
          border: 0.5px solid #7FA8C4;
          border-radius: 6.67px;
          font-size: 0.75rem;         /* was 0.875rem → match SD td 12px */
          font-family: 'Poppins', sans-serif;
          color: #091925;
          outline: none;
          transition: border-color 0.15s;
        }
        .bo-search-input::placeholder { color: #7FA8C4; opacity: 0.7; }
        .bo-search-input:focus { border-color: #2EABFE; }

        /* — search buttons — */
        .bo-search-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px;          /* was 0.6rem 1.1rem */
          background: #2EABFE;
          color: #091925;
          border: 0.5px solid #2EABFE;
          border-radius: 6.67px;
          font-size: 0.72rem;         /* was 0.8rem */
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.15s;
        }
        .bo-search-btn:hover { opacity: 0.88; }

        /* — capability buttons — */
        .bo-cap-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 10px;          /* was 0.5rem 1rem */
          background: rgba(208, 235, 255, 0.25);
          border: 0.5px solid #2EABFE;
          border-radius: 6.67px;
          font-size: 0.72rem;         /* was 0.82rem */
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
          color: #091925;
          cursor: pointer;
          transition: background 0.15s;
        }
        .bo-cap-btn:hover { background: rgba(46,171,254,0.15); }
        .bo-cap-icon { color: #2EABFE; font-size: 0.75rem; } /* was 0.85rem */

        /* — export button — */
        .bo-export-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 3px 10px;          /* was 0.4rem 1rem */
          background: transparent;
          border: 0.5px solid #5B7384;
          border-radius: 10px;
          color: #fff;
          font-size: 0.72rem;         /* was 0.78rem */
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .bo-export-btn:hover { border-color: #2EABFE; }

        /* — back button — */
        .bo-back-btn {
          display: flex; align-items: center; gap: 6px;
          background: #fff;
          border: 0.5px solid #5B7384;
          border-radius: 10px;
          padding: 6px 12px;          /* was 0.6rem 1.1rem */
          font-size: 0.72rem;         /* was 0.82rem */
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          color: #5B7384;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .bo-back-btn:hover { background: #f3f4f6; }

        /* — add student button — */
        .bo-add-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px;          /* was 0.65rem 1.4rem */
          background: #008000;
          color: #fff;
          border: 0.5px solid #008000;
          border-radius: 6.67px;
          font-size: 0.75rem;         /* was 0.875rem */
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.15s;
        }
        .bo-add-btn:hover { opacity: 0.88; }

        /* — pagination buttons — match SD tab count pill sizing — */
        .bo-page-btn {
          width: 32px; height: 32px;  /* was 50×50 */
          border: 0.5px solid #5B7384;
          border-radius: 10px;
          background: #fff;
          color: #5B7384;
          font-size: 0.72rem;         /* was 0.875rem */
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s;
        }
        .bo-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .bo-page-btn-active {
          background: #2EABFE !important;
          color: #091925 !important;
          border-color: #2EABFE !important;
        }

        /* — table header — match SD th: 10px, 9px 16px padding — */
        .bo-th {
          padding: 9px 16px;
          background: rgba(127, 168, 196, 0.1);
          border-top: 0.5px solid #5B7384;
          border-bottom: 0.5px solid #5B7384;
          font-size: 0.625rem;        /* 10px — matches SD th */
          font-weight: 500;
          color: #5B7384;
          text-align: left;
          letter-spacing: 0.04em;    /* was 0.05em */
          text-transform: uppercase;
          white-space: nowrap;
          font-family: 'Poppins', sans-serif;
        }

        /* — table cells — match SD td: 12px, 9px 16px padding — */
        .bo-td {
          padding: 9px 16px;
          font-size: 0.75rem;         /* 12px — was 0.875rem */
          font-weight: 500;
          color: #091925;
          border-bottom: 0.5px solid #5B7384;
          font-family: 'Poppins', sans-serif;
        }

        /* — view link — match SD dateCell/courseTitle 12px — */
        .bo-view-link {
          background: none;
          border: none;
          color: #2EABFE;
          font-size: 0.75rem;         /* was 0.875rem */
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          padding: 0;
          white-space: nowrap;
        }
        .bo-view-link:hover { text-decoration: underline; }

        /* — records badge — match SD statsPillBlue: 10px, 3px 10px — */
        .bo-records-badge {
          background: #E7F8F2;
          color: #10B981;
          font-size: 0.625rem;        /* 10px — was 0.72rem */
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          border-radius: 100px;
          padding: 3px 10px;          /* was 4px 12px */
          white-space: nowrap;
        }

        /* — filter tag — same scale as records badge — */
        .bo-filter-tag {
          background: #E0F2FF;
          color: #1A7AB8;
          font-size: 0.625rem;        /* 10px */
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          border-radius: 100px;
          padding: 3px 10px;
          white-space: nowrap;
        }

        /* — search rows — */
        .bo-search-row {
          display: grid;
          grid-template-columns: 160px 1fr auto; /* was 175px */
          align-items: center;
          gap: 12px;                  /* was 14px */
          padding: 6px 0;            /* was 8px 0 */
        }
        .bo-search-divider {
          border: none;
          border-top: 0.5px solid #5B7384;
          margin: 2px 0;
        }
        .bo-search-label {
          font-size: 0.625rem;        /* 10px — was 0.78rem */
          font-weight: 500;
          color: #091925;
          letter-spacing: 0.04em;    /* was 0.05em */
          text-transform: uppercase;
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <div className="bo-page" style={{ padding: '1.5rem 2rem', fontFamily: "'Poppins', sans-serif" }}>

        {/* Breadcrumb */}
        <Breadcrumb crumbs={[
          { label: 'Dashboard',         to: '/admin' },
          { label: 'Real Estate',       to: '/admin/real-estate' },
          { label: 'Online Exam System' },
          { label: 'BackOffice' },
        ]} />

        {/* Page Header — keep title large, it's a page heading not a card element */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#000', margin: '0 0 0.15rem 0', fontFamily: "'Poppins', sans-serif", lineHeight: 1.1 }}>
              Student BackOffice
            </h1>
            <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5B7384', margin: 0, fontFamily: "'Poppins', sans-serif" }}>
              Search, manage and update student records in the exam system.
            </p>
          </div>
          <button className="bo-back-btn" onClick={() => navigate('/admin/real-estate')} style={{ marginTop: 6 }}>
            <FaChevronLeft style={{ fontSize: '0.6rem' }} /> Back To Real Estate
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '0.5px solid #2EABFE', margin: '0.6rem 0 0.85rem 0' }} />

        {/* What you can do */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', marginBottom: '12px' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 500, color: '#5B7384', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px 0', fontFamily: "'Poppins', sans-serif" }}>
            What You Can Do On This Page
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { icon: FaUser,      label: 'List / Edit Existing Student Contact Info' },
              { icon: FaPlus,      label: 'Add New Student Records' },
              { icon: FaClipboard, label: 'Add Exams To Student Records' },
              { icon: FaPrint,     label: 'Print Exam Certificates For Selected Students' },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <button key={item.label} className="bo-cap-btn">
                  <ItemIcon className="bo-cap-icon" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          background: '#091925',
          borderRadius: 10,
          padding: '14px 20px',        /* was 1rem 1.5rem — matches SD headerCard */
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',        /* was 1rem */
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%)',
            borderRadius: 10,
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, position: 'relative' }}>
            <span className="bo-big-num">{total.toLocaleString()}</span>
            <div style={{ width: 0, height: 32, borderLeft: '0.5px solid #2EABFE' }} />
            <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 400, fontFamily: "'Poppins', sans-serif" }}>Total Student Records</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <p style={{ fontSize: '0.72rem', color: '#fff', textAlign: 'right', margin: 0, lineHeight: 1.5, fontFamily: "'Poppins', sans-serif" }}>
              Showing <strong>all {total.toLocaleString()} records.</strong><br />
              Use a search below to filter.
            </p>
            {(search || stateFilter) && (
              <button onClick={handleClear}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'transparent', border: '0.5px solid #5B7384', borderRadius: 10, color: '#fff', fontSize: '0.625rem', fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>
                <FaTimes style={{ fontSize: '0.6rem' }} /> Clear Filters
              </button>
            )}
            <button className="bo-export-btn" onClick={handleExport}>
              <FaFileExport style={{ fontSize: '0.65rem' }} /> Export CSV
            </button>
          </div>
        </div>

        {/* Search section */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', marginBottom: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <hr style={{ border: 'none', borderTop: '0.5px solid #5B7384', margin: '0 0 8px 0' }} />
            <h3 style={{ fontSize: '0.75rem', fontWeight: 500, color: '#091925', margin: '0 0 2px 0', fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize' }}>Search Student Records</h3>
            <p style={{ fontSize: '0.625rem', color: '#7FA8C4', margin: 0, fontFamily: "'Poppins', sans-serif" }}>Use any of the methods below to find a student</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* BY LAST NAME */}
            <div className="bo-search-row">
              <span className="bo-search-label">By Last Name</span>
              <input className="bo-search-input" placeholder="e.g. Smith" value={inputVal}
                onChange={e => setInputVal(e.target.value)} onKeyDown={handleKeyDown} />
              <button className="bo-search-btn" onClick={handleSearch}>
                <FaSearch style={{ fontSize: '0.6rem' }} /> Filter Student Name List
              </button>
            </div>

            {/* BY EMAIL */}
            <div className="bo-search-row">
              <span className="bo-search-label">By Email</span>
              <input className="bo-search-input" placeholder="e.g. student@gmail.com" value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSearch(emailInput); fetchStudents(1, emailInput, stateFilter); }}} />
              <button className="bo-search-btn"
                onClick={() => { setSearch(emailInput); fetchStudents(1, emailInput, stateFilter); }}>
                <FaEnvelope style={{ fontSize: '0.6rem' }} /> Filter by Email Address
              </button>
            </div>

            <hr className="bo-search-divider" />

            {/* SELECT STUDENT */}
            <div className="bo-search-row">
              <span className="bo-search-label">Select Student</span>
              <select className="bo-search-input" style={{ cursor: 'pointer' }}
                value={selectStudent} onChange={e => setSelectStudent(e.target.value)}>
                <option value="">— Select from list below —</option>
                {students.map(s => <option key={s._id} value={s.studentId}>{s.name}</option>)}
              </select>
              <button className="bo-search-btn"
                onClick={() => { if (selectStudent) { setSearch(selectStudent); fetchStudents(1, selectStudent, stateFilter); } }}>
                <FaEye style={{ fontSize: '0.6rem' }} /> View Student Info
              </button>
            </div>

            <hr className="bo-search-divider" />

            {/* SOCIAL SECURITY # */}
            <div className="bo-search-row">
              <span className="bo-search-label">Social Security #</span>
              <input className="bo-search-input" placeholder="XXX-XX-XXXX" value={ssInput}
                onChange={e => setSsInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSearch(ssInput); fetchStudents(1, ssInput, stateFilter); }}} />
              <button className="bo-search-btn"
                onClick={() => { setSearch(ssInput); fetchStudents(1, ssInput, stateFilter); }}>
                <FaSearch style={{ fontSize: '0.6rem' }} /> Lookup Student SS
              </button>
            </div>

            {/* STUDENT ID / DRE # */}
            <div className="bo-search-row">
              <span className="bo-search-label">Student ID / DRE #</span>
              <input className="bo-search-input" placeholder="e.g. 00123456 or DRE-789" value={idInput}
                onChange={e => setIdInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSearch(idInput); fetchStudents(1, idInput, stateFilter); }}} />
              <button className="bo-search-btn"
                onClick={() => { setSearch(idInput); fetchStudents(1, idInput, stateFilter); }}>
                <FaSearch style={{ fontSize: '0.6rem' }} /> Lookup Student ID / DRE #
              </button>
            </div>

            {/* TELEPHONE */}
            <div className="bo-search-row">
              <span className="bo-search-label">Telephone</span>
              <input className="bo-search-input" placeholder="e.g. (555) 123-4567" value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSearch(phoneInput); fetchStudents(1, phoneInput, stateFilter); }}} />
              <button className="bo-search-btn"
                onClick={() => { setSearch(phoneInput); fetchStudents(1, phoneInput, stateFilter); }}>
                <FaPhone style={{ fontSize: '0.6rem' }} /> Lookup Telephone
              </button>
            </div>

            {/* BY STATE */}
            <div className="bo-search-row">
              <span className="bo-search-label">By State</span>
              <select className="bo-search-input" style={{ cursor: 'pointer' }}
                value={stateFilter} onChange={e => handleStateChange(e.target.value)}>
                <option value="">All States</option>
                {statesList.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <button className="bo-search-btn" onClick={() => fetchStudents(1, search, stateFilter)}>
                <FaSearch style={{ fontSize: '0.6rem' }} /> Filter by State
              </button>
            </div>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', borderRadius: 6, padding: '8px 12px', color: '#dc2626', fontSize: '0.75rem', marginBottom: '12px', fontFamily: "'Poppins', sans-serif" }}>
            ⚠ {error}
          </div>
        )}

        {/* Search Results Table */}
        <div style={{ background: '#fff', borderRadius: 10, marginBottom: '12px', overflow: 'hidden' }}>

          {/* Table Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', flexWrap: 'wrap', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#091925', fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize' }}>
                Search Results
              </span>
              {total > 0 && (
                <span className="bo-records-badge">{total.toLocaleString()} Records</span>
              )}
              {(search || stateFilter) && (
                <span style={{ fontSize: '0.625rem', color: 'rgba(91,115,132,0.5)', fontFamily: "'Poppins', sans-serif" }}>
                  Filtered by:
                </span>
              )}
              {search && <span className="bo-filter-tag">Last Name: {search}</span>}
              {stateFilter && <span className="bo-filter-tag">State: {stateFilter}</span>}
            </div>
            {(search || stateFilter) && (
              <button onClick={handleClear}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '0.5px solid #5B7384', borderRadius: 10, padding: '3px 10px', fontSize: '0.625rem', fontWeight: 700, color: '#5B7384', fontFamily: "'Poppins', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <FaTimes style={{ fontSize: '0.6rem' }} /> Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem' }}>
              <div className="bo-spinner" />
              <p style={{ color: '#5B7384', fontSize: '0.75rem', marginTop: 10, fontFamily: "'Poppins', sans-serif" }}>Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem', color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>
              <FaSearch style={{ fontSize: '1.6rem', color: '#7FA8C4' }} />
              <p style={{ marginTop: 8, fontSize: '0.75rem' }}>No students found matching your search.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Student Name', 'Student ID', 'DRE #', 'State', 'Phone', 'Email', 'Courses', ''].map(h => (
                    <th key={h} className="bo-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}
                    style={{ background: '#fff', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(46,171,254,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <td className="bo-td">{s.name || '—'}</td>
                    <td className="bo-td">{s.studentId || '—'}</td>
                    <td className="bo-td">{s.dreNumber || '—'}</td>
                    <td className="bo-td">{s.state || '—'}</td>
                    <td className="bo-td">{s.workPhone || s.mobilePhone || '—'}</td>
                    <td className="bo-td">{s.email || '—'}</td>
                    <td className="bo-td" style={{ textAlign: 'center' }}>{s.courseCount ?? '—'}</td>
                    <td className="bo-td" style={{ textAlign: 'right' }}>
                      <button className="bo-view-link"
                        onClick={() => navigate(`/admin/students/${s.studentId}`)}>
                        View Student Info →
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#5B7384', fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize' }}>
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} Of {total.toLocaleString()} Records
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              <button className="bo-page-btn" onClick={() => goToPage(page - 1)} disabled={page === 1}>
                <FaChevronLeft style={{ fontSize: '0.6rem' }} />
              </button>
              {pageNumbers().map(n => (
                <button key={n} className={`bo-page-btn${n === page ? ' bo-page-btn-active' : ''}`}
                  onClick={() => goToPage(n)}>
                  {n}
                </button>
              ))}
              <button className="bo-page-btn" onClick={() => goToPage(page + 1)} disabled={page === pages}>
                <FaChevronRight style={{ fontSize: '0.6rem' }} />
              </button>
            </div>
          </div>
        )}

        {/* Add New Student CTA */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 500, color: '#091925', margin: '0 0 2px 0', fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize' }}>Need To Add A New Student?</h3>
            <p style={{ fontSize: '0.625rem', color: '#7FA8C4', margin: 0, fontFamily: "'Poppins', sans-serif" }}>Create a new student record in the system. You can add exam data after the record is created.</p>
          </div>
          <button className="bo-add-btn" onClick={() => navigate('/admin/real-estate/online-exam/backoffice/add-student')}>
            <FaPlus /> Add New Student Records
          </button>
        </div>

      </div>
    </AppLayout>
  );
};

export default BackOffice;
