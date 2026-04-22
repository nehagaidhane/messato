import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaSearch, FaStar, FaCheckCircle, FaTimesCircle, FaFileAlt, FaUniversity, FaIdCard, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaUtensils, FaClock, FaChevronRight, FaTimes, FaDownload, FaEye } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000", timeout: 10000 });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Approval Letter Component (shown in modal, printable) ─────────────────────
function ApprovalLetter({ vendor, onClose }) {
  const printRef = useRef();
  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Approval Letter - ${vendor.mess_name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Serif+4:wght@400;600&display=swap');
        body { margin: 0; padding: 40px; font-family: 'Source Serif 4', serif; color: #1a1a2e; background: #fff; }
        .letter { max-width: 720px; margin: 0 auto; border: 2px solid #1a1a2e; padding: 60px; position: relative; }
        .header { text-align: center; border-bottom: 3px double #1a1a2e; padding-bottom: 24px; margin-bottom: 32px; }
        .logo { font-family: 'Playfair Display', serif; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; }
        .subtitle { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #555; margin-top: 4px; }
        .ref { display: flex; justify-content: space-between; font-size: 12px; color: #555; margin-bottom: 28px; }
        h2 { font-family: 'Playfair Display', serif; font-size: 20px; text-align: center; text-decoration: underline; margin-bottom: 24px; }
        p { line-height: 1.8; margin-bottom: 16px; font-size: 14px; }
        .details { background: #f8f7f4; border-left: 3px solid #1a1a2e; padding: 16px 20px; margin: 24px 0; }
        .details table { width: 100%; font-size: 13px; border-collapse: collapse; }
        .details td { padding: 5px 8px; }
        .details td:first-child { font-weight: 600; width: 40%; }
        .stamp-area { display: flex; justify-content: flex-end; margin-top: 48px; }
        .stamp { width: 160px; height: 160px; border: 3px solid #15803d; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; transform: rotate(-15deg); color: #15803d; text-align: center; padding: 20px; box-sizing: border-box; }
        .stamp-text { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; line-height: 1.3; }
        .stamp-date { font-size: 10px; margin-top: 4px; letter-spacing: 1px; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 16px; font-size: 11px; color: #888; text-align: center; }
        .corner { position: absolute; width: 40px; height: 40px; }
        .tl { top: 10px; left: 10px; border-top: 3px solid #1a1a2e; border-left: 3px solid #1a1a2e; }
        .tr { top: 10px; right: 10px; border-top: 3px solid #1a1a2e; border-right: 3px solid #1a1a2e; }
        .bl { bottom: 10px; left: 10px; border-bottom: 3px solid #1a1a2e; border-left: 3px solid #1a1a2e; }
        .br { bottom: 10px; right: 10px; border-bottom: 3px solid #1a1a2e; border-right: 3px solid #1a1a2e; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const refNo = `MESS/APPR/${vendor.id}/${new Date().getFullYear()}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "780px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}>
        {/* Modal toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
          <span style={{ fontWeight: 600, fontSize: "15px", color: "#111" }}>📄 Approval Letter Preview</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#15803d", color: "#fff", border: "none", borderRadius: "7px", padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
              <FaDownload size={12} /> Print / Download
            </button>
            <button onClick={onClose} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "7px", padding: "8px 14px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
              Close
            </button>
          </div>
        </div>

        {/* Letter content */}
        <div style={{ padding: "32px" }}>
          <div ref={printRef}>
            <div className="letter" style={{ maxWidth: "680px", margin: "0 auto", border: "2px solid #1a1a2e", padding: "52px", position: "relative", fontFamily: "'Georgia', serif", color: "#1a1a2e", background: "#fffdf8" }}>
              {/* Corners */}
              {["tl","tr","bl","br"].map(c => (
                <div key={c} style={{ position: "absolute", width: 36, height: 36,
                  top: c.startsWith("t") ? 10 : "auto", bottom: c.startsWith("b") ? 10 : "auto",
                  left: c.endsWith("l") ? 10 : "auto", right: c.endsWith("r") ? 10 : "auto",
                  borderTop: c.startsWith("t") ? "3px solid #1a1a2e" : "none",
                  borderBottom: c.startsWith("b") ? "3px solid #1a1a2e" : "none",
                  borderLeft: c.endsWith("l") ? "3px solid #1a1a2e" : "none",
                  borderRight: c.endsWith("r") ? "3px solid #1a1a2e" : "none",
                }}/>
              ))}

              {/* Header */}
              <div style={{ textAlign: "center", borderBottom: "3px double #1a1a2e", paddingBottom: "20px", marginBottom: "28px" }}>
                <div style={{ fontSize: "26px", fontWeight: "bold", letterSpacing: "5px", textTransform: "uppercase" }}>MessHub</div>
                <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#666", marginTop: "4px" }}>Food Vendor Management Platform</div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "6px" }}>admin@messhub.in • www.messhub.in</div>
              </div>

              {/* Ref & Date */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555", marginBottom: "24px" }}>
                <span><strong>Ref No:</strong> {refNo}</span>
                <span><strong>Date:</strong> {today}</span>
              </div>

              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "18px", textAlign: "center", textDecoration: "underline", marginBottom: "24px", letterSpacing: "1px" }}>
                LETTER OF APPROVAL — MESS VENDOR REGISTRATION
              </h2>

              <p style={{ lineHeight: 1.9, marginBottom: "14px", fontSize: "14px" }}>
                To,<br />
                <strong>{vendor.owner_name || vendor.name}</strong><br />
                {vendor.mess_name}<br />
                {vendor.address ? `${vendor.address}, ` : ""}{vendor.city}{vendor.state ? `, ${vendor.state}` : ""} {vendor.zip || ""}
              </p>

              <p style={{ lineHeight: 1.9, marginBottom: "14px", fontSize: "14px" }}>
                Dear <strong>{vendor.owner_name || vendor.name}</strong>,
              </p>

              <p style={{ lineHeight: 1.9, marginBottom: "14px", fontSize: "14px" }}>
                We are pleased to inform you that your application for registration as a <strong>Mess Vendor</strong> on the <strong>MessHub Platform</strong> has been reviewed by our administrative team and has been <strong>formally approved</strong> with effect from <strong>{today}</strong>.
              </p>

              {/* Details box */}
              <div style={{ background: "#f5f4f0", borderLeft: "3px solid #1a1a2e", padding: "16px 20px", margin: "20px 0" }}>
                <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px", fontWeight: "bold" }}>Approved Vendor Details</div>
                <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                  {[
                    ["Mess Name", vendor.mess_name],
                    ["Owner Name", vendor.owner_name || vendor.name],
                    ["Mobile", vendor.mobile],
                    ["City", `${vendor.city || ""}${vendor.state ? ", " + vendor.state : ""}`],
                    ["FSSAI No.", vendor.fssai_number || "N/A"],
                    ["FSSAI Valid Till", vendor.fssai_validity ? new Date(vendor.fssai_validity).toLocaleDateString("en-IN") : "N/A"],
                    ["Food Type", Array.isArray(vendor.food_type) ? vendor.food_type.join(", ") : (vendor.food_type || "N/A")],
                    ["Approval Date", today],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: "4px 8px", fontWeight: 600, width: "40%" }}>{label}</td>
                      <td style={{ padding: "4px 8px" }}>{value || "—"}</td>
                    </tr>
                  ))}
                </table>
              </div>

              <p style={{ lineHeight: 1.9, marginBottom: "14px", fontSize: "14px" }}>
                You are now authorized to list your services, receive orders, and operate through the MessHub platform in compliance with our <strong>Terms of Service and Food Safety Guidelines</strong>. Please ensure that your FSSAI license and all documents remain valid throughout your operation period.
              </p>

              <p style={{ lineHeight: 1.9, marginBottom: "24px", fontSize: "14px" }}>
                We wish you great success and look forward to a productive partnership.
              </p>

              {/* Signature + Stamp */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "40px" }}>
                <div>
                  <div style={{ borderTop: "1px solid #333", width: "180px", marginBottom: "6px" }}/>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>Authorized Signatory</div>
                  <div style={{ fontSize: "11px", color: "#666" }}>MessHub Admin Team</div>
                </div>
                {/* Approval Stamp */}
                <div style={{ width: "140px", height: "140px", border: "3px solid #15803d", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(-15deg)", color: "#15803d", textAlign: "center", padding: "16px", boxSizing: "border-box", opacity: 0.9 }}>
                  <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: "bold", lineHeight: 1.4 }}>✓ APPROVED</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "4px", fontFamily: "Georgia" }}>MessHub</div>
                  <div style={{ fontSize: "9px", marginTop: "4px", letterSpacing: "1px" }}>{today}</div>
                  <div style={{ fontSize: "9px", letterSpacing: "1px", color: "#166534" }}>OFFICIAL</div>
                </div>
              </div>

              <div style={{ marginTop: "36px", borderTop: "1px solid #ccc", paddingTop: "12px", fontSize: "10px", color: "#999", textAlign: "center" }}>
                This is a computer-generated document. • MessHub Vendor Management Platform • {refNo}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vendor Detail Drawer ───────────────────────────────────────────────────────
function VendorDrawer({ vendorId, onClose, onStatusUpdate }) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showLetter, setShowLetter] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    let isActive = true;
    API.get(`/api/vendors/${vendorId}`)
      .then(res => { if (isActive) setVendor(res.data.vendor); })
      .catch(() => { if (isActive) setVendor(null); })
      .finally(() => { if (isActive) setLoading(false); });
    return () => { isActive = false; };
  }, [vendorId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await API.put(`/api/vendors/${vendorId}/status`, { status: "approved" });
      setVendor(v => ({ ...v, status: "approved" }));
      onStatusUpdate(vendorId, "approved");
      setShowLetter(true);
    } catch { alert("Failed to approve vendor."); }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert("Please enter a rejection reason."); return; }
    setActionLoading(true);
    try {
      await API.put(`/api/vendors/${vendorId}/status`, { status: "rejected", rejection_reason: rejectReason });
      setVendor(v => ({ ...v, status: "rejected", rejection_reason: rejectReason }));
      onStatusUpdate(vendorId, "rejected");
      setShowRejectModal(false);
    } catch { alert("Failed to reject vendor."); }
    setActionLoading(false);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "business", label: "Business", icon: "🏪" },
    { id: "documents", label: "Documents", icon: "📄" },
    { id: "bank", label: "Bank", icon: "🏦" },
  ];

  const foodTypeArr = vendor?.food_type
    ? (Array.isArray(vendor.food_type) ? vendor.food_type : (typeof vendor.food_type === "string" ? JSON.parse(vendor.food_type) : []))
    : [];

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "min(520px, 95vw)",
        background: "#fff", zIndex: 201, boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', system-ui, sans-serif",
        animation: "slideIn 0.25s ease-out"
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "17px", color: "#111" }}>{vendor?.mess_name || "Vendor Details"}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{vendor?.email || ""}</div>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaTimes color="#6b7280" />
          </button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "14px" }}>
            <span style={{ marginRight: 8 }}>⏳</span> Loading vendor data...
          </div>
        ) : !vendor ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: "14px" }}>
            Failed to load vendor details.
          </div>
        ) : (
          <>
            {/* Status bar */}
            <div style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #e5e7eb", background: vendor.status === "approved" ? "#f0fdf4" : vendor.status === "rejected" ? "#fef2f2" : "#fffbeb" }}>
              <span style={{
                padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                background: vendor.status === "approved" ? "#dcfce7" : vendor.status === "rejected" ? "#fee2e2" : "#fef9c3",
                color: vendor.status === "approved" ? "#15803d" : vendor.status === "rejected" ? "#dc2626" : "#a16207"
              }}>{(vendor.status || "pending").toUpperCase()}</span>
              {vendor.status === "approved" && (
                <button onClick={() => setShowLetter(true)} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", background: "#15803d", color: "#fff", border: "none", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                  <FaFileAlt size={11} /> View Approval Letter
                </button>
              )}
              {vendor.status === "rejected" && vendor.rejection_reason && (
                <span style={{ fontSize: "12px", color: "#dc2626" }}>Reason: {vendor.rejection_reason}</span>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", background: "#fafafa" }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  flex: 1, padding: "11px 4px", border: "none", background: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: activeTab === t.id ? 700 : 400,
                  color: activeTab === t.id ? "#2563eb" : "#6b7280",
                  borderBottom: activeTab === t.id ? "2px solid #2563eb" : "2px solid transparent",
                  transition: "all 0.15s"
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {vendor.profile_image && (
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                      <img src={vendor.profile_image} alt="Profile" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e7eb" }} />
                    </div>
                  )}
                  <InfoRow icon={<FaIdCard />} label="Owner Name" value={vendor.owner_name} />
                  <InfoRow icon={<FaPhone />} label="Mobile" value={vendor.mobile} />
                  <InfoRow icon="📧" label="Email" value={vendor.email} />
                  <InfoRow icon={<FaCalendarAlt />} label="Registered On" value={vendor.created_at ? new Date(vendor.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
                  <InfoRow icon="⭐" label="Avg Rating" value={vendor.avg_rating ? `${vendor.avg_rating} (${vendor.rating_count} reviews)` : "No ratings yet"} />
                  {vendor.description && (
                    <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "12px 14px", fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 600, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#9ca3af", marginBottom: "6px" }}>About</div>
                      {vendor.description}
                    </div>
                  )}
                </div>
              )}

              {/* BUSINESS TAB */}
              {activeTab === "business" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <InfoRow icon={<FaUtensils />} label="Mess Name" value={vendor.mess_name} />
                  <InfoRow icon="🧑‍🍳" label="Experience" value={vendor.experience ? `${vendor.experience} years` : "—"} />
                  <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={[vendor.address, vendor.town, vendor.city, vendor.state, vendor.zip].filter(Boolean).join(", ")} />
                  <InfoRow icon="🍽️" label="Food Type" value={foodTypeArr.join(", ") || "—"} />
                  <InfoRow icon="🥘" label="Cuisine Type" value={vendor.cuisine_type} />
                  <InfoRow icon="🧅" label="Uses Onion/Garlic" value={vendor.uses_onion_garlic ? "Yes" : "No"} />
                  <InfoRow icon={<FaClock />} label="Operating Days" value={vendor.operating_days} />
                  <InfoRow icon="📍" label="Service Radius" value={vendor.service_radius ? `${vendor.service_radius} km` : "—"} />
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}>
                    <div style={{ fontWeight: 600, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#9ca3af", marginBottom: "10px" }}>FSSAI Details</div>
                    <InfoRow icon="📋" label="FSSAI Number" value={vendor.fssai_number} />
                    <InfoRow icon="📅" label="Issue Date" value={vendor.fssai_date ? new Date(vendor.fssai_date).toLocaleDateString("en-IN") : "—"} style={{ marginTop: 10 }} />
                    <InfoRow icon="📅" label="Valid Till" value={vendor.fssai_validity ? new Date(vendor.fssai_validity).toLocaleDateString("en-IN") : "—"} style={{ marginTop: 10 }} />
                  </div>
                  {vendor.tags && (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#9ca3af", marginBottom: "8px" }}>Tags</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {(Array.isArray(vendor.tags) ? vendor.tags : JSON.parse(vendor.tags || "[]")).map((tag, i) => (
                          <span key={i} style={{ background: "#eff6ff", color: "#2563eb", borderRadius: "20px", padding: "3px 10px", fontSize: "12px" }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {activeTab === "documents" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {vendor.documents && Object.keys(vendor.documents).length > 0 ? (
                    Object.entries(vendor.documents).map(([docType, url]) => (
                      <div key={docType} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8f9fa", borderRadius: "10px", padding: "14px 16px", border: "1px solid #e5e7eb" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ background: "#dbeafe", borderRadius: "8px", padding: "8px", display: "flex" }}>
                            <FaFileAlt color="#2563eb" size={14} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "13px", color: "#111", textTransform: "capitalize" }}>{docType.replace(/_/g, " ")}</div>
                            <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>Uploaded document</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <a href={url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "4px", background: "#eff6ff", color: "#2563eb", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", textDecoration: "none", fontWeight: 600 }}>
                            <FaEye size={10} /> View
                          </a>
                          <a href={url} download style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f0fdf4", color: "#15803d", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", textDecoration: "none", fontWeight: 600 }}>
                            <FaDownload size={10} /> Save
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px", fontSize: "14px" }}>
                      No documents uploaded yet.
                    </div>
                  )}
                </div>
              )}

              {/* BANK TAB */}
              {activeTab === "bank" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {vendor.bankDetails ? (
                    <>
                      {/* Header card — full details visible for payment */}
                      <div style={{ background: "linear-gradient(135deg, #0f2044, #1d4ed8)", borderRadius: "16px", padding: "24px", color: "#fff", position: "relative", overflow: "hidden" }}>
                        {/* Decorative circles */}
                        <div style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                        <div style={{ position: "absolute", bottom: -20, right: 40, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

                        <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", opacity: 0.6, marginBottom: "16px" }}>
                          🏦 Bank Account Details
                        </div>

                        {/* Account Holder */}
                        <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>
                          {vendor.bankDetails.account_holder_name || "—"}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "20px" }}>
                          {vendor.bankDetails.bank_name || "—"}
                        </div>

                        {/* Full Account Number — clearly shown */}
                        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "10px", padding: "14px 16px", marginBottom: "12px" }}>
                          <div style={{ fontSize: "10px", letterSpacing: "2px", opacity: 0.65, marginBottom: "6px", textTransform: "uppercase" }}>Account Number</div>
                          <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "3px", fontFamily: "monospace" }}>
                            {vendor.bankDetails.account_number || "—"}
                          </div>
                        </div>

                        {/* IFSC + Branch row */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ background: "rgba(255,255,255,0.10)", borderRadius: "8px", padding: "10px 12px" }}>
                            <div style={{ fontSize: "9px", letterSpacing: "1.5px", opacity: 0.6, textTransform: "uppercase", marginBottom: "4px" }}>IFSC Code</div>
                            <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "1px" }}>{vendor.bankDetails.ifsc_code || "—"}</div>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.10)", borderRadius: "8px", padding: "10px 12px" }}>
                            <div style={{ fontSize: "9px", letterSpacing: "1.5px", opacity: 0.6, textTransform: "uppercase", marginBottom: "4px" }}>Branch</div>
                            <div style={{ fontSize: "13px", fontWeight: 600 }}>{vendor.bankDetails.branch_name || "—"}</div>
                          </div>
                        </div>
                      </div>

                      {/* Copyable detail rows for easy use during payment */}
                      <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "4px 0", border: "1px solid #e5e7eb" }}>
                        {[
                          { label: "Account Holder Name", value: vendor.bankDetails.account_holder_name },
                          { label: "Bank Name", value: vendor.bankDetails.bank_name },
                          { label: "Account Number", value: vendor.bankDetails.account_number, mono: true },
                          { label: "IFSC Code", value: vendor.bankDetails.ifsc_code, mono: true },
                          { label: "Branch Name", value: vendor.bankDetails.branch_name },
                        ].map((row, idx, arr) => (
                          <CopyRow key={row.label} label={row.label} value={row.value} mono={row.mono} last={idx === arr.length - 1} />
                        ))}
                      </div>

                      {/* Payment note */}
                      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "12px 14px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "16px", flexShrink: 0 }}>ℹ️</span>
                        <div style={{ fontSize: "12px", color: "#1e40af", lineHeight: 1.6 }}>
                          Use the above details for NEFT / IMPS / UPI payouts. Always verify account number and IFSC before transferring funds.
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px", fontSize: "14px" }}>
                      No bank details added yet.
                    </div>
                  )}

                  {/* Commission Plan */}
                  {vendor.commissionPlan && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px", marginTop: "4px" }}>
                      <div style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: "#15803d", marginBottom: "12px" }}>
                        💰 Commission Plan
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ background: "#fff", borderRadius: "8px", padding: "12px", border: "1px solid #d1fae5" }}>
                          <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Plan Type</div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "#15803d", textTransform: "capitalize" }}>{vendor.commissionPlan.plan_type || "—"}</div>
                        </div>
                        <div style={{ background: "#fff", borderRadius: "8px", padding: "12px", border: "1px solid #d1fae5" }}>
                          <div style={{ fontSize: "10px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Rate</div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "#15803d" }}>
                            {vendor.commissionPlan.rate}{vendor.commissionPlan.plan_type === "percentage" ? "%" : " ₹ fixed"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {(vendor.status === "pending" || !vendor.status) && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", gap: "10px", background: "#fafafa" }}>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#15803d", color: "#fff", border: "none", borderRadius: "9px", padding: "11px", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: actionLoading ? 0.6 : 1 }}
                >
                  <FaCheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "9px", padding: "11px", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: actionLoading ? 0.6 : 1 }}
                >
                  <FaTimesCircle size={14} /> Reject
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "440px", padding: "28px", boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: "#111" }}>Reject Vendor Application</h3>
            <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#6b7280" }}>This reason will be sent to the vendor and shown on their profile.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. FSSAI license is expired. Please renew and reapply."
              rows={4}
              style={{ width: "100%", borderRadius: "8px", border: "1.5px solid #e5e7eb", padding: "10px 12px", fontSize: "14px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={() => setShowRejectModal(false)} style={{ flex: 1, background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", padding: "10px", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading} style={{ flex: 1, background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px", opacity: actionLoading ? 0.6 : 1 }}>
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Letter Modal */}
      {showLetter && vendor && (
        <ApprovalLetter vendor={vendor} onClose={() => setShowLetter(false)} />
      )}
    </>
  );
}

