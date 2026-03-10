import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import AppLayout from '../../layouts/AppLayout';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  FaEye, FaEdit, FaTrash, FaArrowRight, FaChevronLeft,
  FaExclamationCircle, FaBook, FaEnvelope, FaCertificate,
  FaQuestionCircle, FaSearch, FaChevronDown, FaPlus,
<<<<<<< HEAD
  FaLayerGroup,
=======
>>>>>>> feat/matt
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
<<<<<<< HEAD
  const [courseContentCount, setCourseContentCount] = useState(0);
=======
>>>>>>> feat/matt
  const [loading, setLoading]           = useState(true);

  // ── Fetch all data on mount ─────────────────────────────────
  useEffect(() => {

    // Fetch bundles (Courses tab)
    const token = localStorage.getItem('adminToken');

<<<<<<< HEAD
      // Fetch course content count
      fetch(`${API}/api/course-content`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          setCourseContentCount(Array.isArray(data) ? data.length : 0);
        })
        .catch(() => {});

=======
>>>>>>> feat/matt
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .cms-wrap * { font-family: 'Poppins', sans-serif !important; }
        .cms-row-hover-view, .cms-row-hover-edit, .cms-row-hover-delete { transition: all 0.15s ease !important; }
        .cms-row-hover-view:hover  { background: rgba(46,171,254,0.1) !important; border-color: #2EABFE !important; color: #2EABFE !important; }
        .cms-row-hover-edit:hover  { background: rgba(46,171,254,0.1) !important; border-color: #2EABFE !important; color: #2EABFE !important; }
        .cms-row-hover-delete:hover{ background: rgba(239,68,68,0.1)  !important; border-color: #EF4444 !important; color: #EF4444 !important; }
        .cms-tab:hover { color: #2EABFE !important; }
        .cms-attention-row:hover { background: #f8fafc !important; }
        .cms-select:focus { outline: none; border-color: #2EABFE !important; }
        .cms-search-input::placeholder { color: #7FA8C4; font-family: 'Poppins', sans-serif; font-size: 0.68rem; }
      `}</style>

      <div className="cms-wrap" style={S.page}>
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
            <FaChevronLeft style={{ fontSize: '0.55rem' }} />
            Back To Real Estate
          </button>
        </div>

        <hr style={S.divider} />

        {/* ── Stat Cards ── */}
        <div style={S.statsGrid}>
          <StatCard icon={<FaBook />}        color="#2EABFE" value={loading ? '…' : courses.length}               label="Total Courses"   sub={`${liveCourses} live · ${draftCourses} draft`} />
          <StatCard icon={<FaEnvelope />}    color="#008000" value={loading ? '…' : templates.length}             label="Email Templates" sub={`${liveTemplates} active · ${draftTemplates} draft`} />
          <StatCard icon={<FaCertificate />} color="#f59e0b" value={loading ? '…' : certificates.length}          label="Certificates"    sub={`${activeCerts} active · ${expiringCerts} expiring`} />
          <StatCard
            icon={<FaQuestionCircle />}
            color="#ef4444"
            value={loading ? '…' : totalQuestions.toLocaleString()}
            label="Exam Questions"
            sub="Across all courses"
            onClick={() => navigate('/admin/real-estate/online-exam/rels-cms/exam-banks')}
          />
<<<<<<< HEAD
          <StatCard
            icon={<FaLayerGroup />}
            color="#9569F7"
            value={loading ? '…' : courseContentCount}
            label="Course Content"
            sub={`${courseContentCount} of 11 courses built`}
            onClick={() => navigate('/admin/course-content')}
          />
=======
>>>>>>> feat/matt
        </div>

        {/* ── Content Library (full width) ── */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={S.card}>

            {/* Header */}
            <div style={S.libraryHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={S.libraryTitle}>Content Library</span>
                <span style={S.libraryBadge}>{tableData.length} Items</span>
              </div>
              <button style={S.addBtn} onClick={() => navigate(`/admin/real-estate/online-exam/rels-cms/create`)}>
                <FaPlus style={{ fontSize: '0.58rem' }} />
                Add New
              </button>
            </div>

            <hr style={S.cardDivider} />

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
                    className="cms-search-input"
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
                    <tr style={{ background: 'rgba(127,168,196,0.1)' }}>
                      <th style={{ ...S.th, width: '18%' }}>TITLE / ID</th>
                      <th style={S.th}>TYPE</th>
                      {activeTab === 'Courses' && <th style={S.th}>VERSIONS</th>}
                      {activeTab === 'Courses' && <th style={S.th}>QUESTIONS</th>}
                      <th style={S.th}>STATUS</th>
                      {activeTab !== 'Courses' && <th style={S.th}>LAST MODIFIED</th>}
                      <th style={S.th}>AUTHOR</th>
                      <th style={{ ...S.th, textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length === 0 ? (
                      <tr><td colSpan={7} style={S.emptyCell}>No content found.</td></tr>
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
                        <td style={S.td}>
                          <span style={S.typeTag}>{row.type}</span>
                        </td>

                        {activeTab === 'Courses' && (
                          <td style={S.td}>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {(row.versions || []).map(v => (
                                <span key={v} style={{
                                  ...S.versionBadge,
                                  background: v === 'A' ? 'rgba(46,171,254,0.1)' : 'rgba(149,105,247,0.1)',
                                  color:      v === 'A' ? '#2EABFE'              : '#9569F7',
                                  border:     v === 'A' ? '0.5px solid #2EABFE' : '0.5px solid #9569F7',
                                }}>
                                  Ver {v}
                                </span>
                              ))}
                            </div>
                          </td>
                        )}

                        {activeTab === 'Courses' && (
                          <td style={{ ...S.td, fontSize: '0.72rem', color: '#091925', fontWeight: 600 }}>
                            {row.totalQuestions}
                          </td>
                        )}

                        <td style={S.td}>
                          <span style={{
                            ...S.statusBadge,
                            background: row.status === 'live' ? 'rgba(0,128,0,0.1)' : 'rgba(245,158,11,0.1)',
                            color:      row.status === 'live' ? '#008000'            : '#92400e',
                            border:     row.status === 'live' ? '0.5px solid #008000' : '0.5px solid #f59e0b',
                          }}>
                            <span style={{
                              width: 5, height: 5, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
                              background: row.status === 'live' ? '#008000' : '#f59e0b', marginRight: 4,
                            }} />
                            {row.status === 'live' ? 'Live' : 'Draft'}
                          </span>
                        </td>

                        {activeTab !== 'Courses' && (
                          <td style={{ ...S.td, fontSize: '0.68rem', color: '#5B7384' }}>{row.lastModified}</td>
                        )}
                        <td style={{ ...S.td, fontSize: '0.68rem', color: '#091925' }}>{row.author}</td>

                        <td style={{ ...S.td, textAlign: 'right' }}>
                          <div style={S.rowActions}>
                            <button className="cms-row-hover-view"   title="View"   style={S.rowActionBtn} onClick={() => handleView(row)}><FaEye /></button>
                            <button className="cms-row-hover-edit"   title="Edit"   style={S.rowActionBtn} onClick={() => handleEdit(row)}><FaEdit /></button>
                            <button className="cms-row-hover-delete" title="Delete" style={S.rowActionBtn} onClick={() => handleDelete(row)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Panels ── */}
        <div style={S.bottomGrid}>

          {/* Needs Attention */}
          <div style={S.card}>
            <div style={S.panelHeader}>
              <FaExclamationCircle style={{ color: '#ef4444', fontSize: '0.78rem' }} />
              <span style={{ ...S.panelTitle, color: '#ef4444' }}>Needs Attention</span>
            </div>
            <hr style={S.cardDivider} />
            <div style={S.attentionList}>
              {attention.length === 0 ? (
                <p style={S.emptyPanelText}>No flags at this time.</p>
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
                  <FaArrowRight style={{ color: '#cbd5e1', fontSize: '0.58rem', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={S.card}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}>Recent Activity</span>
            </div>
            <hr style={S.cardDivider} />
            <div>
              {activity.length === 0 ? (
                <p style={S.emptyPanelText}>No recent activity.</p>
              ) : activity.map((item, i) => (
                <div
                  key={item.id}
                  style={{ ...S.activityRow, borderBottom: i < activity.length - 1 ? '0.5px solid #f1f5f9' : 'none' }}
                >
                  <div style={S.activityAvatar}>
                    <span style={S.activityAvatarText}>{item.user ? item.user.slice(0, 2).toUpperCase() : 'AU'}</span>
                  </div>
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
              <button style={S.modalCancel}  onClick={() => setDeleteModal(null)}>Cancel</button>
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
        borderTop: `3px solid ${color}`,
        ...(hovered ? { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' } : {}),
        ...(onClick ? { cursor: 'pointer' } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={{ ...S.statIcon, background: `${color}18`, border: `0.5px solid ${color}`, color }}>{icon}</div>
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
  // Page shell
  page:     { padding: '1.25rem 1.75rem', fontFamily: "'Poppins', sans-serif", minHeight: '100vh' },
  header:   { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' },
  title:    { fontSize: '1.6rem', fontWeight: 700, color: '#000', margin: '0 0 0.2rem 0', lineHeight: 1.1, fontFamily: "'Poppins', sans-serif" },
  subtitle: { fontSize: '0.75rem', fontWeight: 500, color: '#5B7384', margin: 0, fontFamily: "'Poppins', sans-serif" },
  backBtn:  {
    display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#fff',
    border: '0.5px solid #5B7384', borderRadius: '5px', padding: '0.35rem 0.85rem',
    fontSize: '0.7rem', fontWeight: 700, color: '#5B7384', cursor: 'pointer',
    whiteSpace: 'nowrap', flexShrink: 0, marginTop: '0.3rem', fontFamily: "'Poppins', sans-serif",
  },
  divider:  { display: 'none', margin: '0 0 1rem 0' },

  // Stat cards
<<<<<<< HEAD
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.75rem', marginBottom: '0.85rem' },
=======
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '0.85rem' },
>>>>>>> feat/matt
  statCard:  { background: '#fff', borderRadius: '5px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.7rem', transition: 'box-shadow 0.2s ease', cursor: 'default' },
  statIcon:  { width: 48, height: 48, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 },
  statValue: { fontSize: '1.4rem', fontWeight: 700, color: '#091925', lineHeight: 1.1, margin: 0, fontFamily: "'Poppins', sans-serif" },
  statLabel: { fontSize: '0.7rem', fontWeight: 500, color: 'rgba(9,25,37,0.7)', margin: '0.1rem 0', fontFamily: "'Poppins', sans-serif" },
  statSub:   { fontSize: '0.62rem', color: 'rgba(9,25,37,0.3)', margin: 0, fontFamily: "'Poppins', sans-serif" },

  // Card
  card:        { background: '#fff', borderRadius: '5px', padding: '0.85rem', overflow: 'hidden' },
  cardDivider: { border: 'none', borderTop: '0.5px solid #5B7384', margin: '0 0 0.6rem 0' },

  // Library header
  libraryHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' },
  libraryTitle:   { fontSize: '0.8rem', fontWeight: 500, color: '#091925', fontFamily: "'Poppins', sans-serif" },
  libraryBadge:   { background: 'rgba(26,122,184,0.1)', color: '#1A7AB8', fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', fontFamily: "'Poppins', sans-serif" },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#2EABFE',
    color: '#091925', border: 'none', borderRadius: '5px', padding: '0.3rem 0.65rem',
    fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
  },

  // Tabs + filters
  libraryControls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' },
  tabs:            { display: 'flex', gap: '0.15rem' },
  tab: {
    display: 'flex', alignItems: 'center', gap: '0.28rem', background: 'none', border: 'none',
    padding: '0.28rem 0.55rem', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 700,
    color: '#5B7384', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'color 0.15s',
  },
  tabActive:      { background: '#2EABFE', color: '#091925', border: '0.5px solid #2EABFE' },
  tabCount:       { background: 'rgba(91,115,132,0.1)', color: '#5B7384', fontSize: '0.56rem', fontWeight: 700, padding: '1px 5px', borderRadius: '100px', fontFamily: "'Poppins', sans-serif" },
  tabCountActive: { background: 'rgba(9,25,37,0.1)', color: '#091925' },

  filters:    { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    background: 'rgba(127,168,196,0.1)', border: '0.5px solid #7FA8C4',
    borderRadius: '5px', padding: '0.28rem 0.55rem',
  },
  searchIcon:  { color: '#7FA8C4', fontSize: '0.6rem', flexShrink: 0 },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: '0.65rem', color: '#091925', fontFamily: "'Poppins', sans-serif", width: 120 },
  selectWrap:  { position: 'relative', display: 'flex', alignItems: 'center' },
  select: {
    appearance: 'none', background: 'rgba(127,168,196,0.1)', border: '0.5px solid #7FA8C4',
    borderRadius: '5px', padding: '0.28rem 1.4rem 0.28rem 0.5rem',
    fontSize: '0.65rem', color: '#091925', cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif", fontWeight: 500, transition: 'border-color 0.15s',
  },
  selectArrow: { position: 'absolute', right: '0.42rem', color: '#7FA8C4', fontSize: '0.48rem', pointerEvents: 'none' },

  // Table
  tableWrap:   { overflowX: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontSize: '0.6rem', fontWeight: 500, color: '#5B7384', padding: '0.42rem 0.6rem',
    textAlign: 'left', borderTop: '0.5px solid #5B7384', borderBottom: '0.5px solid #5B7384',
    whiteSpace: 'nowrap', letterSpacing: '0.05em', textTransform: 'uppercase',
    fontFamily: "'Poppins', sans-serif",
  },
  tr:          { transition: 'background 0.12s' },
  td:          { padding: '0.52rem 0.6rem', borderBottom: '0.5px solid #5B7384', verticalAlign: 'middle' },
  emptyCell:   { padding: '2rem', textAlign: 'center', color: '#7FA8C4', fontSize: '0.7rem', fontFamily: "'Poppins', sans-serif" },
  loadingText: { padding: '2rem', textAlign: 'center', color: '#7FA8C4', fontSize: '0.7rem', margin: 0, fontFamily: "'Poppins', sans-serif" },

  rowTitle:     { display: 'block', fontSize: '0.7rem', fontWeight: 500, color: '#091925', lineHeight: 1.35, fontFamily: "'Poppins', sans-serif" },
  rowId:        { display: 'block', fontSize: '0.6rem', color: 'rgba(9,25,37,0.3)', marginTop: '0.07rem', fontFamily: "'Poppins', sans-serif" },
  typeTag:      { fontSize: '0.7rem', color: '#091925', fontWeight: 500, fontFamily: "'Poppins', sans-serif" },
  versionBadge: { fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', fontFamily: "'Poppins', sans-serif" },
  statusBadge:  { fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', fontFamily: "'Poppins', sans-serif" },

  rowActions:   { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' },
  rowActionBtn: {
    width: 32, height: 32, border: '0.5px solid #7FA8C4',
    background: 'rgba(127,168,196,0.05)', borderRadius: '5px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#7FA8C4', fontSize: '0.75rem',
  },

  // Bottom panels
  bottomGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  panelHeader:   { display: 'flex', alignItems: 'center', gap: '0.38rem', marginBottom: '0.38rem' },
  panelTitle:    { fontSize: '0.75rem', fontWeight: 500, color: '#091925', fontFamily: "'Poppins', sans-serif" },
  emptyPanelText:{ fontSize: '0.65rem', color: '#7FA8C4', margin: '0.35rem 0', fontFamily: "'Poppins', sans-serif" },

  attentionList: { display: 'flex', flexDirection: 'column' },
  attentionRow:  {
    display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.42rem 0',
    background: 'none', border: 'none', cursor: 'pointer', width: '100%',
    transition: 'background 0.12s', borderRadius: '5px',
  },
  attentionDot:  { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  attentionLabel:{ fontSize: '0.65rem', fontWeight: 700, color: '#091925', margin: 0, lineHeight: 1.4, fontFamily: "'Poppins', sans-serif" },
  attentionMeta: { fontSize: '0.57rem', color: 'rgba(9,25,37,0.3)', margin: '0.07rem 0 0 0', fontFamily: "'Poppins', sans-serif" },

  activityRow:        { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.42rem 0' },
  activityAvatar:     { width: 24, height: 24, borderRadius: '50%', background: '#2EABFE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  activityAvatarText: { fontSize: '0.52rem', fontWeight: 700, color: '#091925', fontFamily: "'Poppins', sans-serif" },
  activityAction:     { fontSize: '0.65rem', fontWeight: 700, color: '#091925', margin: 0, lineHeight: 1.4, fontFamily: "'Poppins', sans-serif" },
  activityMeta:       { fontSize: '0.57rem', color: 'rgba(9,25,37,0.3)', margin: '0.07rem 0 0 0', fontFamily: "'Poppins', sans-serif" },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal:        { background: '#fff', borderRadius: '5px', padding: '1.6rem', width: 360, maxWidth: '90vw', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalIcon:    { width: 40, height: 40, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontSize: '1rem' },
  modalTitle:   { fontSize: '0.85rem', fontWeight: 700, color: '#091925', margin: '0 0 0.35rem', fontFamily: "'Poppins', sans-serif" },
  modalBody:    { fontSize: '0.72rem', color: '#5B7384', margin: '0 0 1.1rem', lineHeight: 1.6, fontFamily: "'Poppins', sans-serif" },
  modalActions: { display: 'flex', gap: '0.6rem', justifyContent: 'center' },
  modalCancel:  { padding: '0.4rem 1.1rem', borderRadius: '5px', border: '0.5px solid #5B7384', background: '#fff', color: '#5B7384', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  modalConfirm: { padding: '0.4rem 1.1rem', borderRadius: '5px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
};

<<<<<<< HEAD
export default RelsCMSDashboard;
=======
export default RelsCMSDashboard;
>>>>>>> feat/matt
