import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaPhone, FaMobileAlt, FaIdCard,
  FaBuilding, FaMapMarkerAlt, FaChevronRight, FaEdit,
  FaSave, FaTimes, FaBookOpen, FaShieldAlt, FaFileAlt,
} from "react-icons/fa";
import { MdBusiness } from "react-icons/md";
import DashboardLayout from "../components/common/MycoursesLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Field Row ─────────────────────────────────────────────────
function FieldRow({ icon, label, value, editing, name, onChange, type = "text" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 0",
      borderBottom: "0.5px solid rgba(9,25,37,0.07)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 5, flexShrink: 0,
        background: "rgba(46,171,254,0.08)",
        border: "0.5px solid rgba(46,171,254,0.2)",
        color: "#2EABFE",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10, color: "rgba(9,25,37,0.4)", fontWeight: 600,
          fontFamily: "'Poppins', sans-serif", textTransform: "uppercase",
          letterSpacing: "0.05em", marginBottom: 2,
        }}>{label}</div>
        {editing ? (
          <input
            name={name}
            type={type}
            defaultValue={value || ""}
            onChange={onChange}
            style={{
              width: "100%", fontSize: 13, fontWeight: 500,
              color: "#091925", fontFamily: "'Poppins', sans-serif",
              background: "rgba(46,171,254,0.06)",
              border: "0.5px solid #2EABFE",
              borderRadius: 4, padding: "4px 8px",
              outline: "none",
            }}
          />
        ) : (
          <div style={{
            fontSize: 13, fontWeight: 500, color: value ? "#091925" : "rgba(9,25,37,0.25)",
            fontFamily: "'Poppins', sans-serif",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {value || "—"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Info Section Card ─────────────────────────────────────────
function SectionCard({ title, icon, children, editing, onEdit, onSave, onCancel, saving }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 5,
      overflow: "hidden",
      marginBottom: 16,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "0.5px solid #e5e7eb",
        background: "rgba(9,25,37,0.02)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 5,
            background: "rgba(46,171,254,0.1)",
            border: "0.5px solid rgba(46,171,254,0.3)",
            color: "#2EABFE",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12,
          }}>{icon}</div>
          <span style={{
            fontSize: 13, fontWeight: 700, color: "#091925",
            fontFamily: "'Poppins', sans-serif",
          }}>{title}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {editing ? (
            <>
              <button onClick={onCancel} style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "none", color: "rgba(9,25,37,0.4)",
                border: "0.5px solid rgba(9,25,37,0.2)", borderRadius: 4,
                padding: "5px 10px", fontSize: 11, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Poppins', sans-serif",
              }}>
                <FaTimes style={{ fontSize: 9 }} /> Cancel
              </button>
              <button onClick={onSave} disabled={saving} style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "#2EABFE", color: "#091925",
                border: "0.5px solid #2EABFE", borderRadius: 4,
                padding: "5px 10px", fontSize: 11, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "'Poppins', sans-serif",
                opacity: saving ? 0.6 : 1,
              }}>
                <FaSave style={{ fontSize: 9 }} /> {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button onClick={onEdit} style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "none", color: "#2EABFE",
              border: "0.5px solid #2EABFE", borderRadius: 4,
              padding: "5px 10px", fontSize: 11, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Poppins', sans-serif",
            }}>
              <FaEdit style={{ fontSize: 9 }} /> Edit
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: "4px 16px 8px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
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
      }}>{icon}</div>
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

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 12, mb = 10, radius = 4 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius, marginBottom: mb,
      background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ── Main Profile Page ─────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Edit states per section
  const [editContact, setEditContact] = useState(false);
  const [editLicense, setEditLicense] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [edits,       setEdits]       = useState({});

  // Read user directly from localStorage
  const userStr = localStorage.getItem("user");
  const student = userStr ? JSON.parse(userStr) : null;

  // Derive display name
  const displayName = student?.name ||
    [student?.firstName, student?.lastName].filter(Boolean).join(" ") || "—";

  const handleChange = (e) => {
    setEdits(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Save: calls backend THEN updates localStorage ─────────
  const handleSave = async (section) => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) { setSaveError("Not authenticated. Please log in again."); return; }

      const res  = await fetch(`${API}/auth/my-profile`, {
        method:  "PATCH",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(edits),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.message || "Save failed. Please try again.");
        return;
      }

      // Update localStorage with the saved values
      const updated = { ...student, ...edits };
      localStorage.setItem("user", JSON.stringify(updated));

      setSaveSuccess("Profile updated successfully!");
      setTimeout(() => setSaveSuccess(""), 3000);

      if (section === "contact") setEditContact(false);
      if (section === "license") setEditLicense(false);
      if (section === "address") setEditAddress(false);
      setEdits({});

      // Reload to reflect updated values from localStorage
      window.location.reload();

    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (section) => {
    setEdits({});
    setSaveError("");
    if (section === "contact") setEditContact(false);
    if (section === "license") setEditLicense(false);
    if (section === "address") setEditAddress(false);
  };

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        input:focus { outline: none; }
        textarea:focus { outline: none; }
      `}</style>

      {/* Breadcrumb */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 13, marginBottom: 14,
        fontFamily: "'Poppins', sans-serif",
      }}>
        <span
          style={{ color: "#2EABFE", fontWeight: 500, cursor: "pointer" }}
          onClick={() => navigate("/my-courses")}
        >
          Student Portal
        </span>
        <FaChevronRight style={{ fontSize: 10, color: "#d1d5db" }} />
        <span style={{ color: "#091925", fontWeight: 600 }}>My Profile</span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "0.5px solid #2EABFE", marginBottom: 22 }} />

      {/* Save Error */}
      {saveError && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5,
          padding: "12px 18px", marginBottom: 16, color: "#b91c1c", fontSize: 13,
          fontFamily: "'Poppins', sans-serif",
        }}>
          {saveError}
        </div>
      )}

      {/* Save Success */}
      {saveSuccess && (
        <div style={{
          background: "rgba(0,128,0,0.06)", border: "1px solid #008000", borderRadius: 5,
          padding: "12px 18px", marginBottom: 16, color: "#008000", fontSize: 13,
          fontFamily: "'Poppins', sans-serif", fontWeight: 500,
        }}>
          ✓ {saveSuccess}
        </div>
      )}

      {/* No user */}
      {!student ? (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5,
          padding: "14px 18px", color: "#b91c1c", fontSize: 13,
          fontFamily: "'Poppins', sans-serif",
        }}>
          You must be logged in to view your profile.
        </div>
      ) : (
        <>
          {/* ── Profile Hero ── */}
          <div style={{
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 5,
            padding: "18px 20px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 5, flexShrink: 0,
              background: "rgba(46,171,254,0.1)", border: "0.5px solid #2EABFE",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 700, color: "#2EABFE",
              fontFamily: "'HomepageBaukasten', sans-serif",
            }}>
              {[student?.firstName, student?.lastName]
                .filter(Boolean).map(w => w[0]).join("").toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 20, fontWeight: 400, color: "#091925",
                fontFamily: "'HomepageBaukasten', sans-serif", marginBottom: 4,
              }}>
                {displayName}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {student.email && (
                  <span style={{
                    fontSize: 11, color: "rgba(9,25,37,0.5)",
                    fontFamily: "'Poppins', sans-serif",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <FaEnvelope style={{ fontSize: 10, color: "#2EABFE" }} />
                    {student.email}
                  </span>
                )}
                {student.studentId && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "#2EABFE",
                    border: "0.5px solid #2EABFE", borderRadius: 100,
                    padding: "1px 8px", background: "rgba(46,171,254,0.08)",
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    ID: {student.studentId}
                  </span>
                )}
                {student.dreNumber && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "#9569F7",
                    border: "0.5px solid #9569F7", borderRadius: 100,
                    padding: "1px 8px", background: "rgba(149,105,247,0.08)",
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    DRE: {student.dreNumber}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate("/my-courses")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", color: "#2EABFE",
                border: "0.5px solid #2EABFE", borderRadius: 5,
                padding: "8px 14px", fontSize: 12, fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <FaBookOpen style={{ fontSize: 11 }} /> My Courses
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <StatCard icon={<FaUser />}     value={student?.registrationYear || "—"} label="Member Since"  iconBg="rgba(46,171,254,0.1)"  iconColor="#2EABFE" topBorder="#2EABFE" />
            <StatCard icon={<FaIdCard />}   value={student?.studentId        || "—"} label="Student ID"    iconBg="rgba(149,105,247,0.1)" iconColor="#9569F7" topBorder="#9569F7" />
            <StatCard icon={<FaShieldAlt />}value={student?.dreNumber        || "—"} label="DRE Number"    iconBg="rgba(0,128,0,0.1)"     iconColor="#008000" topBorder="#008000" />
            <StatCard icon={<FaEnvelope />} value={student?.email            || "—"} label="Email"         iconBg="rgba(245,158,11,0.1)"  iconColor="#F59E0B" topBorder="#F59E0B" />
          </div>

          {/* ── Two-column layout ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* LEFT COLUMN */}
            <div>
              {/* Contact Info */}
              <SectionCard
                title="Contact Information"
                icon={<FaUser />}
                editing={editContact}
                onEdit={() => setEditContact(true)}
                onSave={() => handleSave("contact")}
                onCancel={() => handleCancel("contact")}
                saving={saving}
              >
                <FieldRow icon={<FaUser />}      label="First Name"   value={student?.firstName}   editing={editContact} name="firstName"   onChange={handleChange} />
                <FieldRow icon={<FaUser />}      label="Last Name"    value={student?.lastName}    editing={editContact} name="lastName"    onChange={handleChange} />
                <FieldRow icon={<FaEnvelope />}  label="Email"        value={student?.email}       editing={false}       name="email"       onChange={handleChange} type="email" />
                <FieldRow icon={<FaPhone />}     label="Work Phone"   value={student?.workPhone}   editing={editContact} name="workPhone"   onChange={handleChange} />
                <FieldRow icon={<FaMobileAlt />} label="Mobile Phone" value={student?.mobilePhone} editing={editContact} name="mobilePhone" onChange={handleChange} />
                <FieldRow icon={<MdBusiness />}  label="Company"      value={student?.companyName} editing={editContact} name="companyName" onChange={handleChange} />
              </SectionCard>

              {/* Mailing Address */}
              <SectionCard
                title="Mailing Address"
                icon={<FaMapMarkerAlt />}
                editing={editAddress}
                onEdit={() => setEditAddress(true)}
                onSave={() => handleSave("address")}
                onCancel={() => handleCancel("address")}
                saving={saving}
              >
                <FieldRow icon={<FaMapMarkerAlt />} label="Street Address" value={student?.streetAddress} editing={editAddress} name="streetAddress" onChange={handleChange} />
                <FieldRow icon={<FaBuilding />}      label="City"           value={student?.city}          editing={editAddress} name="city"          onChange={handleChange} />
                <FieldRow icon={<FaBuilding />}      label="State"          value={student?.state}         editing={editAddress} name="state"         onChange={handleChange} />
                <FieldRow icon={<FaBuilding />}      label="Postal Code"    value={student?.postalCode}    editing={editAddress} name="postalCode"    onChange={handleChange} />
              </SectionCard>

              {/* License */}
              <SectionCard
                title="License & Credentials"
                icon={<FaShieldAlt />}
                editing={editLicense}
                onEdit={() => setEditLicense(true)}
                onSave={() => handleSave("license")}
                onCancel={() => handleCancel("license")}
                saving={saving}
              >
                <FieldRow icon={<FaIdCard />} label="DRE Number"    value={student?.dreNumber}     editing={editLicense} name="dreNumber"     onChange={handleChange} />
                <FieldRow icon={<FaIdCard />} label="License Number" value={student?.licenseNumber} editing={editLicense} name="licenseNumber" onChange={handleChange} />
              </SectionCard>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              {/* Notes — uses editLicense toggle (same Save/Cancel) */}
              <SectionCard
                title="Notes"
                icon={<FaFileAlt />}
                editing={editLicense}
                onEdit={() => setEditLicense(true)}
                onSave={() => handleSave("license")}
                onCancel={() => handleCancel("license")}
                saving={saving}
              >
                <div style={{ paddingTop: 8 }}>
                  <textarea
                    name="notes"
                    defaultValue={student?.notes || ""}
                    onChange={handleChange}
                    disabled={!editLicense}
                    placeholder="No notes yet."
                    style={{
                      width: "100%", minHeight: 120, resize: "vertical",
                      fontSize: 13, fontFamily: "'Poppins', sans-serif",
                      color: "#091925", padding: "8px 10px",
                      border: editLicense ? "0.5px solid #2EABFE" : "0.5px solid rgba(9,25,37,0.1)",
                      borderRadius: 4,
                      background: editLicense ? "rgba(46,171,254,0.04)" : "rgba(9,25,37,0.02)",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              </SectionCard>

              {/* Read-only Account Details */}
              <div style={{
                background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: 5, overflow: "hidden",
              }}>
                <div style={{
                  padding: "12px 16px", borderBottom: "0.5px solid #e5e7eb",
                  background: "rgba(9,25,37,0.02)",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 5,
                    background: "rgba(46,171,254,0.1)", border: "0.5px solid rgba(46,171,254,0.3)",
                    color: "#2EABFE", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 12,
                  }}><FaShieldAlt /></div>
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: "#091925",
                    fontFamily: "'Poppins', sans-serif",
                  }}>Account Details</span>
                </div>
                <div style={{ padding: "4px 16px 8px" }}>
                  <FieldRow icon={<FaIdCard />}  label="Student ID"        value={student?.studentId}        editing={false} />
                  <FieldRow icon={<FaUser />}     label="Registration Year" value={student?.registrationYear} editing={false} />
                  <FieldRow icon={<FaFileAlt />}  label="First Order Date"  value={student?.firstOrderDate}   editing={false} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}