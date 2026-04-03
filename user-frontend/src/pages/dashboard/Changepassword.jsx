import { useState } from "react";
import "./Changepassword.css";

const ChangePassword = () => {
  const [show, setShow] = useState({ current: false, newpw: false, confirm: false });
  const [vals, setVals] = useState({ current: "", newpw: "", confirm: "" });

  const toggle = (field) => setShow(p => ({ ...p, [field]: !p[field] }));
  const onChange = (field, val) => setVals(p => ({ ...p, [field]: val }));

  const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#16a34a"];
  const s = getStrength(vals.newpw);
  const canSubmit = vals.current.length >= 6 && vals.newpw.length >= 8 
                    && vals.confirm === vals.newpw && vals.newpw !== vals.current;

  return (
    <div className="cp-page">
      <div className="cp-header">
        <button className="cp-back">&#8249;</button>
        <span className="cp-title">Change Password</span>
      </div>

      <div className="cp-form">
        {[
          { id: "current", label: "Current Password" },
          { id: "newpw",   label: "New Password" },
          { id: "confirm", label: "Confirm Password" },
        ].map(({ id, label }) => (
          <div className="cp-field" key={id}>
            <label>{label}</label>
            <div className="cp-input-wrap">
              <input
                type={show[id] ? "text" : "password"}
                placeholder={`Enter ${label.toLowerCase()}`}
                value={vals[id]}
                onChange={e => onChange(id, e.target.value)}
              />
              <button className="cp-eye" onClick={() => toggle(id)} type="button">
                👁
              </button>
            </div>
            {id === "newpw" && vals.newpw && (
              <div className="cp-strength">
                <div style={{ width: `${s * 25}%`, background: strengthColor[s] }} />
                <span style={{ color: strengthColor[s] }}>{strengthLabel[s]}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="cp-footer">
        <button className="cp-btn" disabled={!canSubmit}>UPDATE</button>
      </div>
    </div>
  );
};

export default ChangePassword;