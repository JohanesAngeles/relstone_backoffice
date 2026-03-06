require('dotenv').config();
const mongoose = require('mongoose');
const XLSX     = require('xlsx');
const fs       = require('fs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(r => rl.question(q, a => r(a.trim()))); }

const examQandaSchema = new mongoose.Schema({
  courseType:     { type: String, required: true, enum: ['CE', 'RE', 'PreLicense'], trim: true },
  bundleId:       { type: String, required: true, trim: true },
  courseGroup:    { type: String, required: true, enum: ['Mandatory', 'Elective'], trim: true },
  electiveGroup:  { type: String, default: null, trim: true },
  part:           { type: String, default: null, trim: true },
  questionNumber: { type: Number, required: true },
  examName:       { type: String, required: true, trim: true },
  version:        { type: String, required: true, trim: true },
  question:       { type: String, required: true, trim: true },
  options: {
    A: { type: String, default: '' }, B: { type: String, default: '' },
    C: { type: String, default: '' }, D: { type: String, default: '' },
  },
  correctAnswer:  { type: String, trim: true },
  pageReference:  { type: String, default: '', trim: true },
}, { timestamps: true });

function mapExamMeta(examTitle, bundleId, courseType) {
  const t = (examTitle || '').toLowerCase();
  let courseGroup = 'Mandatory', electiveGroup = null, part = null;
  if (t.includes('mortgage lending')) {
    courseGroup = 'Elective'; electiveGroup = 'MortgageLending';
    part = t.includes('part two') || t.includes('part 2') ? 'Part Two' : 'Part One';
  } else if (t.includes('business opportunit') || t.includes('selling business')) {
    courseGroup = 'Elective'; electiveGroup = 'BusinessOpportunities';
    part = t.includes('part two') || t.includes('part 2') ? 'Part Two' : 'Part One';
  }
  return { courseType, bundleId, courseGroup, electiveGroup, part };
}

function detectVersion(examTitle, sheetName) {
  const c = `${examTitle || ''} ${sheetName || ''}`.toLowerCase();
  return (c.includes('version b') || c.includes('ver b')) ? 'Version B' : 'Version A';
}

function clean(val) { return (val === null || val === undefined) ? '' : String(val).trim(); }

function getCorrectAnswer(row) {
  const keys = Object.keys(row);
  const match = keys.find(k => k.replace(/\r\n|\n|\r|\s/g, '').toLowerCase() === 'correctanswer');
  return match ? clean(row[match]) : '';
}

function findHeaderRow(sheet) {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z100');
  for (let R = range.s.r; R <= Math.min(range.e.r, 15); R++) {
    let hasHash = false, hasQuestion = false;
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
      if (!cell) continue;
      const v = String(cell.v).trim().toLowerCase();
      if (v === '#')        hasHash = true;
      if (v === 'question') hasQuestion = true;
    }
    if (hasHash && hasQuestion) return R;
  }
  for (let R = range.s.r; R <= Math.min(range.e.r, 15); R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell && String(cell.v).trim().toLowerCase() === 'question') return R;
    }
  }
  return 0;
}

function isValidExamSheet(sheetName) {
  const s = sheetName.trim().toLowerCase();
  if (s === 'summary') return false;
  if (/^\d+$/.test(s)) return false; // skip numeric-only sheet names
  return true;
}

