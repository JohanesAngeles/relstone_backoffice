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
    'Completed':   { bg: 'rgba(16,185,129,0.1)',  color: '#059669', border: 'rgba(16,185,129,0.3)' },
    'Passed':      { bg: 'rgba(16,185,129,0.1)',  color: '#059669', border: 'rgba(16,185,129,0.3)' },
    'In Progress': { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', border: 'rgba(59,130,246,0.3)' },
    'Expired':     { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
  };
  const c = cfg[status] || { bg: 'rgba(100,116,139,0.1)', color: '#475569', border: 'rgba(100,116,139,0.3)' };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {status || 'Unknown'}
    </span>
  );
};

// ── Docs Dropdown ─────────────────────────────────────────────
// Replaces the emoji <select> with a proper icon-driven dropdown
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
          {/* Backdrop — closes dropdown on outside click */}
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
              <FiFileText size={13} color="#2563eb" />
              Transcript
            </button>
            <button
              onClick={() => { setOpen(false); onCertificate(); }}
              style={{ ...sr.docsMenuItem, borderBottom: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <FiAward size={13} color="#059669" />
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

        {/* Header Card */}
        <div style={sr.headerCard}>
          <div style={sr.headerLeft}>
            <div style={sr.bigAvatar}>
              {(student.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <h1 style={sr.studentName}>{student.name}</h1>
              {student.companyName && <p style={sr.companyName}>{student.companyName}</p>}
              <div style={sr.headerTags}>
                <span style={sr.idBadge}>ID: {student.studentId}</span>
                <span style={{ ...sr.stateBadge, background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>
                  CEC
                </span>
                {student.state && <span style={sr.stateBadge}>{student.state}</span>}
                <span style={{ ...sr.statsBadge, background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {student.courses?.length || 0} courses
                </span>
                <span style={{ ...sr.statsBadge, background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {student.orders?.length || 0} orders
                </span>
              </div>
            </div>
          </div>
          {student.firstOrderDate && (
            <div style={sr.headerRight}>
              <p style={sr.firstOrderLabel}>First Order</p>
              <p style={sr.firstOrderDate}>{student.firstOrderDate}</p>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div style={sr.infoGrid}>

          {/* Contact Info */}
          <div style={sr.infoCard}>
            <div style={sr.infoCardHeader}>
              <FiUser size={13} />
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
              <FiShield size={13} />
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
              { key: 'courses', label: `Courses (${student.courses?.length || 0})` },
              { key: 'orders',  label: `Orders (${student.orders?.length || 0})` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ ...sr.tabBtn, ...(tab === t.key ? sr.tabBtnActive : {}) }}>
                {t.label}
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
                      <td style={sr.td}><span style={{ fontSize: 12, color: '#64748b' }}>{c.examTitle || '—'}</span></td>
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
  headerCard: {
    background: '#fff', borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    padding: '20px 24px', marginBottom: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  bigAvatar: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 700, flexShrink: 0,
  },
  studentName: { fontSize: 18, fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins',sans-serif" },
  companyName: { fontSize: 12, color: '#64748b', marginTop: 2 },
  headerTags: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  idBadge: { fontSize: 10, fontFamily: "'DM Mono',monospace", background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: 4 },
  stateBadge: { fontSize: 10, fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: '#2563eb', padding: '2px 7px', borderRadius: 10, border: '1px solid rgba(59,130,246,0.2)' },
  statsBadge: { fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10 },
  headerRight: { textAlign: 'right' },
  firstOrderLabel: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  firstOrderDate: { fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 3, fontFamily: "'DM Mono',monospace" },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  infoCard: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
  infoCardHeader: { display: 'flex', alignItems: 'center', gap: 7, padding: '11px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Poppins',sans-serif" },
  infoCardBody: { padding: '4px 0' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 16px', borderBottom: '1px solid #f8fafc', gap: 16 },
  infoLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 500, flexShrink: 0 },
  infoValue: { fontSize: 12, color: '#0f172a', textAlign: 'right', wordBreak: 'break-word' },
  tabsCard: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
  tabsHeader: { display: 'flex', borderBottom: '1px solid #e2e8f0' },
  tabBtn: { padding: '11px 18px', border: 'none', background: 'none', fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", borderBottom: '2px solid transparent', marginBottom: -1, transition: 'all 0.15s' },
  tabBtnActive: { color: '#2563eb', fontWeight: 600, borderBottom: '2px solid #2563eb' },
  emptyTab: { padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', fontFamily: "'Poppins',sans-serif", whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '10px 16px', verticalAlign: 'middle' },
  courseTitle: { fontSize: 12, fontWeight: 500, color: '#0f172a' },
  dateCell: { fontSize: 11, color: '#64748b', fontFamily: "'DM Mono',monospace" },
  orderNum: { fontSize: 11, fontFamily: "'DM Mono',monospace", background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: 4 },
  moneyCell: { fontSize: 12, fontFamily: "'DM Mono',monospace", color: '#374151' },

  // DocsDropdown styles
  docsBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '4px 10px', fontSize: 11, fontWeight: 600,
    background: '#2563eb', color: '#fff',
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