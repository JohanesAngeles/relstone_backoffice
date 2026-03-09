/**
 * RELSTONE — examqanda Seeder (Excel-driven, multi-format)
 * Database: relstone-admin (via adminDB connection)
 * Collection: examqanda
 *
 * ── Usage ──────────────────────────────────────────────────────────────────────
 *
 *   # Auto-discovers all .xlsx files in the default folder:
 *   node seedExamQanda.js
 *
 *   # Explicit folder (processes every .xlsx inside it):
 *   node seedExamQanda.js "C:\Users\Alezzandrei Balbuena\Downloads\exams\exams excels"
 *
 *   # Single file:
 *   node seedExamQanda.js "./path/to/file.xlsx"
 *
 * ── Supported Excel Formats ────────────────────────────────────────────────────
 *
 *   FORMAT A — CE-style (column-mapped, one row = one question)
 *     Headers: courseType | bundleId | courseGroup | electiveGroup | part |
 *              questionNumber | examName | version | question |
 *              optionA | optionB | optionC | optionD |
 *              correctAnswer | pageReference
 *
 *   FORMAT B — RE Answer Key style (e.g. Real_Estate_Finance_Exam_Answer_Key.xlsx)
 *     Row 0:  Title     (e.g. "REAL ESTATE FINANCE — FINAL EXAM "A" — Answer Key")
 *     Row 1:  Metadata  (e.g. "100 Questions | Version 1 | ...")
 *     Row 2:  Headers:  No. | Question | Choice A | Choice B | Choice C | Choice D | Answer | Correct Answer Text
 *     Row 3+: Data
 *
 *     examName, version, bundleId, courseType, courseGroup are derived
 *     automatically from the filename and sheet name — nothing is hardcoded.
 *
 * ── .env ───────────────────────────────────────────────────────────────────────
 *   ADMIN_DB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/relstone-admin
 */

require('dotenv').config();
const path     = require('path');
const fs       = require('fs');
const os       = require('os');
const XLSX     = require('xlsx');
const mongoose = require('mongoose');
const { adminDB } = require('./config/db');

// ─── Schema ────────────────────────────────────────────────────────────────────
const examQandaSchema = new mongoose.Schema(
  {
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
      A: { type: String, default: '' },
      B: { type: String, default: '' },
      C: { type: String, default: '' },
      D: { type: String, default: '' },
    },
    correctAnswer:  { type: String, trim: true },
    pageReference:  { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const ExamQanda = adminDB.model('ExamQanda', examQandaSchema, 'examqanda');

// ─── Constants ─────────────────────────────────────────────────────────────────

const EXCEL_EXTS = ['.xlsx', '.xlsm', '.xls'];

/**
 * Default folder — where you keep the exam Excel files on your machine.
 * This is the only path that references your local system; everything else
 * is derived dynamically from the files themselves.
 */
const DEFAULT_SEARCH_DIR = 'C:\\Users\\Alezzandrei Balbuena\\Downloads\\exams\\exams excels';

// ─── File Discovery ────────────────────────────────────────────────────────────

/**
 * Return all Excel files to process, in sorted order.
 *
 * Priority:
 *   1. CLI arg is a .xlsx file   → that file only
 *   2. CLI arg is a directory    → all .xlsx files inside it
 *   3. No CLI arg                → DEFAULT_SEARCH_DIR, then ~/Downloads, then cwd
 */
function resolveExcelFiles() {
  const cliArg = process.argv[2];

  if (cliArg) {
    const resolved = path.resolve(cliArg);
    if (!fs.existsSync(resolved)) throw new Error(`Path not found: ${resolved}`);

    const stat = fs.statSync(resolved);

    if (stat.isDirectory()) {
      const files = collectXlsxFromDir(resolved);
      if (files.length === 0) throw new Error(`No Excel files found in: ${resolved}`);
      console.log(`✓ Using directory: ${resolved}`);
      files.forEach(f => console.log(`   ${path.basename(f)}`));
      return files;
    }

    if (stat.isFile()) {
      if (!EXCEL_EXTS.includes(path.extname(resolved).toLowerCase()))
        throw new Error(`Not an Excel file: ${resolved}`);
      console.log(`✓ Using file: ${resolved}`);
      return [resolved];
    }
  }

  // Auto-discover
  const searchDirs = [
    DEFAULT_SEARCH_DIR,
    path.join(os.homedir(), 'Downloads'),
    process.cwd(),
  ];

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = collectXlsxFromDir(dir);
    if (files.length > 0) {
      console.log(`✓ Auto-discovered ${files.length} file(s) in: ${dir}`);
      files.forEach(f => console.log(`   ${path.basename(f)}`));
      return files;
    }
  }

  throw new Error(
    `No Excel files found. Searched:\n  ${searchDirs.join('\n  ')}\n\n` +
    `Tip: node seedExamQanda.js "path/to/folder"  or  node seedExamQanda.js "file.xlsx"`
  );
}

/** Return sorted list of Excel file paths inside a directory */
function collectXlsxFromDir(dir) {
  return fs.readdirSync(dir)
    .filter(f => EXCEL_EXTS.includes(path.extname(f).toLowerCase()))
    .sort()
    .map(f => path.join(dir, f));
}

// ─── Format Detection ──────────────────────────────────────────────────────────

/**
 * Detect whether a workbook is FORMAT_A (CE column-mapped) or FORMAT_B (RE answer key).
 *
 * FORMAT_A: first row of first sheet contains schema column names like "courseType".
 * FORMAT_B: row index 2 of first sheet contains "No." and a "Question" column.
 */
function detectFormat(workbook) {
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: null });
  if (!rows || rows.length === 0) return 'UNKNOWN';

  const row0 = (rows[0] || []).map(c => String(c || '').toLowerCase().replace(/[\s_]+/g, ''));
  const formatAKeys = ['coursetype', 'bundleid', 'coursegroup', 'questionnumber'];
  if (formatAKeys.some(k => row0.includes(k))) return 'FORMAT_A';

  if (rows.length >= 3) {
    const row2 = (rows[2] || []).map(c => String(c || '').toLowerCase().trim());
    if (row2.includes('no.') && row2.some(h => h.includes('question'))) return 'FORMAT_B';
  }

  return 'UNKNOWN';
}

// ─── FORMAT A Parser (CE-style) ───────────────────────────────────────────────

function normalizeHeader(h) {
  return String(h).toLowerCase().replace(/[\s_]+/g, '');
}

const HEADER_MAP = {
  coursetype:     'courseType',
  bundleid:       'bundleId',
  coursegroup:    'courseGroup',
  electivegroup:  'electiveGroup',
  part:           'part',
  questionnumber: 'questionNumber',
  examname:       'examName',
  version:        'version',
  question:       'question',
  optiona:        'optionA',
  optionb:        'optionB',
  optionc:        'optionC',
  optiond:        'optionD',
  correctanswer:  'correctAnswer',
  pagereference:  'pageReference',
};

function parseFormatA(workbook) {
  const allRows = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows  = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });

    if (rows.length === 0) {
      console.log(`    ⚠  Sheet "${sheetName}" is empty — skipped`);
      continue;
    }

    const headers = Object.keys(rows[0]);
    const colMap  = {};
    for (const h of headers) {
      const norm = normalizeHeader(h);
      if (HEADER_MAP[norm]) colMap[HEADER_MAP[norm]] = h;
    }

    const required = ['courseType', 'bundleId', 'courseGroup', 'questionNumber', 'examName', 'version', 'question'];
    const missing  = required.filter(f => !colMap[f]);
    if (missing.length) {
      console.warn(`    ⚠  Sheet "${sheetName}" missing required columns: ${missing.join(', ')} — skipped`);
      continue;
    }

    console.log(`    ✓ Sheet "${sheetName}": ${rows.length} rows`);

    for (const row of rows) {
      const get = field => {
        const col = colMap[field];
        return col && row[col] != null ? String(row[col]).trim() : null;
      };

      const questionNumber = Number(get('questionNumber'));
      if (!get('question') || isNaN(questionNumber)) continue;

      allRows.push({
        courseType:     get('courseType'),
        bundleId:       get('bundleId'),
        courseGroup:    get('courseGroup'),
        electiveGroup:  get('electiveGroup') || null,
        part:           get('part')          || null,
        questionNumber,
        examName:       get('examName'),
        version:        get('version'),
        question:       get('question'),
        options: {
          A: get('optionA') || '',
          B: get('optionB') || '',
          C: get('optionC') || '',
          D: get('optionD') || '',
        },
        correctAnswer:  get('correctAnswer') || '',
        pageReference:  get('pageReference') || '',
      });
    }
  }

  return allRows;
}

