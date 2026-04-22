import { useEffect, useState } from "react";

export default function VendorDashboard() {
  const [data, setData] = useState(null);

  const API = "http://localhost:5000/api/vendor";

  useEffect(() => {
    fetch(`${API}/dashboard`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    })
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Total Orders: {data?.orders}</p>
    </div>
  );
}