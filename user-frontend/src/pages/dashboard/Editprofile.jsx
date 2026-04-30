import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./editProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [avatar, setAvatar] = useState(null);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    pincode: "",
    bio: "",
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim())  e.lastName  = "Last name is required";
    if (!form.email.trim())     e.email     = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (form.phone && !/^\+?[0-9\s-]{7,15}$/.test(form.phone))
      e.phone = "Invalid phone number";
    return e;
  };

  // ── Single, correct handleSave ────────────────────────
const handleSave = async () => {
  const e = validate();
  if (Object.keys(e).length) { setErrors(e); return; }

  setLoading(true);

  try {
    // ✅ Match exactly what Login.jsx stores
    const token = localStorage.getItem("accessToken") 
               || sessionStorage.getItem("accessToken");

    if (!token) {
      alert("You are not logged in. Please login again.");
      navigate("/login");
      return;
    }

    const res = await fetch("http://localhost:5000/api/user/update-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...form, latitude: null, longitude: null }),
    });

    const text = await res.text();
   console.log("STATUS:", res.status);
console.log("RAW RESPONSE:", text); // ← THIS will show exact backend error
const data = JSON.parse(text);

    if (!res.ok) throw new Error(data.message || "Something went wrong");

    setSaved(true);
    setTimeout(() => { setSaved(false); navigate("/profile"); }, 1500);

  } catch (err) {
    console.error("Error:", err);
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

  const initials = `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div className="ep-page">
      <div className="ep-container">

        <div className="ep-header">
          <button className="ep-back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
          <h1 className="ep-title">Edit Profile</h1>
          <div style={{ width: 36 }} />
        </div>

        <div className="ep-avatar-wrap">
          <div className="ep-avatar" onClick={() => fileRef.current.click()}>
            {avatar
              ? <img src={avatar} alt="avatar" className="ep-avatar-img" />
              : <span className="ep-avatar-initials">{initials}</span>
            }
            <div className="ep-avatar-overlay">
              <span className="ep-camera">📷</span>
            </div>
          </div>
          <p className="ep-avatar-hint">Tap to change photo</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>

        <p className="ep-group-label">Personal Info</p>
        <div className="ep-card">
          <div className="ep-row two-col">
            <div className="ep-field">
              <label>First Name <span className="req">*</span></label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="e.g. Arjun"
                className={errors.firstName ? "error" : ""}
              />
              {errors.firstName && <p className="ep-error">{errors.firstName}</p>}
            </div>
            <div className="ep-field">
              <label>Last Name <span className="req">*</span></label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="e.g. Sharma"
                className={errors.lastName ? "error" : ""}
              />
              {errors.lastName && <p className="ep-error">{errors.lastName}</p>}
            </div>
          </div>

          <div className="ep-divider" />

          <div className="ep-row two-col">
            <div className="ep-field">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} />
            </div>
            <div className="ep-field">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="ep-divider" />

          <div className="ep-field ep-row">
            <label>Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="A short intro about yourself…"
              rows={3}
            />
          </div>
        </div>

        <p className="ep-group-label">Contact</p>
        <div className="ep-card">
          <div className="ep-field ep-row">
            <label>Email Address <span className="req">*</span></label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <p className="ep-error">{errors.email}</p>}
          </div>

          <div className="ep-divider" />

          <div className="ep-field ep-row">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className={errors.phone ? "error" : ""}
            />
            {errors.phone && <p className="ep-error">{errors.phone}</p>}
          </div>
        </div>

        <p className="ep-group-label">Address</p>
        <div className="ep-card">
          <div className="ep-field ep-row">
            <label>Street Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Flat / House No., Street"
            />
          </div>

          <div className="ep-divider" />

          <div className="ep-row two-col">
            <div className="ep-field">
              <label>City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Nagpur"
              />
            </div>
            <div className="ep-field">
              <label>PIN Code</label>
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="e.g. 440001"
                maxLength={6}
              />
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          className={`ep-save-btn${saved ? " saved" : ""}`}
          onClick={handleSave}
        >
          {loading ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </button>

      </div>
    </div>
  );
};

export default EditProfile;