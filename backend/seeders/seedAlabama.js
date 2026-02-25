require('dotenv').config();
const mongoose = require('mongoose');
const { webDB } = require('../config/db');
const State = require('../models/State');
const Course = require('../models/Course');
const Package = require('../models/Package');

// ── 1. State Data ──────────────────────────────────────────────
const alabamaState = {
  name: 'Alabama',
  slug: 'alabama',
  providerInfo: 'Insurance School Of Alabama, Approved Cont. Ed. Provider #23301042',
  heroTitle: 'Alabama Insurance Continuing Education Courses',
  introBullets: [
    'Fast, Affordable, and Hassle-Free Continuing Education',
    'You can reach a real person by phone 7 days a week, 6am to 10pm PST.',
    "We'll beat any other school's advertised price.",
    '30-day money back guarantee.',
    "Our exams have fewer questions so they're easier to pass.",
    'Retake the exam once for up to a year if needed.',
    'Since 1974, over 4,000,000+ CE courses have been successfully completed across the U.S.',
  ],
  ceBullets: [
    '24 Hours Alabama Approved Insurance CE Credit, including Required Ethics.',
    'Carry over excess Alabama insurance CE credit hours to following renewal!',
    'Easy self-study! Study online or from textbooks delivered by Priority Mail.',
    'Final exam online or on paper!',
    'Pay only for the hours you need!',
    'All Alabama Insurance Continuing Education Requirements are covered, including Ethics Required Hours!',
    'No time wasted from your job or driving to a classroom.',
    'Finish your Alabama insurance CE in one afternoon from home or office.',
    'All Prices INCLUDE the $1/Credit Hour Fee to report completion to the state!',
  ],
  requirements: {
    producerHours: '24 Hours / 2 Years',
    producerEthicsHours: 'At least 3 must be in Ethics for Producers',
    serviceRepHours: '12 Hours / 2 Years',
    serviceRepEthicsHours: 'At least 2 must be in Ethics for Service Representatives',
    renewalDeadline: 'Renew by the last day of their birth month with applicable fees.',
    carryOverHours: 'Up to 24 hours of excess approved CE credits may be carried forward.',
    notes: [
      'Exams must be monitored by an impartial disinterested third-party proctor.',
      'Proctor cannot be a friend, relative, co-worker, or anyone with financial interest.',
      'Approved proctors: attorney, minister, accountant, librarian, or teacher.',
      'Courses are repeatable every 2 years.',
      'All Self-Study hours and correspondence is permitted.',
      'Providers must submit course completion to SBS Online within 10 days.',
    ],
  },
  examInstructions: {
    online: [
      'Exam must be proctored by a disinterested third party.',
      'Proctor must be present during entire length of final exam.',
      'After submitting exam online, print the Affidavit for Test Administrator form and have proctor sign it.',
      'Fax signed Affidavit to 619-222-8593.',
      'Upon receipt, you will get access to print your certificate of completion within 2 hours.',
    ],
    faxInfo: 'Fax Your Test Administrator Affidavit to 619-222-8593 and Get Results in Only 2 Hours!',
  },
  metaDescription:
    'Complete your Alabama Insurance Continuing Education online. State-approved courses, instant certificate delivery, and affordable pricing.',
};

// ── 2. Courses Data ────────────────────────────────────────────
const alabamaCourses = [
  {
    stateSlug: 'alabama',
    name: 'Alabama Insurance CE: Annuity Best Interest Standard',
    shortName: 'Annuity Best Interest Standard',
    description:
      'Alabama state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.',
    price: 49.00,
    creditHours: 4,
    courseType: 'General',
    hasPrintedTextbook: true,
    printedTextbookPrice: 6.00,
    sortOrder: 1,
  },
  {
    stateSlug: 'alabama',
    name: 'Alabama Insurance CE: Insurance Ethics Training',
    shortName: 'Insurance Ethics Training',
    description:
      'Alabama state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.',
    price: 49.00,
    creditHours: 4,
    courseType: 'Ethics',
    hasPrintedTextbook: true,
    printedTextbookPrice: 6.00,
    sortOrder: 2,
  },
  {
    stateSlug: 'alabama',
    name: 'Alabama Insurance CE: Agent Ethics & Responsibilities',
    shortName: 'Agent Ethics & Responsibilities',
    description:
      'Alabama state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.',
    price: 69.00,
    creditHours: 8,
    courseType: 'Ethics',
    hasPrintedTextbook: true,
    printedTextbookPrice: 13.00,
    sortOrder: 3,
  },
  {
    stateSlug: 'alabama',
    name: 'Alabama Insurance CE: Life, Accident & Health Insurance',
    shortName: 'Life, Accident & Health Insurance',
    description:
      'Alabama state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.',
    price: 59.00,
    creditHours: 8,
    courseType: 'General',
    hasPrintedTextbook: true,
    printedTextbookPrice: 13.00,
    sortOrder: 4,
  },
  {
    stateSlug: 'alabama',
    name: 'Alabama Insurance CE: Insurance Laws in the US',
    shortName: 'Insurance Laws in the US',
    description:
      'Alabama state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.',
    price: 59.00,
    creditHours: 8,
    courseType: 'General',
    hasPrintedTextbook: true,
    printedTextbookPrice: 13.00,
    sortOrder: 5,
  },
  {
    stateSlug: 'alabama',
    name: 'Alabama Insurance CE: Law and the Insurance Contract',
    shortName: 'Law and the Insurance Contract',
    description:
      'Alabama state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.',
    price: 59.00,
    creditHours: 8,
    courseType: 'General',
    hasPrintedTextbook: true,
    printedTextbookPrice: 13.00,
    sortOrder: 6,
  },
];

// ── 3. Packages Data ───────────────────────────────────────────
const alabamaPackages = [
  {
    stateSlug: 'alabama',
    name: 'Alabama: Insurance CE Combo 1',
    coursesIncluded: ['Agent Ethics & Responsibilities', 'Life, Accident & Health Insurance'],
    totalHours: 24,
    price: 98.00,
    sortOrder: 1,
  },
  {
    stateSlug: 'alabama',
    name: 'Alabama: Insurance CE Combo 2',
    coursesIncluded: ['Agent Ethics & Responsibilities', 'Insurance Laws in the US'],
    totalHours: 24,
    price: 98.00,
    sortOrder: 2,
  },
];

// ── 4. Run Seed ────────────────────────────────────────────────
const seed = async () => {
  try {
    // Wait for webDB to be ready
    await new Promise((resolve, reject) => {
      if (webDB.readyState === 1) return resolve();
      webDB.once('connected', resolve);
      webDB.once('error', reject);
    });
    console.log('✅ Connected to Web DB');

    // Clear existing Alabama data
    await State.deleteOne({ slug: 'alabama' });
    await Course.deleteMany({ stateSlug: 'alabama' });
    await Package.deleteMany({ stateSlug: 'alabama' });
    console.log('🗑️  Cleared existing Alabama data');

    // Insert fresh data
    await State.create(alabamaState);
    await Course.insertMany(alabamaCourses);
    await Package.insertMany(alabamaPackages);

    console.log('🌱 Alabama seeded successfully!');
    console.log(`   → 1 state`);
    console.log(`   → ${alabamaCourses.length} courses`);
    console.log(`   → ${alabamaPackages.length} packages`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();