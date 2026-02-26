import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNumber, verifyPassword } from '../../services/adminAuth';
import RELSLogo from '../../assets/RELS Logo.png';


const DIAL_NUMBERS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

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
  const PADDING = 70;
  const totalW  = CARD_W + PADDING * 2;
  const totalH  = CARD_H + PADDING * 2;

  const cardLeft   = PADDING;
  const cardRight  = PADDING + CARD_W;
  const cardTop    = PADDING;
  const cardBottom = PADDING + CARD_H;
  const cardMidX   = PADDING + CARD_W / 2;
  const cardMidY   = PADDING + CARD_H / 2;
  const GAP = 38;

  const dialPos = [
    { num: 0,  x: cardMidX,        y: cardTop    - GAP },
    { num: 10, x: cardRight + GAP, y: cardTop    - GAP },
    { num: 20, x: cardRight + GAP, y: cardMidY - 50    },
    { num: 30, x: cardRight + GAP, y: cardMidY + 50    },
    { num: 40, x: cardRight + GAP, y: cardBottom + GAP },
    { num: 50, x: cardMidX,        y: cardBottom + GAP },
    { num: 60, x: cardLeft  - GAP, y: cardBottom + GAP },
    { num: 70, x: cardLeft  - GAP, y: cardMidY + 50    },
    { num: 80, x: cardLeft  - GAP, y: cardMidY - 50    },
    { num: 90, x: cardLeft  - GAP, y: cardTop    - GAP },
  ];

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

  const activePos = dialPos.find(d => d.num === number) ?? null;

  return (
    <div style={styles.root}>
      <div style={styles.bgPhoto} />
      <div style={styles.bgOverlay} />
      <div style={styles.bgOverlay2} />

      <div style={{
        position: 'relative',
        width: totalW,
        height: totalH,
        zIndex: 2,
        flexShrink: 0,
      }}>

        {/* SVG dial layer */}
        <svg
          width={totalW}
          height={totalH}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'visible',
            zIndex: 4,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <filter id="glow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2EABFE" floodOpacity="1" />
            </filter>
          </defs>

          {dialPos.map(({ num, x, y }) => {
            const isActive = num === number;
            return (
              <g key={num}>
                {isActive && (
                  <circle
                    cx={x} cy={y} r={20}
                    fill="rgba(46,171,254,0.15)"
                    stroke="#2EABFE"
                    strokeWidth="1.5"
                  />
                )}
                <text
                  x={x} y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: isActive ? 15 : 13,
                    fontWeight: isActive ? 700 : 500,
                    fill: isActive ? '#2EABFE' : '#7FA8C4',
                    filter: isActive ? 'drop-shadow(0px 0px 10px #2EABFE)' : 'none',
                    transition: 'all 0.4s ease',
                  }}
                >
                  {num}
                </text>
              </g>
            );
          })}

          {activePos && (() => {
            const cx = totalW / 2;
            const cy = totalH / 2;
            const dx = cx - activePos.x;
            const dy = cy - activePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist;
            const ny = dy / dist;
            const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
            const tx = activePos.x + nx * 28;
            const ty = activePos.y + ny * 28;
            return (
              <polygon
                points="-7,-5 7,0 -7,5"
                transform={`translate(${tx}, ${ty}) rotate(${angleDeg})`}
                fill="#2EABFE"
                filter="url(#glow)"
                style={{ transition: 'all 0.5s ease' }}
              />
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

          {/* Logo row — RELS Logo + login icon */}
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
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                stroke="#FFFFFF" strokeWidth={2}>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            </div>
          </div>

          <h1 style={styles.title}>RESTRICTED ACCESS</h1>
          <p style={styles.subtitle}>
            <strong>RELSExSys.Com Backoffice</strong> is a secured system.
            Unauthorized access is strictly prohibited and may be subject to legal action.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputWrapper}>
              {/* Lock icon on left */}
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

              {/* Backspace/delete icon on right — always visible, clears on click */}
              <button
                type="button"
                onClick={() => setPassword('')}
                style={styles.clearBtn}
                tabIndex={-1}
              >
                {/* Backspace icon (keyboard backspace shape) */}
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                  stroke="#7FA8C4" strokeWidth={1.8}>
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                  <line x1="18" y1="9" x2="12" y2="15"/>
                  <line x1="12" y1="9" x2="18" y2="15"/>
                </svg>
              </button>
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #7FA8C4; letter-spacing: 0.15em; }
        input:focus { outline: none; border-color: #60C3FF !important; }
        button:hover:not(:disabled) { filter: brightness(1.15); }
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
    backgroundColor: '#091925',
    fontFamily: "'Rajdhani', sans-serif",
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
    backgroundColor: '#0D2436',
    background: 'linear-gradient(180deg, #0D2436 40%, rgba(46,171,254,0.18) 100%)',
    border: '1px solid rgba(96,195,255,0.2)',
    borderRadius: 20,
    padding: '34px 38px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    boxShadow: '0px 0px 111px 28px rgba(22,51,71,0.25)',
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
    backgroundColor: '#163347',
    border: '0.5px solid #60C3FF',
    borderRadius: 10,
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
    width: 36,
    height: 36,
    backgroundColor: '#163347',
    border: '0.5px solid #60C3FF',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 24,
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '0.08em',
  },
  subtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 1.65,
    fontWeight: 500,
    textAlign: 'justify',
    textTransform: 'capitalize',
     fontFamily: "'Poppins', sans-serif",
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
    color: '#7FA8C4',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 44px 12px 40px',
    backgroundColor: '#163347',
    border: '0.5px solid #60C3FF',
    borderRadius: 10,
    color: '#7FA8C4',
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '0.15em',
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
  error: {
    fontSize: 12,
    color: '#f87171',
    fontFamily: "'Poppins', sans-serif",
  },
  fetchingText: {
    fontSize: 11,
    color: '#7FA8C4',
    fontFamily: "'Poppins', sans-serif",
  },
  btn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2EABFE',
    color: '#091925',
    border: '0.5px solid #2EABFE',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '0.15em',
    cursor: 'pointer',
    transition: 'filter 0.2s',
    marginTop: 4,
  },
};

export default AdminLogin;
