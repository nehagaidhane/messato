// components/OrderChart.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { ResponsiveContainer } from "recharts";
const data = [
  { name: "Mon", value: 60 },
  { name: "Tue", value: 90 },
  { name: "Wed", value: 50 },
  { name: "Thu", value: 70 },
  { name: "Fri", value: 100 },
];

export default function OrderChart() {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm text-black dark:text-white">

      <h3 className="font-semibold mb-4">Order Overview</h3>

      <ResponsiveContainer width="100%" height={250}>
  <BarChart data={data}>

        {/* X Axis */}
        <XAxis
          dataKey="name"
          stroke="#9CA3AF"
        />

        {/* Y Axis */}
        <YAxis
          stroke="#9CA3AF"
        />

        {/* Tooltip */}
        <Tooltip
          contentStyle={{
            backgroundColor: "#1F2937",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
          }}
          labelStyle={{ color: "#9CA3AF" }}
        />

        {/* Bars */}
        <Bar
          dataKey="value"
          fill="#3b82f6"
          radius={[6, 6, 0, 0]}
        />

      </BarChart>
</ResponsiveContainer>

    </div>
  );
}