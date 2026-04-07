import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaFilter } from "react-icons/fa";
import { useState } from "react";

const usersData = [
  { id: "00001", name: "Amogh Ramteke", address: "089 Kutch Green Apt. 448", date: "2019-09-04", contact: "5466552220" },
  { id: "00002", name: "Roshan Meshram", address: "979 Immanuel Ferry Suite 526", date: "2019-05-28", contact: "5466552220" },
  { id: "00003", name: "Nikita Singh", address: "8587 Frida Ports", date: "2019-11-23", contact: "5466552220" },
  { id: "00004", name: "Atharva Rajkondawar", address: "768 Destiny Lake Suite 600", date: "2019-02-05", contact: "5466552220" },
  { id: "00005", name: "Rajkumar Rao", address: "042 Mylene Throughway", date: "2019-07-29", contact: "5466552220" },
  { id: "00006", name: "B N Rau", address: "543 Weinmann Mountain", date: "2019-08-15", contact: "5466552220" },
  { id: "00007", name: "Maggie Curly", address: "New Scottieberg", date: "2019-12-21", contact: "5466552220" },
  { id: "00008", name: "Nelson Mandela", address: "New Jon", date: "2019-04-30", contact: "5466552220" },
  { id: "00009", name: "Bella Hadid", address: "124 Lyla Forge Suite 975", date: "2019-01-09", contact: "5466552220" },
];

export default function UserList() {

  // ✅ STATE
  const [selectedDate, setSelectedDate] = useState("");

  // ✅ FILTER LOGIC
  const filteredUsers = selectedDate
    ? usersData.filter((user) => user.date === selectedDate)
    : usersData;

  return (
<div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
  <Sidebar />

  <div className="flex-1 flex flex-col overflow-hidden">
    <Header />

    <div className="p-6 flex-1 overflow-auto text-black dark:text-white">
      <h1 className="text-2xl font-semibold mb-4">User Lists</h1>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center gap-6 mb-6">

        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
          <FaFilter />
          <span>Filter By</span>
        </div>

        {/* DATE INPUT */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border dark:border-gray-600 px-3 py-1 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />

        {/* RESET */}
        <button
          onClick={() => setSelectedDate("")}
          className="text-red-500 font-medium"
        >
          Reset Filter
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-blue-500 dark:border-gray-700">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
            <tr>
              <th className="text-left px-6 py-3">ID</th>
              <th className="text-left px-6 py-3">NAME</th>
              <th className="text-left px-6 py-3">ADDRESS</th>
              <th className="text-left px-6 py-3">DATE</th>
              <th className="text-left px-6 py-3">Contact</th>
              <th className="text-left px-6 py-3">STATUS</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={index}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4">{user.id}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  {user.address}
                </td>
                <td className="px-6 py-4">
                  {new Date(user.date).toDateString()}
                </td>
                <td className="px-6 py-4">{user.contact}</td>

                <td className="px-6 py-4">
                  <button className="bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300 px-3 py-1 rounded-full text-xs">
                    Block User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

        {/* FOOTER */}
        <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-500 dark:text-gray-300 border-t dark:border-gray-700">
          <span>
            Showing {filteredUsers.length} of {usersData.length}
          </span>

          <div className="flex gap-2">
            <button className="w-8 h-8 border dark:border-gray-600 rounded flex items-center justify-center">
              {"<"}
            </button>
            <button className="w-8 h-8 border dark:border-gray-600 rounded flex items-center justify-center">
              {">"}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
  );
}