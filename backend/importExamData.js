require('dotenv').config();
const mongoose = require('mongoose');
const XLSX     = require('xlsx');
const path     = require('path');

// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const EXCEL_FILE   = process.argv[3] || 'relstone_extraction_RUN_20260227_101234.xlsx';
const BATCH_SIZE   = 500; // insert in batches to avoid memory issues

// ─────────────────────────────────────────────
//  SCHEMAS
// ─────────────────────────────────────────────

// 1. Course List
const ExamCourseSchema = new mongoose.Schema({
  rowNum        : { type: String },
  examMasterID  : { type: String, index: true },
  relstoneItem  : { type: String },
  courseTitle   : { type: String },
  masterCertUrl : { type: String },
  qaUrl         : { type: String },
}, { timestamps: true });

// 2. Q&A
const ExamQASchema = new mongoose.Schema({
  examMasterID  : { type: String, index: true },
  examSubTestID : { type: String, index: true },
  courseTitle   : { type: String },
  courseDesc    : { type: String },
  examDesc      : { type: String },
  qaUrl         : { type: String },
  questionNum   : { type: String },
  question      : { type: String },
  optionA       : { type: String },
  optionB       : { type: String },
  optionC       : { type: String },
  optionD       : { type: String },
  optionE       : { type: String },
  correctAnswer : { type: String },
  explanation   : { type: String },
}, { timestamps: true });

// 3. Cert Tracking
const ExamCertSchema = new mongoose.Schema({
  examMasterID    : { type: String, index: true },
  examSubTestID   : { type: String, index: true },
  refNo           : { type: String },
  ceHours         : { type: String },
  dreCertNum      : { type: String },
  courseTitle     : { type: String },
  stateCertNum    : { type: String },
  certDate        : { type: String },
  certDateLookup  : { type: String },
  state           : { type: String, index: true },
  creditHrDetails : { type: String },
}, { timestamps: true });

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function clean(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function parseUrlParams(url) {
  if (!url) return {};
  try {
    // examqandalist.php?examMasterID=X&ExamSubTestID=Y&courseDescription=Z&ExamDescription=W
    const params  = {};
    const qs      = url.split('?')[1] || '';
    qs.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
    });
    return params;
  } catch {
    return {};
  }
}

async function insertBatches(Model, docs, label) {
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await Model.insertMany(batch, { ordered: false });
    inserted += batch.length;
    process.stdout.write(`\r  ${label}: ${inserted}/${docs.length} inserted`);
  }
  console.log(`\r  ✅ ${label}: ${inserted} documents inserted`);
}

