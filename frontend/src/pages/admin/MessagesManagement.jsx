import { useEffect, useState } from 'react';
import contactService from '../../services/contactService';

const MessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1, total: 0 });

  const load = (p = 1, onlyUnread = unreadOnly) => {
    setLoading(true);
    setError('');
    contactService
      .list({ page: p, per_page: 15, unread_only: onlyUnread })
      .then((res) => {
        const items = res?.data ?? [];
        setMessages(items);
        setMeta({ last_page: res?.last_page ?? 1, total: res?.total ?? items.length });
        setPage(p);
        setSelected((prev) => {
          if (!prev) return null;
          const fresh = items.find((m) => m.id === prev.id);
          return fresh ? { ...prev, ...fresh } : null;
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    async function initial() {
      try {
        const res = await contactService.list({ page: 1, per_page: 15, unread_only: unreadOnly });
        const items = res?.data ?? [];
        setMessages(items);
        setMeta({ last_page: res?.last_page ?? 1, total: res?.total ?? items.length });
        setPage(1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    }
    initial();
  }, [unreadOnly]);

  const markAsRead = async (message) => {
    if (message.is_read) return;
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m)));
    setSelected((prev) => (prev?.id === message.id ? { ...prev, is_read: true } : prev));
    try {
      await contactService.markRead(message.id);
    } catch {
      // non-fatal; keep optimistic state
    }
  };

  const openMessage = (message) => {
    setSelected(message);
    markAsRead(message);
  };

  const remove = async (message) => {
    if (!window.confirm(`Delete this message from ${message.name}?`)) return;
    try {
      await contactService.remove(message.id);
      setSelected(null);
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const replyHref = selected
    ? `mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`
    : '#';

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Inbound inquiries from the contact form, viewing requests and phone reveals</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="w-4 h-4 accent-[#9aa0a6]" />
          Unread only
        </label>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading messagesâ€¦</div>
          ) : messages.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No messages</div>
          ) : (
            <>
              {messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => openMessage(m)}
                  className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${selected?.id === m.id ? 'bg-gray-50 dark:bg-ink-900' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-sm font-medium truncate ${m.is_read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{m.name}</span>
                    {!m.is_read && <span className="w-2 h-2 rounded-full bg-[#ececf0] shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{m.subject}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-1">{m.type === 'phone_reveal' ? 'Phone reveal' : 'Contact form'}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(m.created_at).toLocaleDateString()}</p>
                </button>
              ))}
              {meta.last_page > 1 && (
                <div className="flex items-center justify-between p-3">
                  <button type="button" disabled={page <= 1} onClick={() => load(page - 1)} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-ink-900 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Prev</button>
                  <span className="text-xs text-gray-400">Page {page} / {meta.last_page}</span>
                  <button type="button" disabled={page >= meta.last_page} onClick={() => load(page + 1)} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-ink-900 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Next</button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.subject}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    From: {selected.name} ({selected.email})
                    {selected.phone ? ` Â· Phone: ${selected.phone}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => remove(selected)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Delete
                </button>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-ink-900">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={replyHref} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ececf0] text-ink-950 text-sm font-semibold hover:bg-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8l9-5 9 5v10a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 0l9 5 9-5" />
                  </svg>
                  Reply by email
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone.replace(/\s/g, '')}`} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Call {selected.phone}
                  </a>
                )}
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
