import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../store/slices/notificationSlice';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => dispatch(markAllAsRead())} className="px-4 py-2 rounded-xl bg-[#1f94af] text-white text-sm font-semibold hover:bg-[#117490] transition-colors">
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No notifications yet.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((n) => (
              <motion.div
                key={n._id || n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 flex items-start justify-between ${!n.read ? 'bg-[#1f94af]/5' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#1f94af]" />}
                    <p className={`text-sm ${n.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                      {n.message || n.title || 'Notification'}
                    </p>
                  </div>
                  {n.createdAt && (
                    <p className="text-xs text-gray-400 mt-1 ml-4">{new Date(n.createdAt).toLocaleString()}</p>
                  )}
                </div>
                {!n.read && (
                  <button onClick={() => dispatch(markAsRead(n._id || n.id))} className="text-xs text-[#1f94af] hover:underline flex-shrink-0 ml-4">
                    Mark Read
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

