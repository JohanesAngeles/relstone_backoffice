// src/pages/real_estate/StudentDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import { FaDownload, FaEnvelope } from 'react-icons/fa';
import { getStudent, updateStudent, updateMainNotes, updateTeleNotes, emailAffidavit, emailPasswordLink } from '../../services/students';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const Icon = ({ d, size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
  </svg>
);

const StatusBadge = ({ status }) => {
  const cfg = {
    'Completed':   { bg: 'rgba(16,185,129,0.1)',  color: '#059669', border: 'rgba(16,185,129,0.3)' },
    'Passed':      { bg: '#E7F8F2',               color: '#10B981', border: 'transparent' },
    'In Progress': { bg: 'rgba(59,130,246,0.1)',   color: '#2563eb', border: 'rgba(59,130,246,0.3)' },
    'Expired':     { bg: 'rgba(239,68,68,0.1)',    color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
  };
  const c = cfg[status] || { bg: 'rgba(100,116,139,0.1)', color: '#475569', border: 'rgba(100,116,139,0.3)' };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: c.bg, color: c.color, border: `0.5px solid ${c.border}` }}>
      {status || 'Unknown'}
    </span>
  );
};

// Toggle badge — matches Figma: red box for N, green box for Y
const FlagToggle = ({ value, onChange }) => {
  const isY = value === 'Y';
  return (
    <button
      onClick={() => onChange(isY ? 'N' : 'Y')}
      style={{
        width: 30, height: 30, borderRadius: 5, border: `0.5px solid ${isY ? '#10B981' : '#EF4444'}`,
        background: isY ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        color: isY ? '#10B981' : '#EF4444',
        fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 0.15s',
      }}>
      {isY ? 'Y' : 'N'}
    </button>
  );
};

