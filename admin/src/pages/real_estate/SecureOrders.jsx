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

const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS      = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS     = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i));
const DEPTS     = ['Any Dept.','CE','DMV','DollarCE','EPC','LCR','LicSol','LPC','RELS','Tab - R.E.'];
const WHERE_HEAR= ['Any Dept.','Referral by Friend/Colleague','E-Mail','Postcard','Past Customer','DRE Website','Old Tabloid','Yellow Pages','Search Engine','Telemarketing Call','Customer Callback','Other'];

const SecureOrders = () => {
  const navigate = useNavigate();
  const today    = new Date();

  const [lookup,   setLookup]   = useState({ orderNumber:'', email:'', lastName:'', companyName:'', upsTrk:'', creditCard:'', itemNumber:'' });
  const [archive,  setArchive]  = useState({ trackingNumber:'', lastName:'' });
  const [results,  setResults]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

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

  const handleReset = () => { setLookup({ orderNumber:'', email:'', lastName:'', companyName:'', upsTrk:'', creditCard:'', itemNumber:'' }); setResults(null); setError(''); };

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

        {/* Header */}
        <div style={s.topRow}>
          <div>
            <h1 style={s.pageTitle}>Secure Orders</h1>
            <div style={s.subLine}>
              <span style={s.subText}>OnlineCourseDelivery.com Order Status Menu</span>
              <span style={s.secureBadge}><Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={11} /> Secure Connection</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => navigate('/admin/real-estate')} style={s.outlineBtn}>← Back To Real Estate</button>
            <button style={s.outlineBtn}><Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={12} /> Update Password</button>
          </div>
        </div>

        {/* Order Lookup */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" size={14} />
            Order Lookup
            <span style={s.cardSubtitle}>Search for orders by any field below</span>
          </div>

          <div style={s.lookupGrid}>
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
                  <input style={s.lookupInput} placeholder={ph} value={lookup[key]}
                    onChange={e => setLookup(p => ({ ...p, [key]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleLookup()} />
                </div>
              ))}
              {error && <p style={s.errorMsg}>⚠ {error}</p>}
              <div style={s.lookupActions}>
                <button onClick={handleLookup} disabled={loading} style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }}>
                  <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" size={13} />
                  {loading ? 'Searching...' : 'Lookup Order(s)'}
                </button>
                <button onClick={handleReset} style={s.cancelBtn}>✕ Cancel</button>
              </div>
            </div>

            <div style={s.archiveBox}>
              <div style={s.archiveHeader}>RESEARCH ARCHIVES OF ANTIQUE DOS ORDER ENTRY SYSTEM</div>
              <div style={{ padding:14 }}>
                {[
                  { label:'Lookup Student Tracking #:', key:'trackingNumber', ph:'Tracking #' },
                  { label:'Lookup Student Last Name:',  key:'lastName',       ph:'Last Name'  },
                ].map(({ label, key, ph }) => (
                  <div key={key} style={s.lookupRow}>
                    <label style={s.lookupLabel}>{label}</label>
                    <input style={s.lookupInput} placeholder={ph} value={archive[key]}
                      onChange={e => setArchive(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <button style={{ ...s.outlineBtn, fontSize:11 }}>✉ Lookup R.E. Mail Order(s)</button>
                  <button onClick={() => setArchive({ trackingNumber:'', lastName:'' })} style={{ ...s.cancelBtn, fontSize:11 }}>✕ Cancel</button>
                </div>
                <p style={{ fontSize:11, color:'#94a3b8', marginTop:10 }}>Legacy DOS archive integration pending.</p>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading && <div style={s.stateBox}><p style={s.stateText}>🔍 Searching orders...</p></div>}

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
                      <th style={s.th}>Order #</th>
                      <th style={s.th}>Date</th>
                      <th style={s.th}>Student</th>
                      <th style={s.th}>Item #</th>
                      <th style={s.th}>Description</th>
                      <th style={s.th}>Price</th>
                      <th style={s.th}>Discount</th>
                      <th style={s.th}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.orders.map((o, i) => (
                      <tr key={i} style={s.tr}>
                        <td style={s.td}><span style={s.orderNum}>{o.orderNumber || '—'}</span></td>
                        <td style={s.td}><span style={s.mono}>{o.date || '—'}</span></td>
                        <td style={s.td}>
                          <span style={s.studentName}>{o.student?.name || o.studentName || '—'}</span>
                          {o.student?.email && <div style={s.studentEmail}>{o.student.email}</div>}
                        </td>
                        <td style={s.td}><span style={s.mono}>{o.itemNumber || '—'}</span></td>
                        <td style={s.td}><span style={s.desc}>{o.description || '—'}</span></td>
                        <td style={s.td}><span style={s.money}>{o.price || '—'}</span></td>
                        <td style={s.td}><span style={{ ...s.money, color: o.discount && o.discount !== '0.00' ? '#ef4444' : '#94a3b8' }}>{o.discount || '—'}</span></td>
                        <td style={s.td}><span style={{ ...s.money, fontWeight:700, color:'#059669' }}>{o.total || '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Order Views, Filters & Reports */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <Icon d="M3 3h18v18H3z M3 9h18 M9 21V9" size={14} />
            Order Views, Filters &amp; Reports
            <span style={s.cardSubtitle}>Filter by department, view by date, or generate reports</span>
          </div>

          <div style={s.reportsGrid}>
            {/* Dept filter */}
            <div>
              <p style={s.filterLabel}>DEPT. FILTER</p>
              {DEPTS.map(d => (
                <label key={d} style={s.radioRow}>
                  <input type="radio" name="dept" checked={dept===d} onChange={() => setDept(d)} style={{ accentColor:'#2563eb' }} />
                  <span style={s.radioLbl}>{d}</span>
                </label>
              ))}
              <p style={{ ...s.filterLabel, marginTop:14 }}>WHERE HEAR @ FILTER</p>
              {WHERE_HEAR.map(w => (
                <label key={w} style={s.radioRow}>
                  <input type="radio" name="whereHear" checked={whereHear===w} onChange={() => setWhereHear(w)} style={{ accentColor:'#2563eb' }} />
                  <span style={s.radioLbl}>{w}</span>
                </label>
              ))}
            </div>

            {/* View buttons + date picker */}
            <div>
              <button onClick={() => handleViewByDate('today')} style={s.viewBtn}>📋 View Today's Orders</button>
              <button onClick={() => handleViewByDate('month')} style={{ ...s.viewBtn, background:'#1d4ed8' }}>📅 View This Month's Orders</button>
              <button style={s.viewBtnOutline}>☰ View All Orders in List Format</button>

              <div style={s.datePicker}>
                <div style={s.dpRow}>
                  <label style={s.dpLbl}>Month:</label>
                  <select style={s.dpSel} value={selMonth} onChange={e => setSelMonth(e.target.value)}>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                  <label style={s.dpLbl}>Day:</label>
                  <select style={s.dpSel} value={selDay} onChange={e => setSelDay(e.target.value)}>{DAYS.map(d => <option key={d}>{d}</option>)}</select>
                  <label style={s.dpLbl}>Year:</label>
                  <select style={s.dpSel} value={selYear} onChange={e => setSelYear(e.target.value)}>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                </div>
                <button onClick={() => handleViewByDate('selected')} style={s.viewBtn}>📆 View Selected Day's Orders</button>
                <label style={{ ...s.radioRow, marginTop:8 }}>
                  <input type="checkbox" checked={showMonth} onChange={e => setShowMonth(e.target.checked)} style={{ accentColor:'#2563eb' }} />
                  <span style={s.radioLbl}>Show Entire Month Selected</span>
                </label>
                <div style={{ display:'flex', gap:16, marginTop:10 }}>
                  <div>{['Insurance','Real Estate','Both'].map(t => (<label key={t} style={s.radioRow}><input type="radio" name="orderType" checked={orderType===t.toLowerCase().replace(' ','')} onChange={() => setOrderType(t.toLowerCase().replace(' ',''))} style={{ accentColor:'#2563eb' }} /><span style={s.radioLbl}>{t}</span></label>))}</div>
                  <div>{['Online','Shipped','Both'].map(t => (<label key={t} style={s.radioRow}><input type="radio" name="shipType" checked={shipType===t.toLowerCase()} onChange={() => setShipType(t.toLowerCase())} style={{ accentColor:'#2563eb' }} /><span style={s.radioLbl}>{t}</span></label>))}</div>
                </div>
                <button style={{ ...s.viewBtn, background:'#059669', marginTop:10 }}>📊 Bookkeeping Summary</button>
              </div>

              <div style={s.datePicker}>
                <div style={s.dpRow}>
                  <label style={s.dpLbl}>Start Date Range:</label>
                  <input style={s.dpInput} value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="mmddyyyy" />
                  <label style={s.dpLbl}>End Date Range:</label>
                  <input style={s.dpInput} value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="mmddyyyy" />
                </div>
                <button style={{ ...s.viewBtn, background:'#d97706' }}>📄 Sales Tax Summary Report</button>
              </div>
            </div>

            {/* Insurance */}
            <div>
              <div style={s.insCard}>
                <div style={s.insHeader}>INSURANCE ORDERS — BY DATE</div>
                <div style={{ padding:14 }}>
                  <div style={s.dpRow}>
                    <label style={s.dpLbl}>Month:</label>
                    <select style={s.dpSel} value={insMonth} onChange={e => setInsMonth(e.target.value)}>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                    <label style={s.dpLbl}>Day:</label>
                    <select style={s.dpSel} value={insDay} onChange={e => setInsDay(e.target.value)}>{DAYS.map(d => <option key={d}>{d}</option>)}</select>
                    <label style={s.dpLbl}>Year:</label>
                    <select style={s.dpSel} value={insYear} onChange={e => setInsYear(e.target.value)}>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                  </div>
                  <label style={{ ...s.radioRow, marginTop:8 }}>
                    <input type="checkbox" checked={insOnly} onChange={e => setInsOnly(e.target.checked)} style={{ accentColor:'#2563eb' }} />
                    <span style={s.radioLbl}>Check for Insurance Orders ONLY</span>
                  </label>
                  <button style={{ ...s.viewBtn, background:'#7c3aed', marginTop:10, fontSize:11 }}>🖨 Packing Slips For Selected Day's Order</button>
                </div>
              </div>
              <div style={{ ...s.insCard, marginTop:12 }}>
                <div style={s.insHeader}>INSURANCE ORDERS — BY DATE</div>
                <div style={{ padding:14 }}>
                  <button style={{ ...s.viewBtn, background:'#d97706', marginBottom:8, fontSize:11 }}>📦 Inventory List</button>
                  <button style={{ ...s.viewBtn, background:'#d97706', fontSize:11 }}>⭐ Sales Tax Rate Update</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

const s = {
  topRow:       { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  pageTitle:    { fontSize:22, fontWeight:700, color:'#0f172a', fontFamily:"'Poppins',sans-serif", margin:'0 0 6px 0' },
  subLine:      { display:'flex', alignItems:'center', gap:10 },
  subText:      { fontSize:12, color:'#64748b' },
  secureBadge:  { display:'inline-flex', alignItems:'center', gap:5, background:'rgba(16,185,129,0.1)', color:'#059669', border:'1px solid rgba(16,185,129,0.3)', borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:600 },
  card:         { background:'#fff', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:16, overflow:'hidden' },
  cardHeader:   { display:'flex', alignItems:'center', gap:8, padding:'13px 20px', borderBottom:'1px solid #f1f5f9', fontSize:13, fontWeight:700, color:'#0f172a', fontFamily:"'Poppins',sans-serif" },
  cardSubtitle: { fontSize:11, color:'#94a3b8', fontWeight:400, marginLeft:4 },
  lookupGrid:   { display:'grid', gridTemplateColumns:'1fr 360px', gap:20, padding:20 },
  lookupRow:    { display:'grid', gridTemplateColumns:'210px 1fr', alignItems:'center', gap:10, marginBottom:10 },
  lookupLabel:  { fontSize:12, fontWeight:600, color:'#374151', fontFamily:"'Poppins',sans-serif" },
  lookupInput:  { padding:'7px 11px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:12, color:'#0f172a', fontFamily:"'Poppins',sans-serif", outline:'none', width:'100%', boxSizing:'border-box', background:'#fafafa' },
  lookupActions:{ display:'flex', gap:10, marginTop:16 },
  errorMsg:     { fontSize:12, color:'#dc2626', margin:'8px 0 0', fontWeight:500 },
  archiveBox:   { border:'1px solid #d1fae5', borderRadius:8, overflow:'hidden' },
  archiveHeader:{ background:'#ecfdf5', padding:'10px 14px', fontSize:11, fontWeight:700, color:'#059669', letterSpacing:'0.04em' },
  primaryBtn:   { display:'inline-flex', alignItems:'center', gap:6, padding:'8px 18px', background:'#2563eb', color:'#fff', border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif" },
  cancelBtn:    { padding:'8px 16px', background:'#fff', color:'#ef4444', border:'1px solid #fca5a5', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif" },
  outlineBtn:   { display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#fff', color:'#374151', border:'1px solid #e2e8f0', borderRadius:7, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:"'Poppins',sans-serif" },
  stateBox:     { margin:'0 20px 20px', padding:'28px 20px', border:'1px dashed #e2e8f0', borderRadius:8, textAlign:'center', color:'#94a3b8', display:'flex', flexDirection:'column', alignItems:'center', gap:8 },
  stateTitle:   { fontSize:14, fontWeight:600, color:'#475569', margin:0 },
  stateSub:     { fontSize:12, color:'#94a3b8', margin:0 },
  stateText:    { fontSize:13, color:'#64748b', margin:0 },
  resultsCount: { fontSize:12, fontWeight:600, color:'#374151', background:'#f1f5f9', padding:'4px 10px', borderRadius:6 },
  table:        { width:'100%', borderCollapse:'collapse' },
  thead:        { background:'#f8fafc' },
  th:           { padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'1px solid #e2e8f0', fontFamily:"'Poppins',sans-serif", whiteSpace:'nowrap' },
  tr:           { borderBottom:'1px solid #f8fafc' },
  td:           { padding:'10px 14px', verticalAlign:'middle' },
  orderNum:     { fontSize:11, fontFamily:"'DM Mono',monospace", background:'#f1f5f9', color:'#475569', padding:'2px 6px', borderRadius:4 },
  mono:         { fontSize:11, fontFamily:"'DM Mono',monospace", color:'#64748b' },
  studentName:  { fontSize:12, fontWeight:600, color:'#0f172a' },
  studentEmail: { fontSize:11, color:'#64748b', marginTop:2 },
  desc:         { fontSize:12, color:'#374151' },
  money:        { fontSize:12, fontFamily:"'DM Mono',monospace", color:'#374151' },
  reportsGrid:  { display:'grid', gridTemplateColumns:'180px 1fr 240px', gap:20, padding:20 },
  filterLabel:  { fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 8px 0' },
  radioRow:     { display:'flex', alignItems:'center', gap:6, marginBottom:5, cursor:'pointer' },
  radioLbl:     { fontSize:12, color:'#374151' },
  viewBtn:      { display:'block', width:'100%', padding:'9px 14px', background:'#2563eb', color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif", textAlign:'left', marginBottom:8 },
  viewBtnOutline:{ display:'block', width:'100%', padding:'9px 14px', background:'#fff', color:'#374151', border:'1px solid #e2e8f0', borderRadius:7, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:"'Poppins',sans-serif", textAlign:'left', marginBottom:8 },
  datePicker:   { background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:14, marginBottom:12 },
  dpRow:        { display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:10 },
  dpLbl:        { fontSize:11, color:'#64748b', fontWeight:500 },
  dpSel:        { padding:'4px 6px', fontSize:12, border:'1px solid #e2e8f0', borderRadius:5, color:'#0f172a', background:'#fff', fontFamily:"'Poppins',sans-serif" },
  dpInput:      { padding:'4px 8px', fontSize:12, border:'1px solid #e2e8f0', borderRadius:5, color:'#0f172a', background:'#fff', fontFamily:"'Poppins',sans-serif", width:90 },
  insCard:      { border:'1px solid #fde68a', borderRadius:8, overflow:'hidden' },
  insHeader:    { background:'#fef3c7', padding:'9px 14px', fontSize:11, fontWeight:700, color:'#92400e', letterSpacing:'0.04em' },
};

export default SecureOrders;