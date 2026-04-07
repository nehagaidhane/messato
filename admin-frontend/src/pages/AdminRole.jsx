import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState } from "react";

export default function AdminRole() {

  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) return;

    setAdmins([...admins, form]);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "admin",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="p-6 flex-1 overflow-auto space-y-6 text-black dark:text-white">

          <h1 className="text-2xl font-semibold">Admin Role Management</h1>

          <div className="grid grid-cols-3 gap-6">

            {/* FORM CARD */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm col-span-1">

              <h2 className="text-lg font-semibold mb-4">Create Admin</h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700"
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700"
                />

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-700"
                >
                  <option value="admin">Admin</option>
                  <option value="support">Support</option>
                </select>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
                >
                  Create User
                </button>

              </form>
            </div>

            {/* LIST CARD */}
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">

              <div className="p-4 border-b dark:border-gray-700">
                <h2 className="font-semibold">Admin Users</h2>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                  <tr>
                    <th className="text-left px-6 py-3">Name</th>
                    <th className="text-left px-6 py-3">Email</th>
                    <th className="text-left px-6 py-3">Role</th>
                    <th className="text-left px-6 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {admins.map((admin, index) => (
                    <tr key={index} className="border-t dark:border-gray-700">
                      <td className="px-6 py-4">{admin.name}</td>
                      <td className="px-6 py-4">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            admin.role === "admin"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                          }`}
                        >
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            setAdmins(admins.filter((_, i) => i !== index))
                          }
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {admins.length === 0 && (
                <p className="text-center text-gray-400 py-6">
                  No users created yet
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}