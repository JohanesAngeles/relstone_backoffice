require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URI = process.env.ADMIN_DB_URI;
if (!MONGO_URI) { console.error('ADMIN_DB_URI not set'); process.exit(1); }
const schema = new mongoose.Schema({ courseCode: { type: String, index: true }, courseTitle: { type: String, required: true }, type: String, hours: Number, stateCode: String, refNumber: String, stateCert: String, certExpiry: String, withinTenYears: String }, { timestamps: true });
const courses = [
  { courseCode: '2006032', courseTitle: 'Agent Ethics and Responsibilities - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10029', stateCert: '94199', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2012233', courseTitle: 'Agent Ethics and Responsibilities - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10660', stateCert: '94199', certExpiry: '03/01/2023', withinTenYears: 'Yes' },
  { courseCode: '2006039', courseTitle: 'Business Continuation Insurance - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10036', stateCert: '94218', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2012240', courseTitle: 'Business Continuation Insurance - CA [11 hrs]', type: 'C.E.', hours: 11, stateCode: 'CA', refNumber: '10667', stateCert: '94218', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2009091', courseTitle: 'California 4-Hour Annuity Training - CA [4 hrs]', type: 'C.E.', hours: 4, stateCode: 'CA', refNumber: '10208', stateCert: '392956', certExpiry: '10/09/2025', withinTenYears: 'Yes' },
  { courseCode: '2009408', courseTitle: 'California 8-Hour Annuity Training - CA [8 hrs]', type: 'C.E.', hours: 8, stateCode: 'CA', refNumber: '10624', stateCert: '294350', certExpiry: '05/29/2013', withinTenYears: 'No' },
  { courseCode: '2009090', courseTitle: 'California Annuity Training 8-Hour Course - CA [8 hrs]', type: 'C.E.', hours: 8, stateCode: 'CA', refNumber: '10207', stateCert: '216282', certExpiry: '01/01/2006', withinTenYears: 'No' },
  { courseCode: '2006034', courseTitle: 'Concepts of Disability - CA [8 hrs]', type: 'C.E.', hours: 8, stateCode: 'CA', refNumber: '10031', stateCert: '94038', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2012235', courseTitle: 'Concepts of Disability - CA [8 hrs]', type: 'C.E.', hours: 8, stateCode: 'CA', refNumber: '10662', stateCert: '94038', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2012185', courseTitle: 'Homeowners Insurance Valuation - CA [3 hrs]', type: 'C.E.', hours: 3, stateCode: 'CA', refNumber: '10594', stateCert: '270747', certExpiry: '11/15/2011', withinTenYears: 'No' },
  { courseCode: '2009329', courseTitle: 'Insurance Ethics Training in California - CA [4 hrs]', type: 'C.E.', hours: 4, stateCode: 'CA', refNumber: '10446', stateCert: '234327', certExpiry: '10/02/2009', withinTenYears: 'No' },
  { courseCode: '2006037', courseTitle: 'Insurance Law in the US - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10034', stateCert: '290632', certExpiry: '03/27/2013', withinTenYears: 'No' },
  { courseCode: '2012236', courseTitle: 'Insurance Law in the US - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10665', stateCert: '290632', certExpiry: '03/27/2013', withinTenYears: 'No' },
  { courseCode: '2006038', courseTitle: 'Law and the Insurance Contract - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10035', stateCert: '290633', certExpiry: '03/27/2013', withinTenYears: 'No' },
  { courseCode: '2012239', courseTitle: 'Law and the Insurance Contract - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10666', stateCert: '290633', certExpiry: '03/27/2013', withinTenYears: 'No' },
  { courseCode: '2006035', courseTitle: 'Legal Concepts of Insurance - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10032', stateCert: '290630', certExpiry: '03/27/2013', withinTenYears: 'No' },
  { courseCode: '2012238', courseTitle: 'Legal Concepts of Insurance - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10663', stateCert: '290630', certExpiry: '03/27/2013', withinTenYears: 'No' },
  { courseCode: '2012237', courseTitle: 'Life, Accident & Health Insurance in the US - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10664', stateCert: '94220', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2006033', courseTitle: 'Policy Premium Laws in America - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10030', stateCert: '290631', certExpiry: '03/27/2013', withinTenYears: 'No' },
  { courseCode: '2012234', courseTitle: 'Policy Premium Laws in America - CA [6 hrs]', type: 'C.E.', hours: 6, stateCode: 'CA', refNumber: '10661', stateCert: '290631', certExpiry: '03/27/2013', withinTenYears: 'No' },
  { courseCode: '2012210', courseTitle: 'Primary Uses of Annuities, Types of Annuities, and the Senior Market - CA [4 hrs]', type: 'C.E.', hours: 4, stateCode: 'CA', refNumber: '10620', stateCert: '392956', certExpiry: '10/09/2025', withinTenYears: 'Yes' },
  { courseCode: '2009025', courseTitle: 'Agent Ethics and Responsibilities - CFP [8.5 hrs]', type: 'C.E.', hours: 8.5, stateCode: 'CFP', refNumber: '10051', stateCert: '1013', certExpiry: '10/17/2023', withinTenYears: 'Yes' },
  { courseCode: '2009037', courseTitle: 'Agent Ethics and Responsibilities - CFP [8.5 hrs]', type: 'C.E.', hours: 8.5, stateCode: 'CFP', refNumber: '10153', stateCert: '1013', certExpiry: '10/17/2023', withinTenYears: 'Yes' },
  { courseCode: '2009385', courseTitle: 'Agent Ethics and Responsibilities - CFP [8.5 hrs]', type: 'C.E.', hours: 8.5, stateCode: 'CFP', refNumber: '10496', stateCert: '1013', certExpiry: '10/17/2023', withinTenYears: 'Yes' },
  { courseCode: '2009021', courseTitle: 'Business Continuation Insurance - CFP [15 hrs]', type: 'C.E.', hours: 15, stateCode: 'CFP', refNumber: '10054', stateCert: '1020', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2009381', courseTitle: 'Business Continuation Insurance - CFP [15 hrs]', type: 'C.E.', hours: 15, stateCode: 'CFP', refNumber: '10499', stateCert: '112894', certExpiry: '12/01/2024', withinTenYears: 'Yes' },
  { courseCode: '2021774', courseTitle: 'CFP 2021 Ethics and Standards Course [2 hrs]', type: 'C.E.', hours: 2, stateCode: '', refNumber: '10737', stateCert: '249336', certExpiry: '03/01/2021', withinTenYears: 'Yes' },
  { courseCode: '2009020', courseTitle: 'CFP Certificant Ethics & Prof. Resp. [2 hrs]', type: 'C.E.', hours: 2, stateCode: '', refNumber: '10058', stateCert: '91-2008-COE', certExpiry: '07/01/2008', withinTenYears: 'No' },
  { courseCode: '2012209', courseTitle: 'CFP Certificant Ethics & Prof. Resp. [2 hrs]', type: 'C.E.', hours: 2, stateCode: '', refNumber: '10619', stateCert: '2013COE', certExpiry: '12/18/2012', withinTenYears: 'No' },
  { courseCode: '2012231', courseTitle: 'CFP Ethics 2016 [2 hrs]', type: 'C.E.', hours: 2, stateCode: '', refNumber: '10658', stateCert: '223105', certExpiry: '07/01/2016', withinTenYears: 'Yes' },
  { courseCode: '2012214', courseTitle: 'CFP PRACTITIONER ETHICS 2014 [2 hrs]', type: 'C.E.', hours: 2, stateCode: '', refNumber: '10626', stateCert: '195066', certExpiry: '01/01/2015', withinTenYears: 'No' },
  { courseCode: '2009028', courseTitle: 'Concepts of Disability - CFP [8.5 hrs]', type: 'C.E.', hours: 8.5, stateCode: 'CFP', refNumber: '10059', stateCert: '113627', certExpiry: '07/22/2025', withinTenYears: 'Yes' },
  { courseCode: '2009388', courseTitle: 'Concepts of Disability - CFP [8.5 hrs]', type: 'C.E.', hours: 8.5, stateCode: 'CFP', refNumber: '10504', stateCert: '113627', certExpiry: '07/22/2025', withinTenYears: 'Yes' },
  { courseCode: '2009022', courseTitle: 'Insurance Law in the US - CFP [15 hrs]', type: 'C.E.', hours: 15, stateCode: 'CFP', refNumber: '10052', stateCert: '1030', certExpiry: '03/12/2001', withinTenYears: 'No' },
  { courseCode: '2009382', courseTitle: 'Insurance Law in the US - CFP [15 hrs]', type: 'C.E.', hours: 15, stateCode: 'CFP', refNumber: '10497', stateCert: '193180', certExpiry: '02/09/2026', withinTenYears: 'Yes' },
  { courseCode: '2009026', courseTitle: 'Law and the Insurance Contract - CFP [8.5 hrs]', type: 'C.E.', hours: 8.5, stateCode: 'CFP', refNumber: '10053', stateCert: '1012', certExpiry: '12/09/2024', withinTenYears: 'Yes' },
  { courseCode: '2009386', courseTitle: 'Law and the Insurance Contract - CFP [8.5 hrs]', type: 'C.E.', hours: 8.5, stateCode: 'CFP', refNumber: '10498', stateCert: '1012', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2009027', courseTitle: 'Legal Concepts of Insurance - CFP [8.5 hrs]', type: 'C.E.', hours: 8.5, stateCode: 'CFP', refNumber: '10057', stateCert: '1070', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2009387', courseTitle: 'Legal Concepts of Insurance - CFP [8.5 hrs]', type: 'C.E.', hours: 8.5, stateCode: 'CFP', refNumber: '10502', stateCert: '1070', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2009023', courseTitle: 'Life, Accident & Health Insurance in the US - CFP [15 hrs]', type: 'C.E.', hours: 15, stateCode: 'CFP', refNumber: '10055', stateCert: '1080', certExpiry: '12/09/2024', withinTenYears: 'Yes' },
  { courseCode: '2009383', courseTitle: 'Life, Accident & Health Insurance in the US - CFP [15 hrs]', type: 'C.E.', hours: 15, stateCode: 'CFP', refNumber: '10500', stateCert: '1080', certExpiry: '12/09/2024', withinTenYears: 'Yes' },
  { courseCode: '2009024', courseTitle: 'Policy Premium Laws in America - CFP [15 hrs]', type: 'C.E.', hours: 15, stateCode: 'CFP', refNumber: '10056', stateCert: '1050', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2009384', courseTitle: 'Policy Premium Laws in America - CFP [15 hrs]', type: 'C.E.', hours: 15, stateCode: 'CFP', refNumber: '10501', stateCert: '1050', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2009407', courseTitle: 'Agent Ethics and Responsibilities - CPA [20 hrs]', type: 'C.E.', hours: 20, stateCode: 'CPA', refNumber: '10591', stateCert: '1013', certExpiry: '03/05/2001', withinTenYears: 'No' },
  { courseCode: '2009404', courseTitle: 'Business Continuation Insurance - CPA [20 hrs]', type: 'C.E.', hours: 20, stateCode: 'CPA', refNumber: '10588', stateCert: '', certExpiry: 'N/A', withinTenYears: 'N/A' },
  { courseCode: '2009400', courseTitle: 'Concepts of Disability - CPA [20 hrs]', type: 'C.E.', hours: 20, stateCode: 'CPA', refNumber: '10584', stateCert: '', certExpiry: 'N/A', withinTenYears: 'N/A' },
  { courseCode: '2009406', courseTitle: 'Insurance Law in the US - CPA [20 hrs]', type: 'C.E.', hours: 20, stateCode: 'CPA', refNumber: '10590', stateCert: '', certExpiry: 'N/A', withinTenYears: 'N/A' },
  { courseCode: '2009405', courseTitle: 'Law and the Insurance Contract - CPA [20 hrs]', type: 'C.E.', hours: 20, stateCode: 'CPA', refNumber: '10589', stateCert: '', certExpiry: 'N/A', withinTenYears: 'N/A' },
  { courseCode: '2009401', courseTitle: 'Legal Concepts of Insurance - CPA [20 hrs]', type: 'C.E.', hours: 20, stateCode: 'CPA', refNumber: '10585', stateCert: '', certExpiry: 'N/A', withinTenYears: 'N/A' },
  { courseCode: '2009403', courseTitle: 'Life, Accident & Health Insurance in the US - CPA [20 hrs]', type: 'C.E.', hours: 20, stateCode: 'CPA', refNumber: '10587', stateCert: '', certExpiry: 'N/A', withinTenYears: 'N/A' },
  { courseCode: '2009402', courseTitle: 'Policy Premium Laws in America - CPA [20 hrs]', type: 'C.E.', hours: 20, stateCode: 'CPA', refNumber: '10586', stateCert: '', certExpiry: 'N/A', withinTenYears: 'N/A' },
  { courseCode: '2009312', courseTitle: 'Agent Ethics and Responsibilities - SD [12 hrs]', type: 'C.E.', hours: 12, stateCode: 'SD', refNumber: '10429', stateCert: '4758', certExpiry: '12/05/2001', withinTenYears: 'No' },
  { courseCode: '2009319', courseTitle: 'Business Continuation Insurance - SD [12 hrs]', type: 'C.E.', hours: 12, stateCode: 'SD', refNumber: '10436', stateCert: '15526', certExpiry: '12/05/2001', withinTenYears: 'No' },
  { courseCode: '2009314', courseTitle: 'Concepts of Disability - SD [12 hrs]', type: 'C.E.', hours: 12, stateCode: 'SD', refNumber: '10431', stateCert: '15525', certExpiry: '12/05/2001', withinTenYears: 'No' },
  { courseCode: '2009317', courseTitle: 'Insurance Law in the US - SD [12 hrs]', type: 'C.E.', hours: 12, stateCode: 'SD', refNumber: '10434', stateCert: '4759', certExpiry: '12/05/2001', withinTenYears: 'No' },
  { courseCode: '2009318', courseTitle: 'Law and the Insurance Contract - SD [12 hrs]', type: 'C.E.', hours: 12, stateCode: 'SD', refNumber: '10435', stateCert: '4756', certExpiry: '12/05/2001', withinTenYears: 'No' },
  { courseCode: '2009315', courseTitle: 'Legal Concepts of Insurance - SD [12 hrs]', type: 'C.E.', hours: 12, stateCode: 'SD', refNumber: '10432', stateCert: '4757', certExpiry: '12/05/2001', withinTenYears: 'No' },
  { courseCode: '2009316', courseTitle: 'Life, Accident & Health Insurance in the US - SD [12 hrs]', type: 'C.E.', hours: 12, stateCode: 'SD', refNumber: '10433', stateCert: '15527', certExpiry: '12/05/2001', withinTenYears: 'No' },
  { courseCode: '2009313', courseTitle: 'Policy Premium Laws in America - SD [12 hrs]', type: 'C.E.', hours: 12, stateCode: 'SD', refNumber: '10430', stateCert: '4760', certExpiry: '12/05/2001', withinTenYears: 'No' },
];
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected');
  const M = mongoose.connection.model('CECCatalog', schema, 'ceccatalog');
  await M.deleteMany({});
  console.log('Cleared ceccatalog');
  for (const c of courses) { await M.create(c); console.log(' ADDED:', c.courseTitle); }
  console.log('Done. Total:', courses.length);
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });