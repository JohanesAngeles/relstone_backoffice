// src/services/students.js
const BASE = 'http://localhost:5000/api';

const authFetch = async (url) => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  return { ok: res.ok, data };
};

// GET /api/students?page=1&limit=25&search=&state=
export const getStudents = ({ page = 1, limit = 25, search = '', state = '' } = {}) => {
  const params = new URLSearchParams({ page, limit, search, state });
  return authFetch(`${BASE}/students?${params}`);
};

// GET /api/students/states
export const getStates = () => authFetch(`${BASE}/students/states`);

// GET /api/students/:id
export const getStudent = (id) => authFetch(`${BASE}/students/${id}`);

// Export CSV — triggers browser download
export const exportStudents = ({ search = '', state = '' } = {}) => {
  const token  = localStorage.getItem('adminToken');
  const params = new URLSearchParams({ search, state });
  const url    = `${BASE}/students/export?${params}`;
  // Use fetch to get blob then trigger download
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