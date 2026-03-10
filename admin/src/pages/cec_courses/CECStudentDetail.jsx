// src/pages/cec/CECStudentDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiFileText, FiAward, FiChevronDown,
  FiArrowLeft, FiUser, FiShield,
} from 'react-icons/fi';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import { getCECStudent } from '../../services/cecStudents';

// ── Reusable SVG Icon ─────────────────────────────────────────
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
  </svg>
);

// ── Info Row ──────────────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div style={sr.infoRow}>
    <span style={sr.infoLabel}>{label}</span>
    <span style={sr.infoValue}>{value || <span style={{ color: '#cbd5e1' }}>—</span>}</span>
  </div>
);

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    'Completed':   { bg: 'rgba(16,185,129,0.1)',  color: '#059669', border: 'transparent' },
    'Passed':      { bg: '#E7F8F2',               color: '#10B981', border: 'transparent' },
    'In Progress': { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', border: 'rgba(59,130,246,0.3)' },
    'Expired':     { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
  };
  const c = cfg[status] || { bg: 'rgba(100,116,139,0.1)', color: '#475569', border: 'rgba(100,116,139,0.3)' };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: c.bg, color: c.color, border: `0.5px solid ${c.border}` }}>
      {status || 'Unknown'}
    </span>
  );
};

