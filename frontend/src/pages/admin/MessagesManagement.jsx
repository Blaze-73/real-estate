import { useState } from 'react';

const mockMessages = [
  { _id: 1, name: 'Ahmed Benali', email: 'ahmed@example.com', subject: 'Property Inquiry', message: 'I am interested in the villa in Asilah...', read: false, date: '2024-01-15T10:00:00Z' },
  { _id: 2, name: 'Fatima Zahra', email: 'fatima@example.com', subject: 'Rental Question', message: 'How can I book a property?', read: true, date: '2024-01-14T10:00:00Z' },
];

const MessagesManagement = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [selected, setSelected] = useState(null);

  const markAsRead = (id) => {
    setMessages(messages.map((m) => m._id === id ? { ...m, read: true } : m));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Contact messages from visitors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {messages.map((m) => (
            <button
              key={m._id}
              onClick={() => { setSelected(m); markAsRead(m._id); }}
              className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${selected?._id === m._id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
            >
              <div className="flex items-start justify-between mb-1">
                <span className={`text-sm font-medium ${m.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{m.name}</span>
                {!m.read && <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />}
              </div>
              <p className="text-xs text-gray-400 truncate">{m.subject}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(m.date).toLocaleDateString()}</p>
            </button>
          ))}
          {messages.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">No messages</div>}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.subject}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    From: {selected.name} ({selected.email})
                  </p>
                  <p className="text-xs text-gray-400">{new Date(selected.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{selected.message}</p>
              </div>
              <div className="mt-4">
                <textarea placeholder="Type your reply..." rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8] resize-none" />
                <button className="mt-2 px-4 py-2 rounded-xl bg-[#38BDF8] text-white text-sm font-semibold hover:bg-[#0EA5E9] transition-colors">Send Reply</button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">Select a message to read</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesManagement;
