import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProperties, createProperty, updateProperty, deleteProperty } from '../../store/slices/propertySlice';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

const PropertiesManagement = () => {
  const dispatch = useDispatch();
  const { properties, loading, error } = useSelector((state) => state.properties);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', type: 'apartment', price: '', surface: '', bedrooms: '', bathrooms: '', location: '',
    status: 'available', description: '', features: '',
    nightly_price: '', monthly_price: '', min_nights: 1, cleaning_fee: '', deposit: '',
    high_season_from: '', high_season_to: '', high_season_price: '', ical_url: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const emptyForm = () => ({
    title: '', type: 'apartment', price: '', surface: '', bedrooms: '', bathrooms: '', location: '',
    status: 'available', description: '', features: '',
    nightly_price: '', monthly_price: '', min_nights: 1, cleaning_fee: '', deposit: '',
    high_season_from: '', high_season_to: '', high_season_price: '', ical_url: '',
  });

  useEffect(() => { dispatch(fetchProperties()); }, [dispatch]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (property) => {
    setEditing(property);
    setForm({
      title: property.title || '',
      type: property.type || 'apartment',
      price: property.price || '',
      surface: property.surface || '',
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
      location: property.location || '',
      status: property.status || 'available',
      description: property.description || '',
      features: property.features?.join(', ') || '',
      nightly_price: property.nightly_price ?? '',
      monthly_price: property.monthly_price ?? '',
      min_nights: property.min_nights || 1,
      cleaning_fee: property.cleaning_fee || '',
      deposit: property.deposit || '',
      high_season_from: property.high_season?.from || '',
      high_season_to: property.high_season?.to || '',
      high_season_price: property.high_season?.price ?? '',
      ical_url: property.ical_url || '',
    });
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      price: Number(form.price),
      surface: Number(form.surface),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
      nightly_price: num(form.nightly_price),
      monthly_price: num(form.monthly_price),
      min_nights: num(form.min_nights) || 1,
      cleaning_fee: num(form.cleaning_fee) || 0,
      deposit: num(form.deposit) || 0,
      high_season_from: form.high_season_from || null,
      high_season_to: form.high_season_to || null,
      high_season_price: num(form.high_season_price),
      ical_url: form.ical_url || null,
    };
    if (editing) {
      dispatch(updateProperty({ id: editing._id || editing.id, data }));
    } else {
      dispatch(createProperty(data));
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    dispatch(deleteProperty(id));
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage all properties</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate} className="px-4 py-2 rounded-xl bg-[#38BDF8] text-white text-sm font-semibold hover:bg-[#0EA5E9] transition-colors">
          + Add Property
        </motion.button>
      </div>

      {error && <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">{error}</div>}

      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={6} /></div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No properties found. Click "Add Property" to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Location</th>
                  <th className="text-right p-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p._id || p.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-gray-900 dark:text-white font-medium">{p.title}</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 capitalize">{p.type}</td>
                    <td className="p-4 text-gray-900 dark:text-white">{p.price?.toLocaleString()} MAD</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === 'available' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        p.status === 'rented' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>{p.status}</span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{p.location}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEdit(p)} className="px-3 py-1.5 rounded-lg text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-colors text-xs font-medium mr-2">Edit</button>
                      <button onClick={() => setDeleteConfirm(p._id || p.id)} className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Property' : 'Add Property'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" required />
                <div className="grid grid-cols-2 gap-3">
                  <select name="type" value={form.type} onChange={handleChange} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]">
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="studio">Studio</option>
                    <option value="office">Office</option>
                  </select>
                  <select name="status" value={form.status} onChange={handleChange} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]">
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price (MAD)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" required />
                  <input type="number" name="surface" value={form.surface} onChange={handleChange} placeholder="Surface (m²)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} placeholder="Bedrooms" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                  <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="Bathrooms" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                </div>
                <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8] resize-none" />
                <input type="text" name="features" value={form.features} onChange={handleChange} placeholder="Features (comma separated)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Seasonal / Rental Pricing</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" name="nightly_price" value={form.nightly_price} onChange={handleChange} placeholder="Nightly Price (MAD)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                    <input type="number" name="monthly_price" value={form.monthly_price} onChange={handleChange} placeholder="Monthly Price (MAD)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <input type="number" name="min_nights" value={form.min_nights} onChange={handleChange} placeholder="Min Nights" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                    <input type="number" name="cleaning_fee" value={form.cleaning_fee} onChange={handleChange} placeholder="Cleaning Fee" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                    <input type="number" name="deposit" value={form.deposit} onChange={handleChange} placeholder="Deposit" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <input type="date" name="high_season_from" value={form.high_season_from} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                    <input type="date" name="high_season_to" value={form.high_season_to} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                    <input type="number" name="high_season_price" value={form.high_season_price} onChange={handleChange} placeholder="High Season Price" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">High season dates &amp; price override the nightly rate during that period.</p>
                </div>

                <input type="url" name="ical_url" value={form.ical_url} onChange={handleChange} placeholder="iCal URL (Airbnb / Booking.com sync)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]" />
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#38BDF8] text-white text-sm font-semibold hover:bg-[#0EA5E9] transition-colors">{editing ? 'Update' : 'Create'}</button>
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
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Property?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertiesManagement;
