const API_BASE = 'http://localhost:5000/api';

export const getCFPData = async () => {
  const res = await fetch(`${API_BASE}/insurance/cfp-renewal/full`);
  if (!res.ok) throw new Error(`Failed to fetch CFP data: ${res.status}`);
  const json = await res.json();
  // API returns { success: true, data: { state, courses, packages } }
  return json.data;
};