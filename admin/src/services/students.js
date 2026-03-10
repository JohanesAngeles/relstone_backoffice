// src/services/students.js
const BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

// ── Authenticated GET ─────────────────────────────────────────
const authFetch = async (url) => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  return { ok: res.ok, data };
};

// ── Authenticated PATCH ───────────────────────────────────────
const authPatch = async (url, body) => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(url, {
    method:  'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data };
};

// ── GET /api/students?page=1&limit=25&search=&state= ──────────
export const getStudents = ({ page = 1, limit = 25, search = '', state = '' } = {}) => {
  const params = new URLSearchParams({ page, limit, search, state });
  return authFetch(`${BASE}/students?${params}`);
};

// ── GET /api/students/states ──────────────────────────────────
export const getStates = () => authFetch(`${BASE}/students/states`);

// ── GET /api/students/:id ─────────────────────────────────────
export const getStudent = (id) => authFetch(`${BASE}/students/${id}`);

// ── PATCH /api/students/:id ───────────────────────────────────
// Generic field update — pass any allowed fields as an object
// e.g. updateStudent('69805', { email: 'new@email.com', workPhone: '...' })
export const updateStudent = (id, fields) =>
  authPatch(`${BASE}/students/${id}`, fields);

// ── PATCH /api/students/:id  (Main Notes shorthand) ──────────
export const updateMainNotes = (id, mainNotes) =>
  authPatch(`${BASE}/students/${id}`, { mainNotes });

// ── PATCH /api/students/:id  (Telemarketing Notes shorthand) ─
// Saves all 4 telemarketing fields at once
export const updateTeleNotes = (id, { teleNotes, assignedRep, callbackDate, okayToCall }) =>
  authPatch(`${BASE}/students/${id}`, { teleNotes, assignedRep, callbackDate, okayToCall });

// ── Export CSV — triggers browser download ────────────────────
export const exportStudents = ({ search = '', state = '' } = {}) => {
  const token  = localStorage.getItem('adminToken');
  const params = new URLSearchParams({ search, state });
  const url    = `${BASE}/students/export?${params}`;
  return fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'students_export.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    });
};

// POST /api/students/:id/email-affidavit
export const emailAffidavit = (id) => {
  const token = localStorage.getItem('adminToken');
  return fetch(`${BASE}/students/${id}/email-affidavit`, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(async res => {
    const data = await res.json();
    return { ok: res.ok, data };
  });
};

export const emailPasswordLink = (id) => {
  const token = localStorage.getItem('adminToken');
  return fetch(`${BASE}/students/${id}/email-password-link`, {
   method:  'POST',
   headers: { 'Authorization': `Bearer ${token}` },
  }).then(async res => {
   const data = await res.json();
   return { ok: res.ok, data };
  });
 };












