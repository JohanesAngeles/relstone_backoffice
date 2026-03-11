import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaPhone, FaMobileAlt, FaIdCard,
  FaBuilding, FaMapMarkerAlt, FaChevronRight, FaEdit,
  FaSave, FaTimes, FaBookOpen, FaShieldAlt, FaFileAlt,
  FaCheck, FaCamera, FaHome,
} from "react-icons/fa";
import { MdBusiness, MdCalendarToday } from "react-icons/md";
import DashboardLayout from "../components/common/MycoursesLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Table Row ──────────────────────────────────────────────────
function TableRow({ label, value, editing, name, onChange, type = "text", actionType, onAction, placeholder }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      borderBottom: "0.5px solid #5B7384",
      minHeight: 48,
    }}>
      {/* Label */}
      <div style={{
        width: 220, flexShrink: 0,
        fontSize: 14, fontWeight: 500,
        color: "#5B7384",
        fontFamily: "'Poppins', sans-serif",
        padding: "10px 0",
      }}>
        {label}
      </div>

      {/* Value */}
      <div style={{ flex: 1, padding: "10px 12px" }}>
        {editing ? (
          <input
            name={name}
            type={type}
            defaultValue={value || ""}
            onChange={onChange}
            placeholder={placeholder || ""}
            style={{
              width: "100%", fontSize: 14, fontWeight: 500,
              color: "#091925", fontFamily: "'Poppins', sans-serif",
              background: "rgba(46,171,254,0.06)",
              border: "0.5px solid #2EABFE",
              borderRadius: 4, padding: "5px 8px",
              outline: "none", boxSizing: "border-box",
            }}
          />
        ) : (
          <span style={{
            fontSize: 14, fontWeight: 500,
            color: value ? "#091925" : "#5B7384",
            fontFamily: "'Poppins', sans-serif",
          }}>
            {value || "—"}
          </span>
        )}
      </div>

      {/* Action button */}
      {actionType && (
        <div style={{ flexShrink: 0, paddingRight: 0 }}>
          {actionType === "edit" ? (
            <button
              onClick={onAction}
              style={{
                width: 60, height: 36,
                background: "rgba(46,171,254,0.1)",
                border: "0.5px solid #2EABFE",
                borderRadius: 5,
                color: "#2EABFE",
                fontSize: 13, fontWeight: 700,
                fontFamily: "'Poppins', sans-serif",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <FaEdit style={{ fontSize: 11, marginRight: 3 }} /> Edit
            </button>
          ) : actionType === "add" ? (
            <button
              onClick={onAction}
              style={{
                width: 60, height: 36,
                background: "rgba(0,128,0,0.1)",
                border: "0.5px solid #008000",
                borderRadius: 5,
                color: "#008000",
                fontSize: 13, fontWeight: 700,
                fontFamily: "'Poppins', sans-serif",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              Add
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ── Section Panel ──────────────────────────────────────────────
function SectionPanel({ icon, title, children, editing, onSave, onCancel, saving }) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 5,
      overflow: "hidden",
      marginBottom: 16,
    }}>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "14px 20px",
        borderBottom: "0.5px solid #5B7384",
      }}>
        <span style={{ color: "#2EABFE", fontSize: 14, display: "flex", alignItems: "center" }}>{icon}</span>
        <span style={{
          fontSize: 14, fontWeight: 500, color: "#091925",
          fontFamily: "'Poppins', sans-serif",
          textTransform: "uppercase", letterSpacing: "0.05em",
          flex: 1,
        }}>
          {title}
        </span>
        {editing ? (
          <div style={{ display: "flex", gap: 6 }}>
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
          </div>
        ) : null}
      </div>

      {/* Rows */}
      <div style={{ padding: "0 20px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Main Profile Page ──────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [editContact, setEditContact] = useState(false);
  const [editLicense, setEditLicense] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState({});

  const userStr = localStorage.getItem("user");
  const student = userStr ? JSON.parse(userStr) : null;

  const displayName = student?.name ||
    [student?.firstName, student?.lastName].filter(Boolean).join(" ") || "—";

  const initials = [student?.firstName, student?.lastName]
    .filter(Boolean).map(w => w[0]).join("").toUpperCase() || "U";

  const handleChange = (e) => {
    setEdits(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (section) => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const token = localStorage.getItem("token");
      if (!token) { setSaveError("Not authenticated. Please log in again."); return; }

      const res = await fetch(`${API}/auth/my-profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(edits),
      });

      const data = await res.json();
      if (!res.ok) { setSaveError(data.message || "Save failed. Please try again."); return; }

      const updated = { ...student, ...edits };
      localStorage.setItem("user", JSON.stringify(updated));
      setSaveSuccess("Profile updated successfully!");
      setTimeout(() => setSaveSuccess(""), 3000);

      if (section === "contact") setEditContact(false);
      if (section === "license") setEditLicense(false);
      if (section === "address") setEditAddress(false);
      setEdits({});
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        @font-face {
          font-family: 'HomepageBaukasten';
          src: local('HomepageBaukasten');
        }
        input:focus { outline: none; }
        textarea:focus { outline: none; }
      `}</style>

      {/* ── Breadcrumb ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 14, marginBottom: 30,
        fontFamily: "'Poppins', sans-serif",
      }}>
        <span
          style={{ color: "#2EABFE", fontWeight: 500, cursor: "pointer" }}
          onClick={() => navigate("/my-courses")}
        >
          Student Portal
        </span>
        <FaChevronRight style={{ fontSize: 10, color: "#d1d5db" }} />
        <span style={{ color: "#091925", fontWeight: 700 }}>My Profile</span>
      </div>

      {/* ── Page Title ── */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{
          fontSize: 32, fontWeight: 600, color: "#000000",
          fontFamily: "'HomepageBaukasten', 'Poppins', sans-serif",
          margin: 0, lineHeight: 1.1, textTransform: "capitalize",
        }}>
          My Profile
        </h1>
        <p style={{
          fontSize: 15, color: "#5B7384", fontWeight: 500, margin: "4px 0 0",
          fontFamily: "'Poppins', sans-serif",
        }}>
          Personal info, contact &amp; security
        </p>
      </div>

      {/* ── Blue Divider ── */}
      <div style={{ borderTop: "0.5px solid #2EABFE", margin: "14px 0 20px" }} />

      {/* ── Alerts ── */}
      {saveError && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5,
          padding: "12px 18px", marginBottom: 14, color: "#b91c1c", fontSize: 13,
          fontFamily: "'Poppins', sans-serif",
        }}>{saveError}</div>
      )}
      {saveSuccess && (
        <div style={{
          background: "rgba(0,128,0,0.06)", border: "1px solid #008000", borderRadius: 5,
          padding: "12px 18px", marginBottom: 14, color: "#008000", fontSize: 13,
          fontFamily: "'Poppins', sans-serif", fontWeight: 500,
        }}>✓ {saveSuccess}</div>
      )}

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
          {/* ── Hero Banner ── */}
          <div style={{
            position: "relative",
            background: "#091925",
            borderRadius: 5,
            padding: "18px 24px",
            marginBottom: 20,
            overflow: "hidden",
          }}>
            {/* Gradient overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(9,25,37,0.05) 0%, rgba(46,171,254,0.3) 100%)",
              borderRadius: 5, pointerEvents: "none",
            }} />

            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 58, height: 58, borderRadius: "50%",
                  background: "#F59E0B",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: "#091925",
                  fontFamily: "'Poppins', sans-serif",
                }}>
                  {initials}
                </div>
                {/* Camera badge */}
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#2EABFE", border: "1px solid #0F2F46",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}>
                  <FaCamera style={{ fontSize: 9, color: "#091925" }} />
                </div>
              </div>

              {/* Name & meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 28, fontWeight: 400, color: "#FFFFFF",
                    fontFamily: "'HomepageBaukasten', 'Poppins', sans-serif",
                    textTransform: "capitalize",
                  }}>
                    {displayName}
                  </span>
                  {/* Active badge */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "rgba(0,255,9,0.1)",
                    border: "0.5px solid #00FF09",
                    borderRadius: 10, padding: "3px 10px",
                  }}>
                    <FaCheck style={{ fontSize: 9, color: "#00FF09" }} />
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "#00FF09",
                      fontFamily: "'Poppins', sans-serif",
                    }}>Active</span>
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 5, flexWrap: "wrap" }}>
                  {student?.city && (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 13, fontWeight: 700, color: "#2EABFE",
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      <FaMapMarkerAlt style={{ fontSize: 10 }} />
                      City: {student.city}{student.state ? `, ${student.state}` : ""}
                    </span>
                  )}
                  {student?.registrationDate && (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 13, fontWeight: 700, color: "#2EABFE",
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      <MdCalendarToday style={{ fontSize: 10 }} />
                      Registered: {student.registrationDate}
                    </span>
                  )}
                  {student?.email && (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 13, color: "#2EABFE",
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      <FaEnvelope style={{ fontSize: 10 }} />
                      {student.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Student ID — top right */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{
                  fontSize: 13, color: "#FFFFFF",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 400, marginBottom: 2,
                }}>
                  Student ID
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: "#FFFFFF",
                  fontFamily: "'Poppins', sans-serif",
                }}>
                  [{student?.studentId || "—"}]
                </div>
              </div>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* ── LEFT COLUMN ── */}
            <div>
              <SectionPanel
                title="Name & Identity"
                icon={<FaUser />}
                editing={editContact}
                onEdit={() => setEditContact(true)}
                onSave={() => handleSave("contact")}
                onCancel={() => handleCancel("contact")}
                saving={saving}
              >
                <TableRow
                  label="Student ID"
                  value={student?.studentId}
                  editing={false}
                />
                <TableRow
                  label="Email"
                  value={student?.email}
                  editing={editContact}
                  name="email"
                  onChange={handleChange}
                  type="email"
                  actionType={editContact ? null : "edit"}
                  onAction={() => setEditContact(true)}
                />
                <TableRow
                  label="Student Name"
                  value={[student?.lastName, student?.firstName].filter(Boolean).join(", ").toUpperCase() || student?.name?.toUpperCase()}
                  editing={editContact}
                  name="studentName"
                  onChange={handleChange}
                  actionType={editContact ? null : "edit"}
                  onAction={() => setEditContact(true)}
                />
                <TableRow
                  label="Company Name (Optional)"
                  value={student?.companyName}
                  editing={editContact}
                  name="companyName"
                  onChange={handleChange}
                  placeholder="Enter company name"
                  actionType={editContact ? null : "add"}
                  onAction={() => setEditContact(true)}
                />
                <TableRow
                  label="Mailing Address"
                  value={student?.streetAddress ? `${student.streetAddress}${student.city ? `, ${student.city}` : ""}${student.state ? `, ${student.state}` : ""}${student.postalCode ? ` ${student.postalCode}` : ""}` : null}
                  editing={editAddress}
                  name="streetAddress"
                  onChange={handleChange}
                  actionType={editAddress ? null : "edit"}
                  onAction={() => setEditAddress(true)}
                />
                <TableRow
                  label="Work Phone"
                  value={student?.workPhone}
                  editing={editContact}
                  name="workPhone"
                  onChange={handleChange}
                  actionType={editContact ? null : "edit"}
                  onAction={() => setEditContact(true)}
                />
                <TableRow
                  label="Mobile Phone"
                  value={student?.mobilePhone}
                  editing={editContact}
                  name="mobilePhone"
                  onChange={handleChange}
                  actionType={editContact ? null : "add"}
                  onAction={() => setEditContact(true)}
                />
                <TableRow
                  label="Home Phone"
                  value={student?.homePhone}
                  editing={editContact}
                  name="homePhone"
                  onChange={handleChange}
                  actionType={editContact ? null : "add"}
                  onAction={() => setEditContact(true)}
                />
              </SectionPanel>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div>
              <SectionPanel
                title="License, ID Numbers, & Credentials"
                icon={<FaShieldAlt />}
                editing={editLicense}
                onEdit={() => setEditLicense(true)}
                onSave={() => handleSave("license")}
                onCancel={() => handleCancel("license")}
                saving={saving}
              >
                {/* Record Type with badge */}
                <div style={{
                  display: "flex", alignItems: "center",
                  borderBottom: "0.5px solid #5B7384",
                  minHeight: 48,
                }}>
                  <div style={{
                    width: 220, flexShrink: 0, fontSize: 14,
                    fontWeight: 500, color: "#5B7384",
                    fontFamily: "'Poppins', sans-serif", padding: "10px 0",
                  }}>
                    Record Type
                  </div>
                  <div style={{ flex: 1, padding: "10px 12px" }}>
                    {student?.recordType ? (
                      <div style={{
                        display: "inline-flex", alignItems: "center",
                        background: "#E0F2FF", borderRadius: 100,
                        padding: "4px 14px",
                      }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "#1A7AB8",
                          fontFamily: "'Poppins', sans-serif",
                        }}>
                          R — {student.recordType}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#5B7384", fontFamily: "'Poppins', sans-serif" }}>—</span>
                    )}
                  </div>
                </div>

                <TableRow
                  label="DRE Number"
                  value={student?.dreNumber}
                  editing={editLicense}
                  name="dreNumber"
                  onChange={handleChange}
                  placeholder="(R.E. Students)"
                />
                <TableRow
                  label="NMLS ID Number"
                  value={student?.nmlsId}
                  editing={editLicense}
                  name="nmlsId"
                  onChange={handleChange}
                />
                <TableRow
                  label="Last Website"
                  value={student?.lastWebsite}
                  editing={editLicense}
                  name="lastWebsite"
                  onChange={handleChange}
                />
                <TableRow
                  label="Lic. Number"
                  value={student?.licenseNumber}
                  editing={editLicense}
                  name="licenseNumber"
                  onChange={handleChange}
                  placeholder="(Insurance)"
                />
                <TableRow
                  label="CFP Number"
                  value={student?.cfpNumber}
                  editing={editLicense}
                  name="cfpNumber"
                  onChange={handleChange}
                  placeholder="(CFP Students)"
                />
                <TableRow
                  label="NPN Number"
                  value={student?.npnNumber}
                  editing={editLicense}
                  name="npnNumber"
                  onChange={handleChange}
                  placeholder="(NPN #)"
                />

                {/* Password row */}
                <div style={{
                  display: "flex", alignItems: "center",
                  borderBottom: "0.5px solid #5B7384",
                  minHeight: 48,
                }}>
                  <div style={{
                    width: 220, flexShrink: 0, fontSize: 14,
                    fontWeight: 500, color: "#5B7384",
                    fontFamily: "'Poppins', sans-serif", padding: "10px 0",
                  }}>
                    Password
                  </div>
                  <div style={{ flex: 1, padding: "10px 12px" }}>
                    <span style={{
                      fontSize: 14, fontWeight: 500, color: "#091925",
                      fontFamily: "'Poppins', sans-serif", letterSpacing: "0.15em",
                    }}>
                      ••••••
                    </span>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <button style={{
                      height: 36, padding: "0 14px",
                      background: "rgba(46,171,254,0.1)",
                      border: "0.5px solid #2EABFE",
                      borderRadius: 5,
                      color: "#2EABFE",
                      fontSize: 12, fontWeight: 700,
                      fontFamily: "'Poppins', sans-serif",
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}>
                      Change Password
                    </button>
                  </div>
                </div>
              </SectionPanel>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
