import React from 'react'

const StatCard = ({ title, value, subtitle, icon, bg }) => (
	<div className="bg-white rounded-xl p-4 shadow-sm">
		<div className="flex items-start justify-between">
			<div>
				<div className="text-xs text-gray-500">{title}</div>
				<div className="text-2xl font-semibold text-gray-800 mt-2">{value}</div>
				{subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
			</div>
			<div className={`w-10 h-10 rounded-md flex items-center justify-center text-white ${bg}`}>
				{icon}
			</div>
		</div>
	</div>
)

const Dashboard = () => {
	return (
		<div>
			{/* Top metrics */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<StatCard title="Total Teachers" value="248" subtitle="186 verified, 62 pending" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5z" fill="white"/></svg>} bg="bg-indigo-400" />
				<StatCard title="Total Students" value="5,432" subtitle="Across 45 colleges" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2l9 4.5v6c0 5-9 9.5-9 9.5S3 17.5 3 12v-6L12 2z" fill="white"/></svg>} bg="bg-green-400" />
				<StatCard title="Verified Institutes" value="45" subtitle="12 added this month" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 7h7l-5.5 4.5L19 22l-7-4-7 4 1.5-8.5L2 9h7l3-7z" fill="white"/></svg>} bg="bg-purple-400" />
				<StatCard title="Pending Verification" value="8" subtitle="Institutes awaiting approval" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="white"/></svg>} bg="bg-orange-400" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
					<h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
					<ul className="space-y-4">
						<li className="flex items-center justify-between border-b border-gray-100 pb-3">
							<div>
								<div className="font-medium">New institute registered</div>
								<div className="text-sm text-gray-500">Stanford University</div>
							</div>
							<div className="text-xs text-gray-400">2 hours ago</div>
						</li>
						<li className="flex items-center justify-between border-b border-gray-100 pb-3">
							<div>
								<div className="font-medium">Teacher verified</div>
								<div className="text-sm text-gray-500">Dr. Sarah Johnson</div>
							</div>
							<div className="text-xs text-gray-400">5 hours ago</div>
						</li>
						<li className="flex items-center justify-between border-b border-gray-100 pb-3">
							<div>
								<div className="font-medium">Student enrolled</div>
								<div className="text-sm text-gray-500">John Smith - MIT</div>
							</div>
							<div className="text-xs text-gray-400">1 day ago</div>
						</li>
						<li className="flex items-center justify-between">
							<div>
								<div className="font-medium">Institute approved</div>
								<div className="text-sm text-gray-500">Harvard College</div>
							</div>
							<div className="text-xs text-gray-400">2 days ago</div>
						</li>
					</ul>
				</div>

				<div className="bg-white rounded-xl p-6 shadow-sm">
					<h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
					<div className="space-y-3">
						<div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded">Review Pending Institutes<br/><span className="text-sm text-indigo-500">8 institutes waiting</span></div>
						<div className="bg-amber-50 text-amber-700 px-4 py-3 rounded">Verify Teachers<br/><span className="text-sm text-amber-500">62 pending verification</span></div>
						<div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded">View Student Reports<br/><span className="text-sm text-emerald-500">Generate attendance reports</span></div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Dashboard
