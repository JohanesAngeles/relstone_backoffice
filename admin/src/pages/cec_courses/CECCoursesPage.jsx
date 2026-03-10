import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  FaClipboardList,
  FaLeaf,
  FaGlobe,
  FaDatabase,
  FaSearch,
  FaArrowRight,
  FaChevronLeft,
} from 'react-icons/fa';

// ── Sub-system config ────────────────────────────────────────────────────────
const SYSTEMS = [
  {
    id: 'online-exam',
    Icon: FaClipboardList,
    title: 'Online Exam System',
    subtitle: 'Manage and monitor CEC student exams',
    actions: [
      { label: 'BackOffice', to: '/admin/cec-courses/online-exam/backoffice', primary: true },
    ],
  },
  {
    id: 'tx-ethics',
    Icon: FaLeaf,
    title: 'TX Ethics',
    subtitle: 'Texas ethics exam & sales analysis reporting',
    actions: [
      { label: 'Texas Ethics Exam',       to: '/admin/cec-courses/tx-ethics/exam',            primary: true },
      { label: 'TX Sales Analysis Report', to: '/admin/cec-courses/tx-ethics/sales-analysis', primary: true },
    ],
  },
  {
    id: 'overnightce',
    Icon: FaGlobe,
    title: 'OvernightCE.com',
    subtitle: 'State information & update list management',
    actions: [
      { label: 'OvernightCE.com: State Info Update List', to: '/admin/cec-courses/overnightce/state-info', primary: true },
    ],
  },
  {
    id: 'state-cms',
    Icon: FaDatabase,
    title: 'State CMS Maintenance',
    subtitle: 'Individual state details & RELSTONE cert numbers',
    actions: [
      { label: 'Individual State Details / RELSTONE Cert #\'s', to: '/admin/cec-courses/state-cms/details', primary: true },
    ],
    note: 'Use this to view and maintain individual state CMS records and RELSTONE certification numbers. Contact your system administrator for write access.',
  },
  {
    id: 'cse-lookup',
    Icon: FaSearch,
    title: 'CSE Lookup',
    subtitle: 'CSE 2011 and shipping/order dollar lookup',
    actions: [
      { label: 'CSE 2011 Lookup',                   to: '/admin/cec-courses/cse-lookup/2011',     primary: false },
      { label: 'CSE org. Shipping / Order $ Lookup', to: '/admin/cec-courses/cse-lookup/shipping', primary: false },
    ],
  },
];

// ── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    padding: '1.5rem 2rem',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: "'HomepageBaukasten', 'Poppins', sans-serif",
    color: '#000000',
    margin: '0 0 0.3rem 0',
    lineHeight: 1.1,
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#5B7384',
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: '#FFFFFF',
    border: '0.5px solid #5B7384',
    borderRadius: '8px',
    padding: '0.45rem 1rem',
    fontSize: '0.78rem',
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    color: '#5B7384',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    marginTop: '0.35rem',
    textTransform: 'capitalize',
  },
  divider: {
    border: 'none',
    borderTop: '0.5px solid #2EABFE',
    margin: '0 0 1.25rem 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
  },
  card: {
    border: 'none',
    borderRadius: '10px',
    padding: '1rem',
    background: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    boxShadow: 'none',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    paddingBottom: '0.6rem',
  },
  cardHeaderDivider: {
    border: 'none',
    borderTop: '0.5px solid #5B7384',
    margin: '0 0 0.65rem 0',
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: '6px',
    background: 'rgba(208, 235, 255, 0.25)',
    border: '0.5px solid #2EABFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#2EABFE',
    fontSize: '0.95rem',
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
    color: '#091925',
    margin: '0 0 0.1rem 0',
    textTransform: 'capitalize',
  },
  cardSubtitle: {
    fontSize: '0.7rem',
    fontWeight: 400,
    fontFamily: "'Poppins', sans-serif",
    color: '#7FA8C4',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0.6rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    border: 'none',
    background: '#2EABFE',
    color: '#091925',
    textAlign: 'left',
    textTransform: 'capitalize',
    boxSizing: 'border-box',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0.6rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer',
    border: '0.5px solid #5B7384',
    background: '#FFFFFF',
    color: '#091925',
    textAlign: 'left',
    textTransform: 'capitalize',
    boxSizing: 'border-box',
  },
  note: {
    fontSize: '0.8rem',
    fontWeight: 400,
    fontFamily: "'Poppins', sans-serif",
    color: '#7FA8C4',
    margin: '0.6rem 0 0 0',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
};

// ── Component ────────────────────────────────────────────────────────────────
const CECCoursesPage = () => {
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [backHovered, setBackHovered] = useState(false);

  return (
    <AppLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');
      `}</style>
      <div style={S.page}>
        {/* Breadcrumb */}
        <Breadcrumb crumbs={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'C.E.C. Courses' },
        ]} />

        {/* Page Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>C.E.C. Courses</h1>
            <p style={S.subtitle}>
              Select a system or tool below to get started. Click any blue button to open that page.
            </p>
          </div>
          <button
            style={{
              ...S.backBtn,
              ...(backHovered ? { background: '#f3f4f6' } : {}),
            }}
            onClick={() => navigate('/admin')}
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
          >
            <FaChevronLeft style={{ fontSize: '0.7rem' }} />
            Back To Main Menu
          </button>
        </div>

        <hr style={S.divider} />

        {/* Grid */}
        <div style={S.grid}>
          {SYSTEMS.map((system) => {
            const { Icon } = system;
            return (
              <div style={S.card} key={system.id}>
                {/* Card Header */}
                <div style={S.cardHeader}>
                  <div style={S.cardIconWrap}>
                    <Icon />
                  </div>
                  <div>
                    <h2 style={S.cardTitle}>{system.title}</h2>
                    <p style={S.cardSubtitle}>{system.subtitle}</p>
                  </div>
                </div>

                {/* Divider under header */}
                <hr style={S.cardHeaderDivider} />

                {/* Buttons */}
                <div style={S.actions}>
                  {system.actions.map((action) => {
                    const btnKey = `${system.id}-${action.label}`;
                    const isHovered = hoveredBtn === btnKey;
                    const baseStyle = action.primary ? S.btnPrimary : S.btnSecondary;
                    const hoverStyle = action.primary
                      ? { background: '#1a9ee8' }
                      : { background: '#f3f4f6' };

                    return (
                      <button
                        key={action.label}
                        style={{ ...baseStyle, ...(isHovered ? hoverStyle : {}) }}
                        onClick={() => navigate(action.to)}
                        onMouseEnter={() => setHoveredBtn(btnKey)}
                        onMouseLeave={() => setHoveredBtn(null)}
                      >
                        <span>{action.label}</span>
                        <FaArrowRight style={{ fontSize: '0.75rem', opacity: 0.7 }} />
                      </button>
                    );
                  })}
                </div>

                {/* Optional note */}
                {system.note && <p style={S.note}>{system.note}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default CECCoursesPage;