// ─── FORMAT B Parser (RE Answer Key style) ────────────────────────────────────

/**
 * Derive exam metadata purely from the filename — no hardcoded data arrays.
 *
 * The filename stem is normalized (lowercased, underscores → spaces, strip
 * "_exam_answer_key" suffix) and then cleaned up to produce the exam name.
 *
 * Known mappings (can be extended by adding more entries):
 *   real_estate_finance  → Real Estate Finance  | Mandatory
 *   property_management  → Property Management  | Elective
 *   business_law         → Business Law         | Mandatory
 *   re_economics         → Real Estate Economics| Mandatory
 *   re_appraisal         → Real Estate Appraisal| Mandatory
 *
 * If a filename isn't recognized, the exam name falls back to a cleaned
 * version of the stem so seeding still works — just double-check the output.
 */
const RE_FILE_META = {
  'real_estate_finance':  { examName: 'Real Estate Finance',    courseGroup: 'Mandatory' },
  'property_management':  { examName: 'Property Management',    courseGroup: 'Elective'  },
  'business_law':         { examName: 'Business Law',            courseGroup: 'Mandatory' },
  're_economics':         { examName: 'Real Estate Economics',   courseGroup: 'Mandatory' },
  're_appraisal':         { examName: 'Real Estate Appraisal',   courseGroup: 'Mandatory' },
};

function deriveMetaFromFilename(filePath) {
  const base = path.basename(filePath, path.extname(filePath));

  // Strip the common suffix to get the course key
  const courseKey = base
    .toLowerCase()
    .replace(/_exam_answer_key$/i, '')
    .trim();

  const known = RE_FILE_META[courseKey];

  if (known) {
    return {
      examName:    known.examName,
      courseGroup: known.courseGroup,
      courseType:  'RE',
      bundleId:    'RE-45HR',
    };
  }

  // Fallback: build a reasonable exam name from the filename
  console.warn(`    ⚠  Unrecognized RE filename key "${courseKey}" — using derived exam name`);
  const examName = courseKey
    .replace(/_/g, ' ')
    .replace(/\bre\b/gi, 'Real Estate')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return { examName, courseGroup: 'Mandatory', courseType: 'RE', bundleId: 'RE-45HR' };
}

/**
 * Derive version label from sheet name.
 *   "Exam A"             → "Version A"
 *   "Exam B (Version 1)" → "Version B — Version 1"
 *   "Exam A (Version 2)" → "Version A — Version 2"
 */
function deriveVersionFromSheet(sheetName) {
  const s = sheetName.toLowerCase();
  const examLetter = s.includes('exam a') ? 'Version A'
                   : s.includes('exam b') ? 'Version B'
                   : 'Version ?';

  const verMatch = s.match(/version\s*(\d+)/);
  return verMatch ? `${examLetter} — Version ${verMatch[1]}` : examLetter;
}

/** Remove " > " line-break artifacts and escaped underscores */
function cleanText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\s*>\s*/g, ' ').replace(/\\_/g, '_').trim();
}

/** Strip embedded **Answer: X Chapter Y, Page Z** footnotes */
function stripAnswerNote(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/\s*\*\*Answer:\s*[A-D][^*]*\*\*/g, '').trim();
}

/** Pull "Chapter X, Page Y" out of an embedded answer footnote */
function extractPageRef(text) {
  if (typeof text !== 'string') return '';
  const m = text.match(/\*\*Answer:\s*[A-D]\s+(Chapter\s+\d+,\s+Page\s+\d+)\*\*/);
  return m ? m[1] : '';
}

