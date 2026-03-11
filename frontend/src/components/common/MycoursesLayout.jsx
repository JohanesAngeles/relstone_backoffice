import { useState, useEffect, useRef, useMemo } from "react";
import { FaSearch, FaShoppingCart, FaCircle, FaBookOpen } from "react-icons/fa";
import { MdDashboard, MdPersonOutline, MdStar, MdShoppingCart } from "react-icons/md";
import { IoChatbubblesOutline } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ── Live Clock hook ───────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// ── Get user from localStorage ────────────────────────────────────────────────
function useUser() {
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  });
  return user;
}

function getInitials(user) {
  const name = user?.name || user?.fullName || "";
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return (user?.studentId || "ST").slice(0, 2).toUpperCase();
}

function getDisplayName(user) {
  const name = user?.name || user?.fullName || "";
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? `${parts[parts.length - 1]}, ${parts[0][0]}.` : name;
  }
  return user?.studentId || "Student";
}

function getFirstName(user) {
  const name = user?.name || user?.fullName || "";
  if (name) return name.trim().split(/\s+/)[0];
  return user?.studentId || "Student";
}

// ── SVG Icon helper (hamburger, search, modal only) ──────────────────────────
const SvgIcon = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d.split(" M").map((p, i) => <path key={i} d={i === 0 ? p : "M" + p} />)}
  </svg>
);

// ── Student nav — react-icons matching Figma icons ────────────────────────────
// Dashboard     → ic:round-dashboard            → MdDashboard
// My Profile    → material-symbols:person       → MdPersonOutline
// My Courses    → tabler:book-filled            → FaBookOpen
// R.E. Exam     → material-symbols:star-rounded → MdStar
// My Orders     → zondicons:shopping-cart       → MdShoppingCart
// Contact       → chat/message                  → IoChatbubblesOutline
const STUDENT_NAV = [
  {
    section: "MY ACCOUNT",
    items: [
      { label: "Dashboard",      sub: "Home / Overview & Summary",    to: "/",                     icon: MdDashboard          },
      { label: "My Profile",     sub: "Account & Settings",           to: "/profile",              icon: MdPersonOutline      },
    ],
  },
  {
    section: "COURSES & MATERIALS",
    items: [
      { label: "My Courses",     sub: "Progress & Certificates",      to: "/my-courses",           icon: FaBookOpen           },
      { label: "R.E. Exam Prep", sub: "ExamPrepCentral Practice",     to: "/exam-prep/real-estate",icon: MdStar               },
    ],
  },
  {
    section: "SUPPORT",
    items: [
      { label: "My Orders",      sub: "Purchase History & Receipts",  to: "/orders",               icon: MdShoppingCart       },
      { label: "Contact Support",sub: "Get Help from RELS",           to: "/support",              icon: IoChatbubblesOutline },
    ],
  },
];

