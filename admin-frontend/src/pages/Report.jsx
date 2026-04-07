import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useState } from "react";

export default function Report() {

  // ✅ STATE
  const [filter, setFilter] = useState("daily");

  // ✅ SAMPLE DATA
  const reportData = {
    daily: [
      { name: "Amogh", type: "User", amount: 200, date: "Today" },
      { name: "Vendor A", type: "Vendor", amount: 500, date: "Today" },
    ],
    monthly: [
      { name: "Roshan", type: "User", amount: 3000, date: "March" },
      { name: "Vendor B", type: "Vendor", amount: 8000, date: "March" },
    ],
    yearly: [
      { name: "Nikita", type: "User", amount: 20000, date: "2025" },
      { name: "Vendor C", type: "Vendor", amount: 50000, date: "2025" },
    ],
  };

  const currentData = reportData[filter];

  return (
<div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
  <Sidebar />

  <div className="flex-1 flex flex-col overflow-hidden">
    <Header />

    <div className="p-6 flex-1 overflow-auto space-y-6 text-black dark:text-white">

      {/* TITLE */}
      <h1 className="text-2xl font-semibold">Reports</h1>

      {/* FILTER BUTTONS */}
      <div className="flex gap-4">
        {["daily", "monthly", "yearly"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === type
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <p className="text-gray-400 dark:text-gray-300">Total Users</p>
          <h2 className="text-2xl font-bold mt-1">1,245</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <p className="text-gray-400 dark:text-gray-300">Total Vendors</p>
          <h2 className="text-2xl font-bold mt-1">532</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm">
          <p className="text-gray-400 dark:text-gray-300">Total Revenue</p>
          <h2 className="text-2xl font-bold mt-1">₹85,000</h2>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold capitalize">{filter} Report</h2>
        </div>

        <table className="w-full text-sm">

          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
            <tr>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Type</th>
              <th className="text-left px-6 py-3">Amount</th>
              <th className="text-left px-6 py-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((item, i) => (
              <tr
                key={i}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.type}</td>
                <td className="px-6 py-4">₹{item.amount}</td>
                <td className="px-6 py-4">{item.date}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  </div>
</div>
  );
}