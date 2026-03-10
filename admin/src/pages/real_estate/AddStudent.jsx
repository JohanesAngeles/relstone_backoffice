// src/pages/real_estate/AddStudent.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiUser, FiTrash2, FiX, FiSave,
  FiCheckCircle, FiAlertTriangle, FiEye, FiEyeOff, FiLock,
  FiUserPlus, FiXCircle
} from 'react-icons/fi';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api/admin', '');

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const STATE_NAMES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
  KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',
  MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',
  OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
};

const token = () => localStorage.getItem('adminToken') || '';

// ── Confirmation Dialog ────────────────────────────────────────
const ConfirmDialog = ({ config, onConfirm, onCancel }) => {
  if (!config) return null;

  const themeMap = {
    danger:  { iconBg: 'rgba(239,68,68,0.1)',   iconBorder: '#EF4444', iconColor: '#EF4444', btnBg: '#EF4444',  btnHover: '#c93b3b', btnTextColor: '#FFFFFF' },
    warning: { iconBg: 'rgba(245,158,11,0.1)',  iconBorder: '#F59E0B', iconColor: '#F59E0B', btnBg: '#F59E0B',  btnHover: '#c97f09', btnTextColor: '#091925' },
    success: { iconBg: 'rgba(0,128,0,0.1)',     iconBorder: '#008000', iconColor: '#008000', btnBg: '#008000',  btnHover: '#006600', btnTextColor: '#FFFFFF' },
  };

  const t = themeMap[config.theme] || themeMap.warning;
  const Icon = config.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(9,25,37,0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: 999,
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Dialog */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 1000,
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 20px 60px rgba(9,25,37,0.22)',
        width: 500,
        overflow: 'hidden',
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{ padding: '40px 47px 32px', textAlign: 'center' }}>

          {/* Icon — rounded square, centered */}
          <div style={{
            width: 59, height: 59,
            borderRadius: 7,
            background: t.iconBg,
            border: `0.35px solid ${t.iconBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <Icon size={22} color={t.iconColor} />
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: 32, fontWeight: 400, color: '#000000',
            margin: '0 0 10px',
            fontFamily: "'HomepageBaukasten','Poppins',sans-serif",
            textTransform: 'capitalize',
            lineHeight: '35px',
          }}>
            {config.title}
          </h3>

          {/* Body */}
          <p style={{
            fontSize: 14, color: '#5B7384', margin: '0 0 40px',
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 500,
            lineHeight: '20px',
          }}>
            {config.message}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            {/* Cancel button */}
            <button
              onClick={onCancel}
              style={{
                flex: '0 0 159px',
                height: 50,
                background: '#FFFFFF',
                color: '#5B7384',
                border: '0.5px solid #5B7384',
                borderRadius: 5,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Poppins',sans-serif",
                textTransform: 'capitalize',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {config.cancelLabel || 'Cancel'}
            </button>

            {/* Confirm button */}
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                height: 50,
                background: t.btnBg,
                color: t.btnTextColor,
                border: `0.5px solid ${t.btnBg}`,
                borderRadius: 5,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Poppins',sans-serif",
                textTransform: 'capitalize',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = t.btnHover}
              onMouseLeave={e => e.currentTarget.style.background = t.btnBg}
            >
              {config.confirmIcon && <config.confirmIcon size={13} />}
              {config.confirmLabel || 'Confirm'}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translate(-50%,-47%) } to { opacity:1; transform:translate(-50%,-50%) } }
      `}</style>
    </>
  );
};

