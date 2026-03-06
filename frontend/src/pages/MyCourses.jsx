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
    label: "In Progress", dot: "#f97316",
    badgeBg: "#fff7ed", badgeText: "#ea580c", badgeBorder: "#fed7aa",
    iconBg: "#fff7ed", iconColor: "#f97316", barColor: "#f97316",
  },
  "Complete": {
    key: "complete",
    label: "Complete", dot: "#16a34a",
    badgeBg: "#f0fdf4", badgeText: "#15803d", badgeBorder: "#bbf7d0",
    iconBg: "#f0fdf4", iconColor: "#16a34a", barColor: "#16a34a",
  },
  "Failed": {
    key: "failed",
    label: "Failed", dot: "#ef4444",
    badgeBg: "#fef2f2", badgeText: "#b91c1c", badgeBorder: "#fecaca",
    iconBg: "#fef2f2", iconColor: "#dc2626", barColor: "#16a34a",
  },
};

// Fallback for any unexpected status string
const getStatusCfg = (status) =>
  STATUS_CFG[status] || STATUS_CFG["In Progress"];

// ── Map courseType to a readable category label ───────────────
const getCategoryLabel = (courseType = "", courseTitle = "") => {
  if (courseType === "CE")         return "California C.E.";
  if (courseType === "RE")         return "Real Estate";
  if (courseType === "PreLicense") return "Pre-License";
  // Fallback: try to derive from bundleId in title
  if (courseTitle.toLowerCase().includes("c.e.")) return "California C.E.";
  if (courseTitle.toLowerCase().includes("pre-license")) return "Pre-License";
  return courseType || "Course";
};

