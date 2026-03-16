export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the 48ID Admin Portal</p>
      </div>

      {/* Dashboard components will be implemented in Sprint 2 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">
            Pending Activations
          </h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">System Health</h3>
          <p className="text-2xl font-bold text-green-600">UP</p>
        </div>
      </div>
    </div>
  )
}
