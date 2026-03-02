import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiPrinter, FiX } from 'react-icons/fi';

// ── Field mapping note ────────────────────────────────────────────────────────
// The CEC extraction stores fields in a shifted way (confirmed from raw data):
//   course.quizStatus     = actual completion date  e.g. "2023-05-08 00:00"
//   course.completionDate = score percentage        e.g. "92 %"
//   course.score          = formatted date string   e.g. "05/08/2023"
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

// Extract state code from exam title  e.g. "Life Health and Accident Insurance - HI" → "HI"
const getStateFromExam = (examTitle = '') => {
  const m = examTitle.match(/[-–]\s*([A-Z]{2})\s*(\(|$)/);
  return m ? m[1] : '';
};

// Full state name map for the certificate header line
const STATE_NAMES = {
  AL: 'Alabama',    AK: 'Alaska',       AZ: 'Arizona',     AR: 'Arkansas',
  CA: 'California', CO: 'Colorado',     CT: 'Connecticut',  DE: 'Delaware',
  FL: 'Florida',    GA: 'Georgia',      HI: 'Hawaii',       ID: 'Idaho',
  IL: 'Illinois',   IN: 'Indiana',      IA: 'Iowa',         KS: 'Kansas',
  KY: 'Kentucky',   LA: 'Louisiana',    ME: 'Maine',        MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan',  MN: 'Minnesota',    MS: 'Mississippi',
  MO: 'Missouri',   MT: 'Montana',      NE: 'Nebraska',     NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',  NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',     OK: 'Oklahoma',
  OR: 'Oregon',     PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee',  TX: 'Texas',        UT: 'Utah',
  VT: 'Vermont',    VA: 'Virginia',     WA: 'Washington',   WV: 'West Virginia',
  WI: 'Wisconsin',  WY: 'Wyoming',
};

// Parse completion date from quizStatus field "2023-05-08 00:00" → Date obj
const parseCompletionDate = (raw = '') => {
  if (!raw || raw.includes('---') || raw.includes('--')) return null;
  const cleaned = raw.replace(' 00:00', '').trim();
  const d = new Date(cleaned);
  return isNaN(d) ? null : d;
};

// Format date as  "May 8, 2023"

// Format date as  "05/08/2023"
const formatShort = (date) =>
  date ? date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—';

// Parse registration date from "04/24/2023" or "06/25/2015"
const parseRegDate = (raw = '') => {
  if (!raw || raw === 'n/a') return null;
  const d = new Date(raw);
  return isNaN(d) ? null : d;
};

// Course hours — CEC insurance courses
const getCourseHours = (courseTitle = '', examTitle = '') => {
  const t = (courseTitle + ' ' + examTitle).toUpperCase();
  if (t.includes('24 HR') || t.includes('24-HR') || t.includes('FULL REQUIREMENTS')) return '24';
  if (t.includes('20 HR') || t.includes('20-HR')) return '20';
  if (t.includes('15 HR') || t.includes('15-HR')) return '15';
  if (t.includes('10 HR') || t.includes('10-HR')) return '10';
  if (t.includes('8 HOUR') || t.includes('8-HOUR') || t.includes('8 HR')) return '8';
  if (t.includes('5 HOUR') || t.includes('5-HOUR') || t.includes('5 HR')) return '5';
  if (t.includes('4 HOUR') || t.includes('4-HOUR') || t.includes('4 HR')) return '4';
  if (t.includes('3 HOUR') || t.includes('3-HOUR') || t.includes('3 HR')) return '3';
  if (t.includes('ETHICS') && t.includes('STANDARD')) return '6'; // CFP ethics
  if (t.includes('LONG TERM CARE') || t.includes('LTC')) return '8';
  if (t.includes('ANNUIT')) return '8';
  if (t.includes('DISABILITY')) return '8';
  if (t.includes('AGENT ETHICS')) return '3';
  if (t.includes('LEGAL CONCEPTS') || t.includes('INSURANCE LAW') || t.includes('INSURANCE LAWS')) return '12';
  if (t.includes('LAW AND THE INSURANCE')) return '12';
  if (t.includes('LIFE') && t.includes('ACCIDENT') && t.includes('HEALTH')) return '12';
  if (t.includes('POLICY PREMIUM')) return '8';
  if (t.includes('HIGHLIGHTS OF HAWAII')) return '3';
  if (t.includes('HIGHLIGHTS OF OREGON')) return '3';
  if (t.includes('OKLAHOMA')) return '3';
  return '—';
};

// Course type classification
const getCourseType = (courseTitle = '', examTitle = '') => {
  const t = (courseTitle + ' ' + examTitle).toUpperCase();
  if (t.includes('ETHICS')) return 'Ethics';
  if (t.includes('ANNUIT')) return 'Annuity';
  if (t.includes('LONG TERM CARE') || t.includes('LTC')) return 'Long-Term Care';
  if (t.includes('LAW') || t.includes('LEGAL') || t.includes('LEGISLATIVE')) return 'Laws & Regulations';
  if (t.includes('LIFE') || t.includes('ACCIDENT') || t.includes('HEALTH')) return 'Life / Health';
  if (t.includes('DISABILITY')) return 'Disability';
  if (t.includes('HOMEOWNERS') || t.includes('PROPERTY') || t.includes('CASUALTY')) return 'Property & Casualty';
  return 'General';
};

// Today's issuance date
const today = () =>
  new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// ── Main Component ────────────────────────────────────────────────────────────
const CECCertificatePage = () => {
  const { studentId, courseIndex } = useParams();
  const [data,  setData]  = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`cec_transcript_${studentId}`);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!raw) { setError('Certificate data not found.'); return; }
      const parsed = JSON.parse(raw);
      const course = parsed.courses?.[parseInt(courseIndex)];
      if (!course) { setError('Course not found.'); return; }
      setData({ student: parsed.student, course });
    } catch {
      setError('Failed to load certificate.');
    }
  }, [studentId, courseIndex]);

  if (error) return (
    <div style={C.errorPage}>
      <p style={C.errorText}>{error}</p>
      <button onClick={() => window.close()} style={C.closeErrBtn}>Close</button>
    </div>
  );

  if (!data) return (
    <div style={C.loadingPage}>Loading certificate...</div>
  );

  const { student, course } = data;

  // ── Derived values ──────────────────────────────────────────
  const completionDateObj = parseCompletionDate(course.quizStatus);
  const regDateObj        = parseRegDate(course.registrationDate);
  const scoreRaw          = course.completionDate || '';   // "92 %"
  const scoreDisplay      = scoreRaw.includes('%') ? scoreRaw.trim() : '—';
  const stateCode         = getStateFromExam(course.examTitle);
  const stateName         = STATE_NAMES[stateCode] || '';
  const hours             = getCourseHours(course.courseTitle, course.examTitle);
  const courseType        = getCourseType(course.courseTitle, course.examTitle);
  const licenseNum        = student.licenseNumber || student.npnNumber || '—';
  const cfpNum            = student.cfpNumber || '';

  return (
    <div style={C.page}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          @page { size: letter; margin: 0.5in; }
        }
      `}</style>

      {/* ── Action Bar ── */}
      <div className="no-print" style={C.actionBar}>
        <button onClick={() => window.print()} style={C.printBtn}>
          <FiPrinter size={14} />
          Print Certificate
        </button>
        <button onClick={() => window.close()} style={C.closeBtn}>
          <FiX size={14} />
          Close
        </button>
      </div>

      {/* ── Certificate Document ── */}
      <div style={C.doc}>

        {/* ── Header ── */}
        <div style={C.headerSection}>
          <p style={C.schoolName}>Relstone Education — Insurance CE Division</p>
          <p style={C.schoolAddr}>11617 Washington Place, Los Angeles, CA 90066</p>
          <p style={C.schoolPhone}>Phone: (619) 222-2425 &nbsp;|&nbsp; Fax: (619) 222-2426</p>
        </div>

        <div style={C.titleBlock}>
          <div style={C.titleInner}>
            <p style={C.certLabel}>Certificate of Completion</p>
            <p style={C.certSub}>
              Insurance Continuing Education
              {stateName ? ` — ${stateName}` : ''}
            </p>
          </div>
        </div>

        {/* ── Awarded to ── */}
        <div style={C.awardedSection}>
          <p style={C.awardedLabel}>This certifies that</p>
          <p style={C.awardedName}>{student.name || '—'}</p>
          {student.mailingAddress && (
            <p style={C.awardedAddr}>{student.mailingAddress}</p>
          )}
        </div>

        {/* ── Body text ── */}
        <p style={C.bodyText}>
          has successfully completed the following insurance continuing education course via
          home-study / correspondence, passed the final examination, and is entitled to receive
          the credit hours listed below for license renewal purposes.
        </p>

        {/* ── Course Details Box ── */}
        <div style={C.courseBox}>
          <div style={C.courseBoxHeader}>Course Details</div>
          <div style={C.courseBoxBody}>

            <div style={C.detailGrid}>
              <div style={C.detailItem}>
                <span style={C.detailLabel}>Course Title</span>
                <span style={C.detailValue}>{course.examTitle || course.courseTitle || '—'}</span>
              </div>
              <div style={C.detailItem}>
                <span style={C.detailLabel}>Course Type</span>
                <span style={C.detailValue}>{courseType}</span>
              </div>
              <div style={C.detailItem}>
                <span style={C.detailLabel}>State</span>
                <span style={C.detailValue}>{stateName || stateCode || '—'}</span>
              </div>
              <div style={C.detailItem}>
                <span style={C.detailLabel}>Credit Hours</span>
                <span style={{ ...C.detailValue, fontWeight: 700, color: '#111' }}>{hours}</span>
              </div>
              <div style={C.detailItem}>
                <span style={C.detailLabel}>Registration Date</span>
                <span style={C.detailValue}>{regDateObj ? formatShort(regDateObj) : (course.registrationDate || '—')}</span>
              </div>
              <div style={C.detailItem}>
                <span style={C.detailLabel}>Date Completed</span>
                <span style={{ ...C.detailValue, fontWeight: 700, color: '#111' }}>
                  {completionDateObj ? formatShort(completionDateObj) : '—'}
                </span>
              </div>
              <div style={C.detailItem}>
                <span style={C.detailLabel}>Exam Score</span>
                <span style={{ ...C.detailValue, fontWeight: 700, color: '#166534' }}>{scoreDisplay}</span>
              </div>
              <div style={C.detailItem}>
                <span style={C.detailLabel}>Delivery Method</span>
                <span style={C.detailValue}>Correspondence / Home-Study</span>
              </div>
            </div>

            <div style={C.idRow}>
              <div style={C.idItem}>
                <span style={C.detailLabel}>Student ID</span>
                <span style={C.idValue}>{student.studentId || '—'}</span>
              </div>
              <div style={C.idItem}>
                <span style={C.detailLabel}>License Number</span>
                <span style={C.idValue}>{licenseNum}</span>
              </div>
              {cfpNum && (
                <div style={C.idItem}>
                  <span style={C.detailLabel}>CFP Number</span>
                  <span style={C.idValue}>{cfpNum}</span>
                </div>
              )}
              {stateCode && (
                <div style={C.idItem}>
                  <span style={C.detailLabel}>State Code</span>
                  <span style={C.idValue}>{stateCode}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Divider ── */}
        <div style={C.divider} />

        {/* ── Certification statement + Signature ── */}
        <div style={C.footerSection}>

          <div style={C.certStatement}>
            <p style={C.certBold}>Certification</p>
            <p style={C.certBody}>
              I hereby certify that the above-named student successfully completed this
              correspondence / home-study course and passed the final examination with a score of
              70% or better. This record reflects the permanent file maintained by Relstone Education.
            </p>
            <p style={C.certBody}>
              Date of Issuance:&nbsp;
              <strong><u>{today()}</u></strong>
            </p>
          </div>

          <div style={C.signatureBlock}>
            <p style={C.signatureName}>Amina Ahmed</p>
            <div style={C.signatureLine} />
            <p style={C.sigTitle}><strong>Amina Ahmed — School Administrator</strong></p>
            <p style={C.sigTitle}>Relstone Education, Insurance CE Division</p>
          </div>

        </div>

        {/* ── Divider ── */}
        <div style={C.divider} />

        {/* ── Reminder ── */}
        <div style={C.reminderSection}>
          <p style={C.reminderTitle}>Important Reminder</p>
          <ul style={C.reminderList}>
            <li>It is the student's responsibility to report this completion to their state's Department of Insurance.</li>
            <li>Credit hours may expire if not applied to a license renewal within the required timeframe.</li>
            {cfpNum && <li>To apply these hours toward CFP® renewal, report completion directly to the CFP Board.</li>}
            <li>Keep this certificate for your records as proof of completion.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const C = {
  page: {
    background: '#e2e8f0',
    minHeight: '100vh',
    padding: '24px 0 48px',
    fontFamily: 'Georgia, "Times New Roman", serif',
  },
  errorPage: {
    padding: 60, textAlign: 'center', fontFamily: 'sans-serif', color: '#dc2626',
  },
  errorText: { fontSize: 14, marginBottom: 16 },
  closeErrBtn: {
    padding: '8px 18px', background: '#dc2626', color: '#fff',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13,
  },
  loadingPage: {
    padding: 60, textAlign: 'center', fontFamily: 'sans-serif', color: '#94a3b8', fontSize: 14,
  },

  // Action bar
  actionBar: {
    display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20,
  },
  printBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '9px 20px', background: '#1e3a5f', color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Arial, sans-serif',
  },
  closeBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '9px 20px', background: '#fff', color: '#374151',
    border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Arial, sans-serif',
  },

  // Document
  doc: {
    background: '#fff',
    width: 700,
    margin: '0 auto',
    padding: '40px 52px',
    boxShadow: '0 6px 32px rgba(0,0,0,0.18)',
    border: '1px solid #b0bec5',
    fontSize: 12,
    color: '#1a1a1a',
    lineHeight: 1.6,
  },

  // Header
  headerSection: { textAlign: 'center', marginBottom: 20, borderBottom: '2px solid #1e3a5f', paddingBottom: 14 },
  schoolName: { fontSize: 15, fontWeight: 700, margin: '0 0 3px 0', fontFamily: 'Arial, sans-serif', color: '#1e3a5f' },
  schoolAddr: { fontSize: 11, margin: '1px 0', color: '#444', fontFamily: 'Arial, sans-serif' },
  schoolPhone: { fontSize: 11, margin: '1px 0', color: '#444', fontFamily: 'Arial, sans-serif' },

  // Title block
  titleBlock: {
    textAlign: 'center',
    margin: '18px 0',
    padding: '14px 0',
    borderTop: '1px solid #ccc',
    borderBottom: '1px solid #ccc',
  },
  titleInner: {},
  certLabel: {
    fontSize: 20, fontWeight: 700, margin: '0 0 4px 0',
    letterSpacing: '0.04em', color: '#1e3a5f',
  },
  certSub: { fontSize: 12, color: '#555', margin: 0, fontFamily: 'Arial, sans-serif' },

  // Awarded to
  awardedSection: { textAlign: 'center', margin: '18px 0 14px' },
  awardedLabel: { fontSize: 12, color: '#555', margin: '0 0 6px 0', fontStyle: 'italic' },
  awardedName: {
    fontSize: 22, fontWeight: 700, color: '#1a1a1a',
    margin: '0 0 4px 0', fontFamily: 'Georgia, serif',
    borderBottom: '1px solid #ccc', display: 'inline-block', paddingBottom: 4,
  },
  awardedAddr: { fontSize: 11, color: '#555', margin: '4px 0 0', fontFamily: 'Arial, sans-serif' },

  // Body text
  bodyText: { fontSize: 11.5, lineHeight: 1.7, color: '#333', margin: '0 0 18px 0', fontFamily: 'Arial, sans-serif' },

  // Course box
  courseBox: {
    border: '1px solid #b0bec5',
    borderRadius: 4,
    marginBottom: 18,
    overflow: 'hidden',
  },
  courseBoxHeader: {
    background: '#1e3a5f', color: '#fff',
    padding: '8px 14px', fontSize: 11, fontWeight: 700,
    fontFamily: 'Arial, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase',
  },
  courseBoxBody: { padding: '14px 16px' },
  detailGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginBottom: 14,
  },
  detailItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  detailLabel: {
    fontSize: 9, fontWeight: 700, color: '#888', textTransform: 'uppercase',
    letterSpacing: '0.08em', fontFamily: 'Arial, sans-serif',
  },
  detailValue: { fontSize: 12, color: '#1a1a1a', fontFamily: 'Arial, sans-serif' },
  idRow: {
    display: 'flex', gap: 32, paddingTop: 12, borderTop: '1px solid #e5e7eb', flexWrap: 'wrap',
  },
  idItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  idValue: {
    fontSize: 12, color: '#1a1a1a', fontFamily: "'Courier New', monospace", fontWeight: 700,
  },

  // Divider
  divider: { height: 1, background: '#d1d5db', margin: '18px 0' },

  // Footer
  footerSection: { display: 'flex', justifyContent: 'space-between', gap: 32, alignItems: 'flex-start' },
  certStatement: { flex: 1 },
  certBold: { fontSize: 12, fontWeight: 700, margin: '0 0 8px 0', fontFamily: 'Arial, sans-serif' },
  certBody: { fontSize: 11, lineHeight: 1.7, color: '#333', margin: '0 0 6px 0', fontFamily: 'Arial, sans-serif' },
  signatureBlock: { flexShrink: 0, textAlign: 'left', minWidth: 200 },
  signatureName: {
    fontSize: 24, margin: '0 0 2px 0',
    fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
    color: '#1a1a1a',
  },
  signatureLine: { height: 1, background: '#555', marginBottom: 6, width: '100%' },
  sigTitle: { fontSize: 10.5, margin: '0 0 2px 0', color: '#333', fontFamily: 'Arial, sans-serif' },

  // Reminder
  reminderSection: { marginTop: 4 },
  reminderTitle: { fontSize: 11, fontWeight: 700, margin: '0 0 6px 0', fontFamily: 'Arial, sans-serif', fontStyle: 'italic' },
  reminderList: {
    paddingLeft: 18, margin: 0,
    fontFamily: 'Arial, sans-serif',
  },
};

export default CECCertificatePage;