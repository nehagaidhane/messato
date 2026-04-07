import { useState } from "react";
import { Mail, Lock, Shield } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "admin",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login Data:", form);

    // 👉 later connect backend here
    // if success → redirect based on role
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" className="h-18" />
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-center mb-6 text-black dark:text-white">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div className="flex items-center border dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <Mail size={18} className="text-gray-400 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-sm text-black dark:text-white"
            />
          </div>

          {/* PASSWORD */}
          <div className="flex items-center border dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <Lock size={18} className="text-gray-400 mr-2" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-sm text-black dark:text-white"
            />
          </div>

          {/* BUTTON */}
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