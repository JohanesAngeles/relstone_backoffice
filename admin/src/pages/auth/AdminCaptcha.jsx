import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyCaptcha } from '../../services/adminAuth';
import useAuth from '../../context/useAuth';
import RELSLogo from '../../assets/RELS Logo.png';

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
      {/* Background layers */}
      <div style={styles.bgPhoto} />
      <div style={styles.bgOverlay} />
      <div style={styles.bgOverlay2} />

      <div style={styles.card}>

        {/* Logo row */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <img
              src={RELSLogo}
              alt="RELS Logo"
              style={{ width: 26, height: 'auto', objectFit: 'contain' }}
            />
          </div>
          <div style={styles.logoDivider} />
          <div style={styles.logoIcon2}>
            {/* hCaptcha / verification icon */}
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
              stroke="#FFFFFF" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 style={styles.title}>HUMAN VERIFICATION</h1>
          <p style={styles.subtitle}>
            Access to <strong>backofficemainmenu.php</strong> is restricted to authorized personnel only.
            Please type the characters shown below to verify you are human.
          </p>
        </div>

        {/* CAPTCHA label */}
        <p style={styles.captchaLabel}>TYPE THE CHARACTERS THAT APPEAR IN THE BOX</p>

        {/* CAPTCHA Image box — dark-themed to match Figma */}
        <div style={styles.captchaBox}>
          {captchaSvg ? (
            <div
              style={styles.captchaImage}
              className="captcha-svg-wrap"
              dangerouslySetInnerHTML={{ __html: captchaSvg }}
            />
          ) : (
            <p style={styles.captchaPlaceholder}>Loading CAPTCHA...</p>
          )}
          {/* Refresh icon top-right */}
          <div style={styles.refreshIcon}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
              stroke="#2EABFE" strokeWidth={2.2}>
              <path d="M23 4v6h-6"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER CHARACTERS HERE"
              style={styles.input}
              autoFocus
              autoComplete="off"
              disabled={loading}
            />
            {input && (
              <button type="button" onClick={() => setInput('')} style={styles.clearBtn} tabIndex={-1}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                  stroke="#7FA8C4" strokeWidth={1.8}>
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <line x1="18" y1="9" x2="12" y2="15"/>
                  <line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
              </button>
            )}
          </div>

          {/* Attempts dots + text */}
          <div style={styles.attemptsRow}>
            <span style={styles.dot} />
            <span style={styles.dot} />
            <span style={styles.dot} />
            <span style={styles.attemptsText}>3 attempts remaining</span>
          </div>

          {error && (
            <p style={styles.error}>⚠ {error}</p>
          )}

          <button
            type="submit"
            style={{ ...styles.btn, opacity: loading ? 0.65 : 1 }}
            disabled={loading}
          >
            {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE →'}
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #7FA8C4; letter-spacing: 0.1em; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500; }
        input:focus { outline: none; border-color: #60C3FF !important; }
        button:hover:not(:disabled) { filter: brightness(1.1); }

        /* Strip white background from the injected SVG captcha */
        .captcha-svg-wrap svg {
          background: transparent !important;
          border-radius: 6px;
        }
        .captcha-svg-wrap svg rect:first-child,
        .captcha-svg-wrap svg rect[fill="#ffffff"],
        .captcha-svg-wrap svg rect[fill="white"],
        .captcha-svg-wrap svg rect[fill="#fff"],
        .captcha-svg-wrap svg rect[fill="rgb(255,255,255)"] {
          fill: transparent !important;
        }
      `}</style>
    </div>
  );
};

const styles = {
  root: {
    width: '100vw',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#091925',
    fontFamily: "'Rajdhani', sans-serif",
    padding: 20,
  },
  bgPhoto: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.2,
    zIndex: 0,
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(9,25,37,0) 25.48%, #091925 100%)',
    zIndex: 1,
  },
  bgOverlay2: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(9,25,37,0.2)',
    zIndex: 1,
  },
  card: {
    position: 'relative',
    zIndex: 2,
    backgroundColor: '#0D2436',
    background: 'linear-gradient(180deg, #0D2436 40%, rgba(46,171,254,0.18) 100%)',
    border: '1px solid rgba(96,195,255,0.2)',
    borderRadius: 20,
    padding: '34px 38px',
    width: '100%',
    maxWidth: 500,
    boxShadow: '0px 0px 111px 28px rgba(22,51,71,0.25)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#163347',
    border: '0.5px solid #60C3FF',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(96,195,255,0.2)',
  },
  logoIcon2: {
    width: 56,
    height: 56,
    backgroundColor: '#163347',
    border: '0.5px solid #60C3FF',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 26,
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '0.06em',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#7FA8C4',
    lineHeight: 1.7,
    fontWeight: 400,
    textAlign: 'justify',
    fontFamily: "'Poppins', sans-serif",
  },
  captchaLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#7FA8C4',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  captchaBox: {
    position: 'relative',
    // ── KEY CHANGE: dark background matching the Figma design ──────
    backgroundColor: '#163347',
    backgroundImage: `
      radial-gradient(ellipse at 20% 50%, rgba(46,171,254,0.04) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 50%, rgba(96,195,255,0.03) 0%, transparent 60%)
    `,
    borderRadius: 10,
    padding: '14px 40px 14px 16px',
    border: '0.5px solid #60C3FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
    overflow: 'hidden',
  },
  captchaImage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  captchaPlaceholder: {
    fontSize: 13,
    color: '#7FA8C4',
    fontFamily: "'Poppins', sans-serif",
  },
  refreshIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: '#163347',
    border: '0.5px solid #60C3FF',
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'default',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '16px 44px 16px 16px',
    backgroundColor: '#163347',
    border: '0.5px solid #60C3FF',
    borderRadius: 10,
    color: '#7FA8C4',
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    letterSpacing: '0.1em',
    transition: 'border-color 0.2s',
  },
  clearBtn: {
    position: 'absolute',
    right: 10,
    background: 'none',
    border: 'none',
    color: '#7FA8C4',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    opacity: 0.7,
  },
  attemptsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#163347',
    border: '0.5px solid #60C3FF',
    display: 'inline-block',
  },
  attemptsText: {
    fontSize: 12,
    color: '#7FA8C4',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    marginLeft: 2,
  },
  error: {
    fontSize: 12,
    color: '#f87171',
    fontFamily: "'Poppins', sans-serif",
  },
  btn: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#2EABFE',
    color: '#091925',
    border: '0.5px solid #2EABFE',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'filter 0.2s',
    marginTop: 4,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#7FA8C4',
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    textAlign: 'center',
    padding: '4px 0',
    transition: 'filter 0.2s',
  },
};

export default AdminCaptcha;
