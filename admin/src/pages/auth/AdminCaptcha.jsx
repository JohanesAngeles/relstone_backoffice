import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyCaptcha } from '../../services/adminAuth';
import useAuth from '../../context/useAuth';

const AdminCaptcha = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const { login }                   = useAuth();
  const [captchaSvg, setCaptchaSvg] = useState(location.state?.captcha || '');
  const [input, setInput]           = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  // ── Guard: if no captcha was passed, redirect back to login ──────
  useEffect(() => {
    if (!location.state?.captcha) {
      navigate('/admin/login', { replace: true });
    }
  }, []);

  // ── Submit handler ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input) return;

    setLoading(true);
    setError('');

    try {
      const result = await verifyCaptcha(input);

      if (result.success) {
        // ✅ Correct — store token via AuthContext and go to dashboard
        login(result.token);
        navigate('/admin', { replace: true });
      } else {
        // ❌ Wrong — show fresh CAPTCHA
        setCaptchaSvg(result.captcha);
        setError(result.message || 'Incorrect CAPTCHA. Try again.');
        setInput('');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.shieldIcon}>🛡️</div>
          <h1 style={styles.title}>RELSTONE</h1>
          <p style={styles.subtitle}>Step 2 — CAPTCHA Verification</p>
        </div>

        {/* Instruction */}
        <div style={styles.instructionBox}>
          <p style={styles.instructionText}>
            Type the characters you see in the image below. This is case-insensitive.
          </p>
        </div>

        {/* CAPTCHA Image */}
        <div style={styles.captchaBox}>
          {captchaSvg ? (
            <div
              style={styles.captchaImage}
              dangerouslySetInnerHTML={{ __html: captchaSvg }}
            />
          ) : (
            <p style={styles.captchaPlaceholder}>Loading CAPTCHA...</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Enter Characters</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type what you see above"
            style={styles.input}
            autoFocus
            autoComplete="off"
            disabled={loading}
          />

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Submit'}
          </button>
        </form>

        {/* Back to login */}
        <button
          onClick={() => navigate('/admin/login')}
          style={styles.backBtn}
        >
          ← Back to Login
        </button>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; }
        button:hover:not(:disabled) { opacity: 0.85 !important; }
        button { transition: all 0.15s ease; }
      `}</style>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    padding: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: '40px 44px',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  shieldIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  title: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 22,
    fontWeight: 700,
    color: '#10b981',
    letterSpacing: '0.1em',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: 500,
  },
  instructionBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: '12px 16px',
    border: '1px solid #334155',
  },
  instructionText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  captchaBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: '16px',
    border: '2px solid #10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  captchaImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  captchaPlaceholder: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: "'JetBrains Mono', monospace",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: 15,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.15em',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  errorBox: {
    backgroundColor: '#450a0a',
    border: '1px solid #ef4444',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#fca5a5',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    width: '100%',
    padding: '13px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: 13,
    cursor: 'pointer',
    textAlign: 'center',
    padding: '4px 0',
  },
};

export default AdminCaptcha;