// ── Sign Out Modal ────────────────────────────────────────────────────────────
function SignOutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(9,25,37,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px 24px", width: 340, boxShadow: "0 24px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <span style={{ color: "#EF4444", display: "flex" }}>
            <SvgIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={28} />
          </span>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#091925", fontFamily: "'Poppins', sans-serif", margin: "0 0 8px" }}>Sign Out?</h2>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: "1.6", fontFamily: "'Poppins', sans-serif", margin: "0 0 24px" }}>
          Are you sure you want to end your session?<br />Any unsaved changes may be lost.
        </p>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "#EF4444", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <SvgIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={14} />
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── User Pill ─────────────────────────────────────────────────────────────────
function UserPill({ user }) {
  const [open, setOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const confirmLogout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); window.location.href = "/"; };
  const menuItems = [{ label: "Dashboard", href: "/" }, { label: "My Profile", href: "/profile" }, { label: "My Courses", href: "/my-courses" }];

  return (
    <>
      <div ref={ref} style={{ position: "relative" }}>
        <button onClick={() => setOpen((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 8, border: "0.5px solid #60C3FF", borderRadius: 154, padding: "4px 12px 4px 4px", background: "transparent", cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", color: "#091925", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{getInitials(user)}</div>
          <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{getDisplayName(user)}</span>
        </button>
        {open && (
          <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, background: "#0f172a", border: "0.5px solid #334155", borderRadius: 8, minWidth: 220, zIndex: 999, boxShadow: "0 12px 32px rgba(0,0,0,0.5)", overflow: "hidden", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            <div style={{ padding: "14px 16px", borderBottom: "0.5px solid #1e293b" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{user?.name || user?.fullName || "Student"}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>{user?.email || user?.studentId || ""}</div>
            </div>
            <div style={{ padding: "6px 0" }}>
              {menuItems.map(({ label, href }) => (
                <a key={href} href={href} onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", padding: "9px 16px", fontSize: 13, fontWeight: 500, color: "#94a3b8", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#f1f5f9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                >{label}</a>
              ))}
            </div>
            <div style={{ borderTop: "0.5px solid #1e293b" }} />
            <div style={{ padding: "6px 0" }}>
              <button onClick={() => { setOpen(false); setShowSignOut(true); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 16px", background: "transparent", border: "none", fontSize: 13, fontWeight: 500, color: "#ef4444", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >Sign Out</button>
            </div>
          </div>
        )}
      </div>
      {showSignOut && <SignOutModal onConfirm={confirmLogout} onCancel={() => setShowSignOut(false)} />}
    </>
  );
}

// ── Top Header ────────────────────────────────────────────────────────────────
function TopHeader({ user }) {
  return (
    <div style={{ background: "#1e293b", height: 58, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: 190 }}>
        <img src="/src/assets/images/RelsLogo.png" alt="Relstone" style={{ height: 30, objectFit: "contain" }}
          onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
        <div style={{ display: "none", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#1e293b", letterSpacing: -0.5, flexShrink: 0 }}>RC</div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: 1.5 }}>RELSTONE</div>
            <div style={{ color: "#64748b", fontSize: 9, letterSpacing: 0.4, marginTop: 2 }}>Real Estate License Services</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, maxWidth: 460, position: "relative", margin: "0 auto" }}>
        <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 12 }} />
        <input placeholder="Search States Or Courses..." style={{ width: "100%", boxSizing: "border-box", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 14px 8px 36px", color: "#cbd5e1", fontSize: 13, outline: "none" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginLeft: "auto" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 19, padding: 0, display: "flex", alignItems: "center" }}><FaShoppingCart /></button>
        <UserPill user={user} />
      </div>
    </div>
  );
}

// ── Sub Header ────────────────────────────────────────────────────────────────
function SubHeader({ user }) {
  const now = useClock();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const getGreeting = () => { const h = now.getHours(); if (h < 12) return "Good Morning"; if (h < 17) return "Good Afternoon"; return "Good Evening"; };
  return (
    <div style={{ background: "#0f172a", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>{getGreeting()},{" "}<span style={{ color: "#38bdf8" }}>{getFirstName(user)}!</span></div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 3, letterSpacing: 0.5 }}>RELS OnExSyS: BackOffice System</div>
      </div>
      <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "8px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FaCircle style={{ fontSize: 7, color: "#22c55e" }} /> Examination Server</span>
          <span style={{ color: "#334155" }}>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><FaCircle style={{ fontSize: 7, color: "#22c55e" }} /> Online</span>
          <span style={{ color: "#334155" }}>•</span>
          <span>P.S.T.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 800, color: "#e2e8f0", fontFamily: "monospace", letterSpacing: 1.5 }}>
          <span>{dateStr}</span><span style={{ color: "#334155" }}>|</span><span>{timeStr}</span>
        </div>
      </div>
    </div>
  );
}

// ── Stats Box ─────────────────────────────────────────────────────────────────
function StatsBox() {
  const stats = [
    { label: "Courses Enrolled",    value: "6", color: "#1A7AB8" },
    { label: "Certificates Earned", value: "2", color: "#008000" },
    { label: "In Progress",         value: "4", color: "#F59E0B" },
  ];
  return (
    <div style={{ margin: "14px 12px 6px", background: "rgba(127,168,196,0.1)", borderRadius: 5, padding: "10px 14px", flexShrink: 0 }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: i < stats.length - 1 ? 6 : 0 }}>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 500, color: "#5B7384" }}>{s.label}</span>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [navSearch, setNavSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  const ALL_ROUTES = useMemo(() => STUDENT_NAV.flatMap((g) => g.items.map((it) => ({ section: g.section, label: it.label, sub: it.sub, to: it.to }))), []);
  const q = navSearch.trim().toLowerCase();
  const searchResults = useMemo(() => { if (!q) return []; return ALL_ROUTES.filter((r) => `${r.section} ${r.label} ${r.sub}`.toLowerCase().includes(q)).slice(0, 10); }, [q, ALL_ROUTES]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSearchOpen(false); };
    const onClick = (e) => { if (!e.target.closest?.('[data-side-search="1"]')) setSearchOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, []);

  const confirmLogout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); window.location.href = "/"; };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        .stu-nav-item:hover { background: #ECF7FF !important; }
        .stu-nav-item:hover .stu-icon-box { background: #D0EBFF !important; }
        .stu-nav-item:hover .stu-nav-icon { color: #2EABFE !important; }
        .stu-signout-btn:hover { background: rgba(239,68,68,0.08) !important; }
        .stu-search-result:hover { background: #f8fafc !important; }
      `}</style>

      {showSignOut && <SignOutModal onConfirm={confirmLogout} onCancel={() => setShowSignOut(false)} />}

      <aside style={{ width: open ? 270 : 60, background: "#fff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", transition: "width 0.2s ease", overflow: "hidden", flexShrink: 0, height: "100%", fontFamily: "'Poppins', sans-serif" }}>

        {/* ── Hamburger + Search ── */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", minHeight: 52, gap: 10, flexShrink: 0 }}>
          <button onClick={() => setOpen((v) => !v)} style={{ background: "none", border: "none", color: "#163347", cursor: "pointer", display: "flex", padding: 4, borderRadius: 5, flexShrink: 0 }}>
            <SvgIcon d="M3 6h18 M3 12h18 M3 18h18" size={18} />
          </button>
          {open && (
            <div data-side-search="1" style={{ position: "relative", flex: 1, marginLeft: 6, display: "flex", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 10px", gap: 6 }}>
              <span style={{ color: "#7FA8C4", display: "flex", flexShrink: 0 }}>
                <SvgIcon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={15} />
              </span>
              <input value={navSearch} onChange={(e) => setNavSearch(e.target.value)} onFocus={() => setSearchOpen(true)} placeholder="Search menu..."
                style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#091925", fontFamily: "'Poppins', sans-serif" }} />
              {navSearch && (
                <button onClick={() => { setNavSearch(""); setSearchOpen(false); }} style={{ border: "none", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 4px" }}>×</button>
              )}
              {searchOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 12px 30px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 9999 }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: "12px", fontSize: 12, color: "#64748b", fontFamily: "'Poppins', sans-serif" }}>No results found.</div>
                  ) : searchResults.map((r) => (
                    <button key={r.to} className="stu-search-result" onClick={() => { navigate(r.to); setNavSearch(""); setSearchOpen(false); }}
                      style={{ width: "100%", textAlign: "left", border: "none", borderBottom: "1px solid #f1f5f9", background: "#fff", padding: "10px 12px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", transition: "background 0.12s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#091925" }}>{r.label}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.08em" }}>{r.section}</span>
                      </div>
                      <div style={{ marginTop: 2, fontSize: 10, color: "#7FA8C4" }}>{r.sub}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Nav groups ── */}
        <nav style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
          {/* ── Stats Box (scrolls with nav) ── */}
          {open && <StatsBox />}
          {STUDENT_NAV.map((group, gi) => (
            <div key={group.section} style={{ marginTop: gi > 0 ? 8 : 0 }}>
              {gi > 0 && open && (
                <div style={{ width: "calc(100% - 60px)", height: "0.5px", background: "#7FA8C4", margin: "6px 12px", opacity: 0.4 }} />
              )}
              {open && (
                <p style={{ fontSize: 9, fontWeight: 700, color: "#7FA8C4", letterSpacing: "0.1em", padding: "8px 12px 4px", textTransform: "uppercase", fontFamily: "'Poppins', sans-serif", margin: 0 }}>
                  {group.section}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} className="stu-nav-item" title={!open ? item.label : ""}
                    style={{ display: "flex", alignItems: "center", cursor: "pointer", transition: "all 0.15s", textDecoration: "none", position: "relative", minHeight: 52, background: isActive ? "#ECF7FF" : "transparent", justifyContent: open ? "flex-start" : "center", padding: open ? "10px 16px 10px 0" : "10px 0" }}>
                    {isActive && open && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: "#2EABFE", borderRadius: "0 3px 3px 0", flexShrink: 0 }} />}
                    {!isActive && open && <div style={{ width: 5, flexShrink: 0 }} />}
                    <span className="stu-icon-box" style={{ width: 36, height: 36, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isActive ? "#D0EBFF" : "rgba(127,168,196,0.1)", transition: "background 0.15s", marginLeft: open ? 10 : "auto", marginRight: open ? 0 : "auto" }}>
                      <span className="stu-nav-icon" style={{ display: "flex", color: isActive ? "#2EABFE" : "#7FA8C4" }}>
                        <Icon size={18} />
                      </span>
                    </span>
                    {open && (
                      <div style={{ flex: 1, minWidth: 0, marginLeft: 9 }}>
                        <span style={{ fontSize: 13, fontFamily: "'Poppins', sans-serif", lineHeight: "20px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: isActive ? "#163347" : "#091925", fontWeight: isActive ? 600 : 400 }}>
                          {item.label}
                        </span>
                        <p style={{ fontSize: 12, color: "#7FA8C4", margin: 0, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 400, lineHeight: "18px" }}>
                          {item.sub}
                        </p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Sign Out ── */}
        {open ? (
          <div style={{ padding: "8px 12px 12px", flexShrink: 0 }}>
            <button onClick={() => setShowSignOut(true)} className="stu-signout-btn" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", height: 56, cursor: "pointer", fontFamily: "'Poppins', sans-serif", transition: "background 0.15s" }}>
              <span style={{ width: 36, height: 36, borderRadius: 5, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#EF4444", display: "flex" }}>
                  <SvgIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={18} />
                </span>
              </span>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 13, color: "#EF4444", fontWeight: 600, margin: 0, lineHeight: "20px" }}>Sign Out</p>
                <p style={{ fontSize: 12, color: "#7FA8C4", margin: 0, lineHeight: "18px" }}>End Your Session</p>
              </div>
            </button>
          </div>
        ) : (
          <button onClick={() => setShowSignOut(true)} className="stu-signout-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", width: "100%", padding: "14px 0", cursor: "pointer", transition: "background 0.15s", flexShrink: 0 }}>
            <span style={{ color: "#EF4444", display: "flex" }}>
              <SvgIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" size={20} />
            </span>
          </button>
        )}
      </aside>
    </>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <div style={{ borderTop: "1px solid #e5e7eb", padding: "13px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", flexShrink: 0 }}>
      <div style={{ fontSize: 12, color: "#9ca3af" }}>
        © Copyright 2026{" "}
        <span style={{ color: "#2563eb", fontWeight: 600, cursor: "pointer" }}>Real Estate License Services, Inc.</span>{" "}
        — A California School Established 1978. All Rights Reserved.
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace", letterSpacing: 0.5 }}>RELSExSys · BackOffice · v4.1 · TLS 1.3</div>
    </div>
  );
}

// ── DashboardLayout ───────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const user = useUser();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f1f5f9", overflow: "hidden" }}>
      <TopHeader user={user} />
      <SubHeader user={user} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px 32px" }}>{children}</div>
      </div>
      <Footer />
    </div>
  );
}
