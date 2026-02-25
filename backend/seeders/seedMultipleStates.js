require('dotenv').config();
const mongoose = require('mongoose');
const { webDB } = require('../config/db');
const State = require('../models/State');
const Course = require('../models/Course');
const Package = require('../models/Package');

// ─────────────────────────────────────────────────────────────────
// TENNESSEE
// ─────────────────────────────────────────────────────────────────
const tennesseeState = {
  name: 'Tennessee',
  slug: 'tennessee',
  providerInfo: 'Insurance School Of Tennessee, Approved Cont. Ed. Provider #1064',
  heroTitle: 'Tennessee Insurance Continuing Education Courses',
  introBullets: [
    'EASIER EXAMS: Fewer questions. (Retake once for up to a year.)',
    "BEST VALUE: We'll beat any other school's advertised price.",
    'GREAT REVIEWS: Our students return year after year.',
    'PROVEN EXCEPTIONAL SUPPORT: A real person available by phone 7 days a week, 6am to 10pm PST.',
    'RISK FREE: 30-day money back guarantee.',
    'Over 4,000,000+ CE courses successfully completed across the U.S. with Relstone since 1974!',
  ],
  ceBullets: [
    'All 24 Hours Approved Tennessee Insurance CE including 3 Hours Ethics to renew your TN Insurance License!',
    'Finish all 24 Hours with only two easy courses!',
    'Up to 12 Credit Hours may be carried over to the next reporting period!',
    'Final Exam Online or on Paper!',
    'Pay only for the hours you need!',
    'No time wasted from your job, driving to and from a classroom or seminar!',
    'Finish in one afternoon from the comfort of your own home or office!',
    'All prices INCLUDE the $1/Credit Hour Fee to report completion of your course to the state!',
  ],
  requirements: {
    producerHours: '24 Hours / 2 Years',
    producerEthicsHours: 'Including 3 hours of Ethics',
    serviceRepHours: 'Public Adjusters: 24 hours including 3 Ethics every 2 years',
    serviceRepEthicsHours: '3 hours Ethics required',
    renewalDeadline: 'Expiration date falls on last day of birth month every 2 years.',
    carryOverHours: 'Up to 12 excess credit hours may be carried forward to the next renewal period.',
    notes: [
      'Effective January 1, 2009: 24 hours including 3 Ethics every 2 years.',
      'Exemption: producer licensed continuously since 1994 with NO interruptions in license.',
      'Exams are non-monitored.',
      'Courses are repeatable every 3 years.',
      'Late status: producers have up to 1 year to complete CE; license is inactive during this time.',
      'Late fee: $60 + original $60 renewal fee. Once CE completed and fees paid, license reinstated.',
      'Course provider reports using SBS online system with $1 per credit processing fee.',
    ],
  },
  examInstructions: {
    online: [
      'Exams are non-monitored — no proctor required.',
      'Complete your exam online at your own pace.',
      'Upon completion, your certificate will be available for immediate download.',
      'Course provider reports using SBS online system.',
    ],
    faxInfo: 'No fax required for Tennessee — exams are non-monitored.',
  },
  metaDescription: 'Complete your Tennessee Insurance Continuing Education online. State-approved courses, instant certificate delivery, and affordable pricing.',
};

