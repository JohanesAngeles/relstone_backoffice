import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  FaEye, FaEdit, FaTrash, FaArrowRight, FaChevronLeft,
  FaExclamationCircle, FaBook, FaEnvelope, FaCertificate,
  FaQuestionCircle, FaSearch, FaChevronDown, FaPlus,
} from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TABS = ['Courses', 'Certificates', 'Email Templates'];
const STATUS_OPTIONS = ['All Status', 'Live', 'Draft'];
const SORT_OPTIONS = ['Last Modified', 'Title A–Z', 'Title Z–A'];

const severityColor = (s) => ({ high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' }[s] || '#94a3b8');

// ── Component ────────────────────────────────────────────────────────────────
const RelsCMSDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab]       = useState('Courses');
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy]             = useState('Last Modified');
  const [deleteModal, setDeleteModal]   = useState(null);
  const [backHovered, setBackHovered]   = useState(false);
  const [hoveredRow, setHoveredRow]     = useState(null);

  // ── Data state ──────────────────────────────────────────────
  const [courses, setCourses]           = useState([]);
  const [certificates] = useState([]);
  const [templates]       = useState([]);
  const [attention]       = useState([]);
  const [activity]         = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading]           = useState(true);

  // ── Fetch all data on mount ─────────────────────────────────
  useEffect(() => {

    // Fetch bundles (Courses tab)
    const token = localStorage.getItem('adminToken');

            fetch(`${API}/api/exam-qanda/bundles`, {
            headers: { 'Authorization': `Bearer ${token}` },
            })
      .then(r => r.json())
      .then(data => {
        const mapped = (data.bundles || []).map(b => ({
          id:           b._id,
          title:        b._id,
          type:         'Course',
          courseType:   b.courseType,
          versions:     b.versions.sort().map(v => v.replace('Version ', '')),
          examNames:    b.examNames.sort(),
          totalQuestions: b.totalQuestions,
          status:       'live',
          lastModified: '',
          author:       'Admin',
        }));
        setCourses(mapped);
        const total = (data.bundles || []).reduce((sum, b) => sum + b.totalQuestions, 0);
        setTotalQuestions(total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // TODO: replace these with real API calls when endpoints are ready
    // fetch(`${API}/api/rels-cms/certificates`, { credentials: 'include' }).then(r => r.json()).then(d => setCertificates(d));
    // fetch(`${API}/api/rels-cms/email-templates`, { credentials: 'include' }).then(r => r.json()).then(d => setTemplates(d));
    // fetch(`${API}/api/rels-cms/flags`, { credentials: 'include' }).then(r => r.json()).then(d => setAttention(d));
    // fetch(`${API}/api/rels-cms/activity`, { credentials: 'include' }).then(r => r.json()).then(d => setActivity(d));
  }, []);

  // ── Select data based on tab ────────────────────────────────
  const rawData = useMemo(() => {
    if (activeTab === 'Courses')         return courses;
    if (activeTab === 'Certificates')    return certificates;
    return templates;
  }, [activeTab, courses, certificates, templates]);

  // ── Filter + sort ───────────────────────────────────────────
  const tableData = useMemo(() => {
    let d = [...rawData];
    if (statusFilter !== 'All Status')
      d = d.filter(r => r.status === statusFilter.toLowerCase());
    if (search.trim())
      d = d.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase())
      );
    if (sortBy === 'Title A–Z')       d.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'Title Z–A')  d.sort((a, b) => b.title.localeCompare(a.title));
    else d.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    return d;
  }, [rawData, statusFilter, search, sortBy]);

  // ── Stat counts ─────────────────────────────────────────────
  const liveCourses    = courses.filter(c => c.status === 'live').length;
  const draftCourses   = courses.filter(c => c.status === 'draft').length;
  const liveTemplates  = templates.filter(t => t.status === 'live').length;
  const draftTemplates = templates.filter(t => t.status === 'draft').length;
  const activeCerts    = certificates.filter(c => c.status === 'live').length;
  const expiringCerts  = certificates.filter(c => c.expiresAt).length;

  // ── Handlers ────────────────────────────────────────────────
  const handleDelete  = (row) => setDeleteModal({ id: row.id, title: row.title });
  const confirmDelete = () => {
    // TODO: call DELETE /api/rels-cms/content/:id
    console.log('Delete:', deleteModal.id);
    setDeleteModal(null);
  };

  const handleView = (row) => {
    if (activeTab === 'Courses') {
      navigate(`/admin/real-estate/online-exam/rels-cms/exam-banks/${encodeURIComponent(row.id)}`);
    } else {
      navigate(`/admin/real-estate/online-exam/rels-cms/${activeTab.toLowerCase().replace(' ', '-')}/${row.id}/view`);
    }
  };

  const handleEdit = (row) => {
    navigate(`/admin/real-estate/online-exam/rels-cms/${activeTab.toLowerCase().replace(' ', '-')}/${row.id}/edit`);
  };

  return (
    <AppLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');
        .cms-row-action:hover { opacity: 1 !important; background: #f1f5f9 !important; }
        .cms-tab:hover { color: #2EABFE !important; }
        .cms-attention-row:hover { background: #f8fafc !important; }
        .cms-select:focus { outline: none; border-color: #2EABFE !important; }
      `}</style>

      <div style={S.page}>
        <Breadcrumb crumbs={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Real Estate', to: '/admin/real-estate' },
          { label: 'Online Exam System', to: '/admin/real-estate' },
          { label: 'RELS CMS' },
        ]} />

        {/* ── Page Header ── */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>RELS CMS</h1>
            <p style={S.subtitle}>Manage all course content, exam questions, certificates, and email templates</p>
          </div>
          <button
            style={{ ...S.backBtn, ...(backHovered ? { background: '#f3f4f6' } : {}) }}
            onClick={() => navigate('/admin/real-estate')}
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
          >
            <FaChevronLeft style={{ fontSize: '0.7rem' }} />
            Back To Real Estate
          </button>
        </div>

        <hr style={S.divider} />

        {/* ── Stat Cards ── */}
        <div style={S.statsGrid}>
          <StatCard icon={<FaBook />}         color="#2EABFE" value={loading ? '…' : courses.length}        label="Total Courses"    sub={`${liveCourses} live · ${draftCourses} draft`} />
          <StatCard icon={<FaEnvelope />}     color="#10b981" value={loading ? '…' : templates.length}      label="Email Templates"  sub={`${liveTemplates} active · ${draftTemplates} draft`} />
          <StatCard icon={<FaCertificate />}  color="#f59e0b" value={loading ? '…' : certificates.length}   label="Certificates"     sub={`${activeCerts} active · ${expiringCerts} expiring`} />
          <StatCard
            icon={<FaQuestionCircle />}
            color="#ef4444"
            value={loading ? '…' : totalQuestions.toLocaleString()}
            label="Exam Questions"
            sub="Across all courses"
            onClick={() => navigate('/admin/real-estate/online-exam/rels-cms/exam-banks')}
          />
        </div>

        {/* ── Content Library + Attention Panel ── */}
        <div style={S.bodyGrid}>

          {/* ── Content Library ── */}
          <div style={S.card}>
            <div style={S.libraryHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={S.libraryTitle}>Content Library</span>
                <span style={S.libraryBadge}>{tableData.length} Items</span>
              </div>
              <button style={S.addBtn} onClick={() => navigate(`/admin/real-estate/online-exam/rels-cms/create`)}>
                <FaPlus style={{ fontSize: '0.7rem' }} />
                Add New
              </button>
            </div>

            {/* Tabs + Filters */}
            <div style={S.libraryControls}>
              <div style={S.tabs}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    className="cms-tab"
                    style={{ ...S.tab, ...(activeTab === tab ? S.tabActive : {}) }}
                    onClick={() => { setActiveTab(tab); setSearch(''); setStatusFilter('All Status'); }}
                  >
                    {tab}
                    <span style={{ ...S.tabCount, ...(activeTab === tab ? S.tabCountActive : {}) }}>
                      {tab === 'Courses' ? courses.length : tab === 'Certificates' ? certificates.length : templates.length}
                    </span>
                  </button>
                ))}
              </div>

              <div style={S.filters}>
                <div style={S.searchWrap}>
                  <FaSearch style={S.searchIcon} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search Content..."
                    style={S.searchInput}
                  />
                </div>
                <div style={S.selectWrap}>
                  <select className="cms-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={S.select}>
                    {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <FaChevronDown style={S.selectArrow} />
                </div>
                <div style={S.selectWrap}>
                  <select className="cms-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={S.select}>
                    {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <FaChevronDown style={S.selectArrow} />
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={S.tableWrap}>
              {loading && activeTab === 'Courses' ? (
                <p style={S.loadingText}>Loading bundles...</p>
              ) : (
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: '40%' }}>TITLE / ID</th>
                      <th style={S.th}>TYPE</th>
                      {activeTab === 'Courses' && <th style={S.th}>VERSIONS</th>}
                      {activeTab === 'Courses' && <th style={S.th}>QUESTIONS</th>}
                      <th style={S.th}>STATUS</th>
                      {activeTab !== 'Courses' && <th style={S.th}>LAST MODIFIED</th>}
                      {activeTab !== 'Courses' && <th style={S.th}>AUTHOR</th>}
                      <th style={{ ...S.th, width: 80, textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={S.emptyCell}>No content found.</td>
                      </tr>
                    ) : tableData.map(row => (
                      <tr
                        key={row.id}
                        style={{ ...S.tr, ...(hoveredRow === row.id ? { background: '#f8fafc' } : {}) }}
                        onMouseEnter={() => setHoveredRow(row.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td style={S.td}>
                          <span style={S.rowTitle}>{row.title}</span>
                          <span style={S.rowId}>#{row.id}</span>
                        </td>
                        <td style={S.td}><span style={S.typeTag}>{row.type}</span></td>

                        {activeTab === 'Courses' && (
                          <td style={S.td}>
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                              {(row.versions || []).map(v => (
                                <span key={v} style={{ ...S.versionBadge, background: v === 'A' ? '#dbeafe' : '#ede9fe', color: v === 'A' ? '#1d4ed8' : '#7c3aed' }}>
                                  Ver {v}
                                </span>
                              ))}
                            </div>
                          </td>
                        )}

                        {activeTab === 'Courses' && (
                          <td style={{ ...S.td, fontSize: '0.8rem', color: '#5B7384', fontWeight: 600 }}>
                            {row.totalQuestions}
                          </td>
                        )}

                        <td style={S.td}>
                          <span style={{ ...S.statusBadge, background: row.status === 'live' ? '#dcfce7' : '#fef3c7', color: row.status === 'live' ? '#15803d' : '#92400e' }}>
                            {row.status === 'live' ? '● Live' : '○ Draft'}
                          </span>
                        </td>

                        {activeTab !== 'Courses' && (
                          <td style={{ ...S.td, color: '#5B7384', fontSize: '0.8rem' }}>{row.lastModified}</td>
                        )}
                        {activeTab !== 'Courses' && (
                          <td style={{ ...S.td, color: '#091925', fontSize: '0.8rem' }}>{row.author}</td>
                        )}

                        <td style={{ ...S.td, textAlign: 'right' }}>
                          <div style={S.rowActions}>
                            <button className="cms-row-action" title="View"   style={S.rowAction}                              onClick={() => handleView(row)}><FaEye /></button>
                            <button className="cms-row-action" title="Edit"   style={S.rowAction}                              onClick={() => handleEdit(row)}><FaEdit /></button>
                            <button className="cms-row-action" title="Delete" style={{ ...S.rowAction, color: '#ef4444' }}    onClick={() => handleDelete(row)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div style={S.rightCol}>

            {/* Needs Attention */}
            <div style={S.card}>
              <div style={S.panelHeader}>
                <FaExclamationCircle style={{ color: '#ef4444', fontSize: '0.9rem' }} />
                <span style={S.panelTitle}>Needs Attention</span>
              </div>
              <div style={S.attentionList}>
                {attention.length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: '#7FA8C4', margin: '0.5rem 0' }}>No flags at this time.</p>
                ) : attention.map((item, i) => (
                  <button
                    key={item.id}
                    className="cms-attention-row"
                    style={{ ...S.attentionRow, borderBottom: i < attention.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}
                    onClick={() => navigate('/admin/real-estate/online-exam/rels-cms')}
                  >
                    <span style={{ ...S.attentionDot, background: severityColor(item.severity) }} />
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <p style={S.attentionLabel}><strong>{item.label}</strong> — {item.reason}</p>
                      <p style={S.attentionMeta}>{item.meta}</p>
                    </div>
                    <FaArrowRight style={{ color: '#cbd5e1', fontSize: '0.7rem', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ ...S.card, marginTop: '1rem' }}>
              <div style={S.panelHeader}>
                <span style={S.panelTitle}>Recent Activity</span>
              </div>
              <div>
                {activity.length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: '#7FA8C4', margin: '0.5rem 0' }}>No recent activity.</p>
                ) : activity.map((item, i) => (
                  <div
                    key={item.id}
                    style={{ ...S.activityRow, borderBottom: i < activity.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}
                  >
                    <div style={S.activityDot} />
                    <div style={{ flex: 1 }}>
                      <p style={S.activityAction}>{item.action} — <span style={{ color: '#091925', fontWeight: 600 }}>{item.target}</span></p>
                      <p style={S.activityMeta}>{item.time} · {item.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <div style={S.modalIcon}><FaTrash style={{ color: '#ef4444' }} /></div>
            <h2 style={S.modalTitle}>Delete Content?</h2>
            <p style={S.modalBody}>
              Are you sure you want to delete <strong>"{deleteModal.title}"</strong>? This action cannot be undone.
            </p>
            <div style={S.modalActions}>
              <button style={S.modalCancel} onClick={() => setDeleteModal(null)}>Cancel</button>
              <button style={S.modalConfirm} onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, color, value, label, sub, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...S.statCard,
        ...(hovered ? { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' } : {}),
        ...(onClick ? { cursor: 'pointer' } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={{ ...S.statIcon, background: `${color}18`, color }}>{icon}</div>
      <div>
        <p style={S.statValue}>{value}</p>
        <p style={S.statLabel}>{label}</p>
        <p style={S.statSub}>{sub}</p>
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page:      { padding: '1.5rem 2rem', fontFamily: "'Poppins', sans-serif", minHeight: '100vh' },
  header:    { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' },
  title:     { fontSize: '2rem', fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: '#000000', margin: '0 0 0.3rem 0', lineHeight: 1.1 },
  subtitle:  { fontSize: '0.875rem', fontWeight: 500, color: '#5B7384', margin: 0 },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#FFFFFF',
    border: '0.5px solid #5B7384', borderRadius: '8px', padding: '0.45rem 1rem',
    fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Poppins', sans-serif",
    color: '#5B7384', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    marginTop: '0.35rem', textTransform: 'capitalize',
  },
  divider:   { border: 'none', borderTop: '0.5px solid #2EABFE', margin: '0 0 1.25rem 0' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' },
  statCard:  { background: '#FFFFFF', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', transition: 'box-shadow 0.2s ease', cursor: 'default' },
  statIcon:  { width: 44, height: 44, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 },
  statValue: { fontSize: '1.5rem', fontWeight: 700, color: '#091925', lineHeight: 1.1, margin: 0 },
  statLabel: { fontSize: '0.78rem', fontWeight: 600, color: '#5B7384', margin: '0.1rem 0' },
  statSub:   { fontSize: '0.7rem', color: '#7FA8C4', margin: 0 },

  bodyGrid:  { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'flex-start' },
  card:      { background: '#FFFFFF', borderRadius: '10px', padding: '1rem', overflow: 'hidden' },

  libraryHeader:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' },
  libraryTitle:    { fontSize: '0.95rem', fontWeight: 600, color: '#091925' },
  libraryBadge:    { background: '#EFF6FF', color: '#2563eb', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    background: '#2EABFE', color: '#091925', border: 'none',
    borderRadius: '6px', padding: '0.4rem 0.85rem',
    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },

  libraryControls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' },
  tabs:            { display: 'flex', gap: '0.25rem' },
  tab: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    background: 'none', border: 'none', padding: '0.4rem 0.75rem',
    borderRadius: '6px', fontSize: '0.82rem', fontWeight: 500,
    color: '#5B7384', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'color 0.15s',
  },
  tabActive:      { background: '#EFF6FF', color: '#2EABFE', fontWeight: 700 },
  tabCount:       { background: '#e2e8f0', color: '#64748b', fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' },
  tabCountActive: { background: '#bfdbfe', color: '#1d4ed8' },

  filters:    { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', border: '0.5px solid #e2e8f0', borderRadius: '6px', padding: '0.4rem 0.65rem' },
  searchIcon: { color: '#7FA8C4', fontSize: '0.75rem', flexShrink: 0 },
  searchInput:{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8rem', color: '#091925', fontFamily: "'Poppins', sans-serif", width: 140 },
  selectWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  select: {
    appearance: 'none', background: '#f8fafc', border: '0.5px solid #e2e8f0',
    borderRadius: '6px', padding: '0.4rem 1.8rem 0.4rem 0.65rem',
    fontSize: '0.78rem', color: '#091925', cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif", fontWeight: 500, transition: 'border-color 0.15s',
  },
  selectArrow: { position: 'absolute', right: '0.5rem', color: '#7FA8C4', fontSize: '0.6rem', pointerEvents: 'none' },

  tableWrap:   { overflowX: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { fontSize: '0.7rem', fontWeight: 700, color: '#7FA8C4', padding: '0.5rem 0.65rem', textAlign: 'left', borderBottom: '0.5px solid #e2e8f0', whiteSpace: 'nowrap', letterSpacing: '0.05em' },
  tr:          { transition: 'background 0.12s' },
  td:          { padding: '0.65rem 0.65rem', borderBottom: '0.5px solid #f1f5f9', verticalAlign: 'middle' },
  emptyCell:   { padding: '2rem', textAlign: 'center', color: '#7FA8C4', fontSize: '0.85rem' },
  loadingText: { padding: '2rem', textAlign: 'center', color: '#7FA8C4', fontSize: '0.85rem', margin: 0 },

  rowTitle:     { display: 'block', fontSize: '0.82rem', fontWeight: 500, color: '#091925', lineHeight: 1.35 },
  rowId:        { display: 'block', fontSize: '0.7rem', color: '#7FA8C4', marginTop: '0.1rem' },
  typeTag:      { fontSize: '0.72rem', color: '#5B7384', fontWeight: 500 },
  versionBadge: { fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' },
  statusBadge:  { fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' },

  rowActions: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' },
  rowAction: {
    width: 28, height: 28, border: 'none', background: 'transparent',
    borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#5B7384', fontSize: '0.75rem',
    opacity: 0.7, transition: 'all 0.15s',
  },

  rightCol:       { display: 'flex', flexDirection: 'column' },
  panelHeader:    { display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' },
  panelTitle:     { fontSize: '0.9rem', fontWeight: 600, color: '#091925' },

  attentionList: { display: 'flex', flexDirection: 'column' },
  attentionRow: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.6rem 0', background: 'none', border: 'none',
    cursor: 'pointer', width: '100%', transition: 'background 0.12s', borderRadius: '6px',
  },
  attentionDot:  { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  attentionLabel:{ fontSize: '0.78rem', color: '#5B7384', margin: 0, lineHeight: 1.4 },
  attentionMeta: { fontSize: '0.68rem', color: '#7FA8C4', margin: '0.1rem 0 0 0' },

  activityRow:   { display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.6rem 0' },
  activityDot:   { width: 7, height: 7, borderRadius: '50%', background: '#2EABFE', flexShrink: 0, marginTop: '0.3rem' },
  activityAction:{ fontSize: '0.78rem', color: '#5B7384', margin: 0, lineHeight: 1.4 },
  activityMeta:  { fontSize: '0.68rem', color: '#7FA8C4', margin: '0.1rem 0 0 0' },

  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal:        { background: '#fff', borderRadius: '12px', padding: '2rem', width: 400, maxWidth: '90vw', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalIcon:    { width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.2rem' },
  modalTitle:   { fontSize: '1.1rem', fontWeight: 700, color: '#091925', margin: '0 0 0.5rem' },
  modalBody:    { fontSize: '0.875rem', color: '#5B7384', margin: '0 0 1.5rem', lineHeight: 1.6 },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'center' },
  modalCancel:  { padding: '0.55rem 1.5rem', borderRadius: '8px', border: '0.5px solid #5B7384', background: '#fff', color: '#5B7384', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  modalConfirm: { padding: '0.55rem 1.5rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
};

export default RelsCMSDashboard;