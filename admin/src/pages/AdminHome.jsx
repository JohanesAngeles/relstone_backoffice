// src/pages/AdminHome.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { getStats, getActivity, getSystemStatus } from '../services/dashboard';

// ── SVG Icon ──────────────────────────────────────────────────
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(' M').map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
  </svg>
);

// ── Skeleton ──────────────────────────────────────────────────
const Skel = ({ w = '100%', h = 14, r = 6 }) => (
  <div style={{
    width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
  }} />
);

// ── Time ago ──────────────────────────────────────────────────
const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), dy = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} minute${m > 1 ? 's' : ''} ago`;
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  return `${dy} day${dy > 1 ? 's' : ''} ago`;
};

// ── Activity config ───────────────────────────────────────────
const actCfg = {
  exam:        { label: 'NEW',   dot: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  color: '#2563eb' },
  certificate: { label: 'DONE',  dot: '#10b981', bg: 'rgba(16,185,129,0.1)',  color: '#059669' },
  order:       { label: 'DONE',  dot: '#10b981', bg: 'rgba(16,185,129,0.1)',  color: '#059669' },
  admin:       { label: 'INFO',  dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  color: '#d97706' },
  info:        { label: 'INFO',  dot: '#64748b', bg: 'rgba(100,116,139,0.1)', color: '#475569' },
};

// ── System status config ──────────────────────────────────────
const sysCfg = {
  online:      { label: 'ONLINE',      bg: 'rgba(16,185,129,0.1)',  color: '#059669', border: 'rgba(16,185,129,0.3)' },
  offline:     { label: 'OFFLINE',     bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
  maintenance: { label: 'MAINTENANCE', bg: 'rgba(245,158,11,0.1)',  color: '#d97706', border: 'rgba(245,158,11,0.3)' },
  unknown:     { label: 'UNKNOWN',     bg: 'rgba(100,116,139,0.1)', color: '#475569', border: 'rgba(100,116,139,0.3)' },
};

// ── Card wrapper ──────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', ...style }}>
    {children}
  </div>
);

const CardHeader = ({ title, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
    <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Poppins',sans-serif" }}>{title}</p>
    {action}
  </div>
);

// ── Main ──────────────────────────────────────────────────────
const AdminHome = () => {
  const [stats,    setStats]    = useState(null);
  const [activity, setActivity] = useState([]);
  const [systems,  setSystems]  = useState([]);
  const [loading,  setLoading]  = useState({ stats: true, activity: true, systems: true });

  const loadData = useCallback(async () => {
    setLoading({ stats: true, activity: true, systems: true });
    const [sR, aR, syR] = await Promise.all([getStats(), getActivity(), getSystemStatus()]);
    if (sR.ok)   setStats(sR.data);
    if (aR.ok)   setActivity(aR.data);
    if (syR.ok)  setSystems(syR.data);
    setLoading({ stats: false, activity: false, systems: false });
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const badges = {
    newRequests: stats?.newRequests        || 0,
    followUps:   stats?.scheduledFollowUps || 0,
    feedback:    stats?.studentFeedbacks   || 0,
  };

  const allGood = badges.newRequests === 0 && badges.followUps === 0;

  return (
    <AppLayout badges={badges}>

      {/* ── Alert Banner ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px', borderRadius: 8, marginBottom: 16,
        background: allGood ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${allGood ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: allGood ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: allGood ? '#10b981' : '#ef4444',
        }}>
          <Icon d={allGood ? 'M20 6L9 17l-5-5' : 'M12 9v4 M12 17h.01 M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'} size={14} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', fontFamily: "'Poppins',sans-serif" }}>
            {allGood ? 'Everything Looks Good' : 'Attention Required'}
          </p>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
            All systems are online. You have <b>{badges.newRequests}</b> new requests and <b>{badges.followUps}</b> follow-up's waiting.
          </p>
        </div>
      </div>

      {/* ── At a Glance ── */}
      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>At a Glance</p>
      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>A quick summary of what needs your attention right now.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>

        {/* New Info Requests */}
        <Card style={{ borderTop: '3px solid #22c55e' }}>
          <div style={{ padding: '14px 16px' }}>
            {loading.stats ? <Skel w={40} h={32} r={4} /> : (
              <p style={{ fontSize: 30, fontWeight: 800, color: '#22c55e', fontFamily: "'Poppins',sans-serif", lineHeight: 1 }}>
                {stats?.newRequests !== undefined ? stats.newRequests : '—'}
              </p>
            )}
            <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>New Information Requests</p>
            <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>+1 since yesterday</p>
            <Link to="/admin/new-requests" style={{ fontSize: 11, color: '#3b82f6', marginTop: 8, display: 'block' }}>View requests →</Link>
          </div>
        </Card>

        {/* Latest Request */}
        <Card style={{ borderTop: '3px solid #f59e0b' }}>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>LATEST REQUESTS</p>
            {loading.stats ? <Skel w="80%" h={18} r={4} style={{ marginTop: 4 }} /> : (
              <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 4, fontFamily: "'Poppins',sans-serif" }}>
                {stats?.latestRequestName || '—'}
              </p>
            )}
            <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>RE License Info — Exam Inquiry</p>
            <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Today, 10:42 AM</p>
            <Link to="/admin/new-requests" style={{ fontSize: 11, color: '#3b82f6', marginTop: 8, display: 'block' }}>View latest →</Link>
          </div>
        </Card>

        {/* Scheduled Follow-Ups */}
        <Card style={{ borderTop: '3px solid #ef4444' }}>
          <div style={{ padding: '14px 16px' }}>
            {loading.stats ? <Skel w={40} h={32} r={4} /> : (
              <p style={{ fontSize: 30, fontWeight: 800, color: '#ef4444', fontFamily: "'Poppins',sans-serif", lineHeight: 1 }}>
                {stats?.scheduledFollowUps !== undefined ? stats.scheduledFollowUps : '—'}
              </p>
            )}
            <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>Scheduled Follow-Up's</p>
            <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>2 due today · 7 this week</p>
            <Link to="/admin/follow-ups" style={{ fontSize: 11, color: '#3b82f6', marginTop: 8, display: 'block' }}>View follow-up's →</Link>
          </div>
        </Card>

        {/* Closed Info Requests */}
        <Card style={{ borderTop: '3px solid #3b82f6' }}>
          <div style={{ padding: '14px 16px' }}>
            {loading.stats ? <Skel w={40} h={32} r={4} /> : (
              <p style={{ fontSize: 30, fontWeight: 800, color: '#3b82f6', fontFamily: "'Poppins',sans-serif", lineHeight: 1 }}>
                {stats?.closedRequests !== undefined ? stats.closedRequests : '—'}
              </p>
            )}
            <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>Closed Info Requests</p>
            <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>+5 closed this week</p>
            <Link to="/admin/closed-requests" style={{ fontSize: 11, color: '#3b82f6', marginTop: 8, display: 'block' }}>View closed →</Link>
          </div>
        </Card>

      </div>

      {/* ── Student Feedbacks Bar ── */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', fontFamily: "'Poppins',sans-serif" }}>Student Feedbacks</p>
            {badges.feedback > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#3b82f6', padding: '2px 7px', borderRadius: 10 }}>
                {badges.feedback} new
              </span>
            )}
          </div>
          <Link to="/admin/feedback" style={{ fontSize: 11, color: '#3b82f6' }}>View all 12 feedbacks →</Link>
        </div>
      </Card>

      {/* ── Two Column: Activity + System Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>

        {/* Recent Activity */}
        <Card>
          <CardHeader
            title="Recent Activity"
            action={
              <Link to="/admin/activity" style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: '#1e293b', padding: '4px 10px', borderRadius: 5 }}>
                View Full Log
              </Link>
            }
          />
          <p style={{ fontSize: 11, color: '#94a3b8', padding: '8px 16px 4px' }}>What's happened in the system lately.</p>

          {loading.activity ? (
            [1,2,3].map(i => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: 10 }}>
                <Skel w={8} h={8} r={4} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skel w="60%" h={12} />
                  <Skel w="90%" h={10} />
                </div>
              </div>
            ))
          ) : activity.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
              No activity yet. Activity will appear as students complete exams.
            </div>
          ) : (
            activity.map((item) => {
              const cfg = actCfg[item.type] || actCfg.info;
              return (
                <div key={item._id} style={{ display: 'flex', gap: 10, padding: '10px 16px', borderBottom: '1px solid #f8fafc', alignItems: 'flex-start' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', fontFamily: "'Poppins',sans-serif" }}>{item.title}</p>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>{item.description}</p>
                    <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                      {timeAgo(item.createdAt)} · <span style={{ color: '#64748b' }}>{item.actor}</span>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </Card>

        {/* Right column: System Status + How To */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* System Status */}
          <Card>
            <CardHeader
              title="System Status"
              action={
                <span style={{ fontSize: 11, color: '#94a3b8' }}>All services right now.</span>
              }
            />

            {loading.systems ? (
              [1,2,3,4].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: '1px solid #f8fafc' }}>
                  <Skel w="50%" h={12} />
                  <Skel w={60} h={20} r={10} />
                </div>
              ))
            ) : systems.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                No systems configured yet.
              </div>
            ) : (
              systems.map((sys) => {
                const cfg = sysCfg[sys.status] || sysCfg.unknown;
                return (
                  <div key={sys._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 500, color: '#0f172a', fontFamily: "'Poppins',sans-serif" }}>{sys.name}</p>
                        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{sys.sub}</p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      padding: '3px 8px', borderRadius: 10,
                      background: cfg.bg, color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                      letterSpacing: '0.04em',
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </Card>

          {/* How To Use This Page */}
          <Card style={{ border: '1px solid #dbeafe', background: '#f8faff' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ color: '#3b82f6', display: 'flex' }}>
                <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 8v4 M12 16h.01" size={15} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', fontFamily: "'Poppins',sans-serif" }}>How To Use This Page</p>
                <p style={{ fontSize: 10, color: '#3b82f6' }}>Tips for getting around</p>
              </div>
            </div>
            <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01', text: 'Use the left sidebar to jump to any section directly.' },
                { icon: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3', text: 'Blue buttons take you directly to a page. White buttons are secondary actions.' },
                { icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01', text: 'A yellow "Maintenance" status means that system is temporarily unavailable.' },
                { icon: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9', text: "Always click Sign Out in the top right when you're done." },
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ color: '#3b82f6', display: 'flex', marginTop: 1, flexShrink: 0 }}>
                    <Icon d={tip.icon} size={12} />
                  </div>
                  <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>{tip.text}</p>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

    </AppLayout>
  );
};

export default AdminHome;