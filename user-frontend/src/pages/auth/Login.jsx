import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    // ✅ Validation
    if (!form.email || !form.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      console.log("LOGIN DATA:", form); // 🔍 debug

      const res = await api.post("/login", form);

      console.log("RESPONSE:", res.data); // 🔍 debug

      // ✅ Role check
      if (res.data.role !== "user") {
        alert("Please login as user");
        return;
      }

      // ✅ Store data
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("role", res.data.role);

      // ✅ Redirect
      navigate("/dashboard");

    } catch (err) {
      console.log("ERROR:", err.response); // 🔍 debug
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>User Login</h2>

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />
      <br /><br />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;