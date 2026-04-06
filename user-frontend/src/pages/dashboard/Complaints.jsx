import "./Complaints.css";
import { useNavigate } from "react-router-dom";

const Complaints = () => {
  const navigate = useNavigate();

  const data = [
    { status: "Submitted", time: "31 min" },
    { status: "In Progress", time: "45 min" },
    { status: "Resolved", time: "Yesterday" },
    { status: "Resolved", time: "30 July" },
  ];

  return (
    <div className="comp-container">
      {/* Header */}
      <div className="comp-header">
        <button onClick={() => navigate(-1)}>←</button>
        <h3>Complaints</h3>
      </div>

      <h4>New</h4>

      {data.map((item, index) => (
        <div key={index} className="comp-item">
          <div className="icon">!</div>

          <div className="comp-text">
            <h5>SHREE TIFFIN SERVICE</h5>
            <p>Day 3 Tiffin is too Spicy --------</p>
            <span className={`status ${item.status.toLowerCase()}`}>
              {item.status}
            </span>
          </div>

          <div className="time">{item.time}</div>
        </div>
      ))}

      <button className="new-btn">NEW COMPLAINTS</button>
    </div>
  );
};

export default Complaints;