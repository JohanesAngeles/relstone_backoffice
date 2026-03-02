require('dotenv').config();
const mongoose = require('mongoose');
const XLSX     = require('xlsx');
const fs       = require('fs');
const path     = require('path');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const MONGO_URI  = process.env.ADMIN_DB_URI;
const CEC_FOLDER = process.env.CEC_FOLDER ||
  'C:\\Users\\User\\Desktop\\Relstone Extracted Data\\CEC';
// ───────────────────────────────────────────────────────────────────────────


// ─── SCHEMAS ───────────────────────────────────────────────────────────────

const studentSchema = new mongoose.Schema({
  studentId:      { type: String, index: true },
  name:           String,
  companyName:    String,
  mailingAddress: String,
  email:          String,
  dreNumber:      String,
  licenseNumber:  String,
  cfpNumber:      String,
  npnNumber:      String,
  workPhone:      String,
  mobilePhone:    String,
  firstOrderDate: String,
  sourceFile:     String,
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  studentId:   { type: String, index: true },
  studentName: String,
  date:        String,
  orderNumber: String,
  itemNumber:  String,
  description: String,
  price:       String,
  discount:    String,
  total:       String,
  sourceFile:  String,
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  studentId:        { type: String, index: true },
  studentName:      String,
  registrationDate: String,
  expirationDate:   String,
  courseTitle:      String,
  examTitle:        String,
  earliestTestDate: String,
  status:           String,
  quizStatus:       String,
  completionDate:   String,
  score:            String,
  affidavitDate:    String,
  cdiDreAffidavit:  String,
  sourceFile:       String,
}, { timestamps: true });

const CECStudent = mongoose.model('CECStudent', studentSchema);
const CECOrder   = mongoose.model('CECOrder',   orderSchema);
const CECCourse  = mongoose.model('CECCourse',  courseSchema);

// ─── HELPERS ───────────────────────────────────────────────────────────────

function clean(val) {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (s.startsWith('Order History') || s.startsWith('Course\n') || s.startsWith('Course\\n')) return '__SKIP__';
  return s;
}

function isJunkRow(row) {
  const col3 = String(row[2] || '');
  return col3.length > 200 || col3.includes('Order History') || col3.includes('Course\nRegistration');
}

function parseSheet(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { defval: null });
}

// ─── PROCESS ONE FILE ──────────────────────────────────────────────────────

function processFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n  Reading: ${fileName}`);

  const wb = XLSX.readFile(filePath);

  // ── STUDENTS ──
  const studentsRaw = parseSheet(wb, 'Students');
  const students = studentsRaw
    .filter(r => r['Student ID'] && !isJunkRow(Object.values(r)))
    .map(r => ({
      studentId:      clean(r['Student ID']),
      name:           clean(r['Name']),
      companyName:    clean(r['Company Name']),
      mailingAddress: clean(r['Mailing Address']),
      email:          clean(r['Email']),
      dreNumber:      clean(r['DRE Number']),
      licenseNumber:  clean(r['License Number']),
      cfpNumber:      clean(r['CFP Number']),
      npnNumber:      clean(r['NPN Number']),
      workPhone:      clean(r['Work Phone']),
      mobilePhone:    clean(r['Mobile Phone']),
      firstOrderDate: clean(r['First Order Date']),
      sourceFile:     fileName,
    }))
    .filter(r => r.studentId && r.name && !r.name.includes('Order History'));

  // ── ORDERS ──
  const ordersRaw = parseSheet(wb, 'Orders');
  const orders = ordersRaw
    .filter(r => r['Student ID'] && r['Date'] && !isJunkRow(Object.values(r)))
    .map(r => ({
      studentId:   clean(r['Student ID']),
      studentName: clean(r['Student Name']),
      date:        clean(r['Date']),
      orderNumber: clean(r['Order Number']),
      itemNumber:  clean(r['Item Number']),
      description: clean(r['Description']),
      price:       clean(r['Price']),
      discount:    clean(r['Discount']),
      total:       clean(r['Total']),
      sourceFile:  fileName,
    }))
    .filter(r =>
      r.studentId &&
      r.date &&
      r.date.length < 50 &&
      /\d{2}[-/]\d{2}[-/]\d{4}|\d{4}/.test(r.date)
    );

  // ── COURSES ──
  const coursesRaw = parseSheet(wb, 'Courses');
  const courses = coursesRaw
    .filter(r => r['Student ID'] && r['Registration Date'] && !isJunkRow(Object.values(r)))
    .map(r => ({
      studentId:        clean(r['Student ID']),
      studentName:      clean(r['Student Name']),
      registrationDate: clean(r['Registration Date']),
      expirationDate:   clean(r['Expiration Date']),
      courseTitle:      clean(r['Course Title']),
      examTitle:        clean(r['Exam Title']),
      earliestTestDate: clean(r['Earliest Test Date']),
      status:           clean(r['Status']),
      quizStatus:       clean(r['Quiz Status']),
      completionDate:   clean(r['Completion Date']),
      score:            clean(r['Score']),
      affidavitDate:    clean(r['Affidavit Date']),
      cdiDreAffidavit:  clean(r['CDI/DRE Affidavit']),
      sourceFile:       fileName,
    }))
    .filter(r =>
      r.studentId &&
      r.registrationDate &&
      r.registrationDate.length < 50 &&
      /\d{2}[-/]\d{2}[-/]\d{4}|\d{4}/.test(r.registrationDate)
    );

  console.log(`     Students: ${students.length} | Orders: ${orders.length} | Courses: ${courses.length}`);
  return { students, orders, courses };
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log('CEC STUDENT SEEDER');
  console.log('='.repeat(60));
  console.log(`Folder : ${CEC_FOLDER}`);
  console.log(`MongoDB: ${MONGO_URI}\n`);

  // 1. Find all xlsx files in the CEC folder
  //    Matches: CEC_Students_B_FINAL.xlsx, CEC_Students_C_FINAL.xlsx, etc.
  if (!fs.existsSync(CEC_FOLDER)) {
    console.error(`Folder not found: ${CEC_FOLDER}`);
    console.error('Set CEC_FOLDER in your .env or update the path at the top of this script.');
    process.exit(1);
  }

  const files = fs.readdirSync(CEC_FOLDER)
    .filter(f => {
      const lower = f.toLowerCase();
      // Accept any xlsx that starts with "cec_students" (handles _FINAL, _FINAL.xlsx, etc.)
      return lower.endsWith('.xlsx') && lower.startsWith('cec_students');
    })
    .map(f => path.join(CEC_FOLDER, f))
    .sort();

  if (files.length === 0) {
    console.error('No CEC_Students_*.xlsx files found in folder.');
    console.error(`Folder scanned: ${CEC_FOLDER}`);
    console.error('Make sure files are named like: CEC_Students_B_FINAL.xlsx');
    process.exit(1);
  }

  console.log(`Found ${files.length} file(s):`);
  files.forEach(f => console.log(`   - ${path.basename(f)}`));

  // 2. Read all files
  let allStudents = [];
  let allOrders   = [];
  let allCourses  = [];

  for (const filePath of files) {
    const { students, orders, courses } = processFile(filePath);
    allStudents.push(...students);
    allOrders.push(...orders);
    allCourses.push(...courses);
  }

  console.log('\n' + '-'.repeat(60));
  console.log('TOTAL PARSED:');
  console.log(`   Students : ${allStudents.length}`);
  console.log(`   Orders   : ${allOrders.length}`);
  console.log(`   Courses  : ${allCourses.length}`);
  console.log('-'.repeat(60));

  // 3. Connect to MongoDB
  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected!\n');

  // 4. Confirm before wiping
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const answer = await new Promise(resolve => {
    rl.question(
      'WARNING: This will DROP existing CECStudent, CECOrder, CECCourse collections.\n' +
      'Type "yes" to continue, anything else to cancel: ',
      resolve
    );
  });
  rl.close();

  if (answer.trim().toLowerCase() !== 'yes') {
    console.log('\nCancelled. No data was changed.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // 5. Drop existing collections
  console.log('\nDropping existing collections...');
  await CECStudent.deleteMany({});
  await CECOrder.deleteMany({});
  await CECCourse.deleteMany({});
  console.log('Cleared!');

  // 6. Insert in batches of 500
  const BATCH = 500;

  console.log('\nInserting Students...');
  for (let i = 0; i < allStudents.length; i += BATCH) {
    await CECStudent.insertMany(allStudents.slice(i, i + BATCH), { ordered: false });
    process.stdout.write(`\r   ${Math.min(i + BATCH, allStudents.length)} / ${allStudents.length}`);
  }
  console.log('\nStudents done!');

  console.log('\nInserting Orders...');
  for (let i = 0; i < allOrders.length; i += BATCH) {
    await CECOrder.insertMany(allOrders.slice(i, i + BATCH), { ordered: false });
    process.stdout.write(`\r   ${Math.min(i + BATCH, allOrders.length)} / ${allOrders.length}`);
  }
  console.log('\nOrders done!');

  console.log('\nInserting Courses...');
  for (let i = 0; i < allCourses.length; i += BATCH) {
    await CECCourse.insertMany(allCourses.slice(i, i + BATCH), { ordered: false });
    process.stdout.write(`\r   ${Math.min(i + BATCH, allCourses.length)} / ${allCourses.length}`);
  }
  console.log('\nCourses done!');

  // 7. Final count summary
  const finalStudents = await CECStudent.countDocuments();
  const finalOrders   = await CECOrder.countDocuments();
  const finalCourses  = await CECCourse.countDocuments();

  console.log('\n' + '='.repeat(60));
  console.log('SEEDING COMPLETE!');
  console.log(`   CECStudent : ${finalStudents} documents`);
  console.log(`   CECOrder   : ${finalOrders} documents`);
  console.log(`   CECCourse  : ${finalCourses} documents`);
  console.log('='.repeat(60));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  mongoose.disconnect();
  process.exit(1);
});