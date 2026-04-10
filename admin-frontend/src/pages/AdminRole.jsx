import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState, useEffect } from "react";

export default function AdminRole() {
  const [admins, setAdmins] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    status: "active",
  });

  const API = "http://localhost:5000/api/admins";

  // ================= FETCH ADMINS =================
  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("API Error");
        setAdmins([]);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setAdmins(data);
      } else {
        console.error("Invalid API response:", data);
        setAdmins([]);
      }
    } catch (err) {
      console.error(err);
      setAdmins([]);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= CREATE ADMIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("All fields required");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error creating admin");
        return;
      }

      // ✅ Refresh list
      fetchAdmins();

      // ✅ Reset form
      setForm({
        name: "",
        email: "",
        password: "",
        role: "admin",
        status: "active",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE ADMIN =================
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="p-6 flex-1 overflow-auto space-y-6 text-black dark:text-white">
          <h1 className="text-2xl font-semibold">
            Admin Role Management
          </h1>

          <div className="grid grid-cols-3 gap-6">

            {/* ================= FORM ================= */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Create Admin
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700"
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700"
                />

                {/* ✅ FIXED ROLE */}
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700"
                >
                  <option value="finance">Finance</option>
                  <option value="support">Support</option>
                </select>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button className="w-full bg-blue-500 text-white py-2 rounded-lg">
                  Create Admin
                </button>

              </form>
            </div>

            {/* ================= LIST ================= */}
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">

              <div className="p-4 border-b">
                <h2 className="font-semibold">Admin Users</h2>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">
                        No admins found
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin.id} className="border-t dark:border-gray-700">

                        <td className="px-6 py-4">{admin.name}</td>
                        <td>{admin.email}</td>
                        <td>{admin.role}</td>

                        <td>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              admin.status === "active"
                                ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {admin.status}
                          </span>
                        </td>

                        <td>
                          {admin.created_at
                            ? new Date(admin.created_at).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "-"}
                        </td>

                        <td>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="text-red-500"
                          >
                            Delete
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}