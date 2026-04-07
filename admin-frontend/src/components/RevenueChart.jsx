// components/RevenueChart.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Week 1", value: 20000 },
  { name: "Week 2", value: 64000 },
  { name: "Week 3", value: 30000 },
  { name: "Week 4", value: 70000 },
  { name: "Week 5", value: 50000 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm text-black dark:text-white">

      <h3 className="font-semibold mb-4">Revenue Trend</h3>

      <LineChart width={500} height={250} data={data}>
        
        {/* X Axis */}
        <XAxis
          dataKey="name"
          stroke="#9CA3AF" // gray-400
        />

        {/* Y Axis */}
        <YAxis
          stroke="#9CA3AF"
        />

        {/* Tooltip */}
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937", // dark gray
            border: "none",
            borderRadius: "8px",
            color: "#fff",
          }}
          labelStyle={{ color: "#9CA3AF" }}
        />

        {/* Line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
        />

      </LineChart>
    </div>
  );
}