// src/services/cecStudents.js

const API = '/api/cec-students';
const token = () => localStorage.getItem('adminToken') || '';

export const getCECStudent = async (id) => {
  try {
    const res = await fetch(`${API}/${id}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.status === 404) return { ok: false, data: null };
    if (!res.ok) throw new Error('Failed to fetch CEC student');
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    console.error('getCECStudent error:', err);
    return { ok: false, data: null };
  }
};