// ── Main Component ─────────────────────────────────────────────
const AddStudent = () => {
  const navigate = useNavigate();

  const [nextId,    setNextId]    = useState('');
  const [idLoading, setIdLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: '', lastName: '', companyName: '',
    email: '', mobilePhone: '', workPhone: '',
    streetAddress: '', city: '', state: '', postalCode: '',
    dreNumber: '', password: '', confirmPassword: '', notes: '',
  });

  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState(null);
  const [serverErr, setServerErr] = useState('');
  const [showPass,  setShowPass]  = useState(false);

  // ── Dialog state ───────────────────────────────────────────
  const [dialog, setDialog] = useState(null);

  const openDialog = (config, onConfirm) => setDialog({ config, onConfirm });
  const closeDialog = () => setDialog(null);

  const handleDialogConfirm = () => {
    dialog?.onConfirm();
    closeDialog();
  };

  // ── Fetch next Student ID ──────────────────────────────────
  const fetchNextId = () => {
    setIdLoading(true);
    fetch(`${API}/api/students/next-id`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
      .then(r => r.json())
      .then(d => { setNextId(d.nextId || '—'); setIdLoading(false); })
      .catch(() => { setNextId('—'); setIdLoading(false); });
  };

  useEffect(() => { fetchNextId(); }, []);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim())     e.firstName     = 'First name is required.';
    if (!form.lastName.trim())      e.lastName      = 'Last name is required.';
    if (!form.email.trim())         e.email         = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.streetAddress.trim()) e.streetAddress = 'Street address is required.';
    if (!form.city.trim())          e.city          = 'City is required.';
    if (!form.state.trim())         e.state         = 'State is required.';
    if (!form.postalCode.trim())    e.postalCode    = 'Postal code is required.';
    if (!form.password.trim())      e.password      = 'System password is required.';
    else if (form.password.length < 6) e.password   = 'Password must be at least 6 characters.';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  // ── Action: Clear Form ─────────────────────────────────────
  const doClear = () => {
    setForm({ firstName:'', lastName:'', companyName:'', email:'', mobilePhone:'', workPhone:'', streetAddress:'', city:'', state:'', postalCode:'', dreNumber:'', password:'', confirmPassword:'', notes:'' });
    setErrors({});
    setServerErr('');
  };

  const handleClearClick = () => {
    openDialog({
      theme: 'danger',
      icon: FiTrash2,
      title: 'Clear All Fields?',
      message: "This will erase everything you've typed in this form. This cannot be undone.",
      detail: 'All fields will be reset to their empty default state.',
      cancelLabel: 'Keep My Data',
      confirmLabel: 'Yes, Clear Everything',
      confirmIcon: FiTrash2,
    }, doClear);
  };

  // ── Action: Cancel / Go Back ───────────────────────────────
  const doCancel = () => navigate('/admin/real-estate/online-exam/backoffice');

  const handleCancelClick = () => {
    openDialog({
      theme: 'warning',
      icon: FiAlertTriangle,
      title: 'Cancel & Go Back?',
      message: "Any information you've entered will be lost. Are you sure you want to leave this form without saving?",
      detail: 'You will be returned to the BackOffice search page.',
      cancelLabel: 'Stay on Page',
      confirmLabel: 'Yes, Leave Without Saving',
      confirmIcon: FiArrowLeft,
    }, doCancel);
  };

  // ── Action: Save ───────────────────────────────────────────
  const doSave = async () => {
    setServerErr('');
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    try {
      const res  = await fetch(`${API}/api/students/add`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setServerErr(data.message || 'Failed to save.'); return; }
      setSuccess({ studentId: data.studentId, name: data.name });
    } catch {
      setServerErr('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    openDialog({
      theme: 'success',
      icon: FiCheckCircle,
      title: 'Save Student Record?',
      message: `You're about to create a new student record for ${form.firstName} ${form.lastName}. This will assign them a Student ID and activate their account.`,
      detail: `Email: ${form.email}  ·  State: ${form.state}  ·  Password set`,
      cancelLabel: 'Go Back',
      confirmLabel: 'Yes, Save Record',
      confirmIcon: FiSave,
    }, doSave);
  };

  // ── Success screen ─────────────────────────────────────────
  if (success) {
    return (
      <AppLayout>
        <div style={{ padding:'1.5rem 2rem' }}>
          <Breadcrumb crumbs={[
            { label:'Dashboard',          to:'/admin' },
            { label:'Real Estate',        to:'/admin/real-estate' },
            { label:'Online Exam System', to:'/admin/real-estate/online-exam' },
            { label:'BackOffice',         to:'/admin/real-estate/online-exam/backoffice' },
            { label:'Add New Student' },
          ]} />
          <div style={s.successCard}>
            <div style={s.successIcon}>
              <FiCheckCircle size={28} color="#2EABFE" />
            </div>
            <h2 style={s.successTitle}>Student Record Created!</h2>
            <p style={s.successSub}>The new student has been saved to the database.</p>
            <div style={s.successDetails}>
              <div style={s.successRow}>
                <span style={s.successLabel}>Student ID</span>
                <span style={s.successVal}>{success.studentId}</span>
              </div>
              <div style={{ ...s.successRow, borderBottom: 'none' }}>
                <span style={s.successLabel}>Name</span>
                <span style={s.successVal}>{success.name}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:24, flexWrap:'wrap' }}>
              <button style={s.primaryBtn} onClick={() => navigate(`/admin/students/${success.studentId}`)}>
                <FiUser size={13} /> View Student Record
              </button>
              <button style={s.outlineBtn} onClick={() => {
                setSuccess(null); doClear(); fetchNextId();
              }}>
                <FiUserPlus size={13} /> Add Another Student
              </button>
              <button style={s.outlineBtn} onClick={doCancel}>
                <FiArrowLeft size={13} /> Back to BackOffice
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .as-input {
          width: 100%;
          padding: 8px 12px;
          border: 0.5px solid #7FA8C4;
          border-radius: 5px;
          font-size: 12px;
          font-family: 'Poppins', sans-serif;
          color: #091925;
          background: rgba(127,168,196,0.1);
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, background 0.15s;
        }
        .as-input::placeholder { color: #5B7384; font-weight: 500; }
        .as-input:focus { border-color: #2EABFE; background: rgba(46,171,254,0.05); }
        .as-input.error { border-color: #ef4444; background: rgba(239,68,68,0.05); }

        .as-select {
          width: 100%;
          padding: 8px 12px;
          border: 0.5px solid #7FA8C4;
          border-radius: 5px;
          font-size: 12px;
          font-family: 'Poppins', sans-serif;
          color: #091925;
          background: rgba(127,168,196,0.1);
          outline: none;
          box-sizing: border-box;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237FA8C4' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }
        .as-select:focus { border-color: #2EABFE; }
        .as-select.error { border-color: #ef4444; }

        .as-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 0.5px solid #7FA8C4;
          border-radius: 5px;
          font-size: 12px;
          font-family: 'Poppins', sans-serif;
          color: #091925;
          background: rgba(127,168,196,0.1);
          outline: none;
          box-sizing: border-box;
          resize: vertical;
          min-height: 110px;
          transition: border-color 0.15s;
        }
        .as-textarea::placeholder { color: #5B7384; font-weight: 500; }
        .as-textarea:focus { border-color: #2EABFE; background: rgba(46,171,254,0.05); }
      `}</style>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        config={dialog?.config}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />

      <div style={{ padding:'1.5rem 2rem' }}>

        <Breadcrumb crumbs={[
          { label:'Dashboard',          to:'/admin' },
          { label:'Real Estate',        to:'/admin/real-estate' },
          { label:'Online Exam System', to:'/admin/real-estate/online-exam' },
          { label:'BackOffice',         to:'/admin/real-estate/online-exam/backoffice' },
          { label:'Add New Student Record' },
        ]} />

        {/* Header */}
        <div style={s.topRow}>
          <div>
            <h1 style={s.pageTitle}>Add New Student Record</h1>
            <p style={s.pageSub}>Fill in the student's details below. Fields marked <span style={{ color:'#ef4444' }}>*</span> are required.</p>
          </div>
          <button style={s.outlineBtn} onClick={handleCancelClick}>
            <FiArrowLeft size={13} /> Back To Search
          </button>
        </div>

        {/* Auto ID Banner */}
        <div style={s.idBanner}>
          <div>
            <p style={s.idLabel}>Student ID #</p>
            <p style={s.idValue}>{idLoading ? 'Generating...' : nextId}</p>
            <p style={s.idSub}>Auto-Assigned · Next Available ID In System</p>
          </div>
          <div style={s.idBadge}>
            <FiLock size={11} style={{ marginRight: 6 }} />
            ID Is Assigned Automatically When The Record Is Saved
          </div>
        </div>

        {/* Server error */}
        {serverErr && (
          <div style={s.errorBanner}>
            <FiAlertTriangle size={14} style={{ marginRight: 6 }} />
            {serverErr}
          </div>
        )}

        {/* ── Section: Name & Identity ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Name &amp; Identity</h2>
            <p style={s.sectionSub}>The student's personal and company information</p>
          </div>
          <div style={s.grid3}>
            <div>
              <label style={s.label}>Last Name <span style={s.req}>*</span></label>
              <input className={`as-input${errors.lastName ? ' error' : ''}`} placeholder="e.g. Smith"
                value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              {errors.lastName && <p style={s.fieldErr}>{errors.lastName}</p>}
            </div>
            <div>
              <label style={s.label}>First Name <span style={s.req}>*</span></label>
              <input className={`as-input${errors.firstName ? ' error' : ''}`} placeholder="e.g. John"
                value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              {errors.firstName && <p style={s.fieldErr}>{errors.firstName}</p>}
            </div>
            <div>
              <label style={s.label}>Company Name <span style={s.opt}>Optional</span></label>
              <input className="as-input" placeholder="e.g. ABC Realty Group"
                value={form.companyName} onChange={e => set('companyName', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Section: Contact Information ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Contact Information</h2>
            <p style={s.sectionSub}>Email, phone numbers, and communication preferences</p>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={s.label}>Email Address <span style={s.req}>*</span></label>
            <input className={`as-input${errors.email ? ' error' : ''}`} placeholder="e.g. student@email.com"
              type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            {errors.email && <p style={s.fieldErr}>{errors.email}</p>}
          </div>
          <div style={s.grid2}>
            <div>
              <label style={s.label}>Mobile Phone <span style={s.opt}>Optional</span></label>
              <input className="as-input" placeholder="(XXX) XXX-XXXX"
                value={form.mobilePhone} onChange={e => set('mobilePhone', e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Home Phone <span style={s.opt}>Optional</span></label>
              <input className="as-input" placeholder="(XXX) XXX-XXXX"
                value={form.workPhone} onChange={e => set('workPhone', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Section: Mailing Address ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Mailing Address</h2>
            <p style={s.sectionSub}>Student's current mailing address</p>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={s.label}>Street Address <span style={s.req}>*</span></label>
            <input className={`as-input${errors.streetAddress ? ' error' : ''}`} placeholder="e.g. 1629 Georgetown Way"
              value={form.streetAddress} onChange={e => set('streetAddress', e.target.value)} />
            {errors.streetAddress && <p style={s.fieldErr}>{errors.streetAddress}</p>}
          </div>
          <div style={s.grid3}>
            <div>
              <label style={s.label}>City <span style={s.req}>*</span></label>
              <input className={`as-input${errors.city ? ' error' : ''}`} placeholder="e.g. Los Angeles"
                value={form.city} onChange={e => set('city', e.target.value)} />
              {errors.city && <p style={s.fieldErr}>{errors.city}</p>}
            </div>
            <div>
              <label style={s.label}>State / Province <span style={s.req}>*</span></label>
              <select className={`as-select${errors.state ? ' error' : ''}`}
                value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">— Select State —</option>
                {US_STATES.map(st => (
                  <option key={st} value={st}>{st} — {STATE_NAMES[st]}</option>
                ))}
              </select>
              {errors.state && <p style={s.fieldErr}>{errors.state}</p>}
            </div>
            <div>
              <label style={s.label}>Postal Code <span style={s.req}>*</span></label>
              <input className={`as-input${errors.postalCode ? ' error' : ''}`} placeholder="e.g. 90012"
                value={form.postalCode} onChange={e => set('postalCode', e.target.value)} />
              {errors.postalCode && <p style={s.fieldErr}>{errors.postalCode}</p>}
            </div>
          </div>
        </div>

        {/* ── Section: License & Credentials ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>License &amp; Credentials</h2>
            <p style={s.sectionSub}>DRE license number and system access password</p>
          </div>
          <div style={s.grid3}>
            <div>
              <label style={s.label}>DRE Number <span style={s.opt}>Optional</span></label>
              <input className="as-input" placeholder="e.g. 01234567"
                value={form.dreNumber} onChange={e => set('dreNumber', e.target.value)} />
              <p style={s.fieldNote}>California Dept. of Real Estate license number</p>
            </div>
            <div>
              <label style={s.label}>System Password <span style={s.req}>*</span></label>
              <div style={{ position:'relative' }}>
                <input className={`as-input${errors.password ? ' error' : ''}`}
                  type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  style={{ paddingRight:40 }} />
                <button onClick={() => setShowPass(p => !p)} style={s.eyeBtn} type="button">
                  {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {errors.password && <p style={s.fieldErr}>{errors.password}</p>}
            </div>
            <div>
              <label style={s.label}>Confirm Password <span style={s.req}>*</span></label>
              <input className={`as-input${errors.confirmPassword ? ' error' : ''}`}
                type={showPass ? 'text' : 'password'} placeholder="Re-enter password"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              {errors.confirmPassword && <p style={s.fieldErr}>{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        {/* ── Section: Internal Notes ── */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>Internal Notes <span style={s.opt}>Optional</span></h2>
            <p style={s.sectionSub}>This is for internal use only. The student will not see these notes.</p>
          </div>
          <textarea className="as-textarea"
            placeholder="e.g. Student called in to register. Referred by John Smith at ABC Realty..."
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        {/* ── Footer actions ── */}
        <div style={s.footer}>
          <p style={s.footerNote}>
            <span style={{ color:'#ef4444', marginRight: 4 }}>ⓘ</span>
            Field Marked <span style={{ color:'#ef4444' }}>*</span> Are Required Before Saving.
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <button style={s.clearBtn} onClick={handleClearClick}>
              <FiTrash2 size={12} /> Clear Form
            </button>
            <button style={s.cancelBtn} onClick={handleCancelClick}>
              <FiXCircle size={12} /> Cancel
            </button>
            <button
              style={{ ...s.primaryBtn, opacity: saving ? 0.7 : 1 }}
              onClick={handleSaveClick}
              disabled={saving}
            >
              <FiUserPlus size={14} />
              {saving ? 'Saving...' : 'Save New Student Record'}
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

// ── Styles ─────────────────────────────────────────────────────
const s = {
  topRow:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 },
  pageTitle:  { fontSize:22, fontWeight:700, color:'#000000', fontFamily:"'Poppins',sans-serif", margin:'0 0 4px 0', textTransform:'capitalize' },
  pageSub:    { fontSize:12, color:'#5B7384', margin:0, fontFamily:"'Poppins',sans-serif", fontWeight:500 },

  // ID Banner — dark navy with blue gradient overlay (matches Figma #091925 + gradient)
  idBanner:   {
    background: 'linear-gradient(180deg, #091925 0%, rgba(9,25,37,0.92) 100%)',
    borderRadius: 5,
    padding: '14px 20px',
    marginBottom: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  idLabel:    { fontSize:11, color:'#ffffff', margin:'0 0 2px 0', fontFamily:"'JetBrains Mono','Courier New',monospace", textTransform:'capitalize', letterSpacing:'0.02em' },
  idValue:    { fontSize:28, fontWeight:700, color:'#2EABFE', margin:'0 0 2px 0', fontFamily:"'JetBrains Mono','Courier New',monospace" },
  idSub:      { fontSize:11, color:'#ffffff', margin:0, fontFamily:"'JetBrains Mono','Courier New',monospace", textTransform:'capitalize' },
  idBadge:    {
    fontSize: 11,
    color: '#F5801B',
    background: 'rgba(245,128,27,0.1)',
    border: '0.5px solid #F5801B',
    borderRadius: 5,
    padding: '10px 14px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Poppins',sans-serif",
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    lineHeight: 1.4,
  },

  errorBanner:{ background:'rgba(239,68,68,0.08)', border:'0.5px solid #ef4444', borderRadius:5, padding:'8px 14px', color:'#ef4444', fontSize:12, fontFamily:"'Poppins',sans-serif", marginBottom:12, display:'flex', alignItems:'center' },

  // Sections — white cards with subtle shadow
  section:    { background:'#FFFFFF', borderRadius:5, boxShadow:'0 1px 4px rgba(9,25,37,0.08)', padding:'16px 20px', marginBottom:10 },
  sectionHeader:{ marginBottom:14, paddingBottom:10, borderBottom:'0.5px solid #5B7384' },
  sectionTitle: { fontSize:13, fontWeight:500, color:'#091925', margin:'0 0 3px 0', fontFamily:"'Poppins',sans-serif", textTransform:'capitalize' },
  sectionSub:   { fontSize:11, color:'#7FA8C4', margin:0, fontFamily:"'Poppins',sans-serif" },

  grid3:      { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 },
  grid2:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },

  label:      { display:'block', fontSize:11, fontWeight:500, color:'#091925', marginBottom:5, fontFamily:"'Poppins',sans-serif", textTransform:'uppercase' },
  req:        { color:'#ef4444' },
  opt:        { color:'#5B7384', fontWeight:700, fontSize:7, background:'rgba(91,115,132,0.1)', borderRadius:100, padding:'2px 6px', marginLeft:5, textTransform:'none', letterSpacing:0, verticalAlign:'middle' },
  fieldErr:   { fontSize:10, color:'#ef4444', margin:'3px 0 0 0', fontFamily:"'Poppins',sans-serif" },
  fieldNote:  { fontSize:10, color:'#5B7384', margin:'4px 0 0 0', fontFamily:"'Poppins',sans-serif" },

  eyeBtn:     { position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#7FA8C4', padding:0, display:'flex', alignItems:'center' },

  // Footer — white card
  footer:     { background:'#FFFFFF', borderRadius:5, boxShadow:'0 1px 4px rgba(9,25,37,0.08)', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  footerNote: { fontSize:12, color:'#091925', margin:0, fontFamily:"'Poppins',sans-serif", fontWeight:700, display:'flex', alignItems:'center', gap:5, textTransform:'capitalize' },

  // Buttons matching Figma
  primaryBtn: {
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'0 18px', height:38,
    background:'#2EABFE',
    color:'#091925',
    border:'0.5px solid #2EABFE',
    borderRadius:5,
    fontSize:12, fontWeight:700, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif",
    textTransform:'capitalize',
  },
  outlineBtn: {
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'0 14px', height:38,
    background:'#FFFFFF',
    color:'#5B7384',
    border:'0.5px solid #5B7384',
    borderRadius:5,
    fontSize:12, fontWeight:700, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif",
    textTransform:'capitalize',
  },
  clearBtn: {
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'0 14px', height:38,
    background:'rgba(239,68,68,0.1)',
    color:'#EF4444',
    border:'0.5px solid #EF4444',
    borderRadius:5,
    fontSize:12, fontWeight:700, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif",
    textTransform:'capitalize',
  },
  cancelBtn: {
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'0 14px', height:38,
    background:'#FFFFFF',
    color:'#5B7384',
    border:'0.5px solid #5B7384',
    borderRadius:5,
    fontSize:12, fontWeight:500, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif",
    textTransform:'capitalize',
  },

  // Dialog buttons
  dialogCancelBtn: {
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'7px 14px',
    background:'#FFFFFF', color:'#5B7384',
    border:'0.5px solid #5B7384',
    borderRadius:5, fontSize:12, fontWeight:500, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif",
  },
  dialogConfirmBtn: {
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'7px 16px',
    color:'#fff', border:'none',
    borderRadius:5, fontSize:12, fontWeight:700, cursor:'pointer',
    fontFamily:"'Poppins',sans-serif", transition:'background 0.15s',
  },

  // Success card
  successCard:  { background:'#FFFFFF', borderRadius:5, boxShadow:'0 4px 24px rgba(9,25,37,0.12)', padding:'40px 32px', textAlign:'center', maxWidth:440, margin:'50px auto' },
  successIcon:  { width:52, height:52, borderRadius:'50%', background:'rgba(46,171,254,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' },
  successTitle: { fontSize:17, fontWeight:700, color:'#091925', margin:'0 0 6px 0', fontFamily:"'Poppins',sans-serif" },
  successSub:   { fontSize:12, color:'#5B7384', margin:'0 0 20px 0', fontFamily:"'Poppins',sans-serif" },
  successDetails:{ background:'rgba(127,168,196,0.08)', borderRadius:5, padding:'12px 16px', textAlign:'left', marginBottom:8, border:'0.5px solid #7FA8C4' },
  successRow:   { display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'0.5px solid #e2e8f0' },
  successLabel: { fontSize:11, color:'#5B7384', fontFamily:"'Poppins',sans-serif" },
  successVal:   { fontSize:11, fontWeight:600, color:'#091925', fontFamily:"'JetBrains Mono','Courier New',monospace" },
};

export default AddStudent;
