import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNumber, verifyPassword } from '../../services/adminAuth';

// Numbers on the dial in clockwise order starting from top
const DIAL_NUMBERS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

// Position each number around the card like a clock
const getDialPositions = (cardW, cardH, padding) => {
  const cx = cardW / 2;
  const cy = cardH / 2;
  const rx = cardW / 2 + padding;
  const ry = cardH / 2 + padding;

  return DIAL_NUMBERS.map((num, i) => {
    const angleDeg = (i / DIAL_NUMBERS.length) * 360 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = cx + rx * Math.cos(angleRad);
    const y = cy + ry * Math.sin(angleRad);
    return { num, x, y };
  });
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [number, setNumber]     = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [shake, setShake]       = useState(false);

  const CARD_W  = 420;
  const CARD_H  = 380;
  const PADDING = 90;
  const dialPos = getDialPositions(CARD_W, CARD_H, PADDING);
  const totalW  = CARD_W + PADDING * 2;
  const totalH  = CARD_H + PADDING * 2;

  useEffect(() => { fetchNumber(); }, []);

  const fetchNumber = async () => {
    setFetching(true);
    try {
      const data = await getNumber();
      setNumber(data.number);
    } catch {
      setError('Could not connect to server.');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await verifyPassword(password);
      if (result.success) {
        navigate('/admin/captcha', { state: { captcha: result.captcha } });
      } else {
        setNumber(result.newNumber);
        setError(result.message || 'Incorrect password.');
        setPassword('');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeIndex = DIAL_NUMBERS.indexOf(number);
  const activePos   = activeIndex >= 0 ? dialPos[activeIndex] : null;

  return (
    <div style={styles.root}>
      {/* City background */}
      <div style={styles.bgPhoto} />
      <div style={styles.bgOverlay} />

      {/* Dial + Card wrapper */}
      <div style={{ position: 'relative', width: totalW, height: totalH, zIndex: 2 }}>

        {/* SVG dial layer */}
        <svg
          width={totalW}
          height={totalH}
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', zIndex: 2 }}
        >
          {/* Dashed ellipse border */}
          <ellipse
            cx={totalW / 2}
            cy={totalH / 2}
            rx={CARD_W / 2 + PADDING - 12}
            ry={CARD_H / 2 + PADDING - 12}
            fill="none"
            stroke="rgba(99,179,237,0.18)"
            strokeWidth="1"
            strokeDasharray="4 7"
          />

          {/* Dial numbers */}
          {dialPos.map(({ num, x, y }) => {
            const isActive = num === number;
            return (
              <g key={num}>
                {isActive && (
                  <circle
                    cx={x} cy={y} r={22}
                    fill="rgba(59,130,246,0.2)"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                  />
                )}
                <text
                  x={x} y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: isActive ? 15 : 12,
                    fontWeight: isActive ? 700 : 400,
                    fill: isActive ? '#60a5fa' : 'rgba(148,163,184,0.45)',
                    transition: 'all 0.4s ease',
                  }}
                >
                  {num}
                </text>
              </g>
            );
          })}

          {/* Arrow from active number toward card */}
          {activePos && (() => {
            const cx   = totalW / 2;
            const cy   = totalH / 2;
            const dx   = cx - activePos.x;
            const dy   = cy - activePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx   = dx / dist;
            const ny   = dy / dist;
            const x1   = activePos.x + nx * 30;
            const y1   = activePos.y + ny * 30;
            const x2   = activePos.x + nx * (dist - 22);
            const y2   = activePos.y + ny * (dist - 22);

            return (
              <>
                <defs>
                  <marker id="arr" markerWidth="8" markerHeight="6"
                    refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
                  </marker>
                </defs>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  markerEnd="url(#arr)"
                  style={{ transition: 'all 0.5s ease' }}
                />
              </>
            );
          })()}
        </svg>

        {/* Login Card */}
        <div style={{
          ...styles.card,
          position: 'absolute',
          top: PADDING,
          left: PADDING,
          width: CARD_W,
          height: CARD_H,
          animation: shake ? 'shake 0.5s ease' : 'fadeIn 0.5s ease',
        }}>
          {/* Logo icons */}
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                stroke="#3b82f6" strokeWidth={2.5}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div style={styles.logoDivider} />
            <div style={styles.logoIcon2}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                stroke="#94a3b8" strokeWidth={2}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            </div>
          </div>

          <h1 style={styles.title}>RESTRICTED ACCESS</h1>
          <p style={styles.subtitle}>
            RELSExSys.Com Backoffice is a secured system.<br />
            Unauthorized access is strictly prohibited and<br />may be subject to legal action.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width={15} height={15} viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD"
                style={styles.input}
                disabled={fetching || loading}
                autoFocus
              />
              {password && (
                <button type="button" onClick={() => setPassword('')} style={styles.clearBtn}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2.5}>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {error && <p style={styles.error}>⚠ {error}</p>}
            {fetching && <p style={styles.fetchingText}>Connecting to server...</p>}

            <button
              type="submit"
              style={{ ...styles.btn, opacity: loading || fetching ? 0.65 : 1 }}
              disabled={loading || fetching}
            >
              {loading ? 'VERIFYING...' : 'SUBMIT →'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(148,163,184,0.4); letter-spacing: 0.15em; }
        input:focus { outline: none; border-color: rgba(59,130,246,0.6) !important; }
        button:hover:not(:disabled) { filter: brightness(1.1); }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
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
    fontFamily: "'Rajdhani', sans-serif",
  },
  bgPhoto: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 0,
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(5,10,25,0.93) 0%, rgba(10,20,50,0.89) 100%)',
    zIndex: 1,
  },
  card: {
    backgroundColor: 'rgba(15,23,42,0.82)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(59,130,246,0.18)',
    borderRadius: 4,
    padding: '34px 38px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    boxShadow: '0 0 80px rgba(59,130,246,0.08), 0 30px 60px rgba(0,0,0,0.7)',
    zIndex: 3,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.25)',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148,163,184,0.18)',
  },
  logoIcon2: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(148,163,184,0.04)',
    border: '1px solid rgba(148,163,184,0.12)',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 24,
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '0.08em',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 1.65,
    fontWeight: 500,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 6,
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 13,
    color: '#475569',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 36px 12px 40px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(148,163,184,0.12)',
    borderRadius: 3,
    color: '#e2e8f0',
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.15em',
    transition: 'border-color 0.2s',
  },
  clearBtn: {
    position: 'absolute',
    right: 11,
    background: 'none',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    padding: 2,
  },
  error: {
    fontSize: 12,
    color: '#f87171',
    fontFamily: "'JetBrains Mono', monospace",
  },
  fetchingText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: "'JetBrains Mono', monospace",
  },
  btn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 3,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: '0.15em',
    cursor: 'pointer',
    transition: 'filter 0.2s',
    marginTop: 4,
  },
};

export default AdminLogin;