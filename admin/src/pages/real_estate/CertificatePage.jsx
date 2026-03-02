import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns true if a string looks like a real date (not a score like "94.0 %")
const looksLikeDate = (val = '') => {
  if (!val || typeof val !== 'string') return false;
  if (val.includes('%'))               return false;
  if (val.replace(/-/g, '').trim().length < 4) return false;
  const d = new Date(val.replace(' 00:00', '').trim());
  return !isNaN(d);
};

// quizStatus holds the real completion date; fallback to completionDate if it looks like a date
const resolveCompletionDate = (course) => {
  if (looksLikeDate(course.quizStatus))     return course.quizStatus;
  if (looksLikeDate(course.completionDate)) return course.completionDate;
  return null;
};

// Convert "2020-07-02 00:00" → "2020-07-02" for the API query param
const toISODate = (raw = '') => {
  const cleaned = raw.replace(' 00:00', '').trim();
  const d = new Date(cleaned);
  return isNaN(d) ? null : d.toISOString().split('T')[0];
};

// Format date for display: "2020-07-02 00:00" → "07/02/2020"
const formatDate = (raw = '') => {
  if (!raw || !looksLikeDate(raw)) return '—';
  const d = new Date(raw.replace(' 00:00', '').trim());
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

const formatIssuanceDate = () =>
  new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Standard DRE-approved clock hours per course type
const getCourseHours = (title = '') => {
  const t = title.toUpperCase();
  if (t.includes('PRINCIPLES'))                             return '45';
  if (t.includes('PRACTICE'))                               return '45';
  if (t.includes('FINANCE'))                                return '45';
  if (t.includes('ECONOMICS'))                              return '45';
  if (t.includes('APPRAISAL'))                              return '45';
  if (t.includes('PROPERTY MANAGEMENT'))                    return '45';
  if (t.includes('BUSINESS LAW'))                           return '45';
  if (t.includes('ETHICS') || t.includes('LEGAL ASPECTS')) return '15';
  if (t.includes('AGENCY'))                                 return '3';
  if (t.includes('TRUST FUND'))                             return '3';
  if (t.includes('FAIR HOUSING'))                           return '3';
  if (t.includes('RISK MANAGEMENT'))                        return '3';
  if (t.includes('IMPLICIT BIAS'))                          return '2';
  if (t.includes('MANAGEMENT AND SUPERVISION'))             return '3';
  if (t.includes('SELLING') || t.includes('BUSINESS OPP')) return '15';
  if (t.includes('MORTGAGE') || t.includes('LOAN'))        return '15';
  return '—';
};

// B&P Code Section 10170.5 designation
const getDesignation = (title = '') => {
  const t = title.toUpperCase();
  if (t.includes('IMPLICIT BIAS'))              return 'IMPLICIT BIAS TRAINING';
  if (t.includes('ETHICS'))                     return 'CONSUMER PROTECTION';
  if (t.includes('AGENCY'))                     return 'CONSUMER PROTECTION';
  if (t.includes('TRUST FUND'))                 return 'CONSUMER PROTECTION';
  if (t.includes('FAIR HOUSING'))               return 'CONSUMER PROTECTION';
  if (t.includes('RISK MANAGEMENT'))            return 'CONSUMER PROTECTION';
  if (t.includes('MANAGEMENT AND SUPERVISION')) return 'MANAGEMENT AND SUPERVISION';
  if (t.includes('PRINCIPLES'))                 return 'PRE-LICENSE';
  if (t.includes('PRACTICE'))                   return 'PRE-LICENSE';
  if (t.includes('FINANCE'))                    return 'PRE-LICENSE';
  if (t.includes('ECONOMICS'))                  return 'PRE-LICENSE';
  if (t.includes('APPRAISAL'))                  return 'PRE-LICENSE';
  if (t.includes('PROPERTY MANAGEMENT'))        return 'PRE-LICENSE';
  if (t.includes('BUSINESS LAW'))               return 'PRE-LICENSE';
  if (t.includes('LEGAL ASPECTS'))              return 'PRE-LICENSE';
  return 'CONTINUING EDUCATION';
};

// ── Component ─────────────────────────────────────────────────────────────────
const CertificatePage = () => {
  const { studentId, courseIndex } = useParams();
  const [data,       setData]       = useState(null);
  const [dreNumber,  setDreNumber]  = useState(null);
  const [dreLoading, setDreLoading] = useState(true);
  const [error,      setError]      = useState('');

  // Load student + course from localStorage (same pattern as TranscriptPage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`transcript_${studentId}`);
      if (!raw) { setError('Certificate data not found.'); return; }
      const parsed = JSON.parse(raw);
      const course = parsed.courses?.[parseInt(courseIndex)];
      if (!course) { setError('Course not found.'); return; }
      setData({ student: parsed.student, course });
    } catch {
      setError('Failed to load certificate.');
    }
  }, [studentId, courseIndex]);

  // Once course is loaded, fetch DRE number from backend API
  useEffect(() => {
    if (!data?.course) return;

    const fetchDRE = async () => {
      setDreLoading(true);
      try {
        const completionRaw = resolveCompletionDate(data.course);
        const isoDate       = completionRaw ? toISODate(completionRaw) : null;

        if (!isoDate) {
          setDreNumber(null);
          setDreLoading(false);
          return;
        }

        const token  = localStorage.getItem('adminToken');
        const params = new URLSearchParams({
          courseTitle: data.course.courseTitle || '',
          date:        isoDate,
        });

        const res = await fetch(`${API}/api/dre-approvals/lookup?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Lookup failed');

        const json = await res.json();
        setDreNumber(json.dreNumber || null);
      } catch (err) {
        console.error('DRE lookup error:', err);
        setDreNumber(null);
      } finally {
        setDreLoading(false);
      }
    };

    fetchDRE();
  }, [data]);

  // ── Render states ─────────────────────────────────────────────
  if (error) return (
    <div style={{ padding: 40, fontFamily: 'Arial', textAlign: 'center', color: '#dc2626' }}>
      <p>{error}</p>
      <button onClick={() => window.close()} style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}>
        Close Tab
      </button>
    </div>
  );

  if (!data) return (
    <div style={{ padding: 40, fontFamily: 'Arial', textAlign: 'center', color: '#6b7280' }}>
      Loading certificate...
    </div>
  );

  const { student, course } = data;

  // ── Derive display values ──────────────────────────────────────
  const completionDateRaw = resolveCompletionDate(course);
  const completionDate    = formatDate(completionDateRaw);
  const score             = [course.quizStatus, course.completionDate]
                              .find(v => typeof v === 'string' && v.includes('%')) || '';
  const hours      = getCourseHours(course.courseTitle);
  const designation= getDesignation(course.courseTitle);
  const licenseNum = student.licenseNumber || student.dreNumber || '—';
  const displayDRE = dreLoading ? 'Loading...' : (dreNumber || '—');

  return (
    <div style={C.page}>
      <style>{`
        @media print {
          body { margin: 0; background: white; }
          .no-print { display: none !important; }
          @page { size: letter; margin: 0.5in; }
        }
        body { background: #d1d5db; }
      `}</style>

      {/* Print / Close bar */}
      <div className="no-print" style={C.printBar}>
        <button
          onClick={() => window.print()}
          disabled={dreLoading}
          style={{ ...C.printBtn, opacity: dreLoading ? 0.6 : 1, cursor: dreLoading ? 'not-allowed' : 'pointer' }}
        >
          🖨 {dreLoading ? 'Loading DRE #...' : 'Print Certificate'}
        </button>
        <button onClick={() => window.close()} style={C.closeBtn}>✕ Close</button>
      </div>

      {/* ── Certificate Document ── */}
      <div style={C.doc}>

        {/* Header */}
        <div style={C.headerSection}>
          <p style={C.headerBold}>Real Estate License Services</p>
          <p style={C.headerLine}>11617 Washington Place</p>
          <p style={C.headerLine}>Los Angeles, CA 90066</p>
          <p style={C.headerLine}>619 222-2425</p>
        </div>

        {/* Title */}
        <div style={C.titleSection}>
          <p style={C.title}>CONTINUING EDUCATION IN REAL ESTATE COMPLETION CERTIFICATE</p>
        </div>

        {/* Intro */}
        <p style={C.introText}>This Certificate will verify that:</p>

        {/* Student info box with corner markers */}
        <div style={C.studentBox}>
          <span style={C.cornerTL}>+</span>
          <span style={C.cornerTR}>+</span>
          <span style={C.cornerBL}>+</span>
          <span style={C.cornerBR}>+</span>
          <div style={C.studentInner}>
            <div style={C.studentLeft}>
              <p style={C.studentName}>{student.name || '—'}</p>
              {(student.mailingAddress || '').split(',').map((line, i) => (
                <p key={i} style={C.studentAddr}>{line.trim()}</p>
              ))}
            </div>
            <div style={C.studentRight}>
              <p style={C.rightLine}>Real Estate License Number: <strong>{licenseNum}</strong></p>
              <p style={C.rightLine}>Telephone: <strong>{student.workPhone || student.mobilePhone || '—'}</strong></p>
            </div>
          </div>
        </div>

        {/* Body text */}
        <p style={C.bodyText}>
          Has met all requirements and successfully completed the correspondence home/study Internet course and passed
          the final exam(s) with a score of 70% or better for the following course(s) for continuing education credit.
          The date(s) completed, the designation of courses under the Business &amp; Professions Code, the 8-digit California
          Department of Real Estate (DRE) Certificate Number, and the total number of clock hours are listed below:
        </p>

        {/* Course info block */}
        <div style={C.courseBlock}>
          <div style={C.courseRow}>
            <span style={C.courseLabel}>
              Title: <strong>{course.courseTitle || '—'}</strong>
            </span>
            <span style={C.courseRight}>
              Registration Date: <strong>{course.registrationDate || '—'}</strong>
            </span>
          </div>
          <div style={C.courseRow}>
            <span style={C.courseLabel}>
              Certificate #:{' '}
              <strong style={{ color: dreLoading ? '#94a3b8' : '#111' }}>
                {displayDRE}
              </strong>
            </span>
            <span style={C.courseRight}>
              Date of Successful Completion: <strong>{completionDate}</strong>
              &nbsp;&nbsp;Hours: <strong>{hours}</strong>
            </span>
          </div>
          <div style={C.courseRow}>
            <span style={C.courseLabel}>
              Designation Under B &amp; P Code Section 10170.5: <strong>{designation}</strong>
            </span>
          </div>
          {score && (
            <div style={{ ...C.courseRow, marginTop: 2 }}>
              <span style={{ ...C.courseLabel, color: '#059669' }}>
                Exam Score: <strong>{score}</strong>
              </span>
            </div>
          )}
        </div>

        <div style={C.divider} />

        {/* Total clock hours */}
        <p style={C.totalHours}>Total Clock Hours: <strong>{hours}</strong></p>

        {/* Certification text */}
        <div style={C.certSection}>
          <p style={C.certBold}>I hereby verify that the above participant:</p>
          <p style={C.certText}>
            Successfully completed the correspondence home/study course and passed the final exam with a
            score of 70% or better.
          </p>
        </div>

        {/* Signature */}
        <div style={C.signatureSection}>
          <p style={C.signatureCursive}>Amina Ahmed</p>
          <div style={C.signatureLine} />
          <p style={C.signatureTitle}><strong>Amina Ahmed, SCHOOL ADMINISTRATOR</strong></p>
          <p style={C.signatureDate}>Date of Issuance: <u><strong>{formatIssuanceDate()}</strong></u></p>
        </div>

        <div style={C.divider} />

        {/* Reminder section */}
        <div style={C.reminderSection}>
          <p style={C.reminderTitle}><em>Reminder</em></p>
          <ul style={C.reminderList}>
            <li style={C.reminderItem}>
              DRE requires that the Continuing Education Course Verification (RE251) form be used by a licensee
              upon license renewal, along with other necessary renewal documents. OR
            </li>
            <li style={C.reminderItem}>
              Go to www.dre.ca.gov and file your renewal online, using &quot;eLicensing&quot;
            </li>
            <li style={C.reminderItem}>
              Credit will expire if not used within four years of the completion date.
            </li>
          </ul>
          <p style={C.reminderFooter}>
            <strong>
              You are responsible for reporting your course completion to DRE;
              DRE does not accept course completions directly from schools
            </strong>
          </p>
        </div>

      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const C = {
  page: {
    background: '#d1d5db',
    minHeight: '100vh',
    padding: '24px 0 40px',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  printBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  printBtn:   { padding: '9px 20px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600 },
  closeBtn:   { padding: '9px 20px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  doc:        { background: '#fff', width: 680, padding: '36px 48px', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', border: '1px solid #999', fontSize: 12, color: '#111', lineHeight: 1.5 },
  headerSection: { textAlign: 'center', marginBottom: 14 },
  headerBold:    { fontSize: 13, fontWeight: 700, margin: '0 0 2px 0' },
  headerLine:    { fontSize: 12, margin: '1px 0' },
  titleSection:  { textAlign: 'center', marginBottom: 14, borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '8px 0' },
  title:         { fontSize: 13, fontWeight: 700, margin: 0, letterSpacing: '0.02em' },
  introText:     { fontSize: 12, margin: '0 0 6px 0' },
  studentBox:    { position: 'relative', border: '1px solid #999', padding: '14px 16px', marginBottom: 14, minHeight: 72 },
  cornerTL: { position: 'absolute', top: -9,    left: -5,  fontSize: 15, color: '#333', lineHeight: 1 },
  cornerTR: { position: 'absolute', top: -9,    right: -5, fontSize: 15, color: '#333', lineHeight: 1 },
  cornerBL: { position: 'absolute', bottom: -9, left: -5,  fontSize: 15, color: '#333', lineHeight: 1 },
  cornerBR: { position: 'absolute', bottom: -9, right: -5, fontSize: 15, color: '#333', lineHeight: 1 },
  studentInner:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  studentLeft:   { flex: 1 },
  studentName:   { fontSize: 13, fontWeight: 700, margin: '0 0 3px 0' },
  studentAddr:   { fontSize: 12, margin: '0 0 1px 0' },
  studentRight:  { textAlign: 'right', flexShrink: 0, paddingLeft: 16 },
  rightLine:     { fontSize: 12, margin: '0 0 5px 0' },
  bodyText:      { fontSize: 11, lineHeight: 1.65, marginBottom: 14, color: '#222' },
  courseBlock:   { border: '1px solid #ccc', padding: '12px 14px', marginBottom: 14, background: '#fafafa' },
  courseRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7, flexWrap: 'wrap', gap: 4 },
  courseLabel:   { fontSize: 12, color: '#111' },
  courseRight:   { fontSize: 12, color: '#111', textAlign: 'right' },
  divider:       { height: 1, background: '#ccc', margin: '12px 0' },
  totalHours:    { fontSize: 12, margin: '0 0 14px 0' },
  certSection:   { marginBottom: 20 },
  certBold:      { fontSize: 12, fontWeight: 700, margin: '0 0 6px 0' },
  certText:      { fontSize: 12, margin: '0 0 2px 0' },
  signatureSection: { marginBottom: 20 },
  signatureCursive: { fontSize: 28, fontFamily: "'Dancing Script', 'Brush Script MT', cursive", margin: '0 0 2px 0', color: '#111' },
  signatureLine:    { height: 1, background: '#333', width: '55%', marginBottom: 5 },
  signatureTitle:   { fontSize: 12, margin: '0 0 3px 0' },
  signatureDate:    { fontSize: 12, margin: 0 },
  reminderSection:  { marginTop: 8 },
  reminderTitle:    { fontSize: 13, fontWeight: 700, margin: '0 0 8px 0' },
  reminderList:     { paddingLeft: 20, margin: '0 0 10px 0' },
  reminderItem:     { fontSize: 11, marginBottom: 5, lineHeight: 1.55 },
  reminderFooter:   { fontSize: 11, lineHeight: 1.5 },
};

export default CertificatePage;