// ── Docs Dropdown ─────────────────────────────────────────────
const DocsDropdown = ({ onTranscript, onCertificate }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={sr.docsBtn}
      >
        <FiFileText size={12} />
        Docs
        <FiChevronDown size={11} />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          />
          <div style={sr.docsMenu}>
            <button
              onClick={() => { setOpen(false); onTranscript(); }}
              style={sr.docsMenuItem}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <FiFileText size={13} color="#2EABFE" />
              Transcript
            </button>
            <button
              onClick={() => { setOpen(false); onCertificate(); }}
              style={{ ...sr.docsMenuItem, borderBottom: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <FiAward size={13} color="#10B981" />
              Certificate
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const CECStudentDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [student,  setStudent]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab,      setTab]      = useState('courses');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getCECStudent(id);
      if (res.ok) setStudent(res.data);
      else setNotFound(true);
      setLoading(false);
    })();
  }, [id]);

  // ── Open Transcript ────────────────────────────────────────
  const openTranscript = (courseIndex) => {
    const payload = {
      student: {
        studentId:      student.studentId,
        name:           student.name,
        mailingAddress: student.mailingAddress,
        workPhone:      student.workPhone,
        mobilePhone:    student.mobilePhone,
        licenseNumber:  student.licenseNumber,
      },
      courses: student.courses,
    };
    localStorage.setItem(`cec_transcript_${student.studentId}`, JSON.stringify(payload));
    window.open(`/admin/cec-transcript/${student.studentId}/${courseIndex}`, '_blank');
  };

  // ── Open Certificate ───────────────────────────────────────
  const openCertificate = (courseIndex) => {
    const payload = {
      student: {
        studentId:      student.studentId,
        name:           student.name,
        mailingAddress: student.mailingAddress,
        workPhone:      student.workPhone,
        mobilePhone:    student.mobilePhone,
        licenseNumber:  student.licenseNumber,
        cfpNumber:      student.cfpNumber,
        npnNumber:      student.npnNumber,
      },
      courses: student.courses,
    };
    localStorage.setItem(`cec_transcript_${student.studentId}`, JSON.stringify(payload));
    window.open(`/admin/cec-certificate/${student.studentId}/${courseIndex}`, '_blank');
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <AppLayout>
      <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <p style={{ fontSize: 14 }}>Loading CEC student...</p>
      </div>
    </AppLayout>
  );

  // ── Not Found ──────────────────────────────────────────────
  if (notFound) return (
    <AppLayout>
      <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>CEC Student not found</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>No student with ID "{id}" exists in the CEC database.</p>
        <button onClick={() => navigate('/admin/cec-courses/online-exam/backoffice')} style={sr.backBtn}>
          Back to CEC Students
        </button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div style={{ padding: '1.5rem 2rem' }}>

        {/* Breadcrumb */}
        <Breadcrumb crumbs={[
          { label: 'Dashboard',        to: '/admin' },
          { label: 'C.E.C. Courses',  to: '/admin/cec-courses' },
          { label: 'BackOffice',       to: '/admin/cec-courses/online-exam/backoffice' },
          { label: student.name || id },
        ]} />

        {/* Back link */}
        <div style={sr.topRow}>
          <button onClick={() => navigate('/admin/cec-courses/online-exam/backoffice')} style={sr.backLink}>
            <FiArrowLeft size={14} />
            Back to CEC Students
          </button>
        </div>

        {/* ── Dark Header Card ── */}
        <div style={sr.headerCard}>
          <div style={sr.headerInner}>
            <div style={sr.headerLeft}>
              <div style={sr.bigAvatar}>
                {(student.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={sr.headerTags}>
                  <span style={sr.idBadge}>ID: {student.studentId}</span>
                  <span style={sr.cecBadge}>CEC</span>
                  {student.state && (
                    <span style={sr.stateBadge}>
                      <svg width={10} height={12} viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {student.state}
                    </span>
                  )}
                  {student.companyName && (
                    <span style={sr.companyBadge}>
                      <svg width={11} height={12} viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}>
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      {student.companyName}
                    </span>
                  )}
                </div>
                <h1 style={sr.studentName}>{student.name}</h1>
              </div>
            </div>
            {student.firstOrderDate && (
              <div style={sr.headerRight}>
                <p style={sr.firstOrderLabel}>First Order</p>
                <p style={sr.firstOrderDate}>{student.firstOrderDate}</p>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div style={sr.statsRow}>
            <span style={sr.statsPillBlue}>
              {student.courses?.length || 0} courses
            </span>
            <span style={sr.statsPillGray}>
              {student.orders?.length || 0} orders
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div style={sr.infoGrid}>

          {/* Contact Info */}
          <div style={sr.infoCard}>
            <div style={sr.infoCardHeader}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Contact Information
            </div>
            <div style={sr.infoCardBody}>
              <InfoRow label="Email"        value={student.email} />
              <InfoRow label="Work Phone"   value={student.workPhone} />
              <InfoRow label="Mobile Phone" value={student.mobilePhone} />
              <InfoRow label="Address"      value={student.mailingAddress} />
            </div>
          </div>

          {/* License & ID Numbers */}
          <div style={sr.infoCard}>
            <div style={sr.infoCardHeader}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              License &amp; ID Numbers
            </div>
            <div style={sr.infoCardBody}>
              <InfoRow label="License Number" value={student.licenseNumber} />
              <InfoRow label="DRE Number"     value={student.dreNumber} />
              <InfoRow label="CFP Number"     value={student.cfpNumber} />
              <InfoRow label="NPN Number"     value={student.npnNumber} />
            </div>
          </div>

        </div>

        {/* Tabs */}
        <div style={sr.tabsCard}>
          <div style={sr.tabsHeader}>
            {[
              { key: 'courses', label: 'Courses', count: student.courses?.length || 0 },
              { key: 'orders',  label: 'Orders',  count: student.orders?.length  || 0 },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ ...sr.tabBtn, ...(tab === t.key ? sr.tabBtnActive : {}) }}>
                {t.label}
                <span style={{
                  ...sr.tabCount,
                  ...(tab === t.key ? sr.tabCountActive : sr.tabCountInactive),
                }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Courses Tab ── */}
          {tab === 'courses' && (
            !student.courses?.length ? (
              <div style={sr.emptyTab}>No courses on record for this CEC student.</div>
            ) : (
              <table style={sr.table}>
                <thead>
                  <tr style={sr.thead}>
                    <th style={sr.th}>Course Title</th>
                    <th style={sr.th}>Exam Title</th>
                    <th style={sr.th}>Registered</th>
                    <th style={sr.th}>Expires</th>
                    <th style={sr.th}>Completed</th>
                    <th style={sr.th}>Score</th>
                    <th style={sr.th}>Status</th>
                    <th style={sr.th}>Docs</th>
                  </tr>
                </thead>
                <tbody>
                  {student.courses.map((c, i) => (
                    <tr key={i} style={sr.tr}>
                      <td style={sr.td}><span style={sr.courseTitle}>{c.courseTitle || '—'}</span></td>
                      <td style={sr.td}><span style={{ fontSize: 12, color: '#091925' }}>{c.examTitle || '—'}</span></td>
                      <td style={sr.td}><span style={sr.dateCell}>{c.registrationDate || '—'}</span></td>
                      <td style={sr.td}><span style={sr.dateCell}>{c.expirationDate || '—'}</span></td>
                      <td style={sr.td}>
                        {/* completionDate field actually stores score; quizStatus stores real completion date */}
                        <span style={sr.dateCell}>{c.quizStatus || '—'}</span>
                      </td>
                      <td style={sr.td}>
                        {c.completionDate && c.completionDate.includes('%')
                          ? <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', fontFamily: "'DM Mono',monospace" }}>{c.completionDate}</span>
                          : <span style={{ fontSize: 11, color: '#cbd5e1' }}>—</span>
                        }
                      </td>
                      <td style={sr.td}><StatusBadge status={c.status} /></td>
                      <td style={sr.td}>
                        {(c.status === 'Completed' || c.status === 'Passed') ? (
                          <DocsDropdown
                            onTranscript={() => openTranscript(i)}
                            onCertificate={() => openCertificate(i)}
                          />
                        ) : (
                          <span style={{ fontSize: 11, color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* ── Orders Tab ── */}
          {tab === 'orders' && (
            !student.orders?.length ? (
              <div style={sr.emptyTab}>No orders on record for this CEC student.</div>
            ) : (
              <table style={sr.table}>
                <thead>
                  <tr style={sr.thead}>
                    <th style={sr.th}>Order #</th>
                    <th style={sr.th}>Item #</th>
                    <th style={sr.th}>Date</th>
                    <th style={sr.th}>Description</th>
                    <th style={sr.th}>Price</th>
                    <th style={sr.th}>Discount</th>
                    <th style={sr.th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {student.orders.map((o, i) => (
                    <tr key={i} style={sr.tr}>
                      <td style={sr.td}><span style={sr.orderNum}>{o.orderNumber || '—'}</span></td>
                      <td style={sr.td}><span style={sr.orderNum}>{o.itemNumber || '—'}</span></td>
                      <td style={sr.td}><span style={sr.dateCell}>{o.date || '—'}</span></td>
                      <td style={sr.td}><span style={{ fontSize: 12, color: '#374151' }}>{o.description || '—'}</span></td>
                      <td style={sr.td}><span style={sr.moneyCell}>{o.price || '—'}</span></td>
                      <td style={sr.td}><span style={{ ...sr.moneyCell, color: '#ef4444' }}>{o.discount || '—'}</span></td>
                      <td style={sr.td}><span style={{ ...sr.moneyCell, fontWeight: 700, color: '#059669' }}>{o.total || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

        </div>
      </div>
    </AppLayout>
  );
};

// ── Styles ────────────────────────────────────────────────────
const sr = {
  topRow: { marginBottom: 14 },
  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, color: '#3b82f6', fontFamily: "'Poppins', sans-serif",
    fontWeight: 500, padding: 0,
  },
  backBtn: {
    marginTop: 16, padding: '8px 16px', borderRadius: 7,
    background: '#2563eb', color: '#fff', border: 'none',
    fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
  },

  // ── Dark Header Card ──
  headerCard: {
    background: '#091925',
    backgroundImage: 'linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%)',
    borderRadius: 10,
    padding: '14px 20px 12px',
    marginBottom: 12,
    position: 'relative',
  },
  headerInner: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  bigAvatar: {
    width: 42, height: 42, borderRadius: '50%',
    background: 'linear-gradient(135deg,#2EABFE,#1a7fc4)',
    color: '#091925', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 700, flexShrink: 0,
  },
  studentName: {
    fontSize: 22, fontWeight: 700, color: '#FFFFFF',
    fontFamily: "'Poppins', sans-serif",
    margin: '3px 0 0',
    textTransform: 'capitalize',
    letterSpacing: '-0.2px',
  },
  headerTags: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  idBadge: {
    fontSize: 12, fontFamily: "'Poppins', monospace", fontWeight: 700,
    color: '#2EABFE', padding: 0,
  },
  cecBadge: {
    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
    background: 'rgba(16,185,129,0.2)', color: '#10B981',
    border: '1px solid rgba(16,185,129,0.3)',
    fontFamily: "'Poppins', sans-serif",
  },
  stateBadge: {
    fontSize: 12, fontWeight: 700, color: '#2EABFE',
    display: 'inline-flex', alignItems: 'center',
  },
  companyBadge: {
    fontSize: 12, fontWeight: 700, color: '#2EABFE',
    display: 'inline-flex', alignItems: 'center',
  },
  statsRow: {
    display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
  },
  statsPillBlue: {
    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
    background: '#2EABFE', color: '#091925',
    fontFamily: "'Poppins', sans-serif",
  },
  statsPillGray: {
    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
    background: 'rgba(91,115,132,0.25)', color: '#7FA8C4',
    fontFamily: "'Poppins', sans-serif",
  },
  headerRight: { textAlign: 'right' },
  firstOrderLabel: {
    fontSize: 11, color: '#FFFFFF', textTransform: 'capitalize',
    letterSpacing: '0.02em', fontFamily: "'Poppins', sans-serif", fontWeight: 400,
  },
  firstOrderDate: {
    fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginTop: 2,
    fontFamily: "'Poppins', sans-serif",
  },

  // ── Info Cards ──
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  infoCard: { background: '#FFFFFF', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
  infoCardHeader: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '10px 16px',
    borderBottom: '0.5px solid #5B7384',
    fontSize: 12, fontWeight: 500, color: '#091925',
    textTransform: 'capitalize', fontFamily: "'Poppins', sans-serif",
  },
  infoCardBody: { padding: 0 },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 16px', borderBottom: '0.5px solid #5B7384', gap: 16,
  },
  infoLabel: { fontSize: 11, color: '#5B7384', fontWeight: 500, flexShrink: 0, fontFamily: "'Poppins', sans-serif" },
  infoValue: { fontSize: 11, color: '#091925', textAlign: 'right', wordBreak: 'break-word', fontFamily: "'Poppins', sans-serif", fontWeight: 500 },

  // ── Tabs ──
  tabsCard: { background: '#FFFFFF', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
  tabsHeader: { display: 'flex', borderBottom: '0.5px solid #5B7384', padding: '0 6px' },
  tabBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '10px 13px', border: 'none', background: 'none',
    fontSize: 13, fontWeight: 500, color: '#5B7384',
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
    borderBottom: '3px solid transparent', marginBottom: -1, transition: 'all 0.15s',
    textTransform: 'capitalize',
  },
  tabBtnActive: { color: '#2EABFE', fontWeight: 500, borderBottom: '3px solid #2EABFE' },
  tabCount: {
    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
    fontFamily: "'Poppins', sans-serif",
  },
  tabCountActive: { background: '#2EABFE', color: '#091925' },
  tabCountInactive: { background: 'rgba(91,115,132,0.15)', color: '#5B7384' },

  emptyTab: { padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 },

  // ── Table ──
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
  courseTitle: { fontSize: 12, fontWeight: 500, color: '#091925', fontFamily: "'Poppins', sans-serif" },
  dateCell: { fontSize: 12, color: '#091925', fontFamily: "'Poppins', sans-serif", fontWeight: 500 },
  orderNum: {
    fontSize: 11, fontFamily: "'DM Mono', monospace",
    background: '#f1f5f9', color: '#475569', padding: '2px 5px', borderRadius: 4,
  },
  moneyCell: { fontSize: 12, fontFamily: "'DM Mono', monospace", color: '#374151' },

  // ── DocsDropdown ──
  docsBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '4px 10px', fontSize: 11, fontWeight: 600,
    background: '#2EABFE', color: '#091925',
    border: 'none', borderRadius: 5, cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  docsMenu: {
    position: 'absolute', top: '100%', left: 0, zIndex: 20,
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 7, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    minWidth: 148, marginTop: 4, overflow: 'hidden',
  },
  docsMenuItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '9px 14px', border: 'none',
    background: 'none', textAlign: 'left', cursor: 'pointer',
    fontSize: 12, color: '#0f172a',
    fontFamily: "'Poppins', sans-serif",
    borderBottom: '1px solid #f1f5f9',
  },
};

export default CECStudentDetail;
