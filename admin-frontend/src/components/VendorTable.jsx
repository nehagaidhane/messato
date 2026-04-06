// components/VendorTable.jsx
export default function VendorTable() {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm text-black dark:text-white">

      <h3 className="font-semibold mb-4">Vendor Request</h3>

      <table className="w-full text-sm">

        <thead className="text-gray-400 dark:text-gray-300">
          <tr>
            <th className="text-left py-2">Vendor Name</th>
            <th>Kitchen</th>
            <th>Location</th>
            <th>Contact</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            
            <td className="py-3">Nirmal Sinha</td>
            <td>Mom's Mess</td>
            <td>Nagpur</td>
            <td>9952265220</td>

            <td>
              <span className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-full text-xs">
                Approved
              </span>
            </td>

          </tr>
        </tbody>

      </table>
    </div>
  );
}