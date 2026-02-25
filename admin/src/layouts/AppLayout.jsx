// src/layouts/AppLayout.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import companyLogo from '../assets/images/rels_logo_white.png';

const NAV = [
  {
    section: 'MAIN MENU',
    items: [
      { label: 'Dashboard',      sub: 'Home / Overview & Summary',  to: '/admin',             icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
      { label: 'Real Estate',    sub: 'Exams, Orders & Info',        to: '/admin/real-estate', icon: 'M2 20h20M5 20V8l7-6 7 6v12M9 20v-5h6v5' },
      { label: 'C.E.C. Courses', sub: 'Continuing Education',        to: '/admin/cec-courses', icon: 'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5' },
    ],
  },
  {
    section: 'REQUESTS',
    items: [
      { label: 'New Requests',    sub: 'Unread Information',    to: '/admin/new-requests',    icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', badge: 'newRequests' },
      { label: "Follow-Up's Due", sub: 'Scheduled Reminders',   to: '/admin/follow-ups',      icon: 'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2', badge: 'followUps', badgeRed: true },
      { label: 'Closed Requests', sub: 'Completed & Resolved',  to: '/admin/closed-requests', icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
    ],
  },
  {
    section: 'TOOLS',
    items: [
      { label: 'Email Tools',      sub: 'Status, Domain & Prefix', to: '/admin/email-tools',     icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6' },
      { label: 'DRE Verify',       sub: 'License Verification',    to: '/admin/dre-verify',      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
      { label: 'Promo Discounts',  sub: 'Coupon Codes',            to: '/admin/promo-discounts', icon: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01' },
      { label: 'Reports',          sub: 'Charts, Data & More',     to: '/admin/reports',         icon: 'M18 20V10 M12 20V4 M6 20v-6' },
      { label: 'Student Feedback', sub: 'Reviews & Comments',      to: '/admin/feedback',        icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', badge: 'feedback' },
    ],
  },
];

const SvgIcon = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => (
      <path key={i} d={i === 0 ? p : 'M' + p} />
    ))}
  </svg>
);

const AppLayout = ({ children, badges = {} }) => {
  const { logout } = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clock, setClock] = useState({ date: '', time: '' });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const opts = { timeZone: 'America/Los_Angeles' };
      const date = now.toLocaleDateString('en-CA', opts);
      const time = now.toLocaleTimeString('en-GB', { ...opts, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setClock({ date, time });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        body { font-family: 'Poppins', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .nav-item:hover { background: rgba(59,130,246,0.08) !important; }
        .nav-item:hover .nav-icon { color: #3b82f6 !important; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .main-content > * { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      {/* ── TOP NAVBAR ── */}
      <header style={s.topNav}>
        <div style={s.topNavLeft}>
          <img src={companyLogo} alt="Relstone" style={{ height: 200, objectFit: 'contain' }} />
        </div>
        <div style={s.topNavRight}>
          <div style={s.avatarWrap}>
            <div style={s.avatar}>AU</div>
            <span style={s.avatarName}>Adminizer</span>
          </div>
          <button onClick={handleLogout} style={s.signOutBtn}>
            <SvgIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={14} />
            Sign Out
          </button>
        </div>
      </header>

      {/* ── SUB HEADER ── */}
      <div style={s.subHeader}>
        <div>
          <h1 style={s.greeting}>
            {getGreeting()}, <span style={s.greetingAccent}>Admin</span>
          </h1>
          <p style={s.greetingSub}>RELS OnExSys: BackOffice System</p>
        </div>
        <div style={s.subHeaderRight}>
          <div style={s.statusChip}>
            <span style={s.statusDot} />
            <span style={s.statusChipText}>EXAMINATION SERVER</span>
            <span style={s.statusChipDivider}>·</span>
            <span style={{ ...s.statusChipText, color: '#4ade80', fontWeight: 700 }}>ONLINE</span>
          </div>
          <div style={s.clockWrap}>
            <span style={s.clockDate}>{clock.date}</span>
            <span style={s.clockDivider}>|</span>
            <span style={s.clockTime}>{clock.time}</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={s.body}>

        {/* ── SIDEBAR ── */}
        <aside style={{ ...s.sidebar, width: sidebarOpen ? 210 : 56 }}>

          {/* Sidebar controls */}
          <div style={s.sidebarControls}>
            <button style={s.iconBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <SvgIcon d="M3 6h18 M3 12h18 M3 18h18" size={16} />
            </button>
            {sidebarOpen && (
              <button style={s.iconBtn}>
                <SvgIcon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />
              </button>
            )}
          </div>

          {/* Nav */}
          <nav style={s.nav}>
            {NAV.map((group) => (
              <div key={group.section} style={s.navGroup}>
                {sidebarOpen && <p style={s.navSection}>{group.section}</p>}
                {group.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  const badgeCount = item.badge ? (badges[item.badge] || 0) : 0;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="nav-item"
                      style={{
                        ...s.navItem,
                        ...(isActive ? s.navItemActive : {}),
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                        padding: sidebarOpen ? '9px 12px' : '10px 0',
                      }}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <span className="nav-icon" style={{
                        ...s.navIcon,
                        color: isActive ? '#2563eb' : '#64748b',
                      }}>
                        <SvgIcon d={item.icon} size={15} />
                      </span>
                      {sidebarOpen && (
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              ...s.navLabel,
                              color: isActive ? '#1e40af' : '#1e293b',
                              fontWeight: isActive ? 600 : 500,
                            }}>{item.label}</span>
                            {badgeCount > 0 && (
                              <span style={{
                                ...s.badge,
                                background: item.badgeRed ? '#ef4444' : '#3b82f6',
                              }}>{badgeCount}</span>
                            )}
                          </div>
                          <p style={s.navSub}>{item.sub}</p>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            style={{
              ...s.sidebarSignOut,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}
          >
            <span style={{ color: '#ef4444', display: 'flex' }}>
              <SvgIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={15} />
            </span>
            {sidebarOpen && (
              <div>
                <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Sign Out</p>
                <p style={{ color: '#94a3b8', fontSize: 11 }}>End Your Session</p>
              </div>
            )}
          </button>
        </aside>

        {/* ── MAIN + FOOTER ── */}
        <div style={s.mainWrap}>
          <main style={s.main} className="main-content">
            {children}
          </main>

          {/* ── FOOTER ── */}
          <footer style={s.footer}>
            <span>
              © Copyright {new Date().getFullYear()}{' '}
              <a href="#" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                Real Estate License Services, Inc.
              </a>
              {' '}— A California School Established 1978. All Rights Reserved.
            </span>
            <div style={s.footerRight}>
              <span>RELSExSys</span>
              <span style={s.footerDot}>·</span>
              <span>BackOffice</span>
              <span style={s.footerDot}>·</span>
              <span>v4.1</span>
              <span style={s.footerDot}>·</span>
              <span>TLS 1.3</span>
            </div>
          </footer>
        </div>

      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────
const s = {
  root: {
    display: 'flex', flexDirection: 'column',
    width: '100vw', minHeight: '100vh',
    fontFamily: "'Poppins', sans-serif",
    background: '#f1f5f9',
  },
  topNav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px', height: 52,
    background: '#0f172a',
    flexShrink: 0, zIndex: 10,
  },
  topNavLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  topNavRight: { display: 'flex', alignItems: 'center', gap: 12 },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  avatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: '#2563eb', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700,
  },
  avatarName: { fontSize: 12, color: '#94a3b8', fontWeight: 500 },
  signOutBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 6,
    border: '1px solid #334155',
    background: 'transparent', color: '#94a3b8',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  subHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#0f172a',
    borderTop: '1px solid #1e293b',
    flexShrink: 0,
  },
  greeting: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 20, fontWeight: 700, color: '#fff',
  },
  greetingAccent: { color: '#38bdf8' },
  greetingSub: { fontSize: 11, color: '#475569', marginTop: 2 },
  subHeaderRight: { display: 'flex', alignItems: 'center', gap: 12 },
  statusChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 10px', borderRadius: 6,
    background: 'rgba(16,185,129,0.12)',
    border: '1px solid rgba(16,185,129,0.25)',
  },
  statusDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#4ade80', boxShadow: '0 0 6px #4ade80',
  },
  statusChipText: { fontSize: 10, color: '#94a3b8', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' },
  statusChipDivider: { color: '#334155', fontSize: 10 },
  clockWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '5px 10px', borderRadius: 6,
    background: '#1e293b', border: '1px solid #334155',
  },
  clockDate: { fontSize: 11, color: '#94a3b8', fontFamily: "'DM Mono', monospace" },
  clockDivider: { color: '#334155', fontSize: 12 },
  clockTime: { fontSize: 11, color: '#60a5fa', fontFamily: "'DM Mono', monospace", fontWeight: 500 },
  body: { display: 'flex', flex: 1 },
  sidebar: {
    background: '#fff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column',
    transition: 'width 0.2s ease',
    overflow: 'hidden', flexShrink: 0,
    height: '100vh', position: 'sticky', top: 0,
  },
  sidebarControls: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    minHeight: 42,
  },
  iconBtn: {
    background: 'none', border: 'none',
    color: '#64748b', cursor: 'pointer',
    display: 'flex', padding: 4, borderRadius: 5,
  },
  nav: {
    flex: 1, overflowY: 'auto',
    padding: '6px 8px',
  },
  navGroup: { marginBottom: 4 },
  navSection: {
    fontSize: 9, fontWeight: 700, color: '#94a3b8',
    letterSpacing: '0.1em', padding: '8px 6px 4px',
    textTransform: 'uppercase',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 9,
    borderRadius: 7, cursor: 'pointer',
    transition: 'all 0.15s', marginBottom: 1,
    textDecoration: 'none',
  },
  navItemActive: { background: 'rgba(37,99,235,0.08)' },
  navIcon: { display: 'flex', flexShrink: 0 },
  navLabel: { fontSize: 13, fontFamily: "'Poppins', sans-serif" },
  navSub: { fontSize: 10, color: '#94a3b8', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  badge: {
    fontSize: 10, fontWeight: 700, color: '#fff',
    padding: '1px 5px', borderRadius: 10, flexShrink: 0,
  },
  sidebarSignOut: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '12px 12px',
    borderTop: '1px solid #f1f5f9',
    background: 'none', border: 'none', cursor: 'pointer',
    width: '100%', fontFamily: "'Poppins', sans-serif",
  },
  mainWrap: { flex: 1, display: 'flex', flexDirection: 'column' },
  main: {
    flex: 1, overflowY: 'auto',
    padding: '16px 20px',
    background: '#f8fafc',
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px', height: 36,
    background: '#0f172a',
    fontSize: 10, color: '#475569',
    flexShrink: 0,
    fontFamily: "'DM Mono', monospace",
  },
  footerRight: { display: 'flex', alignItems: 'center', gap: 6, color: '#334155' },
  footerDot: { color: '#1e293b' },
};

export default AppLayout;