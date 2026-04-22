import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/user/login", { // ✅ FIXED
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // ✅ Store token
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user?.role; // ✅ FIXED

      // ✅ Redirect based on role
      if (role === "superadmin") {
        navigate("/admin-role");
      } else if (role === "admin") {
        navigate("/");
      } else if (role === "support") {
        navigate("/support");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">

        <div className="flex justify-center mb-6">
          <img src="/logo.png" className="h-14" />
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6 text-black dark:text-white">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="flex items-center border dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <Mail size={18} className="text-gray-400 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-sm text-black dark:text-white"
              required
            />
          </div>

          <div className="flex items-center border dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <Lock size={18} className="text-gray-400 mr-2" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-sm text-black dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
          >
            Login
          </button>

        </form>

      </div>
    </div>
  );
}