const tennesseeCourses = [
  { stateSlug: 'tennessee', name: 'Tennessee: Business Continuation Insurance', shortName: 'Business Continuation Insurance', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 160.00, creditHours: 12, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 1 },
  { stateSlug: 'tennessee', name: 'Tennessee: Insurance Ethics Training [Prop/Cas]', shortName: 'Insurance Ethics Training [Prop/Cas]', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 39.00, creditHours: 4, courseType: 'Ethics', hasPrintedTextbook: false, printedTextbookPrice: 6.00, sortOrder: 2 },
  { stateSlug: 'tennessee', name: 'Tennessee: Legal Concepts of Insurance [Prop/Cas]', shortName: 'Legal Concepts of Insurance [Prop/Cas]', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 3 },
  { stateSlug: 'tennessee', name: 'Tennessee: Law and the Insurance Contract [Prop/Cas]', shortName: 'Law and the Insurance Contract [Prop/Cas]', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 4 },
  { stateSlug: 'tennessee', name: 'Tennessee: Insurance Laws in the US [Prop/Cas]', shortName: 'Insurance Laws in the US [Prop/Cas]', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 5 },
  { stateSlug: 'tennessee', name: 'Tennessee: Concepts of Disability Income [Prop/Cas]', shortName: 'Concepts of Disability Income [Prop/Cas]', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 6 },
  { stateSlug: 'tennessee', name: 'Tennessee: Agent Ethics & Responsibilities [Prop/Cas]', shortName: 'Agent Ethics & Responsibilities [Prop/Cas]', description: 'Tennessee state-approved insurance continuing education course. 12 Hours — Life/Ethics/Acc & Health/Annuities/Var. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'Ethics', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 7 },
  { stateSlug: 'tennessee', name: 'Tennessee: Insurance Ethics Training', shortName: 'Insurance Ethics Training', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 39.00, creditHours: 4, courseType: 'Ethics', hasPrintedTextbook: false, printedTextbookPrice: 6.00, sortOrder: 8 },
  { stateSlug: 'tennessee', name: 'Tennessee: Long Term Care Insurance in the U.S.', shortName: 'Long Term Care Insurance in the U.S.', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 69.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 9 },
  { stateSlug: 'tennessee', name: 'Tennessee: Policy Premium Laws in America', shortName: 'Policy Premium Laws in America', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 10 },
  { stateSlug: 'tennessee', name: 'Tennessee: Life, Accident & Health Insurance', shortName: 'Life, Accident & Health Insurance', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 11 },
  { stateSlug: 'tennessee', name: 'Tennessee: Legal Concepts of Insurance', shortName: 'Legal Concepts of Insurance', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 12 },
  { stateSlug: 'tennessee', name: 'Tennessee: Law and the Insurance Contract', shortName: 'Law and the Insurance Contract', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 13 },
  { stateSlug: 'tennessee', name: 'Tennessee: Insurance Laws in the US', shortName: 'Insurance Laws in the US', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 14 },
  { stateSlug: 'tennessee', name: 'Tennessee: Concepts of Disability Income Insurance', shortName: 'Concepts of Disability Income Insurance', description: 'Tennessee state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 15 },
  { stateSlug: 'tennessee', name: 'Tennessee: Agent Ethics & Responsibilities', shortName: 'Agent Ethics & Responsibilities', description: 'Tennessee state-approved insurance continuing education course. 12 Hours — Life/Ethics/Acc & Health/Annuities/Var. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'Ethics', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 16 },
];

const tennesseePackages = [
  { stateSlug: 'tennessee', name: 'Tennessee Insurance CE: Combo 1', coursesIncluded: ['Agent Ethics & Responsibilities', 'Life, Accident & Health Insurance'], totalHours: 24, price: 98.00, sortOrder: 1 },
  { stateSlug: 'tennessee', name: 'Tennessee Insurance CE: Combo 2', coursesIncluded: ['Agent Ethics & Responsibilities', 'Insurance Laws in the US [Prop/Cas]'], totalHours: 24, price: 98.00, sortOrder: 2 },
];

// ─────────────────────────────────────────────────────────────────
// TEXAS
// ─────────────────────────────────────────────────────────────────
const texasState = {
  name: 'Texas',
  slug: 'texas',
  providerInfo: 'Insurance School Of Texas, Approved Cont. Ed. Provider #32355 (Registered Name: "C.E. Credits, Inc.")',
  heroTitle: 'Texas Insurance Continuing Education Courses',
  introBullets: [
    'EASIER EXAMS: Fewer questions. (Retake once for up to a year.)',
    "BEST VALUE: We'll beat any other school's advertised price.",
    'GREAT REVIEWS: Our students return year after year.',
    'EXCEPTIONAL SUPPORT: Reach a real person by phone 7 days a week, 6am to 10pm PST.',
    'COMPLETELY RISK FREE: 30-day money back guarantee.',
    'Over 4,000,000+ CE courses successfully completed across the U.S. with Relstone since 1974.',
  ],
  ceBullets: [
    'All Approved Continuing Education for TDI Texas Insurance License Renewal!',
    'Fast and easy Open-Book Final Exam Online or on Paper.',
    'Note: Texas Agent & Adjuster Ethics and Responsibilities 15 Hrs. Classroom Equivalent Course May be Taken ONLY Online.',
    'Finish up to 24 Texas insurance CE Credit Hours, including required 2 Hrs Ethics and 15 Hrs Classroom Equivalent, with only 2 courses!',
    'No time wasted from your job, driving to and from a classroom or seminar!',
    'All prices INCLUDE the $0.75/Credit Hour fee to report completion of your course to the state!',
  ],
  requirements: {
    producerHours: '24 Hours / 2 Years',
    producerEthicsHours: 'Including 2 Hours of Ethics + 15 Hours Classroom Equivalent',
    serviceRepHours: 'Same (LAH, PC, MGA, LH Counselors, all adjusters including public adjusters)',
    serviceRepEthicsHours: '2 hours Ethics required',
    renewalDeadline: 'No CE grace period. Once expiration date has passed, a violation exists. CE cannot be made up after expiration.',
    carryOverHours: 'N/A — no grace period; $50 fine per deficient hour.',
    notes: [
      'All Agents require 24 Hours Total: 2 Hours Ethics + 15 Hours Classroom Equivalent + remaining Self Study.',
      'General Lines Agents with County Mutual license can renew BOTH licenses with the 24-hour requirement.',
      'Exams are non-monitored.',
      'Students must keep certificates for 5 years in case of audit by Texas Department of Insurance.',
      'Exemption (effective 12/31/2002): 20 years CONTINUOUS licensure (no breaks greater than 90 days) under Texas Insurance Code.',
    ],
  },
  examInstructions: {
    online: [
      'Exams are non-monitored — open book.',
      'Note: Agent & Adjuster Ethics & Responsibilities (15 Hr Classroom Equivalent) must be taken ONLINE only.',
      'Complete your exam online at your own pace.',
      'Upon completion, your certificate will be available for immediate download.',
      'Credits submitted by roster via email to appropriate state insurance department.',
    ],
    faxInfo: 'Paper option: Fax your Final Exam and get results in only 2 Hours. Enjoy Priority Mail delivery of textbooks!',
  },
  metaDescription: 'Complete your Texas Insurance Continuing Education online. State-approved courses, instant certificate delivery, and affordable pricing.',
};

const texasCourses = [
  { stateSlug: 'texas', name: 'Texas: Agent & Adjuster Ethics & Responsibilities', shortName: 'Agent & Adjuster Ethics & Responsibilities', description: 'Texas state-approved insurance continuing education course. 15 Hours Classroom Equivalent (Includes 2 Hours Ethics). Must be taken ONLINE. Instant certificate delivery upon completion.', price: 79.00, creditHours: 15, courseType: 'Ethics', hasPrintedTextbook: false, printedTextbookPrice: 13.00, sortOrder: 1 },
  { stateSlug: 'texas', name: 'Texas Insurance Ethics Training', shortName: 'Insurance Ethics Training', description: 'Texas state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 49.00, creditHours: 4, courseType: 'Ethics', hasPrintedTextbook: false, printedTextbookPrice: 6.00, sortOrder: 2 },
  { stateSlug: 'texas', name: 'Texas Life Accident & Health Insurance', shortName: 'Life Accident & Health Insurance', description: 'Texas state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 59.00, creditHours: 6, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 3 },
  { stateSlug: 'texas', name: 'Texas Insurance Law in the United States', shortName: 'Insurance Law in the United States', description: 'Texas state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 9, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 4 },
];

const texasPackages = [
  { stateSlug: 'texas', name: 'Texas Insurance CE: Combo 1', coursesIncluded: ['Agent & Adjuster Ethics & Responsibilities (ONLINE Classroom Equiv.)', 'Life, Accident & Health BASICS', 'Insurance Ethics Training'], totalHours: 24, price: 130.00, sortOrder: 1 },
  { stateSlug: 'texas', name: 'Texas Insurance CE: Combo 2', coursesIncluded: ['Agent & Adjuster Ethics & Responsibilities (ONLINE Classroom Equiv.)', 'Insurance Laws in the US'], totalHours: 24, price: 132.00, sortOrder: 2 },
];

// ─────────────────────────────────────────────────────────────────
// UTAH
// ─────────────────────────────────────────────────────────────────
const utahState = {
  name: 'Utah',
  slug: 'utah',
  providerInfo: 'Insurance School Of Utah, Approved Cont. Ed. Provider #10382',
  heroTitle: 'Utah Insurance Continuing Education Courses',
  introBullets: [
    'EASIER EXAMS: Fewer questions. (Retake once for up to a year.)',
    "BEST VALUE: We'll beat any other school's advertised price.",
    'GREAT REVIEWS: Students say our courses are well-organized and easy to follow.',
    'EXCEPTIONAL SUPPORT: Talk to a real person by phone 7 days a week, 6am to 10pm PST.',
    'RISK FREE: 30-day money back guarantee.',
    'Over 4,000,000+ CE courses successfully completed across the U.S. with Relstone since 1974!',
  ],
  ceBullets: [
    '3, 6 or 12 Hours Approved Utah Insurance CE, Including Ethics, to renew your UT Insurance License!',
    'Final Exam Online or on Paper!',
    'Pay only for the Utah insurance CE hours you need!',
    'No time wasted from your job, driving to and from a classroom or seminar!',
    'Finish in one afternoon from the comfort of your own home or office!',
    'Note: Only half of the required hours may be by self-study.',
  ],
  requirements: {
    producerHours: '24 Hours / 2 Years (6 hours if licensed 20+ consecutive years)',
    producerEthicsHours: '3 hours of Ethics required (included in 6-hr requirement for 20+ year licensees)',
    serviceRepHours: 'Title producers excluded from requirement.',
    serviceRepEthicsHours: 'N/A',
    renewalDeadline: 'CE due every 2 years based on last day of birth month.',
    carryOverHours: 'Excess credit hours may NOT be carried forward.',
    notes: [
      '12 hours must be classroom or classroom equivalent type courses.',
      '3 hours must be Ethics training; remaining 21 hours can be any line of insurance.',
      'Only HALF of required hours may be self-study.',
      'If licensed 20+ consecutive years: only 6 hours required (3 of which must be Ethics).',
      'Exams are non-monitored.',
      'Courses can only be repeated in a different compliance period.',
      'Course provider responsible for reporting completion to the state.',
      'Producers have 1 year after expiration to renew with reinstatement fee. After 1 year: must reapply and retest.',
    ],
  },
  examInstructions: {
    online: [
      'Exams are non-monitored — no proctor required.',
      'Complete your exam online at your own pace.',
      'Upon completion, your certificate will be available for immediate download.',
      'Course provider responsible for reporting completion to the state.',
    ],
    faxInfo: 'No fax required for Utah — exams are non-monitored.',
  },
  metaDescription: 'Complete your Utah Insurance Continuing Education online. State-approved courses, instant certificate delivery, and affordable pricing.',
};

const utahCourses = [
  { stateSlug: 'utah', name: 'Utah: Insurance Ethics Training', shortName: 'Insurance Ethics Training', description: 'Utah state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 49.00, creditHours: 4, courseType: 'Ethics', hasPrintedTextbook: false, printedTextbookPrice: 6.00, sortOrder: 1 },
  { stateSlug: 'utah', name: 'Utah: Long Term Care Insurance in the U.S.', shortName: 'Long Term Care Insurance in the U.S.', description: 'Utah state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 2 },
  { stateSlug: 'utah', name: 'Utah: Life, Accident & Health Insurance', shortName: 'Life, Accident & Health Insurance', description: 'Utah state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 3 },
  { stateSlug: 'utah', name: 'Utah: Insurance Laws in the US', shortName: 'Insurance Laws in the US', description: 'Utah state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 4 },
  { stateSlug: 'utah', name: 'Utah: Concepts of Disability Income Insurance', shortName: 'Concepts of Disability Income Insurance', description: 'Utah state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 5 },
  { stateSlug: 'utah', name: 'Utah: Policy Premium Laws in America', shortName: 'Policy Premium Laws in America', description: 'Utah state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 6 },
  { stateSlug: 'utah', name: 'Utah: Legal Concepts of Insurance', shortName: 'Legal Concepts of Insurance', description: 'Utah state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 7 },
  { stateSlug: 'utah', name: 'Utah: Law and the Insurance Contract', shortName: 'Law and the Insurance Contract', description: 'Utah state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 8 },
  { stateSlug: 'utah', name: 'Utah: Business Continuation Insurance', shortName: 'Business Continuation Insurance', description: 'Utah state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 9 },
  { stateSlug: 'utah', name: 'Utah: Agent Ethics & Responsibilities', shortName: 'Agent Ethics & Responsibilities', description: 'Utah state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'Ethics', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 10 },
];

const utahPackages = [
  { stateSlug: 'utah', name: 'Utah Insurance CE: Combo 1', coursesIncluded: ['Agent Ethics & Responsibilities', 'Life, Accident & Health Insurance'], totalHours: 12, price: 98.00, sortOrder: 1 },
  { stateSlug: 'utah', name: 'Utah Insurance CE: Combo 2', coursesIncluded: ['Agent Ethics & Responsibilities', 'Law and the Insurance Contract'], totalHours: 12, price: 98.00, sortOrder: 2 },
];

// ─────────────────────────────────────────────────────────────────
// VERMONT
// ─────────────────────────────────────────────────────────────────
const vermontState = {
  name: 'Vermont',
  slug: 'vermont',
  providerInfo: 'Insurance School Of Vermont, Approved Cont. Ed. Provider #500027223',
  heroTitle: 'Vermont Insurance Continuing Education Courses',
  introBullets: [
    'EASIER EXAMS: Fewer questions. (Retake once for up to a year.)',
    "BEST VALUE: We'll beat any other school's advertised price.",
    'GREAT REVIEWS: Students say our courses are well-organized and easy to follow.',
    'EXCEPTIONAL SUPPORT: Talk to a real person by phone 7 days a week, 6am to 10pm PST.',
    'RISK FREE: 30-day money back guarantee.',
    'Over 4,000,000+ CE courses successfully completed across the U.S. with Relstone since 1974!',
  ],
  ceBullets: [
    'All 24 Hours Approved Vermont Insurance Continuing Education including 3 Hours Ethics to renew your VT Insurance License!',
    'Final Exam Online or on Paper!',
    'Pay only for the Vermont insurance CE hours you need!',
    'No time wasted from your job, driving to and from a classroom or seminar!',
    'Finish in one afternoon from the comfort of your own home or office!',
  ],
  requirements: {
    producerHours: '24 Hours / 2 Years',
    producerEthicsHours: 'Including 3 hours of Ethics',
    serviceRepHours: 'N/A (Limited line reps/agents including title, travel accident and baggage are exempt)',
    serviceRepEthicsHours: 'N/A',
    renewalDeadline: 'Future compliance periods end during odd-numbered years on March 31.',
    carryOverHours: 'Excess credit hours may NOT be carried forward.',
    notes: [
      'P&C producers have a one-time requirement for 3 hours on National Flood Insurance Program (not offered).',
      'Those newly licensed are exempt from CE requirement.',
      'Exams must be monitored by a disinterested third party — CLOSED book exam.',
      'Courses are repeatable every renewal period.',
      'Provider reports credits to Sircon including $1.50 per credit fee.',
      'Non-renewal for CE failure: must submit new NAIC Uniform application + $30 application fee + $30 license fee + CE compliance certificates.',
    ],
  },
  examInstructions: {
    online: [
      'Self-study courses require a proctored, CLOSED book examination — no course material or personal notes allowed.',
      'For internet exams, test proctor must witness the student accessing the examination.',
      'Proctor must be present during entire length of final exam.',
      'After submitting exam online, print the Affidavit for Test Administrator form and have proctor sign it.',
      'Fax signed Affidavit to 619-222-8593.',
      'Upon receipt, you will get access to print your certificate of completion within 2 hours.',
    ],
    faxInfo: 'Fax Your Test Administrator Affidavit to 619-222-8593 and Get Results in Only 2 Hours!',
  },
  metaDescription: 'Complete your Vermont Insurance Continuing Education online. State-approved courses, instant certificate delivery, and affordable pricing.',
};

const vermontCourses = [
  { stateSlug: 'vermont', name: 'Vermont Insurance CE: Policy Premium Laws in America', shortName: 'Policy Premium Laws in America', description: 'Vermont state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 1 },
  { stateSlug: 'vermont', name: 'Vermont Insurance CE: Agent Ethics & Responsibilities', shortName: 'Agent Ethics & Responsibilities', description: 'Vermont state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'Ethics', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 2 },
];

const vermontPackages = [
  { stateSlug: 'vermont', name: 'Vermont Insurance CE: Combo 1', coursesIncluded: ['Agent Ethics & Responsibilities', 'Policy Premium Laws in America'], totalHours: 24, price: 98.00, sortOrder: 1 },
];

// ─────────────────────────────────────────────────────────────────
// VIRGINIA
// ─────────────────────────────────────────────────────────────────
const virginiaState = {
  name: 'Virginia',
  slug: 'virginia',
  providerInfo: 'Insurance School Of Virginia, Approved Cont. Ed. Provider #124167',
  heroTitle: 'Virginia Insurance Continuing Education Courses',
  introBullets: [
    'EASIER EXAMS: Fewer questions. (Retake once for up to a year.)',
    "BEST VALUE: We'll beat any other school's advertised price.",
    'GREAT REVIEWS: Our students return year after year.',
    'OUTSTANDING SUPPORT: A real person available by phone 7 days a week, 6am to 10pm PST.',
    'RISK FREE: 30-day money back guarantee.',
    'Over 4,000,000+ CE courses completed across the U.S. with Relstone since 1974!',
  ],
  ceBullets: [
    'Finish 16 Hours of Continuing Education with only ONE easy self-study course!',
    'Final Exam Online or on Paper!',
    'Pay only for the hours you need!',
    'No time wasted from your job, driving to and from a classroom or seminar!',
    'Finish in one afternoon from the comfort of your own home or office!',
  ],
  requirements: {
    producerHours: '16 Hours / 2 Years (single license) | 24 Hours / 2 Years (two license types)',
    producerEthicsHours: '3 hours Ethics required (may include VA laws and regulations)',
    serviceRepHours: 'Special 16-hour rule: Life & Annuities + Health holders, or L&A and/or Health + P&C holders = still only 16 hours total',
    serviceRepEthicsHours: '3 hours Ethics/Law & Regulations required',
    renewalDeadline: 'CE compliance and $22 Continuance fee due by November 30. Must be received by Pearson VUE.',
    carryOverHours: 'Unlimited excess credits carry over to next biennium (one biennium to next only).',
    notes: [
      'Dual license holders: 24 hours required; at least 8 hours from each line of insurance.',
      'Self-study exams must be monitored by a disinterested third party. Cannot be co-worker, relative, friend, or acquaintance.',
      'CLOSED BOOK Final exam. After submitting, print Student Certification and Proctor Certification — both must be signed.',
      'Fax certifications to 619-222-8593. Rosters submitted via Vertafore within 7 days of course completion.',
      'No more than 75% of required credits from company/agency course credits.',
      'Agents newly licensed in the second year of a biennium are exempt for that biennium.',
      'Late filing option: pay $22 fee + $100 late penalty by January 31 (next working day if weekend).',
      'Identify yourself using Virginia License Number (VLN) or National Producer Number (NPN) only.',
    ],
  },
  examInstructions: {
    online: [
      'Exam must be proctored by a disinterested third party (notary, librarian, lawyer, supervisor, HR/education personnel, clergy, etc.).',
      'Proctor CANNOT be a co-worker, relative, friend, or acquaintance.',
      'CLOSED BOOK Final — proctor must be present for entire exam.',
      'After submitting exam, print Student Certification and Proctor Certification forms — both student and proctor must sign.',
      'Fax certifications to 619-222-8593.',
      'Upon receipt, you will get access to print your certificate of completion.',
    ],
    faxInfo: 'Fax Signed Student & Proctor Certifications to 619-222-8593 to Receive Your Certificate!',
  },
  metaDescription: 'Complete your Virginia Insurance Continuing Education online. State-approved courses, instant certificate delivery, and affordable pricing.',
};

const virginiaCourses = [
  { stateSlug: 'virginia', name: 'Virginia Insurance CE: Insurance Ethics Training', shortName: 'Insurance Ethics Training', description: 'Virginia state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 49.00, creditHours: 4, courseType: 'Ethics', hasPrintedTextbook: false, printedTextbookPrice: 24.00, sortOrder: 1 },
  { stateSlug: 'virginia', name: 'Virginia Insurance CE: Law and the Insurance Contract', shortName: 'Law and the Insurance Contract', description: 'Virginia state-approved insurance continuing education course. 16 Credits — Law and Regulations. Instant certificate delivery upon completion.', price: 98.00, creditHours: 16, courseType: 'General', hasPrintedTextbook: false, printedTextbookPrice: 24.00, sortOrder: 2 },
  { stateSlug: 'virginia', name: 'Virginia Insurance CE: Life, Accident and Health Insurance', shortName: 'Life, Accident and Health Insurance', description: 'Virginia state-approved insurance continuing education course. 7 Credits — Life/Health. Instant certificate delivery upon completion.', price: 69.00, creditHours: 7, courseType: 'General', hasPrintedTextbook: false, printedTextbookPrice: 24.00, sortOrder: 3 },
  { stateSlug: 'virginia', name: 'Virginia Insurance CE: Policy Premium Laws in America', shortName: 'Policy Premium Laws in America', description: 'Virginia state-approved insurance continuing education course. 12 Credits — Life/Health: 6, Law and Regulations: 6. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'General', hasPrintedTextbook: false, printedTextbookPrice: 24.00, sortOrder: 4 },
];

const virginiaPackages = []; // No packages listed for Virginia

// ─────────────────────────────────────────────────────────────────
// WASHINGTON
// ─────────────────────────────────────────────────────────────────
const washingtonState = {
  name: 'Washington',
  slug: 'washington',
  providerInfo: 'Insurance School Of Washington, Approved Cont. Ed. Provider #031882',
  heroTitle: 'Washington Insurance Continuing Education Courses',
  introBullets: [
    'EASIER EXAMS: Fewer questions. (Retake once for up to a year.)',
    "BEST VALUE: We'll beat any other school's advertised price.",
    'GREAT REVIEWS: Students say our courses are well-organized and easy to follow.',
    'EXCEPTIONAL SUPPORT: Talk to a real person by phone 7 days a week, 6am to 10pm PST.',
    'RISK FREE: 30-day money back guarantee.',
    'Over 4,000,000+ CE courses successfully completed across the U.S. with Relstone since 1974!',
  ],
  ceBullets: [
    'All 24 Hours Approved Washington Insurance CE including 3 Hours Ethics to renew your WA Insurance License!',
    'Final Exam Online or on Paper!',
    'Pay only for the Washington Insurance CE hours you need!',
    'No time wasted from your job, driving to and from a classroom or seminar!',
    'Finish in one afternoon from the comfort of your own home or office!',
  ],
  requirements: {
    producerHours: '24 Hours / 2 Years',
    producerEthicsHours: 'Including 3 hours of Ethics',
    serviceRepHours: 'N/A',
    serviceRepEthicsHours: 'N/A',
    renewalDeadline: 'CE due every 2 years based on birth month. New licenses: CE due 1 year from next birthday after licensing.',
    carryOverHours: 'Cannot carry over excess hours.',
    notes: [
      'Agents can take any course regardless of which line they hold (4 lines: life, disability, property, casualty).',
      'Courses repeatable every 2 years, once each license renewal period.',
      'Exams are non-monitored.',
      'Both student and course provider are responsible for reporting course completion to the state.',
      'Within 60 days before/after expiration: may renew (late renewal fees apply after expiration).',
      '61 days to 12 months past expiration: must reinstate license (additional reinstatement fees apply).',
    ],
  },
  examInstructions: {
    online: [
      'Exams are non-monitored — no proctor required.',
      'Complete your exam online at your own pace.',
      'Upon completion, your certificate will be available for immediate download.',
      'Both student and course provider are responsible for reporting completion to the state.',
    ],
    faxInfo: 'No fax required for Washington — exams are non-monitored.',
  },
  metaDescription: 'Complete your Washington Insurance Continuing Education online. State-approved courses, instant certificate delivery, and affordable pricing.',
};

const washingtonCourses = [
  { stateSlug: 'washington', name: 'Washington Insurance CE: Insurance Ethics Training', shortName: 'Insurance Ethics Training', description: 'Washington state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 49.00, creditHours: 4, courseType: 'Ethics', hasPrintedTextbook: false, printedTextbookPrice: 6.00, sortOrder: 1 },
  { stateSlug: 'washington', name: 'Washington Insurance CE: Legal Concepts of Insurance', shortName: 'Legal Concepts of Insurance', description: 'Washington state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 129.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: false, printedTextbookPrice: 0, sortOrder: 2 },
  { stateSlug: 'washington', name: 'Washington Insurance CE: Law and the Insurance Contract', shortName: 'Law and the Insurance Contract', description: 'Washington state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 99.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: false, printedTextbookPrice: 0, sortOrder: 3 },
  { stateSlug: 'washington', name: 'Washington Insurance CE: Agent Ethics & Responsibilities', shortName: 'Agent Ethics & Responsibilities', description: 'Washington state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 8, courseType: 'Ethics', hasPrintedTextbook: false, printedTextbookPrice: 0, sortOrder: 4 },
  { stateSlug: 'washington', name: 'Washington Insurance CE: Concepts of Disability Income Insurance', shortName: 'Concepts of Disability Income Insurance', description: 'Washington state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 95.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: false, printedTextbookPrice: 0, sortOrder: 5 },
  { stateSlug: 'washington', name: 'Washington Insurance CE: Business Continuation Insurance', shortName: 'Business Continuation Insurance', description: 'Washington state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 129.00, creditHours: 8, courseType: 'General', hasPrintedTextbook: false, printedTextbookPrice: 0, sortOrder: 6 },
];

const washingtonPackages = [
  { stateSlug: 'washington', name: 'Washington: Insurance CE Combo', coursesIncluded: ['Business Continuation Insurance', 'Legal Concepts of Insurance', 'Law and the Insurance Contract', 'Insurance Ethics Training'], totalHours: 24, price: 199.00, sortOrder: 1 },
];

// ─────────────────────────────────────────────────────────────────
// WEST VIRGINIA
// ─────────────────────────────────────────────────────────────────
const westVirginiaState = {
  name: 'West Virginia',
  slug: 'west-virginia',
  providerInfo: 'Insurance School Of West Virginia, Approved Cont. Ed. Provider #S11128',
  heroTitle: 'West Virginia Insurance Continuing Education Courses',
  introBullets: [
    'EASIER EXAMS: Fewer questions. (Retake once for up to a year.)',
    "BEST VALUE: We'll beat any other school's advertised price.",
    'GREAT REVIEWS: Students say our courses are well-organized and easy to follow.',
    'EXCEPTIONAL SUPPORT: Talk to a real person by phone 7 days a week, 6am to 10pm PST.',
    'RISK FREE: 30-day money back guarantee.',
    'Over 4,000,000+ CE courses successfully completed across the U.S. with Relstone since 1974!',
  ],
  ceBullets: [
    'All 24 Hours Approved West Virginia Insurance CE including 3 Hours Ethics to renew your WV Insurance License!',
    'Final Exam Online or on Paper!',
    'Pay only for the West Virginia insurance CE hours you need!',
    'No time wasted from your job, driving to and from a classroom or seminar!',
    'Finish in one afternoon from the comfort of your own home or office!',
  ],
  requirements: {
    producerHours: '24 Hours / 2 Years',
    producerEthicsHours: 'Minimum 3 hours of Ethics',
    serviceRepHours: 'N/A',
    serviceRepEthicsHours: 'N/A',
    renewalDeadline: 'Compliance dates staggered based on birth month every 2 years (last day of birth month).',
    carryOverHours: 'Up to 6 excess hours may carry forward to next 2-year cycle. Excess Ethics credits count as general when carried over.',
    notes: [
      'Producers licensed on/before June 30, 2011: first CE compliance date was June 30, 2012 biennium.',
      'Producers licensed on/after July 1, 2011: must comply by license expiration date.',
      'Exams proctored by disinterested third party — not related by blood/marriage, no business relationship.',
      'Exams are CLOSED book; must pass with 70% or better. Unlimited free retakes until passing.',
      'Courses repeatable every 2 years in different compliance period; not more than once within a 2-year license term.',
      'Course credit hours reported to Sircon once every week on Wednesdays.',
    ],
  },
  examInstructions: {
    online: [
      'Exam must be proctored by a disinterested third party (not related by blood/marriage, no business relationship).',
      'CLOSED book exam — proctor must be present for the entire exam.',
      'Must pass with 70% or better. Unlimited free retakes until passing.',
      'After submitting exam, print the Affidavit for Test Administrator form and have proctor sign it.',
      'Fax signed Affidavit to 619-222-8593.',
      'Upon receipt, you will get access to print your certificate of completion within 2 hours.',
    ],
    faxInfo: 'Fax Your Test Administrator Affidavit to 619-222-8593 and Get Results in Only 2 Hours!',
  },
  metaDescription: 'Complete your West Virginia Insurance Continuing Education online. State-approved courses, instant certificate delivery, and affordable pricing.',
};

const westVirginiaCourses = [
  { stateSlug: 'west-virginia', name: 'West Virginia Insurance CE: Life, Accident and Health Insurance', shortName: 'Life, Accident and Health Insurance', description: 'West Virginia state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 1 },
  { stateSlug: 'west-virginia', name: 'West Virginia Insurance CE: Law and the Insurance Contract', shortName: 'Law and the Insurance Contract', description: 'West Virginia state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 2 },
  { stateSlug: 'west-virginia', name: 'West Virginia Insurance CE: Insurance Ethics Training', shortName: 'Insurance Ethics Training', description: 'West Virginia state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 49.00, creditHours: 4, courseType: 'Ethics', hasPrintedTextbook: false, printedTextbookPrice: 6.00, sortOrder: 3 },
  { stateSlug: 'west-virginia', name: 'West Virginia Insurance CE: Agent Ethics & Responsibilities', shortName: 'Agent Ethics & Responsibilities', description: 'West Virginia state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 79.00, creditHours: 12, courseType: 'Ethics', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 4 },
];

const westVirginiaPackages = [
  { stateSlug: 'west-virginia', name: 'West Virginia: Insurance CE Combo 1', coursesIncluded: ['Agent Ethics & Responsibilities', 'Life, Accident & Health Insurance'], totalHours: 24, price: 199.00, sortOrder: 1 },
  { stateSlug: 'west-virginia', name: 'West Virginia: Insurance CE Combo 2', coursesIncluded: ['Agent Ethics & Responsibilities', 'Law and the Ins. Contract'], totalHours: 24, price: 199.00, sortOrder: 2 },
];

// ─────────────────────────────────────────────────────────────────
// WYOMING
// ─────────────────────────────────────────────────────────────────
const wyomingState = {
  name: 'Wyoming',
  slug: 'wyoming',
  providerInfo: 'Insurance School Of Wyoming, Approved Cont. Ed. Provider #9191',
  heroTitle: 'Wyoming Insurance Continuing Education Courses',
  introBullets: [
    'EASIER EXAMS: Fewer questions. (Retake once for up to a year.)',
    "BEST VALUE: We'll beat any other school's advertised price.",
    'GREAT REVIEWS: Students say our courses are well-organized and easy to follow.',
    'EXCEPTIONAL SUPPORT: Talk to a real person by phone 7 days a week, 6am to 10pm PST.',
    'RISK FREE: 30-day money back guarantee.',
    'Over 4,000,000+ CE courses successfully completed across the U.S. with Relstone since 1974!',
  ],
  ceBullets: [
    'All 24 Hours Approved Wyoming Insurance CE including 3 Hours Ethics to renew your WY Insurance License!',
    'Final Exam Online or on Paper!',
    'Pay only for the Wyoming insurance CE hours you need!',
    'No time wasted from your job, driving to and from a classroom or seminar!',
    'Finish in one afternoon from the comfort of your own home or office!',
  ],
  requirements: {
    producerHours: '24 Hours / 2 Years',
    producerEthicsHours: 'Including 3 hours of Ethics',
    serviceRepHours: 'Non-resident adjusters NOT designating Wyoming as home state: exempt from CE reporting.',
    serviceRepEthicsHours: 'N/A for exempt adjusters',
    renewalDeadline: 'CE filings must be received prior to license expiration. Filing fee: $30 plus applicable renewal fees.',
    carryOverHours: 'Excess credits may NOT be carried forward.',
    notes: [
      'Resident Producers, Resident Adjusters, Non-Resident Adjusters designating WY as home state, and Resident Consultants must comply.',
      'Exams must be monitored by a disinterested third party.',
      'Courses repeatable every 2 years or within a different renewal period.',
      'Both course provider AND licensee responsible for notifying state of course completion.',
      'No grace period — license will lapse if CE not completed and reported by expiration date.',
      'Reinstatement within 12 months: new application + CE Report + filing fee + renewal fee + reinstatement penalty.',
      'Lapsed more than 12 months: treated as new applicant; must reapply, retest, and provide fingerprints.',
    ],
  },
  examInstructions: {
    online: [
      'Exam must be proctored by a disinterested third party.',
      'Proctor must be present during entire length of final exam.',
      'After submitting exam online, print the Affidavit for Test Administrator form and have proctor sign it.',
      'Fax signed Affidavit to 619-222-8593.',
      'Upon receipt, you will get access to print your certificate of completion within 2 hours.',
      'Credits submitted by roster via first class mail to appropriate state insurance department.',
    ],
    faxInfo: 'Fax Your Test Administrator Affidavit to 619-222-8593 and Get Results in Only 2 Hours!',
  },
  metaDescription: 'Complete your Wyoming Insurance Continuing Education online. State-approved courses, instant certificate delivery, and affordable pricing.',
};

const wyomingCourses = [
  { stateSlug: 'wyoming', name: 'Wyoming Insurance CE: Insurance Ethics Training', shortName: 'Insurance Ethics Training', description: 'Wyoming state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 49.00, creditHours: 4, courseType: 'Ethics', hasPrintedTextbook: false, printedTextbookPrice: 6.00, sortOrder: 1 },
  { stateSlug: 'wyoming', name: 'Wyoming Insurance CE: Life, Accident & Health Insurance', shortName: 'Life, Accident & Health Insurance', description: 'Wyoming state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 98.00, creditHours: 12, courseType: 'General', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 2 },
  { stateSlug: 'wyoming', name: 'Wyoming Insurance CE: Agent Ethics & Responsibilities', shortName: 'Agent Ethics & Responsibilities', description: 'Wyoming state-approved insurance continuing education course. Complete your CE requirements online for license renewal. Instant certificate delivery upon completion.', price: 98.00, creditHours: 12, courseType: 'Ethics', hasPrintedTextbook: true, printedTextbookPrice: 13.00, sortOrder: 3 },
];

const wyomingPackages = []; // No packages listed for Wyoming

// ─────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────
const STATES = [
  { state: tennesseeState,   courses: tennesseeCourses,   packages: tennesseePackages },
  { state: texasState,       courses: texasCourses,       packages: texasPackages },
  { state: utahState,        courses: utahCourses,        packages: utahPackages },
  { state: vermontState,     courses: vermontCourses,     packages: vermontPackages },
  { state: virginiaState,    courses: virginiaCourses,    packages: virginiaPackages },
  { state: washingtonState,  courses: washingtonCourses,  packages: washingtonPackages },
  { state: westVirginiaState,courses: westVirginiaCourses,packages: westVirginiaPackages },
  { state: wyomingState,     courses: wyomingCourses,     packages: wyomingPackages },
];

const seed = async () => {
  try {
    await new Promise((resolve, reject) => {
      if (webDB.readyState === 1) return resolve();
      webDB.once('connected', resolve);
      webDB.once('error', reject);
    });
    console.log('✅ Connected to Web DB\n');

    for (const { state, courses, packages } of STATES) {
      await State.deleteOne({ slug: state.slug });
      await Course.deleteMany({ stateSlug: state.slug });
      await Package.deleteMany({ stateSlug: state.slug });

      await State.create(state);
      if (courses.length > 0) await Course.insertMany(courses);
      if (packages.length > 0) await Package.insertMany(packages);

      console.log(`🌱 ${state.name} seeded → ${courses.length} courses, ${packages.length} packages`);
    }

    console.log('\n✅ All states seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();