// Editable row — inline Edit/Add + Save/Cancel, calls onSave(newValue)
const EditableRow = ({ label, value, onSave, isAdd = false }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value || '');
  const [busy, setBusy]       = useState(false);

  const handleSave = async () => {
    setBusy(true);
    await onSave(val);
    setBusy(false);
    setEditing(false);
  };

  return (
    <div style={sr.infoRow}>
      <span style={sr.infoLabel}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
        {editing ? (
          <>
            <input autoFocus value={val} onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
              style={sr.inlineInput} />
            <button onClick={handleSave} disabled={busy} style={sr.saveBtn}>{busy ? '...' : 'Save'}</button>
            <button onClick={() => { setVal(value || ''); setEditing(false); }} style={sr.cancelBtn}>✕</button>
          </>
        ) : (
          <>
            <span style={sr.infoValue}>{value ? value : <span style={{ color: '#cbd5e1' }}>—</span>}</span>
            <button onClick={() => { setVal(value || ''); setEditing(true); }}
              style={isAdd && !value ? sr.addBtn : sr.editBtn}>
              {isAdd && !value ? 'Add' : 'Edit'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const AffidavitConfirmModal = ({ result, onClose }) => {
  if (!result) return null;
  return (
    <div style={am.overlay}>
      <div style={am.modal}>
        <div style={am.header}>
          <span style={am.okBadge}>✓ OK</span>
          <button onClick={onClose} style={am.closeBtn}>✕</button>
        </div>
        <div style={am.summary}>
          <p style={am.summaryLine}><strong>Student First Name:</strong> {result.firstName}</p>
          <p style={am.summaryLine}><strong>Student Email Address:</strong> {result.email}</p>
        </div>
        <p style={am.sentLabel}>The following message has just been sent:</p>
        <div style={am.emailBox}>
          <p style={am.emailLine}><strong>{result.firstName},</strong></p>
          <p style={am.emailLine}>We have processed your Affidavits(s)</p>
          <p style={am.emailLine}>
            Now you may go back to our website:{' '}
            <a href="https://relstoneexams.com/relsexsys/" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
              relstoneexams.com/relsexsys/
            </a>
            {' '}and log in using your password.
          </p>
          <p style={am.emailLine}>Please go ahead and print your <strong>Completion Certificate</strong>.</p>
          <p style={am.emailLine}>Thank You,</p>
          <p style={{ ...am.emailLine, marginBottom: 0 }}>
            -- C.E. Credits / Cal-State Exams<br />
            -- A California School Since 1978
          </p>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onClose} style={am.returnLink}>return to student record</button>
        </div>
      </div>
    </div>
  );
};

const am = {
  overlay:     { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(9,25,37,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' },
  modal:       { background: '#fff', borderRadius: 12, width: 520, maxWidth: '95vw', padding: '24px 28px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', fontFamily: 'Arial, sans-serif', maxHeight: '90vh', overflowY: 'auto' },
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  okBadge:     { fontSize: 14, fontWeight: 700, color: '#059669', background: 'rgba(16,185,129,0.1)', padding: '4px 14px', borderRadius: 100, border: '1px solid rgba(16,185,129,0.3)' },
  closeBtn:    { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8', padding: '2px 6px' },
  summary:     { textAlign: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' },
  summaryLine: { margin: '4px 0', fontSize: 13, color: '#1e293b' },
  sentLabel:   { fontSize: 13, color: '#374151', marginBottom: 12 },
  emailBox:    { border: '1.5px solid #374151', borderRadius: 4, padding: '16px 20px' },
  emailLine:   { margin: '0 0 10px', fontSize: 13, color: '#1e293b', lineHeight: 1.6 },
  returnLink:  { background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 13, textDecoration: 'underline', fontFamily: 'Arial, sans-serif' },
};

const PasswordLinkConfirmModal = ({ result, onClose }) => {
  if (!result) return null;
  return (
    <div style={am.overlay}>
      <div style={am.modal}>
        <div style={am.header}>
          <span style={am.okBadge}>✓ OK</span>
          <button onClick={onClose} style={am.closeBtn}>✕</button>
        </div>
        <div style={am.summary}>
          <p style={am.summaryLine}><strong>Student First Name:</strong> {result.firstName}</p>
          <p style={am.summaryLine}><strong>Student Email Address:</strong> {result.email}</p>
        </div>
        <p style={am.sentLabel}>The following message has just been sent:</p>
        <div style={am.emailBox}>
          <p style={am.emailLine}><strong>{result.firstName},</strong></p>
          <p style={am.emailLine}>Thank you for Registering for your Online C.E. Examinations.</p>
          <p style={am.emailLine}>
            To access your materials, go to:{' '}
            <a href="https://relstoneexams.com/relsexsys/" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
              RELSTONE Courses4RealEstate
            </a>
          </p>
          <p style={am.emailLine}>
            To login you'll need your E-Mail Address: &lt;<strong>{result.email}</strong>&gt; as your UserID and<br />
            Your Password is: &lt;<strong>••••••••</strong>&gt;
          </p>
          <p style={am.emailLine}>Good Luck on Your Exam(s)!</p>
          <p style={am.emailLine}>-- RELSTONE, Educational Products and Services</p>
          <p style={{ ...am.emailLine, marginBottom: 0 }}>-- A California School Since 1978</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onClose} style={am.returnLink}>return to student record</button>
        </div>
      </div>
    </div>
  );
};

// Simple toast
const Toast = ({ msg, type = 'success' }) => msg ? (
  <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '10px 18px', borderRadius: 8, background: type === 'success' ? '#059669' : '#dc2626', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: "'Poppins', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
    {msg}
  </div>
) : null;

const StudentDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [student,  setStudent]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab,      setTab]      = useState('courses');

  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 2500);
  };

  const [mainNotes,    setMainNotes]    = useState('');
  const [teleNotes,    setTeleNotes]    = useState('');
  const [assignedRep,  setAssignedRep]  = useState('');
  const [notePhrase,   setNotePhrase]   = useState('');
  const [callbackDate, setCallbackDate] = useState('');
  const [okayToCall,   setOkayToCall]   = useState('Yes');
  const [selectedMonitor, setSelectedMonitor] = useState('');
  const [savingNotes, setSavingNotes]   = useState(false);
  const [savingTele,  setSavingTele]    = useState(false);
  const [affidavitResult,  setAffidavitResult]  = useState(null);
  const [sendingAffidavit, setSendingAffidavit] = useState(false);
  const [passwordLinkResult,  setPasswordLinkResult]  = useState(null);
  const [sendingPasswordLink, setSendingPasswordLink] = useState(false);


  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getStudent(id);
      if (res.ok) {
        setStudent(res.data);
        setMainNotes(res.data.mainNotes     || '');
        setTeleNotes(res.data.teleNotes     || '');
        setAssignedRep(res.data.assignedRep || '');
        setCallbackDate(res.data.callbackDate || '');
        setOkayToCall(res.data.okayToCall   || 'Yes');
      } else {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleFieldSave = async (field, value) => {
    const res = await updateStudent(id, { [field]: value });
    if (res.ok) { setStudent(prev => ({ ...prev, [field]: value })); showToast('Saved ✓'); }
    else showToast('Save failed', 'error');
  };

  const handleSaveMainNotes = async () => {
    setSavingNotes(true);
    const res = await updateMainNotes(id, mainNotes);
    setSavingNotes(false);
    res.ok ? showToast('Notes saved ✓') : showToast('Save failed', 'error');
  };

  const handleSaveTeleNotes = async () => {
    setSavingTele(true);
    const res = await updateTeleNotes(id, { teleNotes, assignedRep, callbackDate, okayToCall });
    setSavingTele(false);
    res.ok ? showToast('Telemarketing notes saved ✓') : showToast('Save failed', 'error');
  };

  const handlePhraseSelect = (phrase) => {
    if (!phrase) return;
    const now  = new Date().toLocaleString('en-US');
    const line = `${now}: ${phrase}\n`;
    setTeleNotes(prev => line + prev);
    setNotePhrase('');
  };

  const handleEmailAffidavit = async () => {
    setSendingAffidavit(true);
    const res = await emailAffidavit(student.studentId);
    setSendingAffidavit(false);
    if (res.ok) setAffidavitResult(res.data);
    else showToast(res.data?.message || 'Failed to send email', 'error');
  };

  const handleEmailPasswordLink = async () => {
    setSendingPasswordLink(true);
    const res = await emailPasswordLink(student.studentId);
    setSendingPasswordLink(false);
    if (res.ok) setPasswordLinkResult(res.data);
    else showToast(res.data?.message || 'Failed to send email', 'error');
  };

  const openTranscript = (i) => {
    const payload = { student: { studentId: student.studentId, name: student.name, mailingAddress: student.mailingAddress, workPhone: student.workPhone, mobilePhone: student.mobilePhone, dreNumber: student.dreNumber }, courses: student.courses };
    localStorage.setItem(`transcript_${student.studentId}`, JSON.stringify(payload));
    window.open(`/admin/transcript/${student.studentId}/${i}`, '_blank');
  };

  const openCertificate = (i) => {
    const payload = { student: { studentId: student.studentId, name: student.name, mailingAddress: student.mailingAddress, workPhone: student.workPhone, mobilePhone: student.mobilePhone, dreNumber: student.dreNumber, licenseNumber: student.licenseNumber }, courses: student.courses };
    localStorage.setItem(`transcript_${student.studentId}`, JSON.stringify(payload));
    window.open(`/admin/certificate/${student.studentId}/${i}`, '_blank');
  };

  if (loading) return <AppLayout><div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}><p style={{ fontSize: 14 }}>Loading student...</p></div></AppLayout>;

  if (notFound) return (
    <AppLayout>
      <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Student not found</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>No student with ID "{id}" exists in the database.</p>
        <button onClick={() => navigate('/admin/real-estate/online-exam/backoffice')} style={sr.backBtn}>← Back to Students</button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <Toast msg={toast.msg} type={toast.type} />
      <AffidavitConfirmModal result={affidavitResult} onClose={() => setAffidavitResult(null)} />
      <PasswordLinkConfirmModal result={passwordLinkResult} onClose={() => setPasswordLinkResult(null)} />
      <div style={{ padding: '1.5rem 2rem' }}>

        <Breadcrumb crumbs={[
          { label: 'Dashboard',   to: '/admin' },
          { label: 'Real Estate', to: '/admin/real-estate' },
          { label: 'BackOffice',  to: '/admin/real-estate/online-exam/backoffice' },
          { label: student.name || id },
        ]} />

        <div style={sr.topRow}>
          <button onClick={() => navigate('/admin/real-estate/online-exam/backoffice')} style={sr.backLink}>
            <Icon d="M19 12H5 M12 19l-7-7 7-7" size={14} /> Back to Students
          </button>
        </div>

        {/* ── Header Card ── */}
        <div style={sr.headerCard}>
          <div style={sr.headerInner}>
            <div style={sr.headerLeft}>
              <div style={sr.bigAvatar}>{(student.name || '?')[0].toUpperCase()}</div>
              <div>
                <div style={sr.headerTags}>
                  <span style={sr.idBadge}>ID: {student.studentId}</span>
                  {student.state && <span style={sr.stateBadge}><svg width={10} height={12} viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>{student.state}</span>}
                  {student.companyName && <span style={sr.companyBadge}><svg width={11} height={12} viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 3 }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>{student.companyName}</span>}
                  <span style={sr.activeBadge}>✓ Active</span>
                </div>
                <h1 style={sr.studentName}>{student.name}</h1>
                {student.email && <p style={sr.registeredLine}>{student.email}</p>}
              </div>
            </div>
            <div style={sr.headerRight}>
              <p style={sr.firstOrderLabel}>Student ID</p>
              <p style={sr.firstOrderDate}>[{student.studentId}]</p>
            </div>
          </div>
          <div style={sr.statsRow}>
            <span style={sr.statsPillBlue}>{student.courses?.length || 0} courses</span>
            <span style={sr.statsPillGray}>{student.orders?.length || 0} orders</span>
          </div>
        </div>

        {/* ── Action Bar ── */}
        <div style={sr.actionBarWrap}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigate(`/admin/real-estate/online-exam/backoffice/student/${student.studentId}/add-exam`)} style={sr.addExamBtn}>+ Add Exam</button>
            <button
              onClick={handleEmailPasswordLink}
              disabled={sendingPasswordLink}
              style={{ ...sr.greenOutlineBtn, opacity: sendingPasswordLink ? 0.6 : 1 }}>
              {sendingPasswordLink ? 'Sending...' : '✉ Email Student Password Link'}
            </button>
            <button
              onClick={handleEmailAffidavit}
              disabled={sendingAffidavit}
              style={{ ...sr.purpleOutlineBtn, opacity: sendingAffidavit ? 0.6 : 1 }}>
              {sendingAffidavit ? 'Sending...' : '✉ Email Student Affidavit Ready'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={sr.optLabel}>Email Opt Out:</span>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select value={student.emailOptOut || 'No'} onChange={e => handleFieldSave('emailOptOut', e.target.value)} style={sr.optSelect}>
                <option>No</option><option>Yes</option>
              </select>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#5B7384" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 8, pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
        </div>

        {/* ── Info Grid ── */}
        <div style={sr.infoGrid}>
          <div style={sr.infoCard}>
            <div style={sr.infoCardHeader}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Contact Information
            </div>
            <div style={sr.infoCardBody}>
              <EditableRow label="Student ID"      value={student.studentId}      onSave={v => handleFieldSave('studentId', v)} />
              <EditableRow label="Email"           value={student.email}          onSave={v => handleFieldSave('email', v)} />
              <EditableRow label="Student Name"    value={student.name}           onSave={v => handleFieldSave('name', v)} />
              <EditableRow label="Company Name"    value={student.companyName}    onSave={v => handleFieldSave('companyName', v)}    isAdd />
              <EditableRow label="Mailing Address" value={student.mailingAddress} onSave={v => handleFieldSave('mailingAddress', v)} />
              <EditableRow label="Work Phone"      value={student.workPhone}      onSave={v => handleFieldSave('workPhone', v)} />
              <EditableRow label="Mobile Phone"    value={student.mobilePhone}    onSave={v => handleFieldSave('mobilePhone', v)}    isAdd />
              <EditableRow label="Home Phone"      value={student.homePhone}      onSave={v => handleFieldSave('homePhone', v)}      isAdd />
            </div>
          </div>

          <div style={sr.infoCard}>
            <div style={sr.infoCardHeader}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              License &amp; ID Numbers
            </div>
            <div style={sr.infoCardBody}>
              <div style={sr.infoRow}>
                <span style={sr.infoLabel}>Record Type</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={sr.recordTypeBadge}>{student.recordType || 'R'} — Real Estate</span>
                  <button style={sr.editBtn}>Edit</button>
                </div>
              </div>
              <EditableRow label="DRE Number"              value={student.dreNumber}     onSave={v => handleFieldSave('dreNumber', v)}     isAdd />
              <EditableRow label="NMLS ID Number"          value={student.nmlsId}        onSave={v => handleFieldSave('nmlsId', v)}        isAdd />
              <EditableRow label="Last Website"            value={student.lastWebsite}   onSave={v => handleFieldSave('lastWebsite', v)} />
              <EditableRow label="Lic. Number (Insurance)" value={student.licenseNumber} onSave={v => handleFieldSave('licenseNumber', v)} isAdd />
              <EditableRow label="CFP Number"              value={student.cfpNumber}     onSave={v => handleFieldSave('cfpNumber', v)}     isAdd />
              <EditableRow label="NPN Number"              value={student.npnNumber}     onSave={v => handleFieldSave('npnNumber', v)}     isAdd />
              <EditableRow label="Password"                value={student.password}      onSave={v => handleFieldSave('password', v)} />
              <div style={sr.infoRow}>
                <span style={sr.infoLabel}>Access Denied</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={sr.allowedBadge}>{student.accessDenied === 'Y' ? 'Y — Denied' : 'N — Allowed'}</span>
                  <span style={sr.infoValue}>CPA: {student.cpaState || '—'}</span>
                  <span style={sr.infoValue}>INS</span>
                  <span style={sr.infoValue}>Cert: <strong>{student.insCertState || 'CA'}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Flag Row ── */}
        <div style={sr.flagRow}>
          {/* TX Ethics */}
          <div style={sr.flagItem}>
            <span style={sr.flagLabel}>TX Ethics Cust Y/N?</span>
            <FlagToggle value={student.txEthicsCust || 'N'} onChange={v => handleFieldSave('txEthicsCust', v)} />
          </div>
          <div style={sr.flagDivider} />
          {/* CFP */}
          <div style={sr.flagItem}>
            <span style={sr.flagLabel}>CFP Cust Y/N?</span>
            <FlagToggle value={student.cfpCust || 'N'} onChange={v => handleFieldSave('cfpCust', v)} />
          </div>
          <div style={sr.flagDivider} />
          {/* DMV */}
          <div style={sr.flagItem}>
            <span style={sr.flagLabel}>DMV Cust Y/N?</span>
            <FlagToggle value={student.dmvCust || 'N'} onChange={v => handleFieldSave('dmvCust', v)} />
          </div>
          <div style={sr.flagDivider} />
          {/* DMV Exp Date */}
          <div style={sr.flagItem}>
            <span style={sr.flagLabel}>DMV Exp Date:</span>
            <input type="text" placeholder="mm/dd/yyyy"
              value={student.dmvExpDate || ''}
              onChange={e => setStudent(prev => ({ ...prev, dmvExpDate: e.target.value }))}
              onBlur={e => handleFieldSave('dmvExpDate', e.target.value)}
              style={sr.flagDateInput} />
          </div>
          <div style={{ flex: 1 }} />
          {/* Org. Record Source */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#5B7384', fontFamily: "'Poppins', sans-serif", fontWeight: 400, marginBottom: 2 }}>Org. Record Source</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F59E0B', fontFamily: "'Poppins', sans-serif", textAlign: 'right' }}>{student.orgRecordSource || 'PC'}</div>
            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2, fontStyle: 'italic', fontFamily: "'Poppins', sans-serif" }}>(website .com name, or if numeric, DOS floppy import)</div>
          </div>
        </div>

        {/* ── Notes + Telemarketing Grid ── */}
        <div style={sr.notesGrid}>

          {/* Main Notes */}
          <div style={sr.notesCard}>
            <div style={sr.notesHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                <span style={sr.notesSectionTitle}>NOTES</span>
              </div>
              <span style={sr.notesStudentId}>STUDENT ID# [{student.studentId}]</span>
            </div>
            <textarea value={mainNotes} onChange={e => setMainNotes(e.target.value)} placeholder="Enter notes here..." style={sr.notesTextarea} />
            <button onClick={handleSaveMainNotes} disabled={savingNotes} style={sr.updateNotesBtn}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              {savingNotes ? 'Saving...' : 'Update Main Notes'}
            </button>
          </div>

          {/* Telemarketing Notes */}
          <div style={sr.notesCard}>
            <div style={sr.notesHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.42 2 2 0 0 1 3.62 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <span style={sr.notesSectionTitle}>TELEMARKETING NOTES</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={sr.flagLabel}>Assigned Rep:</span>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <select value={assignedRep} onChange={e => setAssignedRep(e.target.value)} style={sr.repSelect}>
                    <option value="">— Select A Rep —</option>
                    <option value="Rep 1">Rep 1</option>
                    <option value="Rep 2">Rep 2</option>
                    <option value="Rosa">Rosa</option>
                  </select>
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#5B7384" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 8, pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #e2e8f0' }}>
              <p style={sr.teleSubLabel}>ADD NOTE PHRASE</p>
              <div style={{ position: 'relative', marginTop: 5 }}>
                <select value={notePhrase} onChange={e => handlePhraseSelect(e.target.value)} style={{ ...sr.repSelect, width: '100%' }}>
                  <option value="">— Select New Phrase w/ Date Stamp —</option>
                  <option value="Called — No Answer">Called — No Answer</option>
                  <option value="Left Voicemail">Left Voicemail</option>
                  <option value="Spoke to Student">Spoke to Student</option>
                  <option value="Email Sent">Email Sent</option>
                  <option value="Student Called In">Student Called In</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '8px 14px', borderBottom: '0.5px solid #e2e8f0' }}>
              <textarea value={teleNotes} onChange={e => setTeleNotes(e.target.value)} placeholder="Telemarketing notes..." style={{ ...sr.notesTextarea, minHeight: 80, marginBottom: 0 }} />
            </div>

            <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderBottom: '0.5px solid #e2e8f0' }}>
              <div>
                <p style={sr.teleSubLabel}>CALLBACK SCHEDULE DATE</p>
                <input type="text" placeholder="mm/dd/yyyy" value={callbackDate} onChange={e => setCallbackDate(e.target.value)} style={{ ...sr.callbackInput, marginTop: 5 }} />
              </div>
              <div>
                <p style={sr.teleSubLabel}>OKAY TO CALL? (Y/N)</p>
                <select value={okayToCall} onChange={e => setOkayToCall(e.target.value)}
                  style={{ ...sr.callbackInput, marginTop: 5, background: okayToCall === 'Yes' ? 'rgba(16,185,129,0.08)' : '#fff', color: okayToCall === 'Yes' ? '#059669' : '#091925', fontWeight: 700 }}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <button onClick={handleSaveTeleNotes} disabled={savingTele} style={sr.updateNotesBtn}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              {savingTele ? 'Saving...' : 'Update Telemarketing Notes'}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={sr.tabsCard}>
          <div style={sr.tabsHeader}>
            {[
              { key: 'courses', label: 'Courses', count: student.courses?.length || 0 },
              { key: 'orders',  label: 'Orders',  count: student.orders?.length  || 0 },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ ...sr.tabBtn, ...(tab === t.key ? sr.tabBtnActive : {}) }}>
                {t.label}
                <span style={{ ...sr.tabCount, ...(tab === t.key ? sr.tabCountActive : sr.tabCountInactive) }}>{t.count}</span>
              </button>
            ))}
          </div>

          {tab === 'courses' && (!student.courses?.length ? <div style={sr.emptyTab}>No courses on record.</div> : (
            <table style={sr.table}>
              <thead><tr style={sr.thead}><th style={sr.th}>Course Title</th><th style={sr.th}>Exam Title</th><th style={sr.th}>Registered</th><th style={sr.th}>Expires</th><th style={sr.th}>Completed</th><th style={sr.th}>Status</th><th style={sr.th}>Docs</th></tr></thead>
              <tbody>
  {student.courses?.map((c, i) => {
    const isWebRecord = !!c.bundleId && !!c.examNames;
    const examResults = c.examResults || {};
    const resultEntries = Object.entries(examResults);
    return (
      <tr key={i} style={sr.tr}>

        {/* Course Title */}
        <td style={sr.td}>
          <span style={sr.courseTitle}>{c.courseTitle || '—'}</span>
          {isWebRecord && c.bundleId && (
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1, fontFamily: "'Poppins', sans-serif" }}>
              {c.bundleId}
            </div>
          )}
        </td>

        {/* Exam Title — seeded: shows examTitle | web: shows per-exam result badges */}
        <td style={sr.td}>
          {isWebRecord ? (
            resultEntries.length === 0 ? (
              <span style={{ fontSize: 11, color: '#cbd5e1', fontFamily: "'Poppins', sans-serif" }}>No attempts yet</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {resultEntries.map(([examName, result]) => (
                  <div key={examName} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, flexShrink: 0,
                      background: result.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: result.passed ? '#059669' : '#dc2626',
                      border: `0.5px solid ${result.passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>
                      {result.passed ? '✓' : '✗'} {result.score}%
                    </span>
                    <span style={{ fontSize: 10, color: '#374151', fontFamily: "'Poppins', sans-serif", maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {examName}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <span style={{ fontSize: 12, color: '#091925' }}>{c.examTitle || '—'}</span>
          )}
        </td>

        {/* Registered */}
        <td style={sr.td}><span style={sr.dateCell}>{c.registrationDate || '—'}</span></td>

        {/* Expires */}
        <td style={sr.td}><span style={sr.dateCell}>{c.expirationDate || 'n/a'}</span></td>

        {/* Completed — seeded: completionDate | web: progress % */}
        <td style={sr.td}>
          {isWebRecord ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 50, height: 4, background: '#f1f5f9', borderRadius: 99 }}>
                <div style={{ width: `${c.progress || 0}%`, height: '100%', borderRadius: 99, background: c.progress === 100 ? '#10B981' : '#2563eb' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', fontFamily: "'Poppins', sans-serif" }}>
                {c.progress || 0}%
              </span>
            </div>
          ) : (
            <span style={sr.dateCell}>{c.completionDate || (c.completionPercent ? `${c.completionPercent}%` : '—')}</span>
          )}
        </td>

        {/* Status */}
        <td style={sr.td}><StatusBadge status={c.status} /></td>

        {/* Docs */}
        <td style={sr.td}>
          {(c.status === 'Completed' || c.status === 'Passed' || c.status === 'Complete') ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

              {/* Seeded/old records — existing dropdown */}
              {!isWebRecord && (
                <select defaultValue="" onChange={e => {
                  const v = e.target.value;
                  if (v === 'transcript') openTranscript(i);
                  if (v === 'certificate') openCertificate(i);
                  e.target.value = '';
                }} style={{ padding: '4px 8px', fontSize: 11, fontWeight: 600,
                  background: '#2EABFE', color: '#fff', border: 'none',
                  borderRadius: 5, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                  <option value="" disabled>View Docs</option>
                  <option value="transcript">Transcript</option>
                  <option value="certificate">Certificate</option>
                </select>
              )}

              {/* Web records — Download + Send buttons */}
              {isWebRecord && (
                <>
                  <a
                    href={`${API}/api/certificate/download/${c._id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 8px', fontSize: 11, fontWeight: 600,
                      background: '#2EABFE', color: '#fff', borderRadius: 5,
                      textDecoration: 'none', fontFamily: "'Poppins', sans-serif" }}
                  >
                    <FaDownload size={10} /> Download
                  </a>
                  <button
                    onClick={async () => {
                      const note = window.prompt('Optional note for the email (leave blank to skip):');
                      if (note === null) return;
                      try {
                        const token = localStorage.getItem('adminToken') || '';
                        const r = await fetch(`${API}/api/certificate/send/${c._id}`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                          body: JSON.stringify({ message: note }),
                        });
                        const data = await r.json();
                        alert(r.ok ? `✅ ${data.message}` : `❌ ${data.message}`);
                      } catch {
                        alert('Failed to send. Check server logs.');
                      }
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 8px', fontSize: 11, fontWeight: 600,
                      background: '#10B981', color: '#fff', border: 'none',
                      borderRadius: 5, cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif" }}
                  >
                    <FaEnvelope size={10} /> Send
                  </button>
                </>
              )}

            </div>
          ) : <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>}
        </td>

      </tr>
    );
  })}
</tbody>
            </table>
          ))}

          {tab === 'orders' && (!student.orders?.length ? <div style={sr.emptyTab}>No orders on record.</div> : (
            <>
              <table style={sr.table}>
                <thead><tr style={sr.thead}><th style={sr.th}>Date</th><th style={sr.th}>Order #</th><th style={sr.th}>Item #</th><th style={sr.th}>Description</th><th style={sr.th}>Price</th><th style={sr.th}>Discount</th><th style={sr.th}>Total</th></tr></thead>
                <tbody>
                  {student.orders?.map((o, i) => (
                    <tr key={i} style={sr.tr}>
                      <td style={sr.td}><span style={sr.dateCell}>{o.date || '—'}</span></td>
                      <td style={sr.td}><span style={sr.orderNum}>{o.orderNumber || '—'}</span></td>
                      <td style={sr.td}><span style={sr.orderNum}>{o.itemNumber || '—'}</span></td>
                      <td style={sr.td}><span style={{ fontSize: 12, color: '#374151' }}>{o.description || '—'}</span></td>
                      <td style={sr.td}><span style={sr.moneyCell}>{o.price || '—'}</span></td>
                      <td style={sr.td}><span style={{ ...sr.moneyCell, color: '#ef4444' }}>{o.discount || '—'}</span></td>
                      <td style={sr.td}><span style={{ ...sr.moneyCell, fontWeight: 700, color: '#059669' }}>{o.total || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={sr.monitorRow}>
                <span style={sr.flagLabel}>Selected Monitor:</span>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <select value={selectedMonitor} onChange={e => setSelectedMonitor(e.target.value)} style={sr.monitorSelect}>
                    <option value="">— Select Monitor From Existing List —</option>
                  </select>
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#5B7384" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 8, pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                <span style={{ fontSize: 11, color: '#5B7384', fontFamily: "'Poppins', sans-serif" }}>
                  — If Monitor NOT in List, <button style={sr.clickHereLink}>Click Here</button> To ADD New Monitor Record.
                </span>
                <div style={{ flex: 1 }} />
                <button style={sr.examPrepBtn}>🖥 Add FREE ExamPrepCentral Setup</button>
              </div>
            </>
          ))}
        </div>

      </div>
    </AppLayout>
  );
};

const sr = {
  topRow:   { marginBottom: 14 },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#3b82f6', fontFamily: "'Poppins', sans-serif", fontWeight: 500, padding: 0 },
  backBtn:  { marginTop: 16, padding: '8px 16px', borderRadius: 7, background: '#2563eb', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  headerCard:      { background: '#091925', backgroundImage: 'linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%)', borderRadius: 10, padding: '14px 20px 12px', marginBottom: 12 },
  headerInner:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft:      { display: 'flex', alignItems: 'center', gap: 12 },
  bigAvatar:       { width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#2EABFE,#1a7fc4)', color: '#091925', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 },
  studentName:     { fontSize: 22, fontWeight: 700, color: '#FFFFFF', fontFamily: "'Poppins', sans-serif", margin: '3px 0 0', textTransform: 'capitalize', letterSpacing: '-0.2px' },
  registeredLine:  { fontSize: 11, color: '#7FA8C4', margin: '3px 0 0', fontFamily: "'Poppins', sans-serif" },
  headerTags:      { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  idBadge:         { fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#2EABFE' },
  stateBadge:      { fontSize: 12, fontWeight: 700, color: '#2EABFE', display: 'inline-flex', alignItems: 'center' },
  companyBadge:    { fontSize: 12, fontWeight: 700, color: '#2EABFE', display: 'inline-flex', alignItems: 'center' },
  activeBadge:     { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', fontFamily: "'Poppins', sans-serif" },
  statsRow:        { display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 },
  statsPillBlue:   { fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: '#2EABFE', color: '#091925', fontFamily: "'Poppins', sans-serif" },
  statsPillGray:   { fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: 'rgba(91,115,132,0.25)', color: '#7FA8C4', fontFamily: "'Poppins', sans-serif" },
  headerRight:     { textAlign: 'right' },
  firstOrderLabel: { fontSize: 11, color: '#FFFFFF', fontFamily: "'Poppins', sans-serif", fontWeight: 400 },
  firstOrderDate:  { fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginTop: 2, fontFamily: "'Poppins', sans-serif" },
  actionBarWrap:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', borderRadius: 10, padding: '10px 14px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  addExamBtn:      { padding: '7px 14px', borderRadius: 7, border: 'none', background: '#2EABFE', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  greenOutlineBtn: { padding: '7px 14px', borderRadius: 7, border: '1.5px solid #10B981', background: 'transparent', color: '#10B981', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  purpleOutlineBtn:{ padding: '7px 14px', borderRadius: 7, border: '1.5px solid #A78BFA', background: 'rgba(167,139,250,0.07)', color: '#7C3AED', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  optLabel:        { fontSize: 12, fontWeight: 500, color: '#5B7384', fontFamily: "'Poppins', sans-serif" },
  optSelect:       { appearance: 'none', WebkitAppearance: 'none', border: '0.5px solid #CBD5E1', borderRadius: 7, padding: '6px 28px 6px 10px', fontSize: 12, fontWeight: 600, color: '#091925', background: '#fff', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  infoGrid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  infoCard:        { background: '#FFFFFF', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
  infoCardHeader:  { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderBottom: '0.5px solid #5B7384', fontSize: 12, fontWeight: 600, color: '#091925', textTransform: 'capitalize', fontFamily: "'Poppins', sans-serif" },
  infoCardBody:    { padding: 0 },
  infoRow:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 16px', borderBottom: '0.5px solid #e2e8f0', gap: 16 },
  infoLabel:       { fontSize: 12, color: '#5B7384', fontWeight: 500, flexShrink: 0, fontFamily: "'Poppins', sans-serif" },
  infoValue:       { fontSize: 11, color: '#091925', textAlign: 'right', wordBreak: 'break-word', fontFamily: "'Poppins', sans-serif", fontWeight: 500 },
  inlineInput:     { border: '1px solid #2EABFE', borderRadius: 5, padding: '3px 7px', fontSize: 11, fontFamily: "'Poppins', sans-serif", color: '#091925', outline: 'none', width: 160 },
  editBtn:         { padding: '3px 10px', borderRadius: 5, border: '1px solid #2EABFE', background: 'transparent', color: '#2EABFE', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },
  addBtn:          { padding: '3px 10px', borderRadius: 5, border: '1px solid #10B981', background: 'transparent', color: '#10B981', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },
  saveBtn:         { padding: '3px 10px', borderRadius: 5, border: 'none', background: '#2EABFE', color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  cancelBtn:       { padding: '3px 7px', borderRadius: 5, border: '1px solid #e2e8f0', background: 'transparent', color: '#94a3b8', fontSize: 10, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  recordTypeBadge: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(46,171,254,0.12)', color: '#2EABFE', border: '1px solid rgba(46,171,254,0.3)', fontFamily: "'Poppins', sans-serif" },
  allowedBadge:    { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', fontFamily: "'Poppins', sans-serif" },
  flagRow:         { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: '#FFFFFF', borderRadius: 10, padding: '10px 16px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  flagItem:        { display: 'flex', alignItems: 'center', gap: 7 },
  flagDivider:     { width: 1, height: 18, background: '#e2e8f0' },
  flagLabel:       { fontSize: 11, color: '#5B7384', fontWeight: 500, fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },
  flagDateInput:   { border: '0.5px solid #5B7384', borderRadius: 5, padding: '3px 8px', fontSize: 11, fontFamily: "'Poppins', sans-serif", color: '#5B7384', width: 100, textAlign: 'center' },
  notesGrid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  notesCard:         { background: '#FFFFFF', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
  notesHeader:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '0.5px solid #e2e8f0' },
  notesSectionTitle: { fontSize: 11, fontWeight: 700, color: '#091925', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Poppins', sans-serif" },
  notesStudentId:    { fontSize: 10, color: '#5B7384', fontFamily: "'Poppins', sans-serif" },
  notesTextarea:     { width: '100%', minHeight: 120, resize: 'vertical', border: 'none', borderBottom: '0.5px solid #e2e8f0', padding: '10px 14px', fontSize: 11, color: '#091925', fontFamily: "'Poppins', sans-serif", outline: 'none', background: 'transparent', boxSizing: 'border-box' },
  updateNotesBtn:    { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px 14px', background: '#f8fafc', border: 'none', borderTop: '0.5px solid #e2e8f0', fontSize: 11, fontWeight: 600, color: '#2EABFE', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  teleSubLabel:      { fontSize: 9, fontWeight: 700, color: '#5B7384', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Poppins', sans-serif", margin: 0 },
  repSelect:         { appearance: 'none', WebkitAppearance: 'none', border: '0.5px solid #CBD5E1', borderRadius: 7, padding: '5px 28px 5px 10px', fontSize: 11, color: '#091925', background: '#fff', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  callbackInput:     { appearance: 'none', border: '0.5px solid #CBD5E1', borderRadius: 7, padding: '6px 10px', fontSize: 11, color: '#091925', background: '#fff', fontFamily: "'Poppins', sans-serif", width: '100%', boxSizing: 'border-box' },
  tabsCard:         { background: '#FFFFFF', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
  tabsHeader:       { display: 'flex', borderBottom: '0.5px solid #5B7384', padding: '0 6px' },
  tabBtn:           { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '10px 13px', border: 'none', background: 'none', fontSize: 13, fontWeight: 500, color: '#5B7384', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", borderBottom: '3px solid transparent', marginBottom: -1, transition: 'all 0.15s', textTransform: 'capitalize' },
  tabBtnActive:     { color: '#2EABFE', fontWeight: 500, borderBottom: '3px solid #2EABFE' },
  tabCount:         { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, fontFamily: "'Poppins', sans-serif" },
  tabCountActive:   { background: '#2EABFE', color: '#091925' },
  tabCountInactive: { background: 'rgba(91,115,132,0.15)', color: '#5B7384' },
  emptyTab:         { padding: '28px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 12 },
  table:       { width: '100%', borderCollapse: 'collapse' },
  thead:       { background: 'rgba(127,168,196,0.1)' },
  th:          { padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: '#5B7384', textTransform: 'uppercase', letterSpacing: '0.04em', borderTop: '0.5px solid #7FA8C4', borderBottom: '0.5px solid #7FA8C4', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },
  tr:          { borderBottom: '0.5px solid #5B7384' },
  td:          { padding: '9px 16px', verticalAlign: 'middle' },
  courseTitle: { fontSize: 12, fontWeight: 500, color: '#091925', fontFamily: "'Poppins', sans-serif" },
  dateCell:    { fontSize: 12, color: '#091925', fontFamily: "'Poppins', sans-serif", fontWeight: 500 },
  orderNum:    { fontSize: 11, fontFamily: 'monospace', background: '#f1f5f9', color: '#475569', padding: '2px 5px', borderRadius: 4 },
  moneyCell:   { fontSize: 12, fontFamily: 'monospace', color: '#374151' },
  monitorRow:    { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '10px 16px', borderTop: '0.5px solid #e2e8f0', background: '#f8fafc' },
  monitorSelect: { appearance: 'none', WebkitAppearance: 'none', border: '0.5px solid #CBD5E1', borderRadius: 7, padding: '5px 28px 5px 10px', fontSize: 11, color: '#091925', background: '#fff', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", minWidth: 200 },
  clickHereLink: { background: 'none', border: 'none', padding: 0, color: '#2EABFE', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", textDecoration: 'underline' },
  examPrepBtn:   { padding: '7px 14px', borderRadius: 7, border: '1.5px solid #A78BFA', background: 'rgba(167,139,250,0.07)', color: '#7C3AED', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },
};

export default StudentDetail;