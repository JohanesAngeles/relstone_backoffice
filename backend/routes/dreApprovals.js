const express = require('express');
const router  = express.Router();
const { protectAdmin } = require('../middleware/adminAuth');
const DREApproval = require('../models/DREApproval');

// ── Course title → courseKey mapping ─────────────────────────
// Maps any variation of a course title string to its canonical key
const getCourseKey = (title = '') => {
  const t = title.toUpperCase();
  if (t.includes('AGENCY'))                                                          return 'AGENCY';
  if (t.includes('TRUST FUND'))                                                      return 'TRUST_FUND';
  if (t.includes('FAIR HOUSING'))                                                    return 'FAIR_HOUSING';
  if (t.includes('RISK MANAGEMENT'))                                                 return 'RISK_MGMT';
  if (t.includes('ETHICS') || t.includes('LEGAL ASPECTS'))                          return 'ETHICS';
  if (t.includes('IMPLICIT BIAS'))                                                   return 'IMPLICIT_BIAS';
  if (t.includes('MANAGEMENT AND SUPERVISION') || t.includes('MGMT AND SUPER'))     return 'RE_MGMT';
  if ((t.includes('SELLING') || t.includes('BUSINESS OPP')) &&
      (t.includes('PART 1') || t.includes('PART I')))                               return 'SELL_BIZ_1';
  if ((t.includes('SELLING') || t.includes('BUSINESS OPP')) &&
      (t.includes('PART 2') || t.includes('PART II')))                              return 'SELL_BIZ_2';
  if (t.includes('MORTGAGE') && (t.includes('PART 1') || t.includes('PART I')))    return 'MTG_1';
  if (t.includes('MORTGAGE') && (t.includes('PART 2') || t.includes('PART II')))   return 'MTG_2';
  return null; // prelicense or unrecognized — no DRE number
};

// ── GET /api/dre-approvals/lookup ─────────────────────────────
// Query params: courseTitle, date (ISO format: YYYY-MM-DD)
// Returns the correct DRE approval number for a course on a given date
// Uses range check: begDate <= date <= endDate (NOT exact match)
router.get('/lookup', protectAdmin, async (req, res) => {
  try {
    const { courseTitle, date } = req.query;

    if (!courseTitle || !date) {
      return res.status(400).json({ message: 'courseTitle and date are required' });
    }

    const courseKey = getCourseKey(courseTitle);
    if (!courseKey) {
      // Prelicense or unrecognized course type — no DRE number exists
      return res.json({
        dreNumber:  null,
        courseKey:  null,
        message:    'No DRE approval number for this course type (prelicense or unrecognized)',
      });
    }

    const lookupDate = new Date(date);
    if (isNaN(lookupDate)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Range lookup: find approval where begDate <= lookupDate <= endDate
    const approval = await DREApproval.findOne({
      courseKey,
      begDate: { $lte: lookupDate },
      endDate: { $gte: lookupDate },
    }).lean();

    if (!approval) {
      return res.json({
        dreNumber:  null,
        courseKey,
        message:    `No DRE approval found for ${courseKey} on ${date}`,
      });
    }

    res.json({
      dreNumber:   approval.dreNumber,
      courseKey:   approval.courseKey,
      courseTitle: approval.courseTitle,
      begDate:     approval.begDate,
      endDate:     approval.endDate,
    });
  } catch (err) {
    console.error('GET /dre-approvals/lookup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/dre-approvals ────────────────────────────────────
// Returns all DRE approvals, optionally filtered by courseKey
router.get('/', protectAdmin, async (req, res) => {
  try {
    const query = {};
    if (req.query.courseKey) query.courseKey = req.query.courseKey;

    const approvals = await DREApproval.find(query)
      .sort({ courseKey: 1, begDate: 1 })
      .lean();

    res.json(approvals);
  } catch (err) {
    console.error('GET /dre-approvals error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;