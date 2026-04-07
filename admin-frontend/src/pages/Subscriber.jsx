import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaSearch, FaStar } from "react-icons/fa";
import { useState } from "react";

export default function Subscriber() {

  // ✅ DATA
  const subscribers = [
    { name: "Nikhil Bawane", msg: "Our Bachelor of Commerce program is ACBSP-accredited.", time: "8:38 AM", type: "daily" },
    { name: "Suraj Shende", msg: "Our Bachelor of Commerce program is ACBSP-accredited.", time: "8:13 AM", type: "monthly" },
    { name: "Vinay Nikose", msg: "Our Bachelor of Commerce program is ACBSP-accredited.", time: "7:52 PM", type: "none" },
    { name: "Nayan Nikhare", msg: "Our Bachelor of Commerce program is ACBSP-accredited.", time: "7:52 PM", type: "daily" },
    { name: "Om Nivane", msg: "Our Bachelor of Commerce program is ACBSP-accredited.", time: "4:13 PM", type: "monthly" },
  ];

  // ✅ STATE
  const [filter, setFilter] = useState("all");

  // ✅ FILTER LOGIC
  const filteredData =
    filter === "all"
      ? subscribers
      : subscribers.filter((item) => item.type === filter);

  return (
<div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
  <Sidebar />

  <div className="flex-1 flex flex-col overflow-hidden">
    <Header />

    <div className="p-6 flex-1 overflow-auto text-black dark:text-white">
      <h1 className="text-2xl font-semibold mb-6">Subscriber</h1>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT PANEL */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm h-fit">

          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg mb-6">
            Send Reminder
          </button>

          <h3 className="text-sm text-gray-500 dark:text-gray-300 mb-4">
            Total Request
          </h3>

          <div className="space-y-3 text-sm">

            {/* ALL */}
            <div
              onClick={() => setFilter("all")}
              className={`flex justify-between px-3 py-2 rounded cursor-pointer ${
                filter === "all"
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-500 dark:text-blue-300"
                  : ""
              }`}
            >
              <span>All</span>
            </div>

            {/* DAILY */}
            <div
              onClick={() => setFilter("daily")}
              className={`flex justify-between px-3 py-2 rounded cursor-pointer ${
                filter === "daily"
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-500 dark:text-blue-300"
                  : ""
              }`}
            >
              <span>Daily Mess</span>
              <span>1253</span>
            </div>

            {/* MONTHLY */}
            <div
              onClick={() => setFilter("monthly")}
              className={`flex justify-between px-3 py-2 rounded cursor-pointer ${
                filter === "monthly"
                  ? "bg-blue-50 dark:bg-blue-900 text-blue-500 dark:text-blue-300"
                  : ""
              }`}
            >
              <span>Monthly</span>
              <span>245</span>
            </div>

            {/* NOT SUBSCRIBED */}
            <div
              onClick={() => setFilter("none")}
              className={`flex justify-between px-3 py-2 rounded cursor-pointer ${
                filter === "none"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                  : ""
              }`}
            >
              <span>Not Subscribed</span>
              <span>4,532</span>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex flex-col h-[calc(100vh-180px)]">

          {/* Search */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full w-[300px]">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search Request"
                className="bg-transparent outline-none text-sm w-full text-black dark:text-white"
              />
            </div>

            <div className="flex gap-3 text-gray-500 dark:text-gray-300">
              <div className="w-8 h-8 border dark:border-gray-600 rounded flex items-center justify-center">+</div>
              <div className="w-8 h-8 border dark:border-gray-600 rounded flex items-center justify-center">i</div>
              <div className="w-8 h-8 border dark:border-gray-600 rounded flex items-center justify-center">🗑</div>
            </div>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto">
            {filteredData.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-4">
                  <input type="checkbox" />
                  <FaStar className="text-yellow-400" />

                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {s.msg}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {s.time}
                </span>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center px-4 py-3 text-sm text-gray-500 dark:text-gray-300 border-t dark:border-gray-700">
            <span>
              Showing {filteredData.length} of {subscribers.length}
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
</div>
  );
}