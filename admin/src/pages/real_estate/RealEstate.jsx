import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  FaClipboardList,
  FaBookOpen,
  FaDatabase,
  FaChartBar,
  FaArrowRight,
  FaChevronLeft,
} from 'react-icons/fa';

// ── Sub-system config ────────────────────────────────────────────────────────
const SYSTEMS = [
  {
    id: 'online-exam',
    Icon: FaClipboardList,
    title: 'Online Exam System',
    subtitle: 'Manage and monitor student exams',
    actions: [
      { label: 'BackOffice', to: '/admin/real-estate/online-exam/backoffice', primary: true },
      { label: 'Secure Orders', to: '/real-estate/online-exam/secure-orders', primary: true },
      { label: 'RELS CMS', to: '/real-estate/online-exam/rels-cms', primary: true },
    ],
  },
  {
    id: 'examprep',
    Icon: FaBookOpen,
    title: 'ExamPrepCentral.Com',
    subtitle: 'Exam preparation & secure order management',
    actions: [
      { label: 'BackOffice', to: '/real-estate/examprep/backoffice', primary: true },
      { label: 'Secure Orders', to: '/real-estate/examprep/secure-orders', primary: true },
    ],
  },
  {
    id: 'st2',
    Icon: FaDatabase,
    title: 'ST2 (Paradox) Maintenance',
    subtitle: 'Database records & data lookup',
    actions: [
      { label: 'ST2 Data Lookup', to: '/real-estate/st2/lookup', primary: true },
    ],
    note: 'Use this to search, view, and maintain ST2 Paradox database records. Contact your system administrator if you need write access.',
  },
  {
    id: 'mlo',
    Icon: FaChartBar,
    title: 'MLO & Affiliates',
    subtitle: 'Status reports, evaluations and affiliate list',
    actions: [
      { label: 'MLO Status Report', to: '/real-estate/mlo/status-report', primary: false },
      { label: 'MLO Evaluations', to: '/real-estate/mlo/evaluations', primary: false },
      { label: 'Affiliate List', to: '/real-estate/mlo/affiliates', primary: false },
    ],
  },
];

// ── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    padding: '2rem 2.5rem',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '2.625rem',      // ~42px per Figma
    fontWeight: 700,
    fontFamily: "'HomepageBaukasten', 'Poppins', sans-serif",
    color: '#000000',
    margin: '0 0 0.4rem 0',
    lineHeight: 1.1,
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: '1rem',          // ~18px per Figma, scaled for readability
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
    borderRadius: '10px',
    padding: '0.6rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
    color: '#5B7384',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    marginTop: '0.5rem',
    textTransform: 'capitalize',
  },
  divider: {
    border: 'none',
    borderTop: '0.5px solid #2EABFE',   // Blue divider per Figma
    margin: '0 0 1.75rem 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  card: {
    border: 'none',
    borderRadius: '10px',
    padding: '1.25rem 1.25rem 1.25rem 1.25rem',
    background: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    boxShadow: 'none',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    paddingBottom: '0.75rem',
  },
  cardHeaderDivider: {
    border: 'none',
    borderTop: '0.5px solid #5B7384',
    margin: '0 0 0.875rem 0',
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: '6.67px',
    background: 'rgba(208, 235, 255, 0.25)',
    border: '0.5px solid #2EABFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#2EABFE',
    fontSize: '1.1rem',
  },
  cardTitle: {
    fontSize: '1.125rem',      // 18px per Figma
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
    color: '#091925',
    margin: '0 0 0.15rem 0',
    textTransform: 'capitalize',
  },
  cardSubtitle: {
    fontSize: '0.75rem',       // 12px per Figma
    fontWeight: 400,
    fontFamily: "'Poppins', sans-serif",
    color: '#7FA8C4',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0.8rem 1.25rem',
    borderRadius: '6.67px',
    fontSize: '1rem',          // 16px per Figma
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
    padding: '0.8rem 1.25rem',
    borderRadius: '6.67px',
    fontSize: '1rem',          // 16px per Figma
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
    fontSize: '1rem',          // 16px per Figma
    fontWeight: 400,
    fontFamily: "'Poppins', sans-serif",
    color: '#7FA8C4',
    margin: '0.75rem 0 0 0',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
};

// ── Component ────────────────────────────────────────────────────────────────
const RealEstatePage = () => {
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [backHovered, setBackHovered] = useState(false);

  return (
    <AppLayout>
      {/* Poppins font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');
      `}</style>
      <div style={S.page}>
        {/* Breadcrumb */}
        <Breadcrumb crumbs={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Real Estate' },
        ]} />

        {/* Page Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>Real Estate</h1>
            <p style={S.subtitle}>
              Select a system or tool below to get started. Click any blue button to open that page.
            </p>
          </div>
          <button
            style={{
              ...S.backBtn,
              ...(backHovered ? { background: '#f3f4f6' } : {}),
            }}
            onClick={() => navigate('/dashboard')}
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

export default RealEstatePage;
