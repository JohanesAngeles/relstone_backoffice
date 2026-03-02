// src/pages/real_estate/SecureOrders.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api/admin', '');

const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
  </svg>
);

const MONTHS     = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS       = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS      = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i));
const DEPTS      = ['Any Dept.','CE','DMV','DollarCE','EPC','LCR','LicSol','LPC','RELS','Tab - R.E.'];
const WHERE_HEAR = ['Any Dept.','Referral by Friend/Colleague','E-Mail','Postcard','Past Customer','DRE Website','Old Tabloid','Yellow Pages','Search Engine','Telemarketing Call','Customer Callback','Other'];

const SecureOrders = () => {
  const navigate = useNavigate();
  const today    = new Date();

  const [lookup,    setLookup]    = useState({ orderNumber:'', email:'', lastName:'', companyName:'', upsTrk:'', creditCard:'', itemNumber:'' });
  const [archive,   setArchive]   = useState({ trackingNumber:'', lastName:'' });
  const [results,   setResults]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [dept,      setDept]      = useState('Any Dept.');
  const [whereHear, setWhereHear] = useState('Any Dept.');
  const [orderType, setOrderType] = useState('both');
  const [shipType,  setShipType]  = useState('both');
  const [showMonth, setShowMonth] = useState(false);
  const [selMonth,  setSelMonth]  = useState(MONTHS[today.getMonth()]);
  const [selDay,    setSelDay]    = useState(String(today.getDate()).padStart(2,'0'));
  const [selYear,   setSelYear]   = useState(String(today.getFullYear()));
  const [insMonth,  setInsMonth]  = useState(MONTHS[today.getMonth()]);
  const [insDay,    setInsDay]    = useState(String(today.getDate()).padStart(2,'0'));
  const [insYear,   setInsYear]   = useState(String(today.getFullYear()));
  const [insOnly,   setInsOnly]   = useState(true);
  const [startDate, setStartDate] = useState('01012012');
  const [endDate,   setEndDate]   = useState('03312012');

  const token = () => localStorage.getItem('adminToken');

  const fetchOrders = async (url) => {
    setLoading(true); setError(''); setResults(null);
    try {
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      setResults(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleLookup = () => {
    const hasAny = Object.values(lookup).some(v => v.trim());
    if (!hasAny) { setError('Please enter at least one search field.'); return; }
    const p = new URLSearchParams();
    if (lookup.orderNumber) p.set('orderNumber', lookup.orderNumber);
    if (lookup.email)       p.set('email',       lookup.email);
    if (lookup.lastName)    p.set('lastName',     lookup.lastName);
    if (lookup.companyName) p.set('companyName',  lookup.companyName);
    if (lookup.creditCard)  p.set('creditCard',   lookup.creditCard);
    if (lookup.itemNumber)  p.set('itemNumber',   lookup.itemNumber);
    fetchOrders(`${API}/api/orders/lookup?${p}`);
  };

  const handleReset = () => {
    setLookup({ orderNumber:'', email:'', lastName:'', companyName:'', upsTrk:'', creditCard:'', itemNumber:'' });
    setResults(null); setError('');
  };

  const handleViewByDate = (mode) => {
    const p = new URLSearchParams();
    if (mode === 'today') {
      p.set('date', today.toISOString().split('T')[0]);
    } else if (mode === 'month') {
      const m = String(today.getMonth()+1).padStart(2,'0');
      p.set('month', `${today.getFullYear()}-${m}`); p.set('entire','true');
    } else if (mode === 'selected') {
      const monIdx = String(MONTHS.indexOf(selMonth)+1).padStart(2,'0');
      if (showMonth) { p.set('month',`${selYear}-${monIdx}`); p.set('entire','true'); }
      else           { p.set('date', `${selYear}-${monIdx}-${selDay}`); }
    }
    fetchOrders(`${API}/api/orders/by-date?${p}`);
  };

  return (
    <AppLayout>
      <div style={{ padding:'1.5rem 2rem' }}>

        <Breadcrumb crumbs={[
          { label:'Dashboard',          to:'/admin' },
          { label:'Real Estate',        to:'/admin/real-estate' },
          { label:'Online Exam System', to:'/admin/real-estate/online-exam' },
          { label:'Secure Orders' },
        ]} />

        {/* ── Page Header ───────────────────────────────────────── */}
        <div style={s.topRow}>
          <div>
            <h1 style={s.pageTitle}>Secure Orders</h1>
            <div style={s.subLine}>
              <span style={s.subText}>OnlineCourseDelivery.com Order Status Menu</span>
              <span style={s.secureBadge}>
                <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={12} />
                Secure Connection
              </span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => navigate('/admin/real-estate')} style={s.outlineBtn}>← Back To Real Estate</button>
            <button style={s.outlineBtn}>
              <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={12} /> Update Password
            </button>
          </div>
        </div>

        {/* ── Order Lookup Card ─────────────────────────────────── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" size={15} />
            <span style={s.cardTitle}>Order Lookup</span>
            <span style={s.cardSubtitle}>Search for orders by any field below</span>
          </div>

          <div style={s.lookupGrid}>
            {/* Lookup Fields */}
            <div>
              {[
                { label:'Lookup Order Number:',       key:'orderNumber', ph:'e.g. 100482' },
                { label:'Lookup Customer E-Mail:',    key:'email',       ph:'e.g. student@gmail.com' },
                { label:'Lookup Customer Last Name:', key:'lastName',    ph:'e.g. Smith' },
                { label:'Lookup Company Name:',       key:'companyName', ph:'e.g. ABC Realty' },
                { label:'Lookup UPS TRK#/Cust ID#:',  key:'upsTrk',     ph:'e.g. 1Z999AA1...' },
                { label:'Lookup Credit Card #:',      key:'creditCard',  ph:'Last 4 digits' },
                { label:'Lookup Item #:',             key:'itemNumber',  ph:'e.g. ITEM-4821' },
              ].map(({ label, key, ph }) => (
                <div key={key} style={s.lookupRow}>
                  <label style={s.lookupLabel}>{label}</label>
                  <input
                    style={s.lookupInput}
                    placeholder={ph}
                    value={lookup[key]}
                    onChange={e => setLookup(p => ({ ...p, [key]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  />
                </div>
              ))}
              {error && <p style={s.errorMsg}>⚠ {error}</p>}
              <div style={s.lookupActions}>
                <button onClick={handleLookup} disabled={loading} style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }}>
                  <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" size={14} />
                  {loading ? 'Searching...' : 'Lookup Order(s)'}
                </button>
                <button onClick={handleReset} style={s.cancelBtn}>✕ Cancel</button>
              </div>
            </div>

            {/* Archive Box — header + fields inside green box, buttons outside */}
            <div>
              <div style={s.archiveBox}>
                <div style={s.archiveHeader}>RESEARCH ARCHIVES OF ANTIQUE DOS ORDER ENTRY SYSTEM</div>
                <div style={{ padding:'14px 16px' }}>
                  {[
                    { label:'Lookup Student Tracking #:', key:'trackingNumber', ph:'Tracking #' },
                    { label:'Lookup Student Last Name:',  key:'lastName',       ph:'Last Name'  },
                  ].map(({ label, key, ph }) => (
                    <div key={key} style={s.archiveLookupRow}>
                      <label style={s.lookupLabel}>{label}</label>
                      <input
                        style={s.archiveInput}
                        placeholder={ph}
                        value={archive[key]}
                        onChange={e => setArchive(p => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <button style={s.archiveMailBtn}>✉ Lookup R.E. Mail Order(s)</button>
                <button onClick={() => setArchive({ trackingNumber:'', lastName:'' })} style={s.cancelBtn}>✕ Cancel</button>
              </div>
              <p style={{ fontSize:11, color:'#7FA8C4', marginTop:8, fontFamily:"'Poppins',sans-serif" }}>
                Legacy DOS archive integration pending.
              </p>
            </div>
          </div>

          {/* Results */}
          {loading && (
            <div style={s.stateBox}><p style={s.stateText}>🔍 Searching orders...</p></div>
          )}

          {!loading && results && results.total === 0 && (
            <div style={s.stateBox}>
              <Icon d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7 M12 12v9 M8 21h8" size={26} />
              <p style={s.stateTitle}>No Orders Found</p>
              <p style={s.stateSub}>No orders matched your search. Try a different field.</p>
            </div>
          )}

          {!loading && results && results.total > 0 && (
            <div style={{ padding:'0 20px 20px' }}>
              <div style={{ marginBottom:10 }}>
                <span style={s.resultsCount}>{results.total} order{results.total !== 1 ? 's' : ''} found</span>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr style={s.thead}>
                      {['Order #','Date','Student','Item #','Description','Price','Discount','Total'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.orders.map((o, i) => (
                      <tr key={i} style={s.tr}>
                        <td style={s.td}><span style={s.orderNum}>{o.orderNumber || '—'}</span></td>
                        <td style={s.td}><span style={s.mono}>{o.date || '—'}</span></td>
                        <td style={s.td}>
                          <span style={s.cellPrimary}>{o.student?.name || o.studentName || '—'}</span>
                          {o.student?.email && <div style={s.cellSub}>{o.student.email}</div>}
                        </td>
                        <td style={s.td}><span style={s.mono}>{o.itemNumber || '—'}</span></td>
                        <td style={s.td}><span style={s.cellPrimary}>{o.description || '—'}</span></td>
                        <td style={s.td}><span style={s.money}>{o.price || '—'}</span></td>
                        <td style={s.td}>
                          <span style={{ ...s.money, color: o.discount && o.discount !== '0.00' ? '#EF4444' : '#7FA8C4' }}>
                            {o.discount || '—'}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.money, fontWeight:700, color:'#008000' }}>{o.total || '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Order Views, Filters & Reports Card ──────────────── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <Icon d="M3 3h18v18H3z M3 9h18 M9 21V9" size={15} />
            <span style={s.cardTitle}>Order Views, Filters &amp; Reports</span>
            <span style={s.cardSubtitle}>Filter by department, view by date, or generate reports</span>
          </div>

          <div style={s.reportsGrid}>

            {/* Col 1 – Dept & Where Hear filters */}
            <div style={{ padding:'20px 0 20px 20px', borderRight:'0.5px solid #5B7384' }}>
              <p style={s.filterLabel}>DEPT. FILTER</p>
              {DEPTS.map(d => (
                <label key={d} style={s.radioRow}>
                  <input type="radio" name="dept" checked={dept===d} onChange={() => setDept(d)} style={{ accentColor:'#2EABFE' }} />
                  <span style={s.radioLbl}>{d}</span>
                </label>
              ))}
              <p style={{ ...s.filterLabel, marginTop:18 }}>WHERE HEAR @ FILTER</p>
              {WHERE_HEAR.map(w => (
                <label key={w} style={s.radioRow}>
                  <input type="radio" name="whereHear" checked={whereHear===w} onChange={() => setWhereHear(w)} style={{ accentColor:'#2EABFE' }} />
                  <span style={s.radioLbl}>{w}</span>
                </label>
              ))}
            </div>

            {/* Col 2 – View buttons & date pickers */}
            <div style={{ padding:20, borderRight:'0.5px solid #5B7384' }}>
              <button onClick={() => handleViewByDate('today')} style={{ ...s.viewBtn, display:'flex', alignItems:'center', gap:8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                View Today's Orders
              </button>
              <button onClick={() => handleViewByDate('month')} style={{ ...s.viewBtn, display:'flex', alignItems:'center', gap:8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                View This Month's Orders
              </button>
              <button style={{ ...s.viewBtnOutline, display:'flex', alignItems:'center', gap:8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B7384" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                View All Orders in List Format
              </button>

              {/* Selected date box */}
              <div style={s.datePicker}>
                <div style={s.dpRow}>
                  <label style={s.dpLbl}>Month:</label>
                  <select style={s.dpSel} value={selMonth} onChange={e => setSelMonth(e.target.value)}>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <label style={s.dpLbl}>Day:</label>
                  <select style={s.dpSel} value={selDay} onChange={e => setSelDay(e.target.value)}>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <label style={s.dpLbl}>Year:</label>
                  <select style={s.dpSel} value={selYear} onChange={e => setSelYear(e.target.value)}>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <button onClick={() => handleViewByDate('selected')} style={{ ...s.viewBtn, display:'flex', alignItems:'center', gap:8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  View Selected Day's Orders
                </button>
                <label style={{ ...s.radioRow, marginTop:8 }}>
                  <input
                    type="checkbox" checked={showMonth}
                    onChange={e => setShowMonth(e.target.checked)}
                    style={{ accentColor:'#2EABFE', width:15, height:15 }}
                  />
                  <span style={s.radioLbl}>Show Entire Month Selected</span>
                </label>
                <div style={{ display:'flex', gap:24, marginTop:12 }}>
                  <div>
                    {['Insurance','Real Estate','Both'].map(t => (
                      <label key={t} style={s.radioRow}>
                        <input type="radio" name="orderType"
                          checked={orderType===t.toLowerCase().replace(' ','')}
                          onChange={() => setOrderType(t.toLowerCase().replace(' ',''))}
                          style={{ accentColor:'#2EABFE' }} />
                        <span style={s.radioLbl}>{t}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    {['Online','Shipped','Both'].map(t => (
                      <label key={t} style={s.radioRow}>
                        <input type="radio" name="shipType"
                          checked={shipType===t.toLowerCase()}
                          onChange={() => setShipType(t.toLowerCase())}
                          style={{ accentColor:'#2EABFE' }} />
                        <span style={s.radioLbl}>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button style={{ ...s.viewBtn, background:'#008000', border:'0.5px solid #008000', color:'#FFFFFF', marginTop:12, display:'flex', alignItems:'center', gap:8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
                  </svg>
                  Bookkeeping Summary
                </button>
              </div>

              {/* Date range box */}
              <div style={s.datePicker}>
                <div style={s.dpRow}>
                  <label style={s.dpLbl}>Start Date Range:</label>
                  <input style={s.dpInput} value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="mmddyyyy" />
                  <label style={s.dpLbl}>End Date Range:</label>
                  <input style={s.dpInput} value={endDate}   onChange={e => setEndDate(e.target.value)}   placeholder="mmddyyyy" />
                </div>
                <button style={{ ...s.viewBtn, background:'#F59E0B', border:'0.5px solid #F59E0B', color:'#091925', display:'flex', alignItems:'center', gap:8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                  Sales Tax Summary Report
                </button>
              </div>
            </div>

            {/* Col 3 – Insurance cards */}
            <div style={{ padding:20 }}>
              {/* Purple card */}
              <div style={s.insCardPurple}>
                <div style={s.insHeaderPurple}>INSURANCE ORDERS — BY DATE</div>
                <div style={{ borderBottom:'0.5px solid #9569F7' }} />
                <div style={{ padding:14 }}>
                  <div style={s.dpRow}>
                    <label style={s.dpLbl}>Month:</label>
                    <select style={s.dpSel} value={insMonth} onChange={e => setInsMonth(e.target.value)}>
                      {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <label style={s.dpLbl}>Day:</label>
                    <select style={s.dpSel} value={insDay} onChange={e => setInsDay(e.target.value)}>
                      {DAYS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <label style={s.dpLbl}>Year:</label>
                    <select style={s.dpSel} value={insYear} onChange={e => setInsYear(e.target.value)}>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <label style={{ ...s.radioRow, marginTop:8 }}>
                    <input type="checkbox" checked={insOnly} onChange={e => setInsOnly(e.target.checked)}
                      style={{ accentColor:'#2EABFE', width:15, height:15 }} />
                    <span style={s.radioLbl}>Check for Insurance Orders ONLY</span>
                  </label>
                  <button style={{ ...s.viewBtn, background:'#9569F7', border:'0.5px solid #9569F7', color:'#FFFFFF', marginTop:12, fontSize:10 }}>
                    🖨 Packing Slips For Selected Day's Order
                  </button>
                </div>
              </div>

              {/* Amber card */}
              <div style={{ ...s.insCardAmber, marginTop:14 }}>
                <div style={s.insHeaderAmber}>INSURANCE ORDERS — BY DATE</div>
                <div style={{ borderBottom:'0.5px solid #F59E0B' }} />
                <div style={{ padding:14 }}>
                  <button style={{ ...s.viewBtn, background:'#F59E0B', border:'0.5px solid #F59E0B', color:'#091925', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    Inventory List
                  </button>
                  <button style={{ ...s.viewBtn, background:'#F59E0B', border:'0.5px solid #F59E0B', color:'#091925', display:'flex', alignItems:'center', gap:8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#091925" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Sales Tax Rate Update
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </AppLayout>
  );
};

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS (matches Figma + StudentDetail design system)
   #2EABFE  blue accent
   #091925  dark text
   #5B7384  medium gray
   #7FA8C4  light gray / muted
   #008000  green
   #9569F7  purple
   #F59E0B  amber
   #EF4444  red
───────────────────────────────────────────────────────────── */
const s = {
  // Layout
  topRow: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },

  // Page title
  pageTitle: {
    fontSize:32, fontWeight:700, color:'#091925',
    fontFamily:"'Poppins',sans-serif", margin:'0 0 6px 0', textTransform:'capitalize',
  },
  subLine:  { display:'flex', alignItems:'center', gap:12 },
  subText:  { fontSize:14, fontWeight:500, color:'#5B7384', fontFamily:"'Poppins',sans-serif" },
  secureBadge: {
    display:'inline-flex', alignItems:'center', gap:6,
    background:'rgba(0,128,0,0.1)', color:'#008000',
    border:'0.5px solid #008000', borderRadius:5,
    padding:'6px 14px', fontSize:13, fontWeight:700,
    fontFamily:"'Poppins',sans-serif",
  },

  // Outline buttons (header) — matches StudentDetail backBtn
  outlineBtn: {
    display:'inline-flex', alignItems:'center', gap:6,
    height:36, padding:'0 14px',
    background:'#FFFFFF', color:'#5B7384',
    border:'1px solid #e2e8f0', borderRadius:7,
    fontSize:12, fontWeight:500, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif",
  },

  // Card shell — matches StudentDetail exactly
  card: {
    background:'#FFFFFF', borderRadius:10,
    boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
    marginBottom:16, overflow:'hidden',
  },
  cardHeader: {
    display:'flex', alignItems:'center', gap:8,
    padding:'10px 16px', borderBottom:'0.5px solid #5B7384',
  },
  cardTitle: {
    fontSize:12, fontWeight:500, color:'#091925',
    fontFamily:"'Poppins',sans-serif", textTransform:'capitalize',
  },
  cardSubtitle: {
    fontSize:12, fontWeight:400, color:'#7FA8C4',
    fontFamily:"'Poppins',sans-serif", marginLeft:4,
  },

  // Lookup
  lookupGrid: { display:'grid', gridTemplateColumns:'1fr 380px', gap:24, padding:16 },
  lookupRow: {
    display:'grid', gridTemplateColumns:'240px 1fr',
    alignItems:'center', gap:12, marginBottom:12,
  },
  lookupLabel: {
    fontSize:11, fontWeight:500, color:'#5B7384',
    fontFamily:"'Poppins',sans-serif", textTransform:'uppercase',
  },
  lookupInput: {
    height:50, padding:'0 14px',
    borderRadius:5, border:'0.5px solid #7FA8C4',
    background:'rgba(127,168,196,0.1)',
    fontSize:11, fontWeight:500, color:'#091925',
    fontFamily:"'Poppins',sans-serif",
    outline:'none', width:'100%', boxSizing:'border-box',
  },
  lookupActions: { display:'flex', gap:8, marginTop:16 },
  errorMsg: { fontSize:12, color:'#EF4444', margin:'8px 0 0', fontWeight:500 },

  // Archive panel — matches StudentDetail infoCard sizing
  archiveBox: {
    border:'0.5px solid #008000', borderRadius:10,
    background:'rgba(0,128,0,0.1)', overflow:'hidden',
  },
  archiveHeader: {
    padding:'10px 16px',
    fontSize:11, fontWeight:500, color:'#008000',
    fontFamily:"'Poppins',sans-serif", textTransform:'uppercase',
  },
  archiveLookupRow: {
    display:'grid', gridTemplateColumns:'180px 1fr',
    alignItems:'center', gap:10, marginBottom:10,
  },
  archiveInput: {
    height:36, padding:'0 12px',
    borderRadius:5, border:'0.5px solid #7FA8C4',
    background:'#FFFFFF',
    fontSize:11, fontWeight:500, color:'#091925',
    fontFamily:"'Poppins',sans-serif",
    outline:'none', width:'100%', boxSizing:'border-box',
  },
  archiveMailBtn: {
    display:'inline-flex', alignItems:'center', gap:6,
    height:36, padding:'0 14px',
    background:'#FFFFFF', color:'#5B7384',
    border:'0.5px solid #7FA8C4', borderRadius:5,
    fontSize:11, fontWeight:500, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif",
  },

  // Action buttons — match StudentDetail backBtn / tab button sizing
  primaryBtn: {
    display:'inline-flex', alignItems:'center', gap:8,
    height:36, padding:'0 18px',
    background:'#2EABFE', color:'#091925',
    border:'none', borderRadius:7,
    fontSize:13, fontWeight:600, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif",
  },
  cancelBtn: {
    display:'inline-flex', alignItems:'center', gap:6,
    height:36, padding:'0 16px',
    background:'rgba(239,68,68,0.1)', color:'#EF4444',
    border:'0.5px solid #EF4444', borderRadius:7,
    fontSize:13, fontWeight:600, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif",
  },

  // State boxes
  stateBox: {
    margin:'0 20px 20px', padding:'28px 20px',
    border:'0.5px dashed #5B7384', borderRadius:5,
    textAlign:'center', color:'#7FA8C4',
    display:'flex', flexDirection:'column', alignItems:'center', gap:8,
  },
  stateTitle: { fontSize:14, fontWeight:600, color:'#5B7384', margin:0 },
  stateSub:   { fontSize:12, color:'#7FA8C4', margin:0 },
  stateText:  { fontSize:13, color:'#5B7384', margin:0 },

  // Results table
  resultsCount: {
    fontSize:12, fontWeight:600, color:'#5B7384',
    background:'rgba(127,168,196,0.1)', padding:'4px 12px', borderRadius:5,
    fontFamily:"'Poppins',sans-serif",
  },
  table:  { width:'100%', borderCollapse:'collapse' },
  thead:  { background:'rgba(127,168,196,0.1)' },
  th: {
    padding:'9px 16px', textAlign:'left',
    fontSize:10, fontWeight:500, color:'#5B7384',
    textTransform:'uppercase', letterSpacing:'0.04em',
    borderTop:'0.5px solid #7FA8C4', borderBottom:'0.5px solid #7FA8C4',
    fontFamily:"'Poppins',sans-serif", whiteSpace:'nowrap',
  },
  tr:  { borderBottom:'0.5px solid #5B7384' },
  td:  { padding:'9px 16px', verticalAlign:'middle' },
  orderNum: {
    fontSize:11, fontFamily:"'DM Mono',monospace",
    background:'rgba(127,168,196,0.1)', color:'#091925', padding:'2px 5px', borderRadius:4,
  },
  mono:        { fontSize:11, fontFamily:"'DM Mono',monospace", color:'#5B7384' },
  cellPrimary: { fontSize:12, fontWeight:500, color:'#091925', fontFamily:"'Poppins',sans-serif" },
  cellSub:     { fontSize:11, color:'#5B7384', marginTop:2, fontFamily:"'Poppins',sans-serif" },
  money:       { fontSize:12, fontFamily:"'DM Mono',monospace", color:'#5B7384' },

  // Reports section
  reportsGrid: { display:'grid', gridTemplateColumns:'200px 1fr 280px' },

  // Filter sidebar — matches StudentDetail infoLabel sizing
  filterLabel: {
    fontSize:10, fontWeight:700, color:'#7FA8C4',
    textTransform:'uppercase', letterSpacing:'0.07em',
    margin:'0 0 8px 0', fontFamily:"'Poppins',sans-serif",
  },
  radioRow:  { display:'flex', alignItems:'center', gap:6, marginBottom:5, cursor:'pointer' },
  radioLbl:  { fontSize:11, fontWeight:500, color:'#5B7384', fontFamily:"'Poppins',sans-serif" },

  // View buttons — matches StudentDetail backBtn height/font
  viewBtn: {
    display:'block', width:'100%', height:36, padding:'0 14px',
    background:'#2EABFE', color:'#091925',
    border:'none', borderRadius:7,
    fontSize:12, fontWeight:600, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif", textAlign:'left', marginBottom:8,
  },
  viewBtnOutline: {
    display:'block', width:'100%', height:36, padding:'0 14px',
    background:'#FFFFFF', color:'#5B7384',
    border:'1px solid #e2e8f0', borderRadius:7,
    fontSize:12, fontWeight:500, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif", textAlign:'left', marginBottom:8,
  },

  // Date picker sub-panels — matches StudentDetail infoCard inner padding
  datePicker: {
    background:'rgba(46,171,254,0.1)', border:'1px solid #e2e8f0',
    borderRadius:8, padding:12, marginBottom:10,
  },
  dpRow:   { display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:8 },
  dpLbl:   { fontSize:11, fontWeight:500, color:'#5B7384', fontFamily:"'Poppins',sans-serif" },
  dpSel: {
    height:28, padding:'0 6px', fontSize:11, fontWeight:500,
    border:'1px solid #e2e8f0', borderRadius:5,
    color:'#091925', background:'#FFFFFF', fontFamily:"'Poppins',sans-serif",
  },
  dpInput: {
    height:28, padding:'0 8px', fontSize:11, fontWeight:500,
    border:'1px solid #e2e8f0', borderRadius:5,
    color:'#091925', background:'#FFFFFF', fontFamily:"'Poppins',sans-serif", width:90,
  },

  // Insurance cards — borderRadius:10 to match StudentDetail cards
  insCardPurple: {
    border:'0.5px solid #9569F7', borderRadius:10,
    background:'rgba(149,105,247,0.1)', overflow:'hidden',
  },
  insHeaderPurple: {
    padding:'10px 16px', fontSize:11, fontWeight:500, color:'#9569F7',
    fontFamily:"'Poppins',sans-serif", textTransform:'uppercase', letterSpacing:'0.04em',
  },
  insCardAmber: {
    border:'0.5px solid #F59E0B', borderRadius:10,
    background:'rgba(245,158,11,0.1)', overflow:'hidden',
  },
  insHeaderAmber: {
    padding:'10px 16px', fontSize:11, fontWeight:500, color:'#F59E0B',
    fontFamily:"'Poppins',sans-serif", textTransform:'uppercase', letterSpacing:'0.04em',
  },
};

export default SecureOrders;
