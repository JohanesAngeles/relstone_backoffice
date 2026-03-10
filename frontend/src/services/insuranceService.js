const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getStateFull = async (slug) => {
  const res = await fetch(`${BASE_URL}/insurance/${slug}/full`);
  if (!res.ok) throw new Error('State not found');
  const data = await res.json();
  return data.data;
};