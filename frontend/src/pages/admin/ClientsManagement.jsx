import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchClients, createClient, updateClient, deleteClient } from '../../store/slices/clientSlice';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

const ClientsManagement = () => {
  const dispatch = useDispatch();
  const { clients, loading, error } = useSelector((state) => state.clients);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { dispatch(fetchClients()); }, [dispatch]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    setModalOpen(true);
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({ name: client.name || '', email: client.email || '', phone: client.phone || '', address: client.address || '' });
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      dispatch(updateClient({ id: editing._id || editing.id, data: form }));
    } else {
      dispatch(createClient(form));
    }
    setModalOpen(false);
  };

  const filtered = clients.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage all clients</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate} className="px-4 py-2 rounded-xl bg-[#ececf0] text-ink-950 text-sm font-semibold hover:bg-white transition-colors">+ Add Client</motion.button>
      </div>

      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." className="w-full max-w-md px-4 py-2.5 rounded-xl bg-white dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
      </div>

      {error && <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6"><TableSkeleton rows={5} /></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-12 text-center text-gray-400">No clients found.</div>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-ink-900/50">
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Address</th>
                    <th className="text-right p-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c._id || c.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-4 text-gray-900 dark:text-white font-medium">{c.name}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">{c.email}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">{c.phone}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">{c.address}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => openEdit(c)} className="px-3 py-1.5 rounded-lg text-[#63686f] dark:text-[#d9d9de] hover:bg-[#ececf0]/10 transition-colors text-xs font-medium mr-2">Edit</button>
                        <button onClick={() => setDeleteConfirm(c._id || c.id)} className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {filtered.map((c) => (
              <div key={c._id || c.id} className="bg-white dark:bg-ink-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                <p className="font-medium text-gray-900 dark:text-white break-words">{c.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 break-words">{c.email}</p>
                <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <p>Phone: {c.phone || '—'}</p>
                  <p>Address: {c.address || '—'}</p>
                </div>
                <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => openEdit(c)} className="flex-1 py-2 rounded-lg bg-[#ececf0] text-ink-950 hover:bg-white transition-colors text-xs font-semibold">Edit</button>
                  <button onClick={() => setDeleteConfirm(c._id || c.id)} className="flex-1 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-ink-900 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Client' : 'Add Client'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" required />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" required />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Address" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#ececf0] text-ink-950 text-sm font-semibold hover:bg-white transition-colors">{editing ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-ink-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Client?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => { dispatch(deleteClient(deleteConfirm)); setDeleteConfirm(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientsManagement;

