// importStudents.js
// Run from backend folder: node importStudents.js
// Imports all Students, Orders, and Courses from Excel files into MongoDB

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const { adminDB } = require('./config/db');

// ── MongoDB Models ────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  studentId:     { type: String, unique: true, index: true },
  name:          String,
  companyName:   String,
  mailingAddress:String,
  email:         String,
  dreNumber:     String,
  licenseNumber: String,
  cfpNumber:     String,
  npnNumber:     String,
  workPhone:     String,
  mobilePhone:   String,
  firstOrderDate:String,
  importedAt:    { type: Date, default: Date.now },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  studentId:    { type: String, index: true },
  studentName:  String,
  date:         String,
  orderNumber:  String,
  itemNumber:   String,
  description:  String,
  price:        String,
  discount:     String,
  total:        String,
  importedAt:   { type: Date, default: Date.now },
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
  importedAt:       { type: Date, default: Date.now },
}, { timestamps: true });

const Student = adminDB.model('Student', studentSchema);
const Order   = adminDB.model('Order',   orderSchema);
const Course  = adminDB.model('Course',  courseSchema);

// ── Config ────────────────────────────────────────────────────
const DATA_ROOT = 'C:\\Users\\Alezzandrei Balbuena\\Downloads\\DATA SETS\\Week 1';
const BATCH_SIZE = 200; // insert in batches to avoid memory issues

// ── Helpers ───────────────────────────────────────────────────
const clean = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  // Skip cells that contain raw HTML/table headers (messy Courses sheet)
  if (str.length > 300) return '';
  return str;
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Insert in batches, skip duplicates silently
const batchInsert = async (Model, records, uniqueField) => {
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    try {
      const result = await Model.insertMany(batch, { ordered: false });
      inserted += result.length;
    } catch (err) {
      // ordered: false means it continues on duplicate key errors
      if (err.writeErrors) {
        skipped += err.writeErrors.length;
        inserted += (batch.length - err.writeErrors.length);
      }
    }
  }

  return { inserted, skipped };
};

// ── Parse Students Sheet ──────────────────────────────────────
const parseStudents = (ws) => {
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return rows
    .filter(r => r['Student ID'] && String(r['Student ID']).trim() !== '')
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
    }));
};

// ── Parse Orders Sheet ────────────────────────────────────────
const parseOrders = (ws) => {
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return rows
    .filter(r => r['Student ID'] && r['Order Number'])
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
    }));
};

// ── Parse Courses Sheet ───────────────────────────────────────
const parseCourses = (ws) => {
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return rows
    .filter(r => {
      const id = clean(r['Student ID']);
      const title = clean(r['Course Title']);
      // Filter out rows that are clearly messy HTML scrape artifacts
      return id && title && title.length < 200 && !title.includes('\n');
    })
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
    }));
};

// ── Main ──────────────────────────────────────────────────────
const run = async () => {
  // Wait for DB connection
  await new Promise((resolve) => {
    if (adminDB.readyState === 1) return resolve();
    adminDB.once('connected', resolve);
  });
  console.log('✅ Admin DB connected\n');

  // Get all xlsx files recursively
  const allFiles = [];
  const letters = fs.readdirSync(DATA_ROOT);

  for (const letter of letters) {
    const letterPath = path.join(DATA_ROOT, letter);
    if (!fs.statSync(letterPath).isDirectory()) continue;

    const files = fs.readdirSync(letterPath)
  .filter(f => f.endsWith('.xlsx') && !f.includes('_1-4_'))
  .map(f => path.join(letterPath, f));

    allFiles.push(...files);
  }

  console.log(`📂 Found ${allFiles.length} Excel files across ${letters.length} letters\n`);

  // Totals
  let totalStudents = { inserted: 0, skipped: 0 };
  let totalOrders   = { inserted: 0, skipped: 0 };
  let totalCourses  = { inserted: 0, skipped: 0 };

  // Process each file
  for (let i = 0; i < allFiles.length; i++) {
    const filePath = allFiles[i];
    const fileName = path.basename(filePath);
    console.log(`[${i + 1}/${allFiles.length}] Processing: ${fileName}`);

    try {
      const wb = XLSX.readFile(filePath);

      // ── Students ──
      if (wb.SheetNames.includes('Students')) {
        const students = parseStudents(wb.Sheets['Students']);
        const result = await batchInsert(Student, students, 'studentId');
        totalStudents.inserted += result.inserted;
        totalStudents.skipped  += result.skipped;
        console.log(`   Students: +${result.inserted} inserted, ${result.skipped} skipped (duplicates)`);
      }

      // ── Orders ──
      if (wb.SheetNames.includes('Orders')) {
        const orders = parseOrders(wb.Sheets['Orders']);
        const result = await batchInsert(Order, orders, 'orderNumber');
        totalOrders.inserted += result.inserted;
        totalOrders.skipped  += result.skipped;
        console.log(`   Orders:   +${result.inserted} inserted, ${result.skipped} skipped (duplicates)`);
      }

      // ── Courses ──
      if (wb.SheetNames.includes('Courses')) {
        const courses = parseCourses(wb.Sheets['Courses']);
        const result = await batchInsert(Course, courses, null);
        totalCourses.inserted += result.inserted;
        totalCourses.skipped  += result.skipped;
        console.log(`   Courses:  +${result.inserted} inserted, ${result.skipped} skipped`);
      }

    } catch (err) {
      console.error(`   ❌ Error processing ${fileName}:`, err.message);
    }

    console.log('');
    await sleep(100); // small pause between files
  }

  // ── Summary ──────────────────────────────────────────────────
  console.log('════════════════════════════════════════');
  console.log('✅ IMPORT COMPLETE');
  console.log('════════════════════════════════════════');
  console.log(`Students: ${totalStudents.inserted} inserted, ${totalStudents.skipped} duplicates skipped`);
  console.log(`Orders:   ${totalOrders.inserted} inserted,   ${totalOrders.skipped} duplicates skipped`);
  console.log(`Courses:  ${totalCourses.inserted} inserted,  ${totalCourses.skipped} duplicates skipped`);
  console.log('════════════════════════════════════════');

  process.exit(0);
};

run().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});