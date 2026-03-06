import { useState, useEffect } from "react";
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaCircle,
} from "react-icons/fa";

// ── Live Clock hook ───────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// ── Top Header ────────────────────────────────────────────────────────────────
function TopHeader() {
  return (
    <div
      style={{
        background: "#1e293b",
        height: 58,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 16,
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 190 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: "#fff",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 12,
            color: "#1e293b",
            letterSpacing: -0.5,
            flexShrink: 0,
          }}
        >
          RC
        </div>
        <div style={{ lineHeight: 1 }}>
          <div
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: 1.5,
            }}
          >
            RELSTONE
          </div>
          <div
            style={{
              color: "#64748b",
              fontSize: 9,
              letterSpacing: 0.4,
              marginTop: 2,
            }}
          >
            Real Estate License Services
          </div>
        </div>
      </div>

      {/* Search */}
      <div
        style={{ flex: 1, maxWidth: 460, position: "relative", margin: "0 auto" }}
      >
        <FaSearch
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#64748b",
            fontSize: 12,
          }}
        />
        <input
          placeholder="Search States Or Courses..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "8px 14px 8px 36px",
            color: "#cbd5e1",
            fontSize: 13,
            outline: "none",
          }}
        />
      </div>

      {/* Right actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginLeft: "auto",
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#94a3b8",
            fontSize: 19,
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaShoppingCart />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#f97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            MA
          </div>
          <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>
            Adami, M.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Sub Header ────────────────────────────────────────────────────────────────
function SubHeader() {
  const now = useClock();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div
      style={{
        background: "#0f172a",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      {/* Greeting */}
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>
          Good Morning,{" "}
          <span style={{ color: "#38bdf8" }}>Matthew!</span>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#475569",
            marginTop: 3,
            letterSpacing: 0.5,
          }}
        >
          RELS OnExSyS: BackOffice System
        </div>
      </div>

      {/* Server status */}
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 10,
          padding: "8px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 10,
            color: "#64748b",
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 5,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <FaCircle style={{ fontSize: 7, color: "#22c55e" }} />
            Examination Server
          </span>
          <span style={{ color: "#334155" }}>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <FaCircle style={{ fontSize: 7, color: "#22c55e" }} />
            Online
          </span>
          <span style={{ color: "#334155" }}>•</span>
          <span>P.S.T.</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 16,
            fontWeight: 800,
            color: "#e2e8f0",
            fontFamily: "monospace",
            letterSpacing: 1.5,
          }}
        >
          <span>{dateStr}</span>
          <span style={{ color: "#334155" }}>|</span>
          <span>{timeStr}</span>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
// Pass `navItems` prop later when you build out the nav links.
// For now it renders blank with just the hamburger + search icons.
function Sidebar({ navItems = [] }) {
  return (
    <div
      style={{
        width: 56,
        background: "#fff",
        borderRight: "1px solid #e5e7eb",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 14,
        gap: 18,
        zIndex: 50,
      }}
    >
      <button
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#6b7280",
          fontSize: 16,
          padding: 8,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaBars />
      </button>
      <button
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#6b7280",
          fontSize: 15,
          padding: 8,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaSearch />
      </button>

      {/* Render nav items when provided */}
      {navItems.map((item, i) => (
        <button
          key={i}
          title={item.label}
          onClick={item.onClick}
          style={{
            background: item.active ? "#eff6ff" : "none",
            border: "none",
            cursor: "pointer",
            color: item.active ? "#2563eb" : "#6b7280",
            fontSize: 17,
            padding: 10,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <div
      style={{
        borderTop: "1px solid #e5e7eb",
        padding: "13px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: 12, color: "#9ca3af" }}>
        © Copyright 2026{" "}
        <span
          style={{ color: "#2563eb", fontWeight: 600, cursor: "pointer" }}
        >
          Real Estate License Services, Inc.
        </span>{" "}
        — A California School Established 1978. All Rights Reserved.
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#9ca3af",
          fontFamily: "monospace",
          letterSpacing: 0.5,
        }}
      >
        RELSExSys · BackOffice · v4.1 · TLS 1.3
      </div>
    </div>
  );
}

// ── DashboardLayout ───────────────────────────────────────────────────────────
// Usage:
//   <DashboardLayout>
//     <MyCourses />
//   </DashboardLayout>
//
// Props:
//   children   – the page content to render inside the main scroll area
//   navItems   – optional array of { icon, label, active, onClick } for sidebar
//
export default function DashboardLayout({ children, navItems }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: "#f1f5f9",
        overflow: "hidden",
      }}
    >
      {/* ── Top Header ── */}
      <TopHeader />

      {/* ── Sub Header ── */}
      <SubHeader />

      {/* ── Body: Sidebar + Page Content ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar navItems={navItems} />

        {/* Scrollable content area — each page fills this */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px 32px" }}>
          {children}
        </div>
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}