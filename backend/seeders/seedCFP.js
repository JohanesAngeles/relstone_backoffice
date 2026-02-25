require('dotenv').config();
const { webDB } = require('../config/db');

// ── We'll store CFP data in its own simple collections ──
// Reuse the same Course + Package models (stateSlug = 'cfp-renewal')
const Course = require('../models/Course');
const Package = require('../models/Package');
const State = require('../models/State');

const cfpState = {
  name: 'CFP Renewal',
  slug: 'cfp-renewal',
  providerInfo: 'Relstone® / Cal-State Exams, Inc. — CFP® Board Sponsor #91',
  heroTitle: 'Online Continuing Education Courses for CFP® Certification Renewal',
  introBullets: [
    'All courses approved for CERTIFIED FINANCIAL PLANNER certification renewal.',
    'Registered with CFP® Board as Sponsor #91.',
    'Triple duty: use same courses for CFP®, insurance license, and CPA renewal.',
    'Complete online or with printed textbooks delivered to you.',
    '30-day money-back guarantee.',
    'Over 4,000,000+ CE courses completed across the U.S. since 1974!',
  ],
  ceBullets: [
    '30 Hours of CE required every 2 years for CFP® certification renewal.',
    '2 of the 30 hours must be from a pre-approved CFP® Code of Ethics and/or Practice Standards program.',
    'Hours may NOT be carried over from one Reporting Period to the next.',
    'Courses may be repeated in a different compliance period.',
    'We report hours completed directly to the CFP® Board every Wednesday.',
    'All prices include the CFP-imposed reporting fee of $1.25 per hour.',
  ],
  requirements: {
    producerHours: '30 Hours / 2 Years',
    producerEthicsHours: '2 hours must be CFP® Code of Ethics and/or Practice Standards (pre-approved program)',
    serviceRepHours: 'N/A',
    serviceRepEthicsHours: 'N/A',
    renewalDeadline: 'Two-year reporting period ending the last day of the CFP® Certificant\'s renewal month.',
    carryOverHours: 'Hours may NOT be carried over from one Reporting Period to the next.',
    notes: [
      'Certificants can check CE hours at www.CFP.net/login.',
      'If all required CE hours are reported by sponsors, no additional self-reporting is needed.',
      'Complete your exam at least 15 days before your renewal date.',
      'Reporting fees effective January 2023: $1.25 per hour (included in all prices).',
      'Grades required: 70% for standard courses; 80% for CFP® Code of Ethics courses.',
      'Find us on the official CFP® website as "Cal-State Exams, Inc."',
      'Can also be used toward insurance license renewal and (in many states) CPA renewal.',
    ],
  },
  examInstructions: {
    online: [
      'Complete courses online at your own pace with no time pressure.',
      'Or choose printed textbooks delivered to you by Priority Mail.',
      'Exams are graded immediately upon online submission.',
      'We report hours directly to the CFP® Board each Wednesday.',
    ],
    faxInfo: 'Questions? Call us at 619-222-2425. Support available 7 days a week.',
  },
  metaDescription: 'Complete your CFP® Certification Renewal online with Relstone. Board-approved courses, triple-duty credits for CFP®, insurance, and CPA. Sponsor #91 since 1974.',
};

const cfpCourses = [
  {
    stateSlug: 'cfp-renewal',
    name: 'CFP CE: Ethics and Standards',
    shortName: 'Ethics and Standards',
    description: 'CFP CE: Ethics and Standards Online Only — Professional education course from Relstone. State-approved online training with instant certificate delivery. Complete at your own pace.',
    price: 42.00,
    creditHours: 2,
    courseType: 'Ethics',
    hasPrintedTextbook: false,
    printedTextbookPrice: 0,
    sortOrder: 1,
    itemNumber: '2052-18',
    onlineOnly: true,
  },
  {
    stateSlug: 'cfp-renewal',
    name: 'CFP CE: Insurance Law in the U.S., 2nd Ed.',
    shortName: 'Insurance Law in the U.S., 2nd Ed.',
    description: 'CFP CE: Insurance Law in the U.S., 2nd Ed. — Professional education course from Relstone. State-approved online training with instant certificate delivery. Complete at your own pace.',
    price: 108.00,
    creditHours: 14,
    courseType: 'General',
    hasPrintedTextbook: true,
    printedTextbookPrice: 13.00,
    sortOrder: 2,
    itemNumber: '2052-2',
  },
  {
    stateSlug: 'cfp-renewal',
    name: 'CFP CE: Business Continuation Insurance',
    shortName: 'Business Continuation Insurance',
    description: 'CFP CE: Business Continuation Insurance — Professional education course from Relstone. State-approved online training with instant certificate delivery. Complete at your own pace.',
    price: 108.00,
    creditHours: 14,
    courseType: 'General',
    hasPrintedTextbook: true,
    printedTextbookPrice: 13.00,
    sortOrder: 3,
    itemNumber: '2052-1',
  },
];

const cfpPackages = [
  {
    stateSlug: 'cfp-renewal',
    name: 'CFP CE: Renewal Combo for the CFP Professional',
    coursesIncluded: ['Ethics and Standards', 'Insurance Law in the U.S., 2nd Ed.', 'Business Continuation Insurance'],
    totalHours: 30,
    price: 239.00,
    sortOrder: 1,
  },
];

const seed = async () => {
  try {
    await new Promise((resolve, reject) => {
      if (webDB.readyState === 1) return resolve();
      webDB.once('connected', resolve);
      webDB.once('error', reject);
    });
    console.log('✅ Connected to Web DB\n');

    await State.deleteOne({ slug: 'cfp-renewal' });
    await Course.deleteMany({ stateSlug: 'cfp-renewal' });
    await Package.deleteMany({ stateSlug: 'cfp-renewal' });

    await State.create(cfpState);
    await Course.insertMany(cfpCourses);
    await Package.insertMany(cfpPackages);

    console.log(`🌱 CFP Renewal seeded → ${cfpCourses.length} courses, ${cfpPackages.length} packages`);
    console.log('\n✅ CFP Renewal seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();