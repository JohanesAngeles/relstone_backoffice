require('dotenv').config();
const { adminDB } = require('../config/db');
const DREApproval = require('../models/DREApproval');

// ── DRE Approval Schedule ─────────────────────────────────────
// Source of truth: DRE_CERT_Approval_Numbers.xlsx
// courseKey  → used for title-to-key mapping in the lookup route
// courseTitle → human-readable label
const dreApprovals = [

  // ── AGENCY ────────────────────────────────────────────────────────────────
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1044', begDate: '2005-03-20', endDate: '2007-03-19' },
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1052', begDate: '2007-03-20', endDate: '2009-03-19' },
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1060', begDate: '2009-03-17', endDate: '2011-03-16' },
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1070', begDate: '2011-03-17', endDate: '2013-03-16' },
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1079', begDate: '2013-03-17', endDate: '2015-03-16' },
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1091', begDate: '2015-03-17', endDate: '2017-03-16' },
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1100', begDate: '2017-03-17', endDate: '2019-03-16' },
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1110', begDate: '2019-03-17', endDate: '2021-03-16' },
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1122', begDate: '2021-03-17', endDate: '2023-03-16' },
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1132', begDate: '2023-03-17', endDate: '2025-03-16' },
  { courseKey: 'AGENCY', courseTitle: 'Agency', dreNumber: '1035-1144', begDate: '2025-03-17', endDate: '2027-03-16' },

  // ── TRUST FUND ────────────────────────────────────────────────────────────
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1048', begDate: '2005-04-01', endDate: '2007-03-31' },
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1054', begDate: '2007-04-01', endDate: '2009-03-31' },
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1061', begDate: '2009-03-17', endDate: '2011-03-16' },
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1071', begDate: '2011-03-17', endDate: '2013-03-16' },
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1081', begDate: '2013-03-17', endDate: '2015-03-16' },
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1089', begDate: '2015-03-17', endDate: '2017-03-16' },
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1099', begDate: '2017-03-17', endDate: '2019-03-16' },
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1113', begDate: '2019-03-17', endDate: '2021-03-16' },
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1121', begDate: '2021-03-17', endDate: '2023-03-16' },
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1133', begDate: '2023-03-17', endDate: '2025-03-20' },
  { courseKey: 'TRUST_FUND', courseTitle: 'Trust Fund Accounting and Handling', dreNumber: '1035-1143', begDate: '2025-03-17', endDate: '2027-03-20' },

  // ── FAIR HOUSING ──────────────────────────────────────────────────────────
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1045', begDate: '2005-03-25', endDate: '2007-03-24' },
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1053', begDate: '2007-03-25', endDate: '2009-03-24' },
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1062', begDate: '2009-03-17', endDate: '2011-03-16' },
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1072', begDate: '2011-03-17', endDate: '2013-03-16' },
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1080', begDate: '2013-03-17', endDate: '2015-03-16' },
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1090', begDate: '2015-03-17', endDate: '2017-03-16' },
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1101', begDate: '2017-03-17', endDate: '2019-03-16' },
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1112', begDate: '2019-03-17', endDate: '2021-03-16' },
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1123', begDate: '2021-03-17', endDate: '2022-12-20' },
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1129', begDate: '2022-12-21', endDate: '2024-12-20' },
  { courseKey: 'FAIR_HOUSING', courseTitle: 'Fair Housing', dreNumber: '1035-1140', begDate: '2025-01-08', endDate: '2026-01-07' },

  // ── RISK MANAGEMENT ───────────────────────────────────────────────────────
  { courseKey: 'RISK_MGMT', courseTitle: 'Risk Management for Real Estate Professionals', dreNumber: '1035-1051', begDate: '2006-03-19', endDate: '2008-12-18' },
  { courseKey: 'RISK_MGMT', courseTitle: 'Risk Management for Real Estate Professionals', dreNumber: '1035-1067', begDate: '2008-12-19', endDate: '2010-12-18' },
  { courseKey: 'RISK_MGMT', courseTitle: 'Risk Management for Real Estate Professionals', dreNumber: '1035-1069', begDate: '2010-12-19', endDate: '2012-12-18' },
  { courseKey: 'RISK_MGMT', courseTitle: 'Risk Management for Real Estate Professionals', dreNumber: '1035-1078', begDate: '2012-12-19', endDate: '2014-12-18' },
  { courseKey: 'RISK_MGMT', courseTitle: 'Risk Management for Real Estate Professionals', dreNumber: '1035-1088', begDate: '2014-12-19', endDate: '2016-12-18' },
  { courseKey: 'RISK_MGMT', courseTitle: 'Risk Management for Real Estate Professionals', dreNumber: '1035-1098', begDate: '2016-12-19', endDate: '2018-12-18' },
  { courseKey: 'RISK_MGMT', courseTitle: 'Risk Management for Real Estate Professionals', dreNumber: '1035-1108', begDate: '2018-12-19', endDate: '2020-12-18' },
  { courseKey: 'RISK_MGMT', courseTitle: 'Risk Management for Real Estate Professionals', dreNumber: '1035-1118', begDate: '2021-02-22', endDate: '2023-02-23' }, // ✅ FIXED: was 2023-02-21
  { courseKey: 'RISK_MGMT', courseTitle: 'Risk Management for Real Estate Professionals', dreNumber: '1035-1131', begDate: '2023-02-22', endDate: '2025-02-21' },
  { courseKey: 'RISK_MGMT', courseTitle: 'Risk Management for Real Estate Professionals', dreNumber: '1035-1142', begDate: '2025-02-22', endDate: '2027-02-21' },

  // ── ETHICS / LEGAL ASPECTS ────────────────────────────────────────────────
  { courseKey: 'ETHICS', courseTitle: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', dreNumber: '1035-1050', begDate: '2006-05-04', endDate: '2008-05-03' }, // ✅ ADDED: was missing
  { courseKey: 'ETHICS', courseTitle: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', dreNumber: '1035-1059', begDate: '2008-05-04', endDate: '2010-05-03' },
  { courseKey: 'ETHICS', courseTitle: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', dreNumber: '1035-1068', begDate: '2010-05-04', endDate: '2012-05-03' },
  { courseKey: 'ETHICS', courseTitle: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', dreNumber: '1035-1077', begDate: '2012-05-04', endDate: '2014-05-03' },
  { courseKey: 'ETHICS', courseTitle: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', dreNumber: '1035-1086', begDate: '2014-05-04', endDate: '2016-05-03' },
  { courseKey: 'ETHICS', courseTitle: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', dreNumber: '1035-1097', begDate: '2016-05-04', endDate: '2018-05-03' },
  { courseKey: 'ETHICS', courseTitle: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', dreNumber: '1035-1107', begDate: '2018-05-04', endDate: '2020-05-03' },
  { courseKey: 'ETHICS', courseTitle: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', dreNumber: '1035-1117', begDate: '2020-05-04', endDate: '2022-05-03' },
  { courseKey: 'ETHICS', courseTitle: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', dreNumber: '1035-1127', begDate: '2022-05-04', endDate: '2024-05-03' },
  { courseKey: 'ETHICS', courseTitle: 'Ethics, Professional Conduct and Legal Aspects of Real Estate', dreNumber: '1035-1138', begDate: '2024-05-04', endDate: '2026-05-03' },

  // ── IMPLICIT BIAS ─────────────────────────────────────────────────────────
  { courseKey: 'IMPLICIT_BIAS', courseTitle: 'Implicit Bias', dreNumber: '1035-1128', begDate: '2022-11-18', endDate: '2024-11-17' },
  { courseKey: 'IMPLICIT_BIAS', courseTitle: 'Implicit Bias', dreNumber: '1035-1139', begDate: '2024-11-18', endDate: '2026-11-17' },

  // ── REAL ESTATE MANAGEMENT & SUPERVISION ──────────────────────────────────
  { courseKey: 'RE_MGMT', courseTitle: 'Real Estate Management and Supervision', dreNumber: '1035-1096', begDate: '2015-11-15', endDate: '2017-11-17' },
  { courseKey: 'RE_MGMT', courseTitle: 'Real Estate Management and Supervision', dreNumber: '1035-1106', begDate: '2017-11-18', endDate: '2019-11-17' },
  { courseKey: 'RE_MGMT', courseTitle: 'Real Estate Management and Supervision', dreNumber: '1035-1116', begDate: '2019-11-18', endDate: '2021-11-17' },
  { courseKey: 'RE_MGMT', courseTitle: 'Real Estate Management and Supervision', dreNumber: '1035-1126', begDate: '2021-11-18', endDate: '2023-11-17' },
  { courseKey: 'RE_MGMT', courseTitle: 'Real Estate Management and Supervision', dreNumber: '1035-1137', begDate: '2023-11-18', endDate: '2025-11-17' },
  { courseKey: 'RE_MGMT', courseTitle: 'Real Estate Management and Supervision', dreNumber: '1035-1148', begDate: '2025-11-18', endDate: '2027-11-17' },

  // ── SELLING BUSINESS OPPORTUNITIES - PART 1 ───────────────────────────────
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1049', begDate: '2005-04-14', endDate: '2007-04-13' },
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1057', begDate: '2007-04-14', endDate: '2009-04-13' },
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1063', begDate: '2009-03-17', endDate: '2011-03-16' },
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1073', begDate: '2011-03-17', endDate: '2013-03-16' },
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1082', begDate: '2013-03-17', endDate: '2015-03-16' },
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1092', begDate: '2015-03-17', endDate: '2017-03-16' },
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1102', begDate: '2017-03-17', endDate: '2019-03-16' },
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1111', begDate: '2019-03-17', endDate: '2021-03-16' },
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1120', begDate: '2021-03-17', endDate: '2023-03-16' },
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1134', begDate: '2023-04-14', endDate: '2025-04-13' },
  { courseKey: 'SELL_BIZ_1', courseTitle: 'Selling Business Opportunities - Part 1', dreNumber: '1035-1145', begDate: '2025-04-14', endDate: '2027-04-13' },

  // ── SELLING BUSINESS OPPORTUNITIES - PART 2 ───────────────────────────────
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1046', begDate: '2005-04-01', endDate: '2007-03-31' },
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1055', begDate: '2007-04-01', endDate: '2009-03-31' },
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1064', begDate: '2009-03-17', endDate: '2011-03-16' },
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1074', begDate: '2011-03-17', endDate: '2013-03-16' },
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1083', begDate: '2013-03-17', endDate: '2015-03-16' },
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1093', begDate: '2015-03-17', endDate: '2017-03-16' },
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1103', begDate: '2017-02-17', endDate: '2019-02-16' },
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1109', begDate: '2019-02-17', endDate: '2021-02-16' },
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1119', begDate: '2021-02-17', endDate: '2023-02-16' },
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1130', begDate: '2023-02-17', endDate: '2025-02-16' },
  { courseKey: 'SELL_BIZ_2', courseTitle: 'Selling Business Opportunities - Part 2', dreNumber: '1035-1141', begDate: '2025-02-18', endDate: '2027-02-17' },

  // ── MORTGAGE LENDING - PART 1 ─────────────────────────────────────────────
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1047', begDate: '2005-04-01', endDate: '2007-03-31' },
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1056', begDate: '2007-04-01', endDate: '2009-03-31' },
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1065', begDate: '2009-03-17', endDate: '2011-03-16' },
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1075', begDate: '2011-03-17', endDate: '2013-03-16' },
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1084', begDate: '2013-03-17', endDate: '2015-03-16' },
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1094', begDate: '2015-06-04', endDate: '2017-06-03' },
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1104', begDate: '2017-06-04', endDate: '2019-06-03' },
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1114', begDate: '2019-06-04', endDate: '2021-06-03' },
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1124', begDate: '2021-06-04', endDate: '2023-06-03' },
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1135', begDate: '2023-06-01', endDate: '2025-05-31' },
  { courseKey: 'MTG_1', courseTitle: 'Mortgage Lending - Part 1', dreNumber: '1035-1146', begDate: '2025-06-01', endDate: '2027-05-31' },

  // ── MORTGAGE LENDING - PART 2 ─────────────────────────────────────────────
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1042', begDate: '2005-03-25', endDate: '2007-03-24' },
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1058', begDate: '2007-03-25', endDate: '2009-03-24' },
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1066', begDate: '2009-03-17', endDate: '2011-03-16' },
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1076', begDate: '2011-03-17', endDate: '2013-03-16' },
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1085', begDate: '2013-03-17', endDate: '2015-03-16' },
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1095', begDate: '2015-07-15', endDate: '2017-07-14' },
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1105', begDate: '2017-07-15', endDate: '2019-07-02' },
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1115', begDate: '2019-07-15', endDate: '2021-07-02' },
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1125', begDate: '2021-07-03', endDate: '2023-07-02' },
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1136', begDate: '2023-07-03', endDate: '2024-07-02' },
  { courseKey: 'MTG_2', courseTitle: 'Mortgage Lending - Part 2', dreNumber: '1035-1147', begDate: '2025-07-03', endDate: '2027-07-02' },
];

// ── Run Seed ──────────────────────────────────────────────────
const seed = async () => {
  try {
    // Wait for adminDB to be ready
    await new Promise((resolve, reject) => {
      if (adminDB.readyState === 1) return resolve();
      adminDB.once('connected', resolve);
      adminDB.once('error', reject);
    });
    console.log('✅ Connected to Admin DB');

    // Clear existing DRE approvals
    await DREApproval.deleteMany({});
    console.log('🗑️  Cleared existing DRE approvals');

    // Insert fresh data
    await DREApproval.insertMany(dreApprovals);

    console.log('🌱 DRE Approvals seeded successfully!');
    console.log(`   → ${dreApprovals.length} approval records inserted`);
    console.log(`   → Courses: AGENCY, TRUST_FUND, FAIR_HOUSING, RISK_MGMT, ETHICS,`);
    console.log(`              IMPLICIT_BIAS, RE_MGMT, SELL_BIZ_1, SELL_BIZ_2, MTG_1, MTG_2`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();