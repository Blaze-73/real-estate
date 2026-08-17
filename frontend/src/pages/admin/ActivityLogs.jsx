import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import activityLogService from '../../services/activityLogService';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1, total: 0 });

  const load = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await activityLogService.getAll({ page: p, per_page: 20 });
      const items = res?.data ?? [];
      setLogs(items);
      setMeta({ last_page: res?.last_page ?? 1, total: res?.total ?? items.length });
      setPage(p);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initial() {
      setLoading(true);
      setError('');
      try {
        const res = await activityLogService.getAll({ page: 1, per_page: 20 });
        const items = res?.data ?? [];
        setLogs(items);
        setMeta({ last_page: res?.last_page ?? 1, total: res?.total ?? items.length });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    }
    initial();
  }, []);

  const actionColor = (action) => {
    const a = String(action).toLowerCase();
    if (a.includes('delete')) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    if (a.includes('create')) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (a.includes('approve')) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
    if (a.includes('cancel')) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    return 'bg-[#ececf0]/10 text-[#63686f] dark:text-[#d9d9de]';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Track all platform activity ({meta.total} events)</p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading activity…</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No activity logged yet.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log, idx) => (
              <motion.div
                key={log.id ?? idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                className="p-4 flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-full bg-[#ececf0]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#63686f] dark:text-[#d9d9de]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{log.user?.name || 'System'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColor(log.action)}`}>{log.action}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 break-words">{log.description}</p>
                  {log.properties && typeof log.properties === 'object' && Object.keys(log.properties).length > 0 && (
                    <pre className="mt-2 text-xs text-gray-400 dark:text-gray-500 whitespace-pre-wrap">{JSON.stringify(log.properties, null, 2)}</pre>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {!loading && meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button type="button" disabled={page <= 1} onClick={() => load(page - 1)} className="px-4 py-2 text-sm rounded-xl bg-white dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Prev</button>
          <span className="text-sm text-gray-400">Page {page} / {meta.last_page}</span>
          <button type="button" disabled={page >= meta.last_page} onClick={() => load(page + 1)} className="px-4 py-2 text-sm rounded-xl bg-white dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
