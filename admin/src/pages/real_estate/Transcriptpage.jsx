import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TranscriptPage = () => {
  const { studentId, courseIndex } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`transcript_${studentId}`);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!raw) { setError('Transcript data not found.'); return; }
      const parsed = JSON.parse(raw);
      const course = parsed.courses?.[parseInt(courseIndex)];
      if (!course) { setError('Course not found.'); return; }
      setData({ student: parsed.student, course });
    } catch {
      setError('Failed to load transcript.');
    }
  }, [studentId, courseIndex]);

  if (error) return (
    <div style={{ padding: 40, fontFamily: 'Arial', textAlign: 'center', color: '#dc2626' }}>
      <p>{error}</p>
      <button onClick={() => window.close()} style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}>Close Tab</button>
    </div>
  );

  if (!data) return (
    <div style={{ padding: 40, fontFamily: 'Arial', textAlign: 'center', color: '#6b7280' }}>
      Loading transcript...
    </div>
  );

  const { student, course } = data;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Parse DRE number for approval number column
  const dreNum = student.dreNumber || 'NONE';

  return (
    <div style={T.page}>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          @page { size: letter; margin: 0.5in; }
        }
        body { background: #e5e5e5; }
      `}</style>

      {/* Print button - hidden when printing */}
      <div className="no-print" style={T.printBar}>
        <button onClick={() => window.print()} style={T.printBtn}>🖨 Print Transcript</button>
        <button onClick={() => window.close()} style={T.closeBtn}>✕ Close</button>
      </div>

      {/* ── Transcript Document ── */}
      <div style={T.doc}>

        {/* Header */}
        <div style={T.headerSection}>
          <p style={T.headerLine}><strong>Real Estate License Services</strong></p>
          <p style={T.headerLine}>11617 Washington Place</p>
          <p style={T.headerLine}>Los Angeles, CA 90066</p>
          <p style={T.headerLine}>619 222-2425</p>
        </div>

        {/* Title */}
        <div style={T.titleSection}>
          <p style={T.title}>PERMANENT STUDENT RECORD - TRANSCRIPT</p>
        </div>

        {/* Student info */}
        <div style={T.studentSection}>
          <div style={T.studentLeft}>
            <p style={T.studentLabel}>Student name &amp; address:</p>
            <div style={T.studentBox}>
              <p style={T.studentName}>{student.name || '—'}</p>
              {student.mailingAddress && (
                <>
                  {student.mailingAddress.split(',').map((line, i) => (
                    <p key={i} style={T.studentAddr}>{line.trim()}</p>
                  ))}
                </>
              )}
            </div>
          </div>
          <div style={T.studentRight}>
            <p style={T.studentIdLine}>Student ID#: <strong>{student.studentId}</strong></p>
            <p style={T.studentIdLine}>Telephone: <strong>{student.workPhone || student.mobilePhone || '—'}</strong></p>
          </div>
        </div>

        {/* Course table */}
        <table style={T.table}>
          <thead>
            <tr>
              <th colSpan={9} style={T.tableTitle}>
                STATUTORY / PRE-LICENSE COURSE COMPLETION CERTIFICATE
              </th>
            </tr>
            <tr style={T.colHeaderRow}>
              <th style={{ ...T.th, width: 90 }}>REGISTRATION DATE</th>
              <th style={{ ...T.th, width: 30 }}>* R/C</th>
              <th colSpan={2} style={{ ...T.th }}>APPROVAL NUMBERS</th>
              <th style={{ ...T.th, width: 220 }}>COURSE TITLE</th>
              <th style={{ ...T.th, width: 70 }}>DATE STARTED</th>
              <th style={{ ...T.th, width: 55 }}>COURSE CLOCK HOURS</th>
              <th style={{ ...T.th, width: 55 }}>**FINAL GRADE</th>
              <th style={{ ...T.th, width: 80 }}>DATE FINAL EXAM TAKEN</th>
            </tr>
            <tr>
              <th style={T.th}></th>
              <th style={T.th}></th>
              <th style={{ ...T.th, width: 55 }}>DRE</th>
              <th style={{ ...T.th, width: 55 }}>O.R.E.A.</th>
              <th style={T.th}></th>
              <th style={T.th}></th>
              <th style={T.th}></th>
              <th style={T.th}></th>
              <th style={T.th}></th>
            </tr>
          </thead>
          <tbody>
            {/* Main course row */}
            <tr>
              <td style={T.td}>{course.registrationDate || '—'}</td>
              <td style={{ ...T.td, textAlign: 'center' }}>C</td>
              <td style={T.td}>{dreNum}</td>
              <td style={T.td}>NONE</td>
              <td style={T.td}>"{course.courseTitle || '—'}"</td>
              <td style={{ ...T.td, fontWeight: 700 }}>{course.earliestTestDate || course.registrationDate || '—'}</td>
              <td style={{ ...T.td, textAlign: 'center' }}>45</td>
              <td style={{ ...T.td, textAlign: 'center' }}>C</td>
              <td style={T.td}>{course.completionDate || '—'}</td>
            </tr>
            {/* Empty rows to match the template */}
            {[...Array(6)].map((_, i) => (
              <tr key={i}>
                {[...Array(9)].map((_, j) => (
                  <td key={j} style={{ ...T.td, height: 22 }}></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer section */}
        <div style={T.footerSection}>

          {/* Left: grade explanation */}
          <div style={T.footerLeft}>
            <p style={T.footerNote}>* R = Residence Course</p>
            <p style={T.footerNote}>  C = Correspondence Course</p>
            <div style={T.gradeSection}>
              <p style={T.gradeTitle}>**GRADE EXPLANATION</p>
              <div style={T.gradeLine} />
              <p style={T.gradeNote}>A score of 60% or more is required.</p>
              <div style={T.gradeRows}>
                {[
                  ['A 90 - 100', 'Excellent'],
                  ['B 80 - 89',  'Above Average'],
                  ['C 70 - 79',  'Average'],
                  ['D 60 - 69',  'Minimum Passing'],
                  ['F 0   - 59', 'To receive credit, the course will have to be repeated and passed.'],
                ].map(([grade, desc]) => (
                  <div key={grade} style={T.gradeRow}>
                    <span style={T.gradeCode}>{grade}</span>
                    <span style={T.gradeDesc}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: certification */}
          <div style={T.footerRight}>
            <p style={T.certTitle}>CERTIFICATION</p>
            <p style={T.certText}>
              I hereby verify that the above student: Successfully completed the correspondence home/study course
              and passed the final exam with a score of 60% or better. And that this transcript reflects the
              permanent record of the above named student.
            </p>
            <div style={T.signatureArea}>
              <p style={T.signatureName}>Amina Ahmed</p>
              <div style={T.signatureLine} />
              <p style={T.signatureTitle}><strong>Amina Ahmed, School Administrator</strong></p>
              <p style={T.signatureDate}>Date of Issuance: <strong>{today}</strong></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────
const T = {
  page: {
    background: '#e5e5e5',
    minHeight: '100vh',
    padding: '24px 0 40px',
    fontFamily: 'Arial, sans-serif',
  },
  printBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  printBtn: {
    padding: '9px 20px',
    background: '#1d4ed8',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  closeBtn: {
    padding: '9px 20px',
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  doc: {
    background: '#fff',
    width: 720,
    margin: '0 auto',
    padding: '36px 48px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
    border: '2px solid #555',
  },
  headerSection: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 1.6,
  },
  headerLine: {
    fontSize: 13,
    margin: '1px 0',
    color: '#111',
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: '#111',
    margin: 0,
  },
  studentSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingBottom: 10,
    borderBottom: '1px solid #ccc',
  },
  studentLeft: { flex: 1 },
  studentLabel: { fontSize: 12, color: '#333', margin: '0 0 6px 0' },
  studentBox: { paddingLeft: 8 },
  studentName: { fontSize: 13, fontWeight: 700, margin: '0 0 2px 0', color: '#111' },
  studentAddr: { fontSize: 12, margin: '0 0 1px 0', color: '#111' },
  studentRight: { textAlign: 'right' },
  studentIdLine: { fontSize: 12, margin: '0 0 4px 0', color: '#111' },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #555',
    marginBottom: 20,
    fontSize: 11,
  },
  tableTitle: {
    textAlign: 'center',
    padding: '6px 4px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.03em',
    border: '1px solid #555',
    background: '#fff',
    color: '#111',
  },
  colHeaderRow: {
    background: '#fff',
  },
  th: {
    border: '1px solid #555',
    padding: '4px 5px',
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center',
    verticalAlign: 'middle',
    color: '#111',
    lineHeight: 1.3,
  },
  td: {
    border: '1px solid #555',
    padding: '5px 5px',
    fontSize: 11,
    verticalAlign: 'middle',
    color: '#111',
    lineHeight: 1.3,
  },

  footerSection: {
    display: 'flex',
    gap: 40,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  footerLeft: { flex: 1 },
  footerNote: { fontSize: 10, color: '#333', margin: '0 0 1px 0' },
  gradeSection: { marginTop: 16 },
  gradeTitle: { fontSize: 10, fontWeight: 700, color: '#111', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.04em' },
  gradeLine: { height: 1, background: '#333', marginBottom: 4, width: '80%' },
  gradeNote: { fontSize: 10, fontWeight: 700, color: '#111', margin: '0 0 8px 0' },
  gradeRows: { display: 'flex', flexDirection: 'column', gap: 4 },
  gradeRow: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  gradeCode: { fontSize: 11, fontWeight: 600, color: '#111', minWidth: 70 },
  gradeDesc: { fontSize: 11, color: '#333', lineHeight: 1.35, flex: 1 },

  footerRight: { flex: 1.2 },
  certTitle: { fontSize: 13, fontWeight: 700, textAlign: 'center', margin: '0 0 10px 0', letterSpacing: '0.04em', color: '#111' },
  certText: { fontSize: 11, color: '#333', lineHeight: 1.6, textAlign: 'justify' },
  signatureArea: { marginTop: 24 },
  signatureName: {
    fontSize: 22,
    fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
    color: '#111',
    margin: '0 0 2px 0',
  },
  signatureLine: { height: 1, background: '#333', marginBottom: 6, width: '80%' },
  signatureTitle: { fontSize: 11, color: '#111', margin: '0 0 2px 0' },
  signatureDate: { fontSize: 11, color: '#111', margin: 0 },
};

export default TranscriptPage;