function parseFormatB(workbook, filePath) {
  const meta    = deriveMetaFromFilename(filePath);
  const allRows = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet   = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    if (rawRows.length < 4) {
      console.log(`    ⚠  Sheet "${sheetName}" too short — skipped`);
      continue;
    }

    // Row 2 is the column header row
    const headerRow = rawRows[2].map(h => String(h || '').trim());
    const iNo  = headerRow.findIndex(h => /^no\.?$/i.test(h));
    const iQ   = headerRow.findIndex(h => /question/i.test(h));
    const iA   = headerRow.findIndex(h => /choice\s*a/i.test(h));
    const iB   = headerRow.findIndex(h => /choice\s*b/i.test(h));
    const iC   = headerRow.findIndex(h => /choice\s*c/i.test(h));
    const iD   = headerRow.findIndex(h => /choice\s*d/i.test(h));
    const iAns = headerRow.findIndex(h => /^answer$/i.test(h));

    if (iNo === -1 || iQ === -1 || iAns === -1) {
      console.warn(`    ⚠  Sheet "${sheetName}" — could not identify required columns — skipped`);
      continue;
    }

    const version  = deriveVersionFromSheet(sheetName);
    const dataRows = rawRows.slice(3);

    console.log(`    ✓ Sheet "${sheetName}" → ${version}: ${dataRows.length} data rows`);

    for (const row of dataRows) {
      if (!row || row[iNo] == null) continue;

      const questionNumber = Number(row[iNo]);
      if (isNaN(questionNumber)) continue;

      const rawQ = cleanText(String(row[iQ] || ''));
      if (!rawQ) continue;

      // Extract page ref from whichever option cell contains it
      let pageReference = '';
      [iA, iB, iC, iD].forEach(idx => {
        if (!pageReference && idx !== -1 && row[idx]) {
          pageReference = extractPageRef(String(row[idx]));
        }
      });

      const getOpt = idx =>
        idx === -1 || row[idx] == null
          ? ''
          : cleanText(stripAnswerNote(String(row[idx])));

      allRows.push({
        courseType:     meta.courseType,
        bundleId:       meta.bundleId,
        courseGroup:    meta.courseGroup,
        electiveGroup:  null,
        part:           null,
        questionNumber,
        examName:       meta.examName,
        version,
        question:       cleanText(stripAnswerNote(rawQ)),
        options: {
          A: getOpt(iA),
          B: getOpt(iB),
          C: getOpt(iC),
          D: getOpt(iD),
        },
        correctAnswer:  row[iAns] != null ? String(row[iAns]).trim() : '',
        pageReference,
      });
    }
  }

  return allRows;
}

// ─── Parse a single file ───────────────────────────────────────────────────────

function parseFile(filePath) {
  console.log(`\n  📄 ${path.basename(filePath)}`);

  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const format   = detectFormat(workbook);

  console.log(`    Format: ${format}`);

  if (format === 'FORMAT_A') return parseFormatA(workbook);
  if (format === 'FORMAT_B') return parseFormatB(workbook, filePath);

  throw new Error(`Unrecognized Excel format in: ${path.basename(filePath)}`);
}

// ─── Seed Runner ───────────────────────────────────────────────────────────────

async function seedExamQanda() {
  try {
    // 1. Discover files
    const files = resolveExcelFiles();

    // 2. Parse all files
    console.log('\n── Parsing ─────────────────────────────────────────────────────');
    let allDocs = [];
    for (const filePath of files) {
      const docs = parseFile(filePath);
      allDocs = allDocs.concat(docs);
    }

    if (allDocs.length === 0) {
      throw new Error('No valid rows parsed. Check your Excel column headers match the expected format.');
    }

    console.log(`\n✓ Total parsed: ${allDocs.length} questions from ${files.length} file(s)`);

    // 3. Clear existing records per courseType
    const courseTypes = [...new Set(allDocs.map(d => d.courseType))];
    console.log('\n── Seeding Database ────────────────────────────────────────────');
    for (const ct of courseTypes) {
      await ExamQanda.deleteMany({ courseType: ct });
      console.log(`  ✓ Cleared existing records for courseType="${ct}"`);
    }

    // 4. Insert
    const inserted = await ExamQanda.insertMany(allDocs, { ordered: false });
    console.log(`  ✓ Inserted ${inserted.length} records`);

    // 5. Summary
    const summary = allDocs.reduce((acc, q) => {
      const key = `${q.courseType.padEnd(4)} | ${q.courseGroup.padEnd(10)} | ${q.examName.padEnd(36)} — ${q.version}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    console.log('\n── Insert Summary ──────────────────────────────────────────────');
    Object.entries(summary).sort().forEach(([key, count]) => {
      console.log(`  ${String(count).padStart(3)} Qs  →  ${key}`);
    });
    console.log('────────────────────────────────────────────────────────────────');
    console.log(`  TOTAL: ${inserted.length} questions\n`);

  } catch (err) {
    console.error('\n✗ Seed failed:', err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedExamQanda();