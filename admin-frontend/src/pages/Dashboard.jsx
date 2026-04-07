
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import RevenueChart from "../components/RevenueChart";
import OrderChart from "../components/OrderChart";
import VendorTable from "../components/VendorTable";
import { Users, ShoppingCart, Store, DollarSign } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Header />

        <div className="p-6 flex-1 overflow-auto space-y-6 text-black dark:text-white">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6">
<StatsCard
  title="Total User"
  value="40,689"
  change="+8.5%"
  color="bg-purple-100 dark:bg-purple-900"
  icon={Users}
/>

<StatsCard
  title="Total Order"
  value="10,293"
  change="+1.3%"
  color="bg-yellow-100 dark:bg-yellow-900"
  icon={ShoppingCart}
/>

<StatsCard
  title="Total Vendors"
  value="3,200"
  change="+1.8%"
  color="bg-orange-100 dark:bg-orange-900"
  icon={Store}
/>

<StatsCard
  title="Total Revenue"
  value="89,000"
  change="-4.3%"
  color="bg-green-100 dark:bg-green-900"
  icon={DollarSign}
/>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <RevenueChart />
            <OrderChart />
          </div>

          {/* Table */}
          <VendorTable />

        </div>
      </div>
    </div>
  );
}