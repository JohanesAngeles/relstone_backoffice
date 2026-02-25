// src/pages/StudentDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import { getStudent } from '../../services/students';

const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
  </svg>
);

const InfoRow = ({ label, value }) => (
  <div style={sr.infoRow}>
    <span style={sr.infoLabel}>{label}</span>
    <span style={sr.infoValue}>{value || <span style={{ color: '#cbd5e1' }}>—</span>}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = {
    'Completed': { bg: 'rgba(16,185,129,0.1)', color: '#059669', border: 'rgba(16,185,129,0.3)' },
    'In Progress': { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', border: 'rgba(59,130,246,0.3)' },
    'Expired':    { bg: 'rgba(239,68,68,0.1)',  color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
  };
  const c = cfg[status] || { bg: 'rgba(100,116,139,0.1)', color: '#475569', border: 'rgba(100,116,139,0.3)' };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {status || 'Unknown'}
    </span>
  );
};

const StudentDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [student,  setStudent]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab,      setTab]      = useState('courses'); // 'courses' | 'orders'

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getStudent(id);
      if (res.ok) setStudent(res.data);
      else setNotFound(true);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <AppLayout>
      <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <p style={{ fontSize: 14 }}>Loading student...</p>
      </div>
    </AppLayout>
  );

  if (notFound) return (
    <AppLayout>
      <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Student not found</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>No student with ID "{id}" exists in the database.</p>
        <button onClick={() => navigate('/admin/real-estate')} style={sr.backBtn}>← Back to Students</button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>

      {/* ── Back + Header ── */}
      <div style={sr.topRow}>
        <button onClick={() => navigate('/admin/real-estate')} style={sr.backLink}>
          <Icon d="M19 12H5 M12 19l-7-7 7-7" size={14} />
          Back to Students
        </button>
      </div>

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

      {/* ── Info Grid ── */}
      <div style={sr.infoGrid}>

        {/* Contact Info */}
        <div style={sr.infoCard}>
          <div style={sr.infoCardHeader}>
            <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={14} />
            Contact Information
          </div>
          <div style={sr.infoCardBody}>
            <InfoRow label="Email"        value={student.email} />
            <InfoRow label="Work Phone"   value={student.workPhone} />
            <InfoRow label="Mobile Phone" value={student.mobilePhone} />
            <InfoRow label="Address"      value={student.mailingAddress} />
          </div>
        </div>

        {/* License Info */}
        <div style={sr.infoCard}>
          <div style={sr.infoCardHeader}>
            <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={14} />
            License & ID Numbers
          </div>
          <div style={sr.infoCardBody}>
            <InfoRow label="DRE Number"     value={student.dreNumber} />
            <InfoRow label="License Number" value={student.licenseNumber} />
            <InfoRow label="CFP Number"     value={student.cfpNumber} />
            <InfoRow label="NPN Number"     value={student.npnNumber} />
          </div>
        </div>

      </div>

      {/* ── Tabs: Courses / Orders ── */}
      <div style={sr.tabsCard}>
        <div style={sr.tabsHeader}>
          {[
            { key: 'courses', label: `Courses (${student.courses?.length || 0})` },
            { key: 'orders',  label: `Orders (${student.orders?.length || 0})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ ...sr.tabBtn, ...(tab === t.key ? sr.tabBtnActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Courses Tab */}
        {tab === 'courses' && (
          student.courses?.length === 0 ? (
            <div style={sr.emptyTab}>No courses on record.</div>
          ) : (
            <table style={sr.table}>
              <thead>
                <tr style={sr.thead}>
                  <th style={sr.th}>Course Title</th>
                  <th style={sr.th}>Exam Title</th>
                  <th style={sr.th}>Registered</th>
                  <th style={sr.th}>Expires</th>
                  <th style={sr.th}>Completed</th>
                  <th style={sr.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {student.courses?.map((c, i) => (
                  <tr key={i} style={sr.tr}>
                    <td style={sr.td}><span style={sr.courseTitle}>{c.courseTitle || '—'}</span></td>
                    <td style={sr.td}><span style={{ fontSize: 12, color: '#64748b' }}>{c.examTitle || '—'}</span></td>
                    <td style={sr.td}><span style={sr.dateCell}>{c.registrationDate || '—'}</span></td>
                    <td style={sr.td}><span style={sr.dateCell}>{c.expirationDate || '—'}</span></td>
                    <td style={sr.td}><span style={sr.dateCell}>{c.completionDate || '—'}</span></td>
                    <td style={sr.td}><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          student.orders?.length === 0 ? (
            <div style={sr.emptyTab}>No orders on record.</div>
          ) : (
            <table style={sr.table}>
              <thead>
                <tr style={sr.thead}>
                  <th style={sr.th}>Order #</th>
                  <th style={sr.th}>Date</th>
                  <th style={sr.th}>Description</th>
                  <th style={sr.th}>Price</th>
                  <th style={sr.th}>Discount</th>
                  <th style={sr.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {student.orders?.map((o, i) => (
                  <tr key={i} style={sr.tr}>
                    <td style={sr.td}>
                      <span style={sr.orderNum}>{o.orderNumber || '—'}</span>
                    </td>
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

    </AppLayout>
  );
};

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
    background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 700, flexShrink: 0,
  },
  studentName: { fontSize: 18, fontWeight: 700, color: '#0f172a', fontFamily: "'Poppins',sans-serif" },
  companyName: { fontSize: 12, color: '#64748b', marginTop: 2 },
  headerTags: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  idBadge: {
    fontSize: 10, fontFamily: "'DM Mono',monospace",
    background: '#f1f5f9', color: '#64748b',
    padding: '2px 7px', borderRadius: 4,
  },
  stateBadge: {
    fontSize: 10, fontWeight: 700,
    background: 'rgba(59,130,246,0.1)', color: '#2563eb',
    padding: '2px 7px', borderRadius: 10,
    border: '1px solid rgba(59,130,246,0.2)',
  },
  statsBadge: {
    fontSize: 10, fontWeight: 600,
    padding: '2px 7px', borderRadius: 10,
  },
  headerRight: { textAlign: 'right' },
  firstOrderLabel: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  firstOrderDate: { fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 3, fontFamily: "'DM Mono',monospace" },
  infoGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 14, marginBottom: 14,
  },
  infoCard: {
    background: '#fff', borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  infoCardHeader: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '11px 16px', borderBottom: '1px solid #f1f5f9',
    fontSize: 12, fontWeight: 700, color: '#0f172a',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    fontFamily: "'Poppins',sans-serif",
  },
  infoCardBody: { padding: '4px 0' },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '8px 16px', borderBottom: '1px solid #f8fafc',
    gap: 16,
  },
  infoLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 500, flexShrink: 0 },
  infoValue: { fontSize: 12, color: '#0f172a', textAlign: 'right', wordBreak: 'break-word' },
  tabsCard: {
    background: '#fff', borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  tabsHeader: {
    display: 'flex', borderBottom: '1px solid #e2e8f0',
  },
  tabBtn: {
    padding: '11px 18px', border: 'none', background: 'none',
    fontSize: 13, fontWeight: 500, color: '#64748b',
    cursor: 'pointer', fontFamily: "'Poppins',sans-serif",
    borderBottom: '2px solid transparent', marginBottom: -1,
    transition: 'all 0.15s',
  },
  tabBtnActive: {
    color: '#2563eb', fontWeight: 600,
    borderBottom: '2px solid #2563eb',
  },
  emptyTab: {
    padding: '32px 20px', textAlign: 'center',
    color: '#94a3b8', fontSize: 13,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: {
    padding: '10px 16px', textAlign: 'left',
    fontSize: 10, fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid #e2e8f0',
    fontFamily: "'Poppins',sans-serif", whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '10px 16px', verticalAlign: 'middle' },
  courseTitle: { fontSize: 12, fontWeight: 500, color: '#0f172a' },
  dateCell: { fontSize: 11, color: '#64748b', fontFamily: "'DM Mono',monospace" },
  orderNum: {
    fontSize: 11, fontFamily: "'DM Mono',monospace",
    background: '#f1f5f9', color: '#475569',
    padding: '2px 6px', borderRadius: 4,
  },
  moneyCell: { fontSize: 12, fontFamily: "'DM Mono',monospace", color: '#374151' },
};

export default StudentDetail;