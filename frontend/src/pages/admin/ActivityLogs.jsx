import { motion } from 'framer-motion';

const logs = [
  { user: 'Admin', action: 'Created', description: 'New property listing: Beachfront Villa', timestamp: new Date() },
  { user: 'Admin', action: 'Updated', description: 'Property #123 pricing updated', timestamp: new Date(Date.now() - 3600000) },
  { user: 'Admin', action: 'Approved', description: 'Reservation #456 approved', timestamp: new Date(Date.now() - 7200000) },
];

const ActivityLogs = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Track all platform activity</p>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No activity logs yet.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-full bg-[#38BDF8]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{log.user}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#38BDF8]/10 text-[#38BDF8]">{log.action}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{log.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