async function seedFromExcel() {
  console.log('='.repeat(60));
  console.log('      RELSTONE — Excel to MongoDB Seeder');
  console.log('='.repeat(60));

  // ── Ask all inputs upfront ──
  let excelPath  = await ask('\nEnter full path to extracted_exams.xlsx:\n> ');
  excelPath = excelPath.replace(/^["']|["']$/g, '');

  const bundleId   = await ask('\nEnter Bundle ID (e.g. CE-15HR, CE-45HR, RE-45HR):\n> ');
  const courseType = await ask('\nEnter Course Type (CE / RE / PreLicense):\n> ');
  const sheetPrefix = await ask('\nEnter sheet name prefix to strip (or leave blank):\n  e.g. "15 Hour C.E. Course - " → press Enter to skip\n> ');

  rl.close();

  // Validate file
  if (!fs.existsSync(excelPath)) {
    console.error(`\n✗ File not found: ${excelPath}`); process.exit(1);
  }
  if (!bundleId) {
    console.error('\n✗ Bundle ID is required.'); process.exit(1);
  }
  if (!['CE', 'RE', 'PreLicense'].includes(courseType)) {
    console.error('\n✗ Course Type must be CE, RE, or PreLicense.'); process.exit(1);
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`  File:        ${excelPath}`);
  console.log(`  Bundle ID:   ${bundleId}`);
  console.log(`  Course Type: ${courseType}`);
  console.log(`  Prefix:      ${sheetPrefix || '(none)'}`);
  console.log('─'.repeat(60) + '\n');

  const workbook = XLSX.readFile(excelPath);
  const allRecords = [];

  for (const sheetName of workbook.SheetNames) {
    if (!isValidExamSheet(sheetName)) {
      console.log(`  ⏭ Skipping: "${sheetName}"`);
      continue;
    }
    console.log(`  RAW sheet name: "${sheetName}"`);  // ← ADD THIS

    const sheet        = workbook.Sheets[sheetName];
    const headerRowIdx = findHeaderRow(sheet);
    const rows         = XLSX.utils.sheet_to_json(sheet, { defval: '', range: headerRowIdx });

    if (!rows || rows.length === 0) { console.log(`  ⚠ Empty: "${sheetName}"`); continue; }

    // Strip prefix from sheet name to get clean exam title
    // ✅ Get exam title from Row 1 of the sheet (the big title cell)
    const titleCell = sheet['A1'];
    const fullTitle = titleCell ? clean(String(titleCell.v)) : sheetName;
    
    // Strip prefix if provided
    const examTitle = sheetPrefix
      ? fullTitle.replace(new RegExp(`^${sheetPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'), '').trim()
      : fullTitle;

    console.log(`  Processing: "${sheetName}" → "${examTitle}"`);

    let sheetCount = 0;
    for (const row of rows) {
      const questionNum  = parseInt(clean(row['#'] || row['Q#'] || row['Q'] || ''), 10);
      const questionText = clean(row['Question'] || row['question'] || '');
      const optA         = clean(row['A'] || '');
      const optB         = clean(row['B'] || '');
      const optC         = clean(row['C'] || '');
      const optD         = clean(row['D'] || '');
      const correctAns   = getCorrectAnswer(row);
      const explanation  = clean(row['Explanation'] || '');

      if (!questionText || questionText.toLowerCase() === 'question') continue;
      if (!questionNum  || isNaN(questionNum)) continue;

      const { courseGroup, electiveGroup, part } = mapExamMeta(examTitle, bundleId, courseType);

      allRecords.push({
        courseType, bundleId, courseGroup, electiveGroup, part,
        questionNumber: questionNum,
        examName:       examTitle,
        version:        detectVersion(examTitle, sheetName),
        question:       questionText,
        options:        { A: optA, B: optB, C: optC, D: optD },
        correctAnswer:  correctAns,
        pageReference:  explanation,
      });
      sheetCount++;
    }
    console.log(`    → ${sheetCount} questions extracted`);
  }

  if (!allRecords.length) {
    console.error('\n✗ No records found.'); process.exit(1);
  }

  console.log(`\n✓ Total parsed: ${allRecords.length} questions\n`);

  const conn = await mongoose.createConnection(process.env.ADMIN_DB_URI);
  console.log('✓ Connected to MongoDB');
  const ExamQanda = conn.model('ExamQanda', examQandaSchema, 'examqanda');

  // ✅ SAFE: Only deletes records for THIS bundleId — never touches other bundles
  const deleted = await ExamQanda.deleteMany({ bundleId });
  console.log(`✓ Cleared ${deleted.deletedCount} old "${bundleId}" records`);

  const inserted = await ExamQanda.insertMany(allRecords, { ordered: false });
  console.log(`✓ Inserted ${inserted.length} records\n`);

  const summary = {};
  for (const r of allRecords) {
    const key = `${r.bundleId} | ${r.courseGroup} | ${r.examName} — ${r.version}`;
    summary[key] = (summary[key] || 0) + 1;
  }
  console.log('── Summary ──────────────────────────────────────────────────────');
  for (const [k, v] of Object.entries(summary)) console.log(`  ${String(v).padStart(3)} Qs → ${k}`);
  console.log(`\n  TOTAL: ${inserted.length} questions seeded into "${bundleId}" ✓`);

  await conn.close();
  process.exit(0);
}

seedFromExcel().catch(err => { console.error('✗ Error:', err); process.exit(1); });