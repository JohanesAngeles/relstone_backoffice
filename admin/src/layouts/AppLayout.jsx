// src/layouts/AppLayout.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import companyLogo from '../assets/images/rels_logo_white.png';

const NAV = [
  {
    section: 'MAIN MENU',
    items: [
      {
        label: 'Dashboard',
        sub: 'Home / Overview & Summary',
        to: '/admin',
        icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
      },
      {
        label: 'Real Estate',
        sub: 'Exams, Orders & Info',
        to: '/admin/real-estate',
        icon: 'M2 20h20M5 20V8l7-6 7 6v12M9 20v-5h6v5',
      },
      {
        label: 'C.E.C. Courses',
        sub: 'Continuing Education',
        to: '/admin/cec-courses',
        icon: 'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5',
      },
    ],
  },
  {
    section: 'REQUESTS',
    items: [
      {
        label: 'New Requests',
        sub: 'Unread Information',
        to: '/admin/new-requests',
        icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
        badge: 'newRequests',
      },
      {
        label: "Follow-Up's Due",
        sub: 'Scheduled Reminders',
        to: '/admin/follow-ups',
        icon: 'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2',
        badge: 'followUps',
        badgeRed: true,
      },
      {
        label: 'Closed Requests',
        sub: 'Completed & Resolved',
        to: '/admin/closed-requests',
        icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
      },
    ],
  },
  {
    section: 'TOOLS',
    items: [
      {
        label: 'Email Tools',
        sub: 'Status, Domain & Prefix',
        to: '/admin/email-tools',
        icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
      },
      {
        label: 'DRE Verify',
        sub: 'License Verification',
        to: '/admin/dre-verify',
        icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      },
      {
        label: 'Promo Discounts',
        sub: 'Coupon Codes',
        to: '/admin/promo-discounts',
        icon: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01',
      },
      {
        label: 'Reports',
        sub: 'Charts, Data & More',
        to: '/admin/reports',
        icon: 'M18 20V10 M12 20V4 M6 20v-6',
      },
      {
        label: 'Student Feedback',
        sub: 'Reviews & Comments',
        to: '/admin/feedback',
        icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
        badge: 'feedback',
      },
    ],
  },
  {
    section: 'EXAM DATA',
    items: [
      {
        label: 'Exam Browser',
        sub: 'Courses, Q&A & Certs',
        to: '/admin/exam-data',
        icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
      },
    ],
  },
];

const SvgIcon = ({ d, size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d.split(' M').map((p, i) => (
      <path key={i} d={i === 0 ? p : 'M' + p} />
    ))}
  </svg>
);

<<<<<<< HEAD
// ── Sign Out Confirmation Modal ────────────────────────────────
const SignOutModal = ({ onConfirm, onCancel }) => (
  <div style={m.overlay}>
    <div style={m.modal}>
      {/* Icon */}
      <div style={m.iconWrap}>
        <span style={{ color: '#EF4444', display: 'flex' }}>
          <SvgIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={28} />
        </span>
      </div>

      {/* Text */}
      <h2 style={m.title}>Sign Out?</h2>
      <p style={m.body}>
        Are you sure you want to end your session?<br />
        Any unsaved changes may be lost.
      </p>

      {/* Actions */}
      <div style={m.actions}>
        <button onClick={onCancel} style={m.cancelBtn}>
          Cancel
        </button>
        <button onClick={onConfirm} style={m.confirmBtn}>
          <SvgIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={14} />
          Yes, Sign Out
        </button>
      </div>
    </div>
  </div>
);

const m = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(9,25,37,0.55)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    animation: 'fadeIn 0.15s ease',
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    padding: '32px 28px 24px',
    width: 340,
    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    animation: 'fadeIn 0.2s ease',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'rgba(239,68,68,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#091925',
    fontFamily: "'Poppins', sans-serif",
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: '1.6',
    fontFamily: "'Poppins', sans-serif",
    marginBottom: 24,
  },
  actions: {
    display: 'flex',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    padding: '10px 0',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'background 0.15s',
  },
  confirmBtn: {
    flex: 1,
    padding: '10px 0',
    borderRadius: 8,
    border: 'none',
    background: '#EF4444',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'background 0.15s',
  },
};

