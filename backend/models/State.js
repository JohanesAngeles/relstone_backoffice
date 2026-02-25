const mongoose = require('mongoose');
const { webDB } = require('../config/db');

const StateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  providerInfo: { type: String },
  heroTitle: { type: String },
  introBullets: [{ type: String }],
  ceBullets: [{ type: String }],
  requirements: {
    producerHours: { type: String },
    producerEthicsHours: { type: String },
    serviceRepHours: { type: String },
    serviceRepEthicsHours: { type: String },
    renewalDeadline: { type: String },
    carryOverHours: { type: String },
    notes: [{ type: String }],
  },
  examInstructions: {
    online: [{ type: String }],
    faxInfo: { type: String },
  },
  metaDescription: { type: String },
}, { timestamps: true });

module.exports = webDB.model('State', StateSchema);