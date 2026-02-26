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
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 0.3rem 0',
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '0.45rem 1rem',
    fontSize: '0.82rem',
    fontWeight: 500,
    color: '#374151',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    marginTop: '0.25rem',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '0 0 1.75rem 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1.5rem',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: '8px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#2563eb',
    fontSize: '1rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 0.2rem 0',
  },
  cardSubtitle: {
    fontSize: '0.78rem',
    color: '#6b7280',
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
    padding: '0.65rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    textAlign: 'left',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0.65rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    textAlign: 'left',
  },
  note: {
    fontSize: '0.78rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.5,
    borderTop: '1px solid #f3f4f6',
    paddingTop: '0.75rem',
  },
};

// ── Component ────────────────────────────────────────────────────────────────
const RealEstatePage = () => {
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [backHovered, setBackHovered] = useState(false);

  return (
    <AppLayout>
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
          style={{ ...S.backBtn, ...(backHovered ? { background: '#f3f4f6' } : {}) }}
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

              {/* Buttons */}
              <div style={S.actions}>
                {system.actions.map((action) => {
                  const btnKey = `${system.id}-${action.label}`;
                  const isHovered = hoveredBtn === btnKey;
                  const baseStyle = action.primary ? S.btnPrimary : S.btnSecondary;
                  const hoverStyle = action.primary
                    ? { background: '#1d4ed8' }
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