=======
>>>>>>> feat/matt
const AppLayout = ({ children, badges = {} }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [clock, setClock] = useState({ date: '', time: '' });

  // Search state
  const [navSearch, setNavSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

<<<<<<< HEAD
  // Sign out confirmation modal state
  const [showSignOutModal, setShowSignOutModal] = useState(false);

=======
>>>>>>> feat/matt
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const opts = { timeZone: 'America/Los_Angeles' };
      const date = now.toLocaleDateString('en-CA', opts);
      const time = now.toLocaleTimeString('en-GB', {
        ...opts,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
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

<<<<<<< HEAD
  // Open modal instead of signing out directly
  const handleSignOutClick = () => setShowSignOutModal(true);

  // Confirmed — actually sign out
  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
=======
  const handleLogout = () => {
>>>>>>> feat/matt
    logout();
    navigate('/admin/login', { replace: true });
  };

<<<<<<< HEAD
  // Cancelled — close modal
  const handleCancelSignOut = () => setShowSignOutModal(false);

=======
>>>>>>> feat/matt
  // Flatten NAV for searching
  const ALL_ROUTES = useMemo(
    () =>
      NAV.flatMap((g) =>
        g.items.map((it) => ({
          section: g.section,
          label: it.label,
          sub: it.sub,
          to: it.to,
        }))
      ),
    []
  );

  const q = navSearch.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!q) return [];
    return ALL_ROUTES.filter((r) => {
      const hay = `${r.section} ${r.label} ${r.sub}`.toLowerCase();
      return hay.includes(q);
    }).slice(0, 10);
  }, [q, ALL_ROUTES]);

  // Close search on ESC + click outside
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    const onClick = (e) => {
      if (!e.target.closest?.('[data-side-search="1"]')) setSearchOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

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
        .nav-item:hover { background: #ECF7FF !important; }
        .nav-item:hover .nav-icon-box { background: #D0EBFF !important; }
        .nav-item:hover .nav-icon { color: #2EABFE !important; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .main-content > * { animation: fadeIn 0.3s ease forwards; }
        .sign-out-btn:hover { background: rgba(239,68,68,0.08) !important; }
<<<<<<< HEAD
        .modal-cancel-btn:hover { background: #f1f5f9 !important; }
        .modal-confirm-btn:hover { background: #dc2626 !important; }
      `}</style>

      {/* ── SIGN OUT CONFIRMATION MODAL ── */}
      {showSignOutModal && (
        <SignOutModal onConfirm={handleConfirmSignOut} onCancel={handleCancelSignOut} />
      )}

=======
      `}</style>

>>>>>>> feat/matt
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
<<<<<<< HEAD
          <button onClick={handleSignOutClick} style={s.signOutBtn}>
=======
          <button onClick={handleLogout} style={s.signOutBtn}>
>>>>>>> feat/matt
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
        <aside style={{ ...s.sidebar, width: sidebarOpen ? 240 : 56 }}>
          {/* Sidebar controls + Search */}
          <div style={s.sidebarControls}>
            <button style={s.iconBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <SvgIcon d="M3 6h18 M3 12h18 M3 18h18" size={18} />
            </button>

            {sidebarOpen && (
              <div style={s.sideSearchWrap} data-side-search="1">
                <span style={s.sideSearchIcon}>
                  <SvgIcon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} />
                </span>

                <input
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search menu..."
                  style={s.sideSearchInput}
                />

                {navSearch && (
                  <button
                    onClick={() => {
                      setNavSearch('');
                      setSearchOpen(false);
                    }}
                    style={s.sideSearchClear}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}

                {searchOpen && (
                  <div style={s.searchDropdown}>
                    {searchResults.length === 0 ? (
                      <div style={s.searchEmpty}>No results found.</div>
                    ) : (
                      searchResults.map((r) => (
                        <button
                          key={r.to}
                          onClick={() => {
                            navigate(r.to);
                            setNavSearch('');
                            setSearchOpen(false);
                          }}
                          style={{
                            ...s.searchItem,
                            borderBottom: r.to === searchResults.at(-1)?.to ? 'none' : '1px solid #f1f5f9',
                          }}
                        >
                          <div style={s.searchItemTop}>
                            <span style={s.searchItemLabel}>{r.label}</span>
                            <span style={s.searchItemSection}>{r.section}</span>
                          </div>
                          <div style={s.searchItemSub}>{r.sub}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={s.nav}>
            {NAV.map((group, gi) => (
              <div key={group.section} style={{ ...s.navGroup, marginTop: gi > 0 ? 8 : 0 }}>
                {/* Section divider line */}
                {gi > 0 && sidebarOpen && <div style={s.sectionDivider} />}

                {sidebarOpen && <p style={s.navSection}>{group.section}</p>}

                {group.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  const badgeCount = item.badge ? badges[item.badge] || 0 : 0;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="nav-item"
                      style={{
                        ...s.navItem,
                        ...(isActive ? s.navItemActive : {}),
                        justifyContent: sidebarOpen ? 'flex-start' : 'center',
                        padding: sidebarOpen ? '10px 16px 10px 0' : '10px 0',
                        paddingLeft: sidebarOpen ? 0 : 0,
                      }}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      {/* Blue left accent bar for active */}
                      {isActive && sidebarOpen && <div style={s.activeAccent} />}
                      {!isActive && sidebarOpen && <div style={s.inactiveAccentSpace} />}

                      {/* Icon Box */}
                      <span
                        className="nav-icon-box"
                        style={{
                          ...s.navIconBox,
                          background: isActive ? '#D0EBFF' : 'rgba(127,168,196,0.1)',
                          marginLeft: sidebarOpen ? 10 : 'auto',
                          marginRight: sidebarOpen ? 0 : 'auto',
                        }}
                      >
                        <span
                          className="nav-icon"
                          style={{
                            ...s.navIcon,
                            color: isActive ? '#2EABFE' : '#7FA8C4',
                          }}
                        >
                          <SvgIcon d={item.icon} size={16} />
                        </span>
                      </span>

                      {sidebarOpen && (
                        <div style={{ flex: 1, minWidth: 0, marginLeft: 9 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span
                              style={{
                                ...s.navLabel,
                                color: isActive ? '#163347' : '#091925',
                                fontWeight: isActive ? 600 : 400,
                              }}
                            >
                              {item.label}
                            </span>
                            {badgeCount > 0 && (
                              <span
                                style={{
                                  ...s.badge,
                                  background: item.badgeRed ? '#ef4444' : '#2EABFE',
                                }}
                              >
                                {badgeCount}
                              </span>
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
          {sidebarOpen ? (
            <div style={{ padding: '8px 12px 12px' }}>
              <button
<<<<<<< HEAD
                onClick={handleSignOutClick}
=======
                onClick={handleLogout}
>>>>>>> feat/matt
                className="sign-out-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '8px 12px',
                  height: 56,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  transition: 'background 0.15s',
                }}
              >
                <span style={{
                  width: 36, height: 36, borderRadius: 5,
                  background: 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ color: '#EF4444', display: 'flex' }}>
                    <SvgIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={18} />
                  </span>
                </span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 13, color: '#EF4444', fontWeight: 600, fontFamily: "'Poppins', sans-serif", lineHeight: '20px' }}>Sign Out</p>
                  <p style={{ fontSize: 12, color: '#7FA8C4', lineHeight: '18px' }}>End Your Session</p>
                </div>
              </button>
            </div>
          ) : (
            <button
<<<<<<< HEAD
              onClick={handleSignOutClick}
=======
              onClick={handleLogout}
>>>>>>> feat/matt
              className="sign-out-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                width: '100%',
                padding: '14px 0',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ color: '#EF4444', display: 'flex' }}>
                <SvgIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={20} />
              </span>
            </button>
          )}
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
              </a>{' '}
              — A California School Established 1978. All Rights Reserved.
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
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    fontFamily: "'Poppins', sans-serif",
    background: '#f1f5f9',
    overflow: 'hidden',
  },
  topNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: 52,
    background: '#0f172a',
    flexShrink: 0,
    zIndex: 100,
  },
  topNavLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  topNavRight: { display: 'flex', alignItems: 'center', gap: 12 },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: '#2563eb',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
  },
  avatarName: { fontSize: 12, color: '#94a3b8', fontWeight: 500 },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #334155',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  subHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#0f172a',
    borderTop: '1px solid #1e293b',
    flexShrink: 0,
    zIndex: 100,
  },
  greeting: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
  },
  greetingAccent: { color: '#38bdf8' },
  greetingSub: { fontSize: 11, color: '#475569', marginTop: 2 },
  subHeaderRight: { display: 'flex', alignItems: 'center', gap: 12 },
  statusChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    borderRadius: 6,
    background: 'rgba(16,185,129,0.12)',
    border: '1px solid rgba(16,185,129,0.25)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#4ade80',
    boxShadow: '0 0 6px #4ade80',
  },
  statusChipText: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.05em',
  },
  statusChipDivider: { color: '#334155', fontSize: 10 },
  clockWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 10px',
    borderRadius: 6,
    background: '#1e293b',
    border: '1px solid #334155',
  },
  clockDate: { fontSize: 11, color: '#94a3b8', fontFamily: "'DM Mono', monospace" },
  clockDivider: { color: '#334155', fontSize: 12 },
  clockTime: { fontSize: 11, color: '#60a5fa', fontFamily: "'DM Mono', monospace", fontWeight: 500 },

  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  sidebar: {
    background: '#FFFFFF',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s ease',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100%',
    overflowY: 'auto',
  },

  sidebarControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    minHeight: 52,
    gap: 10,
    flexShrink: 0,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: '#163347',
    cursor: 'pointer',
    display: 'flex',
    padding: 4,
    borderRadius: 5,
    flexShrink: 0,
  },

<<<<<<< HEAD
=======
  // Sidebar search styles
>>>>>>> feat/matt
  sideSearchWrap: {
    position: 'relative',
    flex: 1,
    marginLeft: 6,
    display: 'flex',
    alignItems: 'center',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '7px 10px',
    gap: 6,
  },
  sideSearchIcon: { color: '#7FA8C4', display: 'flex' },
  sideSearchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 13,
    color: '#091925',
    fontFamily: "'Poppins', sans-serif",
  },
  sideSearchClear: {
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    padding: '0 4px',
  },
  searchDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    zIndex: 9999,
  },
  searchEmpty: {
    padding: '12px 12px',
    fontSize: 12,
    color: '#64748b',
  },
  searchItem: {
    width: '100%',
    textAlign: 'left',
    border: 'none',
    background: '#fff',
    padding: '10px 12px',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  searchItemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  searchItemLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#091925',
  },
  searchItemSection: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  searchItemSub: {
    marginTop: 2,
    fontSize: 10,
    color: '#7FA8C4',
  },

  nav: { flex: 1, overflowY: 'auto', paddingBottom: 8 },
  navGroup: { marginBottom: 0 },

  sectionDivider: {
    width: 'calc(100% - 60px)',
    height: '0.5px',
    background: '#7FA8C4',
    margin: '6px 12px',
    opacity: 0.4,
  },

  navSection: {
    fontSize: 9,
    fontWeight: 700,
    color: '#7FA8C4',
    letterSpacing: '0.1em',
    padding: '8px 12px 4px',
    textTransform: 'uppercase',
    fontFamily: "'Poppins', sans-serif",
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 0,
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: 0,
    textDecoration: 'none',
    position: 'relative',
    minHeight: 52,
  },
  navItemActive: { background: '#ECF7FF' },

  activeAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    background: '#2EABFE',
    borderRadius: '0 3px 3px 0',
    flexShrink: 0,
  },
  inactiveAccentSpace: {
    width: 5,
    flexShrink: 0,
  },

  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s',
  },
  navIcon: { display: 'flex', flexShrink: 0 },
  navLabel: {
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    lineHeight: '20px',
    textTransform: 'capitalize',
  },
  navSub: {
    fontSize: 12,
    color: '#7FA8C4',
    marginTop: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 400,
    lineHeight: '18px',
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    padding: '1px 5px',
    borderRadius: 10,
    flexShrink: 0,
  },

  sidebarSignOut: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    flexShrink: 0,
    transition: 'background 0.15s',
    border: 'none',
    borderRadius: 0,
    background: 'transparent',
    margin: 0,
    width: '100%',
    minHeight: 52,
    padding: '10px 16px 10px 0',
  },

  mainWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
    background: '#f8fafc',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: 36,
    background: '#0f172a',
    fontSize: 10,
    color: '#475569',
    flexShrink: 0,
    fontFamily: "'DM Mono', monospace",
    zIndex: 100,
  },
  footerRight: { display: 'flex', alignItems: 'center', gap: 6, color: '#334155' },
  footerDot: { color: '#1e293b' },
};

export default AppLayout;
