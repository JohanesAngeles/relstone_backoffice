const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/admin';

// ── Get rotating number on page load ─────────────────────────────
export const getNumber = async () => {
  const res = await fetch(`${BASE_URL}/get-number`);
  const data = await res.json();
  return data; // { number }
};

// ── Submit password + number ──────────────────────────────────────
export const verifyPassword = async (password) => {
  const res = await fetch(`${BASE_URL}/verify-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  return { ok: res.ok, ...data };
  // success: { ok: true,  success: true,  captcha: '<svg>...' }
  // failure: { ok: false, success: false, message, newNumber }
};

// ── Submit CAPTCHA text ───────────────────────────────────────────
export const verifyCaptcha = async (captchaInput) => {
  const res = await fetch(`${BASE_URL}/verify-captcha`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ captchaInput }),
  });
  const data = await res.json();
  return { ok: res.ok, ...data };
  // success: { ok: true,  success: true,  token }
  // failure: { ok: false, success: false, message, captcha: '<svg>...' }
};