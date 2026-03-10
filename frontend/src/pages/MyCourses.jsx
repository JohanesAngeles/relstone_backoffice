import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen, FaCheckCircle, FaClock, FaChalkboardTeacher,
  FaSearch, FaPlay, FaDownload, FaRedo, FaCircle, FaChevronRight,
} from "react-icons/fa";
import { MdOutlineAccessTime, MdCalendarToday } from "react-icons/md";
import DashboardLayout from "../components/common/MycoursesLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Status config ─────────────────────────────────────────────
const STATUS_CFG = {
  "In Progress": {
    key: "in-progress",
    label: "In Progress", dot: "#F59E0B",
    badgeBg: "rgba(245,158,11,0.1)", badgeText: "#F59E0B", badgeBorder: "#F59E0B",
    iconBg: "rgba(245,158,11,0.1)", iconColor: "#F59E0B", barColor: "#F59E0B",
    headerBg: "rgba(245,158,11,0.1)",
  },
  "Complete": {
    key: "complete",
    label: "Complete", dot: "#008000",
    badgeBg: "rgba(0,128,0,0.1)", badgeText: "#008000", badgeBorder: "#008000",
    iconBg: "rgba(0,128,0,0.1)", iconColor: "#008000", barColor: "#008000",
    headerBg: "rgba(0,128,0,0.05)",
  },
  "Failed": {
    key: "failed",
    label: "Failed", dot: "#EF4444",
    badgeBg: "rgba(239,68,68,0.1)", badgeText: "#EF4444", badgeBorder: "#EF4444",
    iconBg: "rgba(239,68,68,0.1)", iconColor: "#EF4444", barColor: "#008000",
    headerBg: "rgba(239,68,68,0.05)",
  },
};

const getStatusCfg = (status) =>
  STATUS_CFG[status] || STATUS_CFG["In Progress"];

const getCategoryLabel = (courseType = "", courseTitle = "") => {
  if (courseType === "CE")         return "California C.E.";
  if (courseType === "RE")         return "Real Estate";
  if (courseType === "PreLicense") return "Pre-License";
  if (courseTitle.toLowerCase().includes("c.e.")) return "California C.E.";
  if (courseTitle.toLowerCase().includes("pre-license")) return "Pre-License";
  return courseType || "Course";
};

const getCreditHours = (bundleId = "") => {
  const m = (bundleId || "").match(/(\d+)HR/i);
  return m ? parseInt(m[1]) : null;
};

const TABS = [
  { key: "all",          label: "All Courses"  },
  { key: "in-progress",  label: "In Progress"  },
  { key: "complete",     label: "Completed"    },
  { key: "not-started",  label: "Not Started"  },
  { key: "failed",       label: "Needs Retake" },
];

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ icon, value, label, iconBg, iconColor, topBorder }) {
  return (
    <div style={{
      flex: "1 1 0", minWidth: 0,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderTop: `3px solid ${topBorder}`,
      borderRadius: 5,
      padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 5,
        background: iconBg,
        border: `0.5px solid ${topBorder}`,
        color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: 26, fontWeight: 400, color: "#091925", lineHeight: 1,
          fontFamily: "'HomepageBaukasten', sans-serif",
        }}>{value}</div>
        <div style={{
          fontSize: 12, color: "rgba(9,25,37,0.7)", marginTop: 3,
          fontFamily: "'Poppins', sans-serif", fontWeight: 500,
        }}>{label}</div>
      </div>
    </div>
  );
}

