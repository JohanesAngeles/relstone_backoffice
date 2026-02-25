import { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Icon Components (inline SVG to avoid extra deps) ────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  home:       'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  mail:       'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  shield:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  book:       'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  users:      'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  chart:      'M18 20V10 M12 20V4 M6 20v-6',
  bell:       'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  settings:   'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  logout:     'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  inbox:      'M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  check:      'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  clock:      'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2',
  file:       'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  search:     'M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z M16 16l4.5 4.5',
  tag:        'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01',
  globe:      'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  list:       'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  externalLink: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3',
};

// ─── Sidebar Nav Items ────────────────────────────────────────────────────────
const navItems = [
  { label: 'Dashboard',        icon: 'home',     to: '/admin' },
  { label: 'Email Lookups',    icon: 'mail',     to: '/admin/email-lookups' },
  { label: 'Promo Discounts',  icon: 'tag',      to: '/admin/promo-discounts' },
  { label: 'DRE Verify',       icon: 'shield',   to: '/admin/dre-verify' },
  { label: 'MOM vs. DRE',      icon: 'chart',    to: '/admin/mom-vs-dre' },
  { label: 'Update DRE Cert',  icon: 'file',     to: '/admin/update-dre-cert' },
  { label: 'Reports',          icon: 'list',     to: '/admin/reports' },
  { label: 'Settings',         icon: 'settings', to: '/admin/settings' },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, count, color, icon }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <div style={{ ...styles.statIcon, backgroundColor: color + '20', color }}>
      <Icon d={icons[icon]} size={20} />
    </div>
    <div>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statCount, color }}>{count}</p>
    </div>
  </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, accent, items }) => (
  <div style={{ ...styles.sectionCard, borderTop: `3px solid ${accent}` }}>
    <h3 style={{ ...styles.sectionTitle, color: accent }}>{title}</h3>
    <ul style={styles.sectionList}>
      {items.map((item, i) => (
        <li key={i} style={styles.sectionItem}>
          {item.sub ? (
            <div>
              <span style={styles.sectionParent}>{item.label}</span>
              <ul style={styles.subList}>
                {item.sub.map((s, j) => (
                  <li key={j}>
                    <Link to={s.to} style={styles.subLink}>
                      <span style={styles.subDot}>›</span> {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Link to={item.to} style={styles.sectionLink}>
              <Icon d={icons.externalLink} size={13} />
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);

// ─── Report Row ───────────────────────────────────────────────────────────────
const ReportRow = ({ label, to }) => (
  <Link to={to} style={styles.reportRow}>
    <div style={styles.reportDot} />
    <span>{label}</span>
    <Icon d={icons.externalLink} size={13} />
  </Link>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminHome = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('/admin');

  const now = new Date();
  const serverTime = now.toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'America/Los_Angeles', hour12: false,
  }) + ' P.S.T.';

  const realEstateItems = [
    {
      label: 'Online Exam System',
      sub: [
        { label: 'BackOffice Portal',   to: '/admin/re/backoffice' },
        { label: 'Secure Orders',        to: '/admin/re/secure-orders' },
        { label: 'RELS CMS',             to: '/admin/re/rels-cms' },
      ],
    },
    {
      label: 'ExamPrepCentral.com',
      sub: [
        { label: 'BackOffice Portal',   to: '/admin/epc/backoffice' },
        { label: 'Secure Orders',        to: '/admin/epc/secure-orders' },
      ],
    },
    {
      label: 'ST2 (Paradox) Maintenance',
      sub: [
        { label: 'ST2 Data Lookup',     to: '/admin/st2/lookup' },
      ],
    },
    { label: 'MLO Status Report',    to: '/admin/mlo-status' },
    { label: 'MLO Evaluations',      to: '/admin/mlo-evaluations' },
    { label: 'Affiliate List',        to: '/admin/affiliates' },
  ];

  const cecItems = [
    {
      label: 'Online Exam System',
      sub: [
        { label: 'BackOffice Portal',  to: '/admin/cec/backoffice' },
      ],
    },
    {
      label: 'TX Ethics',
      sub: [
        { label: 'Texas Ethics Exam',             to: '/admin/tx/ethics-exam' },
        { label: 'TX Sales Analysis Report',      to: '/admin/tx/sales-analysis' },
      ],
    },
    {
      label: 'OvernightCE.com',
      sub: [
        { label: 'State Info Update List',        to: '/admin/oce/state-info' },
      ],
    },
    {
      label: 'State CMS Maintenance',
      sub: [
        { label: 'Individual State Details (RELSTONE Cert #s)', to: '/admin/state-cms' },
      ],
    },
    {
      label: 'CSE Lookup',
      sub: [
        { label: 'CSE 2011 Lookup',               to: '/admin/cse/2011' },
        { label: 'CSE Org. Shipping / Order $ Lookup', to: '/admin/cse/orders' },
      ],
    },
  ];

  return (
    <div style={styles.root}>
      {/* ── Sidebar ── */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? 240 : 64 }}>
        <div style={styles.sidebarHeader}>
          {sidebarOpen && <span style={styles.sidebarBrand}>RELSTONE</span>}
          <button style={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setActiveNav(item.to)}
              style={{
                ...styles.navItem,
                ...(activeNav === item.to ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}><Icon d={icons[item.icon]} size={18} /></span>
              {sidebarOpen && <span style={styles.navLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <Link to="/login" style={styles.logoutBtn}>
          <span style={styles.navIcon}><Icon d={icons.logout} size={18} /></span>
          {sidebarOpen && <span style={styles.navLabel}>Logout</span>}
        </Link>
      </aside>

      {/* ── Main Content ── */}
      <div style={styles.main}>

        {/* Top Bar */}
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>BackOffice Dashboard</h1>
            <p style={styles.serverTime}>Server Time: {serverTime}</p>
          </div>
          <div style={styles.topBarRight}>
            <div style={styles.notifBtn}>
              <Icon d={icons.bell} size={20} />
              <span style={styles.notifDot} />
            </div>
            <div style={styles.adminAvatar}>A</div>
          </div>
        </header>

        {/* ── Stat Cards ── */}
        <section style={styles.statsRow}>
          <StatCard label="New Information Requests" count={0}  color="#3b82f6" icon="inbox" />
          <StatCard label="Scheduled Follow-ups"     count={0}  color="#ef4444" icon="clock" />
          <StatCard label="Closed Info Requests"     count={0}  color="#10b981" icon="check" />
          <StatCard label="Student Feedbacks"        count={0}  color="#f59e0b" icon="users" />
        </section>

        {/* ── Module Sections ── */}
        <section style={styles.sectionsRow}>
          <SectionCard title="Real Estate" accent="#3b82f6" items={realEstateItems} />
          <SectionCard title="C.E.C. (Continuing Education)" accent="#10b981" items={cecItems} />
        </section>

        {/* ── Reports ── */}
        <section style={styles.reportsCard}>
          <h3 style={styles.reportsTitle}>
            <Icon d={icons.chart} size={18} />
            Reports & Documents
          </h3>
          <div style={styles.reportsGrid}>
            <ReportRow label="View Completed Exams"          to="/admin/reports/completed-exams" />
            <ReportRow label="Students Who Obtained Certs"   to="/admin/reports/student-certs" />
            <ReportRow label="Website Info Requests"         to="/admin/reports/info-requests" />
            <ReportRow label="R.E. Source PDFs"              to="/admin/reports/re-pdfs" />
            <ReportRow label="Complete Exam List (w/ Q&As)"  to="/admin/reports/exam-list" />
          </div>
        </section>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        body { font-family: 'DM Sans', sans-serif; }

        .navItem:hover { background: rgba(59,130,246,0.1) !important; color: #3b82f6 !important; }
        .sectionLink:hover { color: #3b82f6 !important; }
        .subLink:hover { color: #3b82f6 !important; }
        .reportRow:hover { background: #f8fafc !important; }
      `}</style>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
  display: 'flex',
  width: '100vw',
  minHeight: '100vh',
  backgroundColor: '#f1f5f9',
  fontFamily: "'DM Sans', sans-serif",
  fontSize:"18px",
},

  // Sidebar
  sidebar: {
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.25s ease',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 16px',
    borderBottom: '1px solid #1e293b',
    minHeight: 64,
  },
  sidebarBrand: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: 15,
    color: '#3b82f6',
    letterSpacing: '0.1em',
    whiteSpace: 'nowrap',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 6,
    display: 'flex',
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 8,
    color: '#94a3b8',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    fontSize: 14,
    fontWeight: 500,
  },
  navItemActive: {
    backgroundColor: '#1e3a5f',
    color: '#3b82f6',
  },
  navIcon: { flexShrink: 0, display: 'flex' },
  navLabel: { overflow: 'hidden' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    color: '#ef4444',
    borderTop: '1px solid #1e293b',
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  // Main
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    padding: 28,
    overflow: 'auto',
  },

  // Top Bar
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: '18px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  serverTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontFamily: "'JetBrains Mono', monospace",
  },
  topBarRight: { display: 'flex', alignItems: 'center', gap: 16 },
  notifBtn: {
    position: 'relative',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    border: '2px solid white',
  },
  adminAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
  },

  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 4 },
  statCount: { fontSize: 26, fontWeight: 700, lineHeight: 1 },

  // Section Cards
  sectionsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: '22px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 18,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  sectionList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sectionItem: { fontSize: 14 },
  sectionParent: {
    display: 'block',
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
    fontSize: 13,
  },
  sectionLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: '#374151',
    fontWeight: 600,
    fontSize: 13,
    transition: 'color 0.15s',
  },
  subList: {
    listStyle: 'none',
    paddingLeft: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  subLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#64748b',
    fontSize: 13,
    transition: 'color 0.15s',
  },
  subDot: { color: '#94a3b8', fontWeight: 700 },

  // Reports
  reportsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: '22px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  reportsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  reportRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 8,
    color: '#374151',
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid #e2e8f0',
    transition: 'background 0.15s',
    justifyContent: 'space-between',
  },
  reportDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    flexShrink: 0,
  },
};

export default AdminHome;