// ── Derive credit hours from bundleId ─────────────────────────
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
      borderRadius: 12,
      padding: "16px 20px",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 10,
        background: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 19, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#111", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3, fontWeight: 500 }}>{label}</div>
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

  // Show the bundle's first examName as the card title, fallback to courseTitle
  const displayTitle = course.examNames?.[0] || course.courseTitle || course.bundleId;

  // Version badges
  const versions = course.versions || [];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        display: "flex", flexDirection: "column",
        boxShadow: hovered ? "0 6px 20px rgba(0,0,0,0.09)" : "0 1px 3px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s",
      }}
    >
      {/* Badge row */}
      <div style={{ padding: "12px 14px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
        {/* Version badges */}
        <div style={{ display: "flex", gap: 5 }}>
          {versions.length > 0 ? versions.sort().map(v => (
            <span key={v} style={{
              fontSize: 11, fontWeight: 600, color: "#6b7280",
              border: "1px solid #d1d5db", borderRadius: 20,
              padding: "2px 8px", background: "#fff",
            }}>
              {v.replace("Version ", "Ver ")}
            </span>
          )) : (
            <span style={{
              fontSize: 11, fontWeight: 600, color: "#6b7280",
              border: "1px solid #d1d5db", borderRadius: 20,
              padding: "2px 10px", background: "#fff",
            }}>
              {course.bundleId}
            </span>
          )}
        </div>

        {/* Status badge */}
        <span style={{
          fontSize: 11, fontWeight: 700,
          background: s.badgeBg, color: s.badgeText,
          border: `1px solid ${s.badgeBorder}`,
          borderRadius: 20, padding: "3px 10px",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <FaCircle style={{ fontSize: 6, color: s.dot }} />
          {s.label}
        </span>
      </div>

      {/* Icon */}
      <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 10px" }}>
        <div style={{
          width: 62, height: 62, borderRadius: 14,
          background: s.iconBg, color: s.iconColor,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
        }}>
          <FaBookOpen />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "0 14px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {category}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.45 }}>
          {displayTitle}
        </div>

        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#9ca3af" }}>
          {creditHrs && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MdOutlineAccessTime style={{ fontSize: 13 }} /> {creditHrs} Credit Hrs
            </span>
          )}
          {course.registrationDate && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MdCalendarToday style={{ fontSize: 12 }} /> {course.registrationDate}
            </span>
          )}
        </div>

        <div style={{ borderTop: "1px solid #f3f4f6", margin: "2px 0" }} />

        {/* Progress */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Progress</span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: sKey === "in-progress" ? "#f97316"
                 : sKey === "complete"    ? "#16a34a"
                 : "#dc2626",
          }}>
            {course.progress ?? 0}%
          </span>
        </div>
        <div style={{ height: 6, background: "#f3f4f6", borderRadius: 99 }}>
          <div style={{
            height: "100%", borderRadius: 99,
            width: `${course.progress ?? 0}%`,
            background: s.barColor,
          }} />
        </div>

        {course.totalQuestions > 0 && (
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            {course.totalQuestions} exam questions
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Action row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <span style={{ fontSize: 12 }}>
            {sKey === "in-progress" && (
              <span style={{ color: "#9ca3af" }}>
                Registered: {course.registrationDate || "—"}
              </span>
            )}
            {sKey === "complete" && (
              <span style={{ color: "#16a34a", fontWeight: 700 }}>
                {course.examScore}% Passed
              </span>
            )}
            {sKey === "failed" && (
              <span style={{ color: "#dc2626", fontWeight: 700 }}>
                {course.examScore}% Failed
              </span>
            )}
          </span>

          {sKey === "in-progress" && (
            <button
                onClick={() => navigate(`/bundle/${course.bundleId}`)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                <FaPlay style={{ fontSize: 9 }} /> Continue
            </button>
            )}
          {sKey === "complete" && (
            <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#16a34a", border: "1.5px solid #16a34a", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              <FaDownload style={{ fontSize: 11 }} /> Certificate
            </button>
          )}
          {sKey === "failed" && (
            <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#7c3aed", border: "1.5px solid #7c3aed", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              <FaRedo style={{ fontSize: 10 }} /> Retake
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CertRow ───────────────────────────────────────────────────
function CertRow({ cert }) {
  return (
    <div style={{
      flex: "1 1 340px", display: "flex", alignItems: "center", gap: 14,
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px",
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        <FaCheckCircle />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111", lineHeight: 1.35 }}>{cert.courseTitle}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
          Completed {cert.completionDate} · Score: {cert.examScore}%
        </div>
      </div>
      <button style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: "#fff", border: "1.5px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", cursor: "pointer" }}>
        <FaDownload style={{ fontSize: 12 }} />
      </button>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────
function CourseSkeleton() {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
      {[80, 60, 200, 120, 40].map((w, i) => (
        <div key={i} style={{
          height: i === 2 ? 14 : 10, borderRadius: 4, marginBottom: 12, width: w,
          background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
          backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
        }} />
      ))}
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

  // ── Fetch real courses from API ───────────────────────────
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

  // ── Derive tab key from DB status string ──────────────────
  const getTabKey = (status) => {
    const cfg = getStatusCfg(status);
    return cfg.key;
  };

  // ── Counts ────────────────────────────────────────────────
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
    { icon: <FaBookOpen />,          value: counts.all,           label: "Total Enrolled",        iconBg: "#eff6ff", iconColor: "#3b82f6", topBorder: "#3b82f6" },
    { icon: <FaCheckCircle />,       value: counts.complete,      label: "Completed",             iconBg: "#f0fdf4", iconColor: "#16a34a", topBorder: "#16a34a" },
    { icon: <FaClock />,             value: counts["in-progress"],label: "In Progress",           iconBg: "#fff7ed", iconColor: "#f97316", topBorder: "#f97316" },
    { icon: <FaChalkboardTeacher />, value: certificates.length,  label: "Certifications Earned", iconBg: "#f5f3ff", iconColor: "#7c3aed", topBorder: "#7c3aed" },
  ];

  // ── Greeting ──────────────────────────────────────────────

  return (
    <DashboardLayout>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
        <span style={{ color: "#3b82f6", fontWeight: 500, cursor: "pointer" }}>Student Portal</span>
        <FaChevronRight style={{ fontSize: 10, color: "#d1d5db" }} />
        <span style={{ color: "#374151", fontWeight: 600 }}>My Courses</span>
      </div>

      {/* Page title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 5px" }}>My Courses</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Track your progress, continue studying, and download your completion certificates.
          </p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          <FaSearch style={{ fontSize: 12 }} /> Browse Courses
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 18px", marginBottom: 20, color: "#b91c1c", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        {STAT_CARDS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* White panel: tabs + grid */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "0 20px 24px", marginBottom: 26 }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1.5px solid #e5e7eb", marginBottom: 20, overflowX: "auto" }}>
          {TABS.map(t => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "14px 16px", border: "none",
                borderBottom: active ? "2.5px solid #2563eb" : "2.5px solid transparent",
                background: "none", cursor: "pointer",
                fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? "#2563eb" : "#6b7280",
                marginBottom: -1.5,
                display: "flex", alignItems: "center", gap: 7,
                whiteSpace: "nowrap", flexShrink: 0, transition: "color 0.15s",
              }}>
                {t.label}
                <span style={{ background: active ? "#dbeafe" : "#f3f4f6", color: active ? "#2563eb" : "#6b7280", fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "1px 8px" }}>
                  {counts[t.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Course grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[1, 2, 3].map(i => <CourseSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <FaBookOpen style={{ fontSize: 36, color: "#e5e7eb" }} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              {tab === "all" ? "No courses enrolled yet." : "No courses in this category."}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {filtered.map(c => <CourseCard key={c._id} course={c} navigate={navigate} />)}
          </div>
        )}
      </div>

      {/* My Certificates */}
      {certificates.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 14px" }}>My Certificates</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {certificates.map(c => <CertRow key={c._id} cert={c} />)}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}