export default function StatsCard({ title, value, change, color, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm flex justify-between items-center text-black dark:text-white">

      <div>
        <p className="text-gray-400 dark:text-gray-300 text-sm">
          {title}
        </p>

        <h2 className="text-2xl font-bold mt-1">
          {value}
        </h2>

        <p
          className={`text-sm mt-1 ${
            change.includes("-")
              ? "text-red-500 dark:text-red-400"
              : "text-green-500 dark:text-green-400"
          }`}
        >
          {change}
        </p>
      </div>

      {/* ICON */}
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
      >
        {Icon && <Icon size={20} />}
      </div>

    </div>
  );
}