// ─────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────
async function main() {
  console.log('============================================================');
  console.log('  RELSTONE EXAM DATA IMPORTER');
  console.log('============================================================\n');

  // ── 1. Connect to adminDB ────────────────────────────────
  const ADMIN_URI = process.env.ADMIN_DB_URI;
  if (!ADMIN_URI) {
    console.error('❌ ADMIN_DB_URI not found in .env file!');
    process.exit(1);
  }

  console.log('🔌 Connecting to adminDB...');
  const adminDB = mongoose.createConnection(ADMIN_URI);
  await new Promise((res, rej) => {
    adminDB.once('connected', res);
    adminDB.once('error', rej);
  });
  console.log('✅ adminDB connected\n');

  // ── 2. Register models on adminDB connection ─────────────
  const ExamCourse = adminDB.model('ExamCourse', ExamCourseSchema, 'examcourses');
  const ExamQA     = adminDB.model('ExamQA',     ExamQASchema,     'examqanda');
  const ExamCert   = adminDB.model('ExamCert',   ExamCertSchema,   'examcerttracking');

  // ── 3. Drop existing collections (fresh import) ──────────
  console.log('🗑️  Dropping existing collections (fresh import)...');
  await adminDB.db.collection('examcourses').drop().catch(() => {});
  await adminDB.db.collection('examqanda').drop().catch(() => {});
  await adminDB.db.collection('examcerttracking').drop().catch(() => {});
  console.log('✅ Collections cleared\n');

  // ── 4. Load Excel ────────────────────────────────────────
  const filePath = path.resolve(EXCEL_FILE);
  console.log(`📂 Loading Excel: ${filePath}`);
  const wb = XLSX.readFile(filePath);
  console.log('✅ Excel loaded\n');

  // ── 5. Parse & Insert: Course List ──────────────────────
  console.log('📋 Processing Course List...');
  const courseSheet = XLSX.utils.sheet_to_json(wb.Sheets['Course List'], { defval: '' });
  const courseDocs  = courseSheet.map(row => ({
    rowNum        : clean(row['row_num']),
    examMasterID  : clean(row['exam_master_id']),
    relstoneItem  : clean(row['relstone_item']),
    courseTitle   : clean(row['course_title']),
    masterCertUrl : clean(row['master_cert_url']),
    qaUrl         : clean(row['qa_url']),
  }));
  await insertBatches(ExamCourse, courseDocs, 'Course List');

  // ── 6. Parse & Insert: Q&A ───────────────────────────────
  console.log('\n📝 Processing Q&A...');
  const qaSheet = XLSX.utils.sheet_to_json(wb.Sheets['Q&A'], { defval: '' });
  const qaDocs  = qaSheet.map(row => {
    const params = parseUrlParams(clean(row['QA_URL']));
    return {
      examMasterID  : clean(row['ExamMasterID']),
      examSubTestID : clean(params['ExamSubTestID'] || ''),
      courseTitle   : clean(row['CourseTitle']),
      courseDesc    : clean(params['courseDescription'] || ''),
      examDesc      : clean(params['ExamDescription'] || ''),
      qaUrl         : clean(row['QA_URL']),
      questionNum   : clean(row['#']),
      question      : clean(row['Question']),
      optionA       : clean(row['A']),
      optionB       : clean(row['B']),
      optionC       : clean(row['C']),
      optionD       : clean(row['D']),
      optionE       : clean(row['E']),
      correctAnswer : clean(row['CorrectAnswer']),
      explanation   : clean(row['Explanation']),
    };
  });
  await insertBatches(ExamQA, qaDocs, 'Q&A');

  // ── 7. Parse & Insert: Cert Tracking ────────────────────
  // NOTE: The cert tracking sheet has a wide pivot format.
  // We extract the core fields (first 11 columns) per row.
  console.log('\n🏅 Processing Cert Tracking...');
  const certSheet = wb.Sheets['State Cert Tracking'];
  const certRaw   = XLSX.utils.sheet_to_json(certSheet, { defval: '' });

  const certDocs = [];
  for (const row of certRaw) {
    const keys    = Object.keys(row);
    const masterID = clean(row[keys[0]]); // first col = ExamMasterID

    // Skip header repeat rows (where col1 = 'refNo')
    if (masterID === 'refNo' || masterID === 'ExamMasterID' || !masterID) continue;

    // The next cols after ExamMasterID are: refNo, ExamMasterID, ExamSubTestID,
    // CE Hours, DRE Cert #, Course Title, State Cert #, Cert Date,
    // Cert Date Lookup, State, Credit Hr Details
    // (based on the parsed structure from inspection)
    certDocs.push({
      examMasterID    : masterID,
      refNo           : clean(row[keys[1]]),
      examSubTestID   : clean(row[keys[3]]),
      ceHours         : clean(row[keys[4]]),
      dreCertNum      : clean(row[keys[5]]),
      courseTitle     : clean(row[keys[6]]),
      stateCertNum    : clean(row[keys[7]]),
      certDate        : clean(row[keys[8]]),
      certDateLookup  : clean(row[keys[9]]),
      state           : clean(row[keys[10]]),
      creditHrDetails : clean(row[keys[11]]),
    });
  }
  await insertBatches(ExamCert, certDocs, 'Cert Tracking');

  // ── 8. Summary ───────────────────────────────────────────
  const courseCount = await ExamCourse.countDocuments();
  const qaCount     = await ExamQA.countDocuments();
  const certCount   = await ExamCert.countDocuments();

  console.log('\n============================================================');
  console.log('  ✅ IMPORT COMPLETE!');
  console.log('============================================================');
  console.log(`  examcourses       : ${courseCount} documents`);
  console.log(`  examqanda         : ${qaCount} documents`);
  console.log(`  examcerttracking  : ${certCount} documents`);
  console.log('============================================================\n');

  await adminDB.close();
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Import failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});