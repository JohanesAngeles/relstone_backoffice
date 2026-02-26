// src/pages/AdminHome.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { getStats, getActivity, getSystemStatus } from '../services/dashboard';

/* ── Global font imports injected once ─────────────────────── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400&display=swap');
    @import url('https://fonts.cdnfonts.com/css/homepage-baukasten');

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `}</style>
);

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
  exam:        { label: 'NEW',   dot: '#2EABFE', bg: '#E0F2FF',                color: '#1A7AB8' },
  certificate: { label: 'DONE',  dot: '#10b981', bg: '#E7F8F2',                color: '#10B981' },
  order:       { label: 'DONE',  dot: '#10b981', bg: '#E7F8F2',                color: '#10B981' },
  admin:       { label: 'INFO',  dot: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
  info:        { label: 'INFO',  dot: '#64748b', bg: 'rgba(100,116,139,0.1)', color: '#475569' },
};

// ── System status config ──────────────────────────────────────
const sysCfg = {
  online:      { label: 'ONLINE',      dot: '#10B981', bg: '#E0F2FF',                  color: '#1A7AB8',  border: '#E0F2FF' },
  offline:     { label: 'OFFLINE',     dot: '#dc2626', bg: 'rgba(239,68,68,0.1)',      color: '#dc2626',  border: 'rgba(239,68,68,0.3)' },
  maintenance: { label: 'MAINTENANCE', dot: '#F59E0B', bg: 'rgba(245,158,11,0.15)',   color: '#F59E0B',  border: 'rgba(245,158,11,0.3)' },
  unknown:     { label: 'UNKNOWN',     dot: '#94a3b8', bg: 'rgba(100,116,139,0.1)',   color: '#475569',  border: 'rgba(100,116,139,0.3)' },
};

// ── Card wrapper ──────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </div>
);

const CardHeader = ({ title, action }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
  }}>
    <p style={{
      fontSize: 16, fontWeight: 600, color: '#091925',
      textTransform: 'capitalize', fontFamily: "'Poppins',sans-serif",
    }}>{title}</p>
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
      <FontStyle />

      {/* ── Alert Banner ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 8, marginBottom: 16,
        background: allGood ? 'rgba(0,128,0,0.05)' : 'rgba(239,68,68,0.05)',
        border: `0.5px solid ${allGood ? '#008000' : 'rgba(239,68,68,0.4)'}`,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: allGood ? 'rgba(0,128,0,0.12)' : 'rgba(239,68,68,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: allGood ? '#008000' : '#ef4444',
        }}>
          <Icon d={allGood ? 'M20 6L9 17l-5-5' : 'M12 9v4 M12 17h.01 M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'} size={14} />
        </div>
        <div>
          <p style={{
            fontSize: 14, fontWeight: 600, color: allGood ? '#008000' : '#ef4444',
            fontFamily: "'Poppins',sans-serif", textTransform: 'capitalize',
          }}>
            {allGood ? 'Everything Looks Good' : 'Attention Required'}
          </p>
          <p style={{ fontSize: 12, color: allGood ? '#008000' : '#ef4444', marginTop: 1, fontFamily: "'Poppins',sans-serif" }}>
            All systems are online. You have <b>{badges.newRequests}</b> new requests and <b>{badges.followUps}</b> follow-up's waiting.
          </p>
        </div>
      </div>

      {/* ── At a Glance ── */}
      <p style={{ fontSize: 22, fontWeight: 400, color: '#091925', marginBottom: 4, fontFamily: "'HomepageBaukasten',sans-serif" }}>At a Glance</p>
      <div style={{ borderBottom: '0.5px solid #7FA8C4', marginBottom: 12 }} />
      <p style={{ fontSize: 16, color: '#7FA8C4', marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>A quick summary of what needs your attention right now.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>

        {/* New Info Requests */}
        <Card style={{ borderTop: '3px solid #008000' }}>
          <div style={{ padding: '14px 16px' }}>
            {loading.stats ? <Skel w={40} h={50} r={4} /> : (
              <p style={{
                fontSize: 50, fontWeight: 400, color: '#008000',
                fontFamily: "'HomepageBaukasten',sans-serif", lineHeight: 1,
              }}>
                {stats?.newRequests !== undefined ? stats.newRequests : '—'}
              </p>
            )}
            <p style={{ fontSize: 16, fontWeight: 500, color: 'rgba(9,25,37,0.7)', marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>New Information Requests</p>
            <p style={{ fontSize: 13, color: 'rgba(9,25,37,0.5)', marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>+1 since yesterday</p>
            <Link to="/admin/new-requests" style={{ fontSize: 16, fontWeight: 500, color: '#2EABFE', marginTop: 10, display: 'block', fontFamily: "'Poppins',sans-serif" }}>View requests →</Link>
          </div>
        </Card>

        {/* Latest Request */}
        <Card style={{ borderTop: '3px solid #F59E0B' }}>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 16, fontWeight: 500, color: 'rgba(9,25,37,0.7)', fontFamily: "'Poppins',sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>LATEST REQUESTS</p>
            {loading.stats ? <Skel w="80%" h={22} r={4} style={{ marginTop: 6 }} /> : (
              <p style={{ fontSize: 22, fontWeight: 500, color: '#091925', marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>
                {stats?.latestRequestName || '—'}
              </p>
            )}
            <p style={{ fontSize: 14, color: 'rgba(9,25,37,0.7)', marginTop: 4, fontFamily: "'Poppins',sans-serif" }}>RE License Info — Exam Inquiry</p>
            <p style={{ fontSize: 13, color: 'rgba(9,25,37,0.5)', marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>Today, 10:42 AM</p>
            <Link to="/admin/new-requests" style={{ fontSize: 16, fontWeight: 500, color: '#2EABFE', marginTop: 10, display: 'block', fontFamily: "'Poppins',sans-serif" }}>View latest →</Link>
          </div>
        </Card>

        {/* Scheduled Follow-Ups */}
        <Card style={{ borderTop: '3px solid #EF4444' }}>
          <div style={{ padding: '14px 16px' }}>
            {loading.stats ? <Skel w={40} h={50} r={4} /> : (
              <p style={{
                fontSize: 50, fontWeight: 400, color: '#EF4444',
                fontFamily: "'HomepageBaukasten',sans-serif", lineHeight: 1,
              }}>
                {stats?.scheduledFollowUps !== undefined ? stats.scheduledFollowUps : '—'}
              </p>
            )}
            <p style={{ fontSize: 16, fontWeight: 500, color: 'rgba(9,25,37,0.7)', marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>Scheduled Follow-Up's</p>
            <p style={{ fontSize: 13, color: 'rgba(9,25,37,0.5)', marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>2 due today · 7 this week</p>
            <Link to="/admin/follow-ups" style={{ fontSize: 16, fontWeight: 500, color: '#2EABFE', marginTop: 10, display: 'block', fontFamily: "'Poppins',sans-serif" }}>View follow-up's →</Link>
          </div>
        </Card>

        {/* Closed Info Requests */}
        <Card style={{ borderTop: '3px solid #60C3FF' }}>
          <div style={{ padding: '14px 16px' }}>
            {loading.stats ? <Skel w={40} h={50} r={4} /> : (
              <p style={{
                fontSize: 50, fontWeight: 400, color: '#60C3FF',
                fontFamily: "'HomepageBaukasten',sans-serif", lineHeight: 1,
              }}>
                {stats?.closedRequests !== undefined ? stats.closedRequests : '—'}
              </p>
            )}
            <p style={{ fontSize: 16, fontWeight: 500, color: 'rgba(9,25,37,0.7)', marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>Closed Info Requests</p>
            <p style={{ fontSize: 13, color: 'rgba(9,25,37,0.5)', marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>+5 closed this week</p>
            <Link to="/admin/closed-requests" style={{ fontSize: 16, fontWeight: 500, color: '#2EABFE', marginTop: 10, display: 'block', fontFamily: "'Poppins',sans-serif" }}>View closed →</Link>
          </div>
        </Card>

      </div>

      {/* ── Student Feedbacks Bar ── */}
      <Card style={{ marginBottom: 16, borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#091925', fontFamily: "'Poppins',sans-serif" }}>Student Feedbacks</p>
            {badges.feedback > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: '#F59E0B',
                background: 'rgba(245,158,11,0.15)', padding: '4px 10px', borderRadius: 100,
                fontFamily: "'Poppins',sans-serif",
              }}>
                {badges.feedback} new
              </span>
            )}
          </div>
          <Link to="/admin/feedback" style={{ fontSize: 16, fontWeight: 500, color: '#2EABFE', fontFamily: "'Poppins',sans-serif" }}>View all 12 feedbacks →</Link>
        </div>
      </Card>

      {/* ── Two Column: Activity + System Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>

        {/* Recent Activity */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2EABFE', boxShadow: '0 0 4px #2EABFE', flexShrink: 0 }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: '#091925', fontFamily: "'Poppins',sans-serif", textTransform: 'capitalize' }}>Recent Activity</p>
            </div>
            <Link to="/admin/activity" style={{
              fontSize: 14, fontWeight: 700, color: '#2EABFE',
              background: 'rgba(46,171,254,0.1)', padding: '8px 16px',
              borderRadius: 10, border: '0.5px solid #2EABFE',
              fontFamily: "'Poppins',sans-serif", textDecoration: 'none',
            }}>
              View Full Log
            </Link>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(9,25,37,0.5)', padding: '8px 16px 4px', fontFamily: "'Poppins',sans-serif" }}>What's happened in the system lately.</p>

          {loading.activity ? (
            [1,2,3].map(i => (
              <div key={i} style={{ padding: '10px 16px', borderBottom: '0.5px solid #7FA8C4', display: 'flex', gap: 10 }}>
                <Skel w={8} h={8} r={4} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skel w="60%" h={14} />
                  <Skel w="90%" h={12} />
                </div>
              </div>
            ))
          ) : activity.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 14, fontFamily: "'Poppins',sans-serif" }}>
              No activity yet. Activity will appear as students complete exams.
            </div>
          ) : (
            activity.map((item) => {
              const cfg = actCfg[item.type] || actCfg.info;
              return (
                <div key={item._id} style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '0.5px solid #7FA8C4', alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}`, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 16, fontWeight: 400, color: '#091925', fontFamily: "'Poppins',sans-serif", textTransform: 'capitalize' }}>{item.title}</p>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 100,
                        background: cfg.bg, color: cfg.color, fontFamily: "'Poppins',sans-serif",
                      }}>{cfg.label}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(9,25,37,0.5)', marginTop: 3, lineHeight: 1.5, fontFamily: "'Poppins',sans-serif" }}>{item.description}</p>
                    <p style={{ fontSize: 13, color: 'rgba(9,25,37,0.5)', marginTop: 4, fontFamily: "'JetBrains Mono',monospace", fontWeight: 300 }}>
                      {timeAgo(item.createdAt)} · <span style={{ color: 'rgba(9,25,37,0.5)' }}>{item.actor}</span>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 4px #10B981', flexShrink: 0 }} />
                <p style={{ fontSize: 16, fontWeight: 600, color: '#091925', fontFamily: "'Poppins',sans-serif", textTransform: 'capitalize' }}>System Status</p>
              </div>
              <span style={{ fontSize: 14, color: 'rgba(9,25,37,0.5)', fontFamily: "'Poppins',sans-serif" }}>All services right now.</span>
            </div>

            {loading.systems ? (
              [1,2,3,4].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '0.5px solid #7FA8C4' }}>
                  <Skel w="50%" h={14} />
                  <Skel w={75} h={28} r={100} />
                </div>
              ))
            ) : systems.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 14, fontFamily: "'Poppins',sans-serif" }}>
                No systems configured yet.
              </div>
            ) : (
              systems.map((sys) => {
                const cfg = sysCfg[sys.status] || sysCfg.unknown;
                return (
                  <div key={sys._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '0.5px solid #7FA8C4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}`, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 400, color: '#091925', fontFamily: "'Poppins',sans-serif", textTransform: 'capitalize' }}>{sys.name}</p>
                        <p style={{ fontSize: 14, color: 'rgba(9,25,37,0.5)', marginTop: 2, fontFamily: "'Poppins',sans-serif" }}>{sys.sub}</p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      padding: '6px 12px', borderRadius: 100,
                      background: cfg.bg, color: cfg.color,
                      fontFamily: "'Poppins',sans-serif",
                      letterSpacing: '0.04em',
                      minWidth: 75, textAlign: 'center',
                    }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </Card>

          {/* How To Use This Page */}
          <Card style={{ border: '0.5px solid #60C3FF', background: 'rgba(46,171,254,0.05)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #2EABFE', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2EABFE', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#091925', fontFamily: "'Poppins',sans-serif", textTransform: 'capitalize' }}>How To Use This Page</p>
                <p style={{ fontSize: 14, color: 'rgba(9,25,37,0.5)', fontFamily: "'Poppins',sans-serif" }}>Tips for getting around</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { icon: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01', text: 'Use the left sidebar to jump to any section directly.', bold: false },
                { icon: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3', text: 'Blue buttons take you directly to a page. White buttons are secondary actions.', bold: true },
                { icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01', text: "A yellow \"Maintenance\" status means that system is temporarily unavailable.", bold: false },
                { icon: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9', text: "Always click Sign Out in the top right when you're done.", bold: false },
              ].map((tip, i, arr) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '12px 16px',
                  borderBottom: i < arr.length - 1 ? '0.5px solid #2EABFE' : 'none',
                }}>
                  <div style={{ color: '#2EABFE', display: 'flex', marginTop: 2, flexShrink: 0 }}>
                    <Icon d={tip.icon} size={14} />
                  </div>
                  <p style={{
                    fontSize: 14,
                    color: tip.bold ? '#2EABFE' : 'rgba(9,25,37,0.5)',
                    fontWeight: tip.bold ? 600 : 400,
                    lineHeight: 1.6,
                    fontFamily: "'Poppins',sans-serif",
                  }}>{tip.text}</p>
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
