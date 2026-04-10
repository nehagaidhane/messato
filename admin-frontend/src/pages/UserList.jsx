import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldBan,
  ShieldCheck,
  Search,
  Users,
} from "lucide-react";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  const USERS_PER_PAGE = 5;

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const start = (page - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(start, start + USERS_PER_PAGE);
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "blocked" : "active" }
          : u
      )
    );
  };

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <div className="p-6 text-black dark:text-white">

          {/* TITLE ROW + DARK TOGGLE */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-gray-700 dark:text-gray-300" />
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white tracking-tight">
                User Lists
              </h1>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 mb-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm font-medium pr-3 border-r border-gray-200 dark:border-gray-700">
              <SlidersHorizontal size={14} />
              <span>Filter By</span>
            </div>
            <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
              <Search size={13} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm w-48 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-6 py-3.5 font-medium">ID</th>
                  <th className="text-left px-6 py-3.5 font-medium">Name</th>
                  <th className="text-left px-6 py-3.5 font-medium">Email</th>
                  <th className="text-left px-6 py-3.5 font-medium">Date</th>
                  <th className="text-left px-6 py-3.5 font-medium">Status</th>
                  <th className="text-left px-6 py-3.5 font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-gray-400 dark:text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={28} strokeWidth={1.5} />
                        <span>No users found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-400 dark:text-gray-500">
                        {String(user.id).padStart(5, "0")}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {new Date(user.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.status === "blocked"
                              ? "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            user.status === "blocked" ? "bg-red-400" : "bg-green-400"
                          }`} />
                          {user.status || "active"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            user.status === "blocked"
                              ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50"
                              : "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                          }`}
                        >
                          {user.status === "blocked"
                            ? <><ShieldCheck size={12} /> Unblock</>
                            : <><ShieldBan size={12} /> Block</>
                          }
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Page {page} of {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}