// ── Small helper component for info rows ──────────────────────────────────────
function InfoRow({ icon, label, value, style }) {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", ...style }}>
      <div style={{ color: "#9ca3af", flexShrink: 0, marginTop: "2px", fontSize: "13px" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.8px", textTransform: "uppercase", color: "#9ca3af", marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "13px", color: "#111", fontWeight: 500 }}>{value || "—"}</div>
      </div>
    </div>
  );
}

// ── Manage Panel ──────────────────────────────────────────────────────────────
function ManagePanel({ onClose, counts }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "480px", padding: "28px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#111" }}>⚙️ Manage Vendors</h2>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "8px", padding: "7px 10px", cursor: "pointer" }}>
            <FaTimes color="#6b7280" />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Total Vendors", value: counts.approved + counts.pending + counts.rejected, color: "#2563eb", bg: "#eff6ff" },
            { label: "Approved", value: counts.approved, color: "#15803d", bg: "#f0fdf4" },
            { label: "Pending Review", value: counts.pending, color: "#a16207", bg: "#fefce8" },
            { label: "Rejected", value: counts.rejected, color: "#dc2626", bg: "#fef2f2" },
          ].map(item => (
            <div key={item.label} style={{ background: item.bg, borderRadius: "10px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "14px 16px", fontSize: "13px", color: "#374151", lineHeight: 1.7 }}>
          <strong>Quick Actions:</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: "18px" }}>
            <li>Click any vendor row to open their full profile</li>
            <li>Review profile, documents & bank details</li>
            <li>Approve or reject with a reason from the drawer</li>
            <li>Approved vendors receive a downloadable approval letter</li>
          </ul>
        </div>

        <button onClick={onClose} style={{ width: "100%", marginTop: "16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "9px", padding: "11px", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
          Done
        </button>
      </div>
    </div>
  );
}

// ── Copy Row — shows a field with a copy-to-clipboard button ─────────────────
function CopyRow({ label, value, mono, last }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: last ? "none" : "1px solid #e5e7eb" }}>
      <div>
        <div style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>{label}</div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#111", fontFamily: mono ? "monospace" : "inherit", letterSpacing: mono ? "0.5px" : "normal" }}>
          {value || "—"}
        </div>
      </div>
      {value && (
        <button
          onClick={handleCopy}
          style={{
            background: copied ? "#dcfce7" : "#f3f4f6",
            color: copied ? "#15803d" : "#6b7280",
            border: "none", borderRadius: "6px", padding: "5px 10px",
            fontSize: "11px", fontWeight: 600, cursor: "pointer",
            transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0, marginLeft: 12
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
// ... existing imports ...

// ... existing components ...

// ── MAIN PAGE - UPDATE THIS PART ──────────────────────────────────────────────
export default function VendorList() {
  const [allVendors, setAllVendors] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filter, setFilter] = useState("all");
  const [counts, setCounts] = useState({ approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [showManage, setShowManage] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true); 
    setError(null);
    try {
      console.log("Fetching vendors...");
      const vendorRes = await API.get("/api/admin/vendors");
      console.log("Response:", vendorRes.data);
      
      const data = Array.isArray(vendorRes.data) 
        ? vendorRes.data 
        : (vendorRes.data?.vendors ?? []);
      
      console.log("Vendors data:", data);
      setAllVendors(data);

      // Try to get counts
      try {
        const countRes = await API.get("/api/admin/vendors/counts");
        console.log("Counts:", countRes.data);
        setCounts(countRes.data);
      } catch {
        // Fallback: calculate counts
        setCounts({
          approved: data.filter(v => v.status === "approved").length,
          pending:  data.filter(v => (v.status ?? "pending") === "pending").length,
          rejected: data.filter(v => v.status === "rejected").length,
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load vendors: " + (err.response?.data?.message || err.message));
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    let data = [...allVendors];
    if (filter !== "all") data = data.filter(v => (v.status ?? "pending") === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(v => {
        const vendorName = String(v.owner_name || v.name || "").toLowerCase();
        const messName = String(v.mess_name || "").toLowerCase();
        const city = String(v.city || "").toLowerCase();
        const email = String(v.email || "").toLowerCase();
        return vendorName.includes(q) || messName.includes(q) || city.includes(q) || email.includes(q);
      });
    }
    setVendors(data);
  }, [filter, search, allVendors]);

  const handleStatusUpdate = (vendorId, newStatus) => {
    setAllVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: newStatus } : v));
    // Recalculate counts
    fetchAll();
  };

  const totalAll = counts.approved + counts.pending + counts.rejected;

  const filterItems = [
    { key: "all", label: "All", count: totalAll, color: "#2563eb", activeClass: "bg-blue-50 text-blue-600" },
    { key: "approved", label: "Approved", count: counts.approved, color: "#15803d", activeClass: "bg-green-50 text-green-700" },
    { key: "pending", label: "Pending", count: counts.pending, color: "#a16207", activeClass: "bg-yellow-50 text-yellow-700" },
    { key: "rejected", label: "Rejected", count: counts.rejected, color: "#dc2626", activeClass: "bg-red-50 text-red-700" },
  ];

  // Helper function to get vendor name
  const getVendorName = (vendor) => {
    return vendor.owner_name || vendor.name || "Unknown Vendor";
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="p-6 flex-1 overflow-auto text-black dark:text-white">
          <h1 className="text-2xl font-semibold mb-6">Vendor List</h1>

          <div className="grid grid-cols-3 gap-6">
            {/* LEFT PANEL */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm h-fit">
              <button
                onClick={() => setShowManage(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg mb-6 transition-colors font-semibold"
              >
                + Manage
              </button>
              <h3 className="text-sm text-gray-500 dark:text-gray-300 mb-4">Total Request</h3>
              <div className="space-y-2 text-sm">
                {filterItems.map(item => (
                  <div
                    key={item.key}
                    onClick={() => setFilter(item.key)}
                    className={`flex justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      filter === item.key ? item.activeClass + " dark:bg-opacity-20 font-semibold" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
              {/* Search bar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full w-72">
                  <FaSearch className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search name, mess, city..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full text-black dark:text-white placeholder-gray-400"
                  />
                </div>
                <button onClick={fetchAll} className="px-3 py-1.5 text-sm border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  ↻ Refresh
                </button>
              </div>          
{/* List */}
<div className="flex-1 overflow-y-auto">
  {loading && (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm gap-2">
      <span className="animate-spin">⏳</span> Loading vendors...
    </div>
  )}
  {error && (
    <div className="flex flex-col items-center justify-center h-full text-red-500 text-sm gap-3 px-4">
      <p className="text-center">{error}</p>
      <button onClick={fetchAll} className="px-4 py-1.5 bg-red-50 dark:bg-red-900/30 rounded text-red-600 dark:text-red-400">Retry</button>
    </div>
  )}
  {!loading && !error && vendors.length === 0 && (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      No vendors found.
    </div>
  )}
  {!loading && !error && vendors.map((v, i) => {
    // Prefer vendor table name for pending vendors, then owner_name
    const vendorName = v.vendor_name?.trim()
      ? v.vendor_name
      : v.name?.trim()
      ? v.name
      : v.owner_name?.trim()
      ? v.owner_name
      : (v.email?.split("@")[0] || "Unknown Vendor");
    
    const messName = v.mess_name?.trim() ? v.mess_name : "No mess name";
    const city = v.city?.trim() ? ` • ${v.city}` : "";
    const email = v.email?.trim() ? v.email : "No email";
    
    return (
      <div
        key={v.id ?? i}
        onClick={() => setSelectedVendorId(v.id)}
        className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <input type="checkbox" onClick={e => e.stopPropagation()} className="flex-shrink-0" />
          <FaStar className="text-yellow-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">
              {vendorName}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              {messName}{city}
            </p>
            <p className="text-gray-400 text-xs truncate">{email}</p>
            <span className={`inline-block text-xs font-medium mt-1 px-2 py-0.5 rounded ${
              v.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : v.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
            }`}>
              {v.status ?? "pending"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <span className="text-xs text-gray-400">
            {v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}
          </span>
          <FaChevronRight size={11} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    );
  })}
</div>

              {/* Footer */}
              <div className="flex justify-between items-center px-4 py-3 text-sm text-gray-500 dark:text-gray-300 border-t dark:border-gray-700">
                <span>Showing <strong>{vendors.length}</strong> of <strong>{allVendors.length}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Detail Drawer */}
      {selectedVendorId && (
        <VendorDrawer
          vendorId={selectedVendorId}
          onClose={() => setSelectedVendorId(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Manage Panel */}
      {showManage && (
        <ManagePanel onClose={() => setShowManage(false)} counts={counts} />
      )}
    </div>
  );
}