// ── CourseCard ────────────────────────────────────────────────
function CourseCard({ course, navigate }) {
  const s       = getStatusCfg(course.status);
  const sKey    = s.key;
  const [hovered, setHovered] = useState(false);

  const creditHrs = getCreditHours(course.bundleId);
  const category  = getCategoryLabel(course.courseType, course.courseTitle);
  const displayTitle = course.examNames?.[0] || course.courseTitle || course.bundleId;
  const versions = course.versions || [];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 5,
        display: "flex", flexDirection: "column",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
        transition: "box-shadow 0.2s",
        overflow: "hidden",
      }}
    >
      {/* Colored header band */}
      <div style={{
        background: s.headerBg,
        borderRadius: "5px 5px 0 0",
        padding: "10px 12px 0",
        minHeight: 120,
        display: "flex", flexDirection: "column",
      }}>
        {/* Badge row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
          {/* Version badges */}
          <div style={{ display: "flex", gap: 4 }}>
            {versions.length > 0 ? versions.sort().map(v => (
              <span key={v} style={{
                fontSize: 10, fontWeight: 700,
                color: "#2EABFE",
                border: "0.5px solid #2EABFE",
                borderRadius: 100,
                padding: "2px 8px",
                background: "rgba(46,171,254,0.1)",
                fontFamily: "'Poppins', sans-serif",
              }}>
                {v.replace("Version ", "Version ")}
              </span>
            )) : (
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: "#2EABFE",
                border: "0.5px solid #2EABFE",
                borderRadius: 100,
                padding: "2px 8px",
                background: "rgba(46,171,254,0.1)",
                fontFamily: "'Poppins', sans-serif",
              }}>
                {course.bundleId}
              </span>
            )}
          </div>

          {/* Status badge */}
          <span style={{
            fontSize: 10, fontWeight: 700,
            background: s.badgeBg, color: s.badgeText,
            border: `0.5px solid ${s.badgeBorder}`,
            borderRadius: 100, padding: "2px 8px",
            display: "flex", alignItems: "center", gap: 4,
            fontFamily: "'Poppins', sans-serif",
          }}>
            <FaCircle style={{ fontSize: 5, color: s.dot }} />
            {s.label}
          </span>
        </div>

        {/* Icon centered */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, padding: "10px 0 8px" }}>
          <div style={{
            width: 46, height: 46, borderRadius: 5,
            background: s.iconBg,
            border: `0.5px solid ${s.iconColor}`,
            color: s.iconColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>
            <FaBookOpen />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "10px 12px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{
          fontSize: 11, color: "#7FA8C4", fontWeight: 500,
          fontFamily: "'Poppins', sans-serif",
        }}>
          {category}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 500, color: "#091925", lineHeight: "15px",
          fontFamily: "'Poppins', sans-serif", textTransform: "capitalize",
        }}>
          {displayTitle}
        </div>

        <div style={{ display: "flex", gap: 10, fontSize: 11, color: "rgba(9,25,37,0.3)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
          {creditHrs && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <MdOutlineAccessTime style={{ fontSize: 11 }} /> {creditHrs} Credit Hrs
            </span>
          )}
          {course.registrationDate && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <MdCalendarToday style={{ fontSize: 10 }} /> {course.registrationDate}
            </span>
          )}
        </div>

        {/* Progress */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#7FA8C4", fontFamily: "'Poppins', sans-serif" }}>Progress</span>
          <span style={{
            fontSize: 11, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
            color: sKey === "in-progress" ? "#F59E0B"
                 : sKey === "complete"    ? "#008000"
                 : "#008000",
          }}>
            {course.progress ?? 0}%
          </span>
        </div>
        <div style={{ height: 6, background: "rgba(9,25,37,0.05)", borderRadius: 100, border: "0.5px solid rgba(9,25,37,0.1)" }}>
          <div style={{
            height: "100%", borderRadius: 100,
            width: `${course.progress ?? 0}%`,
            background: s.barColor,
            border: `0.5px solid ${s.barColor}`,
          }} />
        </div>

        {course.totalQuestions > 0 && (
          <div style={{ fontSize: 10, color: "rgba(9,25,37,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
            {course.totalQuestions} exam questions
          </div>
        )}

        <div style={{ borderTop: "0.5px solid #5B7384", margin: "4px 0" }} />

        {/* Action row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontFamily: "'Poppins', sans-serif" }}>
            {sKey === "in-progress" && (
              <span style={{ color: "rgba(9,25,37,0.3)", fontWeight: 500 }}>
                Active: Today
              </span>
            )}
            {sKey === "complete" && (
              <span style={{ color: "#008000", fontWeight: 700 }}>
                {course.examScore}% Passed
              </span>
            )}
            {sKey === "failed" && (
              <span style={{ color: "#EF4444", fontWeight: 700 }}>
                {course.examScore}% Failed
              </span>
            )}
          </span>

          {sKey === "in-progress" && (
            <button
              onClick={() => navigate(`/bundle/${course.bundleId}`)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "#2EABFE", color: "#091925",
                border: "0.5px solid #2EABFE", borderRadius: 5,
                padding: "6px 12px", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Poppins', sans-serif",
              }}>
              <FaPlay style={{ fontSize: 8 }} /> Continue
            </button>
          )}
          {sKey === "complete" && (
            <a
              href={`${API}/certificate/download/${course._id}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(0,128,0,0.1)", color: "#008000",
                border: "0.5px solid #008000", borderRadius: 5,
                padding: "6px 12px", fontSize: 12, fontWeight: 700,
                cursor: "pointer", textDecoration: "none",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <FaDownload style={{ fontSize: 10 }} /> Certificate
            </a>
          )}
          {sKey === "failed" && (
            <button style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(149,105,247,0.1)", color: "#9569F7",
              border: "0.5px solid #9569F7", borderRadius: 5,
              padding: "6px 12px", fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Poppins', sans-serif",
            }}>
              <FaRedo style={{ fontSize: 8 }} /> Retake Ver B
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CertRow ───────────────────────────────────────────────────
function CertRow({ cert, api }) {
  return (
    <div style={{
      flex: "1 1 300px", display: "flex", alignItems: "center", gap: 12,
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 5, padding: "12px 14px",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 5,
        background: "rgba(0,128,0,0.1)", border: "0.5px solid #008000",
        color: "#008000", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>
        <FaCheckCircle />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 400, color: "#091925", lineHeight: "16px",
          fontFamily: "'HomepageBaukasten', sans-serif",
        }}>{cert.courseTitle}</div>
        <div style={{
          fontSize: 11, color: "rgba(9,25,37,0.7)", marginTop: 3,
          fontFamily: "'Poppins', sans-serif", fontWeight: 500,
        }}>
          Completed {cert.completionDate} · Score: {cert.examScore}%
        </div>
      </div>
      <a
        href={`${api}/certificate/download/${cert._id}`}
        target="_blank"
        rel="noreferrer"
        style={{
          width: 34, height: 34, borderRadius: 5, flexShrink: 0,
          background: "rgba(91,115,132,0.1)", opacity: 0.5,
          border: "0.5px solid #5B7384",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#5B7384", cursor: "pointer", textDecoration: "none",
        }}
      >
        <FaDownload style={{ fontSize: 12 }} />
      </a>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────
function CourseSkeleton() {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 5, overflow: "hidden" }}>
      <div style={{ height: 186, background: "rgba(245,158,11,0.05)" }} />
      <div style={{ padding: 16 }}>
        {[80, 60, 200, 120, 40].map((w, i) => (
          <div key={i} style={{
            height: i === 2 ? 14 : 10, borderRadius: 4, marginBottom: 12, width: w,
            background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
            backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── MyCourses Page ────────────────────────────────────────────
export default function MyCourses() {
  const navigate = useNavigate();
  const [tab,      setTab]      = useState("all");
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [,  setStudent]  = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view your courses.");
          setLoading(false);
          return;
        }

        const res  = await fetch(`${API}/auth/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load courses.");
          return;
        }

        setStudent(data.student);
        setCourses(data.courses || []);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getTabKey = (status) => {
    const cfg = getStatusCfg(status);
    return cfg.key;
  };

  const counts = {
    all:           courses.length,
    "in-progress": courses.filter(c => getTabKey(c.status) === "in-progress").length,
    complete:      courses.filter(c => getTabKey(c.status) === "complete").length,
    "not-started": 0,
    failed:        courses.filter(c => getTabKey(c.status) === "failed").length,
  };

  const certificates = courses.filter(c => getTabKey(c.status) === "complete" && c.examScore);

  const filtered = tab === "all"
    ? courses
    : tab === "not-started"
      ? []
      : courses.filter(c => getTabKey(c.status) === tab);

  const STAT_CARDS = [
    { icon: <FaBookOpen />,          value: counts.all,           label: "Total Enrolled",        iconBg: "rgba(46,171,254,0.1)",  iconColor: "#2EABFE", topBorder: "#2EABFE" },
    { icon: <FaCheckCircle />,       value: counts.complete,      label: "Completed",             iconBg: "rgba(0,128,0,0.1)",     iconColor: "#008000", topBorder: "#008000" },
    { icon: <FaClock />,             value: counts["in-progress"],label: "In Progress",           iconBg: "rgba(245,158,11,0.1)",  iconColor: "#F59E0B", topBorder: "#F59E0B" },
    { icon: <FaChalkboardTeacher />, value: certificates.length,  label: "Certifications Earned", iconBg: "rgba(149,105,247,0.1)", iconColor: "#9569F7", topBorder: "#9569F7" },
  ];

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Breadcrumb */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 13, marginBottom: 14,
        fontFamily: "'Poppins', sans-serif",
      }}>
        <span style={{ color: "#2EABFE", fontWeight: 500, cursor: "pointer" }}>Student Portal</span>
        <FaChevronRight style={{ fontSize: 10, color: "#d1d5db" }} />
        <span style={{ color: "#091925", fontWeight: 600 }}>My Courses</span>
      </div>

      {/* Divider line */}
      <div style={{ borderTop: "0.5px solid #2EABFE", marginBottom: 22 }} />

      {/* Page title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{
            fontSize: 26, fontWeight: 400, color: "#000", margin: "0 0 4px",
            fontFamily: "'HomepageBaukasten', sans-serif",
            textTransform: "capitalize", lineHeight: "30px",
          }}>My Courses</h1>
          <p style={{
            fontSize: 13, color: "#5B7384", margin: 0,
            fontFamily: "'Poppins', sans-serif", fontWeight: 500,
          }}>
            Track your progress, continue studying, and download your completion certificates.
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#2EABFE", color: "#091925",
          border: "0.5px solid #2EABFE", borderRadius: 5,
          padding: "8px 14px", fontSize: 13, fontWeight: 700,
          cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          fontFamily: "'Poppins', sans-serif", textTransform: "capitalize",
        }}>
          <FaSearch style={{ fontSize: 12, color: "#091925" }} /> Browse Courses
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5,
          padding: "14px 18px", marginBottom: 20, color: "#b91c1c", fontSize: 13,
          fontFamily: "'Poppins', sans-serif",
        }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        {STAT_CARDS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* White panel: tabs + grid */}
      <div style={{
        background: "#fff", border: "1px solid #e5e7eb",
        borderRadius: 5, padding: "0 0 24px", marginBottom: 26,
      }}>
        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4,
          padding: "15px 15px 0",
          marginBottom: 20,
          overflowX: "auto",
          background: "#fff",
          borderRadius: "5px 5px 0 0",
        }}>
          {TABS.map(t => {
            const active = tab === t.key;
            const isFailedTab = t.key === "failed";
            const countColor = isFailedTab && counts[t.key] > 0 ? "#EF4444" : (active ? "#091925" : "#5B7384");
            const countBg = isFailedTab && counts[t.key] > 0 ? "rgba(239,68,68,0.1)" : (active ? "rgba(9,25,37,0.1)" : "rgba(91,115,132,0.1)");
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "8px 12px",
                border: "none",
                background: active ? "#2EABFE" : "none",
                borderRadius: active ? 5 : 0,
                cursor: "pointer",
                fontSize: 12, fontWeight: 700,
                color: active ? "#091925" : "#5B7384",
                display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.15s",
                fontFamily: "'Poppins', sans-serif",
                textTransform: "capitalize",
              }}>
                {t.label}
                <span style={{
                  background: countBg,
                  color: countColor,
                  fontSize: 11, fontWeight: 700,
                  borderRadius: 100, padding: "2px 7px",
                  fontFamily: "'Poppins', sans-serif",
                  minWidth: 22, textAlign: "center",
                }}>
                  {counts[t.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Course grid */}
        <div style={{ padding: "0 15px" }}>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[1, 2, 3].map(i => <CourseSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 0",
              color: "rgba(9,25,37,0.3)", display: "flex",
              flexDirection: "column", alignItems: "center", gap: 10,
            }}>
              <FaBookOpen style={{ fontSize: 36, color: "#e5e7eb" }} />
              <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                {tab === "all" ? "No courses enrolled yet." : "No courses in this category."}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {filtered.map(c => <CourseCard key={c._id} course={c} navigate={navigate} />)}
            </div>
          )}
        </div>
      </div>

      {/* Divider line */}
      <div style={{ borderTop: "0.5px solid #2EABFE", marginBottom: 22 }} />

      {/* My Certificates */}
      {certificates.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <h2 style={{
              fontSize: 16, fontWeight: 400, color: "#091925", margin: 0,
              fontFamily: "'HomepageBaukasten', sans-serif",
              whiteSpace: "nowrap",
            }}>My Certificates</h2>
            <div style={{ flex: 1, borderTop: "0.5px solid #7FA8C4" }} />
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {certificates.map(c => <CertRow key={c._id} cert={c} api={API} />)}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
