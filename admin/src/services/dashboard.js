// src/services/dashboard.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Helper: authenticated fetch ───────────────────────────────
const authFetch = async (url) => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
};

// ── GET /api/dashboard/stats ──────────────────────────────────
export const getStats = async () => {
  return authFetch(`${BASE_URL}/dashboard/stats`);
};

// ── GET /api/dashboard/activity ──────────────────────────────
export const getActivity = async () => {
  return authFetch(`${BASE_URL}/dashboard/activity`);
};

// ── GET /api/dashboard/system-status ─────────────────────────
export const getSystemStatus = async () => {
  return authFetch(`${BASE_URL}/dashboard/system-status`);
};

// ── PATCH /api/dashboard/system-status/:id/override ──────────
export const overrideSystemStatus = async (id, status, note = '') => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${BASE_URL}/dashboard/system-status/${id}/override`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, note }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
};