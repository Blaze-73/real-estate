import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProperties, createProperty, updateProperty, deleteProperty } from '../../store/slices/propertySlice';
import propertyService from '../../services/propertyService';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { AMENITIES } from '../../constants/amenities';

const PropertiesManagement = () => {
  const dispatch = useDispatch();
  const { properties, loading, error } = useSelector((state) => state.properties);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', type: 'apartment', price: '', surface: '', bedrooms: '', bathrooms: '', location: '',
    status: 'available', description: '', amenities: [], video_url: '',
    nightly_price: '', monthly_price: '', min_nights: 1, cleaning_fee: '', deposit: '',
    instant_book: false,
    high_season_from: '', high_season_to: '', high_season_price: '', ical_url: '', cancellation_policy: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const emptyForm = () => ({
    title: '', type: 'apartment', price: '', surface: '', bedrooms: '', bathrooms: '', location: '',
    status: 'available', description: '', amenities: [], video_url: '',
    nightly_price: '', monthly_price: '', min_nights: 1, cleaning_fee: '', deposit: '',
    instant_book: false,
    high_season_from: '', high_season_to: '', high_season_price: '', ical_url: '', cancellation_policy: '',
  });

  useEffect(() => { dispatch(fetchProperties()); }, [dispatch]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setExistingImages([]);
    setNewImages([]);
    setFormError('');
    setModalOpen(true);
  };

  const refreshImages = async (slug) => {
    if (!slug) return;
    setImagesLoading(true);
    try {
      const detail = await propertyService.getOne(slug);
      setExistingImages(detail.images || []);
    } catch {
      setExistingImages([]);
    } finally {
      setImagesLoading(false);
    }
  };

  const openEdit = async (property) => {
    setEditing(property);
    setFormError('');
    setNewImages([]);
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
      amenities: property.amenities || [],
      video_url: property.video_url || '',
      nightly_price: property.nightly_price ?? '',
      monthly_price: property.monthly_price ?? '',
      min_nights: property.min_nights || 1,
      cleaning_fee: property.cleaning_fee || '',
      deposit: property.deposit || '',
      instant_book: !!property.instant_book,
      high_season_from: property.high_season?.from || '',
      high_season_to: property.high_season?.to || '',
      high_season_price: property.high_season?.price ?? '',
      ical_url: property.ical_url || '',
      cancellation_policy: property.cancellation_policy || '',
    });
    setModalOpen(true);
    setExistingImages([]);
    await refreshImages(property.slug);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const data = {
      ...form,
      price: Number(form.price),
      surface: Number(form.surface),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      amenities: form.amenities,
      video_url: form.video_url || null,
      nightly_price: num(form.nightly_price),
      monthly_price: num(form.monthly_price),
      min_nights: num(form.min_nights) || 1,
      cleaning_fee: num(form.cleaning_fee) || 0,
      deposit: num(form.deposit) || 0,
      instant_book: !!form.instant_book,
      high_season_from: form.high_season_from || null,
      high_season_to: form.high_season_to || null,
      high_season_price: num(form.high_season_price),
      ical_url: form.ical_url || null,
      cancellation_policy: form.cancellation_policy || null,
    };
    setSubmitting(true);
    try {
      const saved = editing
        ? await dispatch(updateProperty({ id: editing._id || editing.id, data })).unwrap()
        : await dispatch(createProperty(data)).unwrap();
      const savedSlug = saved.slug || editing?.slug;
      if (newImages.length) {
        await propertyService.uploadImages(saved.id || saved._id, newImages);
        if (editing) await refreshImages(savedSlug);
      }
      setModalOpen(false);
      setNewImages([]);
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await propertyService.setPrimaryImage(imageId);
      await refreshImages(editing.slug);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to set primary image');
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await propertyService.deleteImage(imageId);
      await refreshImages(editing.slug);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to delete image');
    }
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
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate} className="px-4 py-2 rounded-xl bg-[#ececf0] text-ink-950 text-sm font-semibold hover:bg-white transition-colors">
          + Add Property
        </motion.button>
      </div>

      {error && <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6"><TableSkeleton rows={6} /></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-12 text-center text-gray-400">No properties found. Click "Add Property" to create one.</div>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-ink-900/50">
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
                          'bg-gray-100 dark:bg-ink-900 text-gray-600 dark:text-gray-400'
                        }`}>{p.status}</span>
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">{p.location}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => openEdit(p)} className="px-3 py-1.5 rounded-lg text-[#63686f] dark:text-[#d9d9de] hover:bg-[#ececf0]/10 transition-colors text-xs font-medium mr-2">Edit</button>
                        <button onClick={() => setDeleteConfirm(p._id || p.id)} className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {properties.map((p) => (
              <div key={p._id || p.id} className="bg-white dark:bg-ink-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-gray-900 dark:text-white break-words">{p.title}</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    p.status === 'available' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    p.status === 'rented' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    'bg-gray-100 dark:bg-ink-900 text-gray-600 dark:text-gray-400'
                  }`}>{p.status}</span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <p className="capitalize">Type: {p.type}</p>
                  <p className="text-gray-900 dark:text-white font-medium">{p.price?.toLocaleString()} MAD</p>
                  <p>Location: {p.location}</p>
                </div>
                <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => openEdit(p)} className="flex-1 py-2 rounded-lg bg-[#ececf0] text-ink-950 hover:bg-white transition-colors text-xs font-semibold">Edit</button>
                  <button onClick={() => setDeleteConfirm(p._id || p.id)} className="flex-1 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-ink-900 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Property' : 'Add Property'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" required />
                <div className="grid grid-cols-2 gap-3">
                  <select name="type" value={form.type} onChange={handleChange} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]">
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="studio">Studio</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="commercial">Commercial</option>
                    <option value="long_term">Long-term</option>
                  </select>
                  <select name="status" value={form.status} onChange={handleChange} className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]">
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price (MAD)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" required />
                  <input type="number" name="surface" value={form.surface} onChange={handleChange} placeholder="Surface (m²)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} placeholder="Bedrooms" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                  <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="Bathrooms" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                </div>
                <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Location" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6] resize-none" />

                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Amenities</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {AMENITIES.map((a) => {
                      const active = form.amenities.includes(a.key);
                      return (
                        <button
                          key={a.key}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              amenities: active ? form.amenities.filter((k) => k !== a.key) : [...form.amenities, a.key],
                            })
                          }
                          aria-pressed={active}
                          className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium border transition-colors text-left ${
                            active
                              ? 'bg-[#ececf0]/10 text-[#52575d] border-[#9aa0a6]/40'
                              : 'bg-gray-50 dark:bg-ink-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#9aa0a6]'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} />
                          </svg>
                          <span className="truncate">{a.key}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <input type="url" name="video_url" value={form.video_url} onChange={handleChange} placeholder="Video tour URL (YouTube / Vimeo)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Seasonal / Rental Pricing</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" name="nightly_price" value={form.nightly_price} onChange={handleChange} placeholder="Nightly Price (MAD)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                    <input type="number" name="monthly_price" value={form.monthly_price} onChange={handleChange} placeholder="Monthly Price (MAD)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <input type="number" name="min_nights" value={form.min_nights} onChange={handleChange} placeholder="Min Nights" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                    <input type="number" name="cleaning_fee" value={form.cleaning_fee} onChange={handleChange} placeholder="Cleaning Fee" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                    <input type="number" name="deposit" value={form.deposit} onChange={handleChange} placeholder="Deposit" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                  </div>
                  <label className="flex items-center justify-between mt-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-ink-900 cursor-pointer">
                    <span>
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">Instant booking</span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">Guests get confirmed immediately instead of waiting for approval</span>
                    </span>
                    <input type="checkbox" name="instant_book" checked={!!form.instant_book} onChange={(e) => setForm({ ...form, instant_book: e.target.checked })} className="h-5 w-5 rounded accent-[#9aa0a6]" />
                  </label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <input type="date" name="high_season_from" value={form.high_season_from} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                    <input type="date" name="high_season_to" value={form.high_season_to} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                    <input type="number" name="high_season_price" value={form.high_season_price} onChange={handleChange} placeholder="High Season Price" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">High season dates &amp; price override the nightly rate during that period.</p>
                </div>

                <input type="url" name="ical_url" value={form.ical_url} onChange={handleChange} placeholder="iCal URL (Airbnb / Booking.com sync)" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6]" />

                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Cancellation Policy</label>
                  <select name="cancellation_policy" value={form.cancellation_policy} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-ink-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#9aa0a6] mt-1">
                    <option value="">No free cancellation</option>
                    <option value="Free cancellation until 7 days before check-in">Free cancellation until 7 days before check-in</option>
                    <option value="Free cancellation until 48 hours before check-in">Free cancellation until 48 hours before check-in</option>
                    <option value="Free cancellation for 24 hours after booking">Free cancellation for 24 hours after booking</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Images</p>
                  {imagesLoading ? (
                    <p className="text-sm text-gray-400">Loading images...</p>
                  ) : existingImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img src={img.url} alt="" className="w-full h-24 object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!img.is_primary && (
                              <button type="button" onClick={() => handleSetPrimary(img.id)} className="px-2 py-1 rounded-lg bg-[#ececf0] text-ink-950 text-xs font-medium">Main</button>
                            )}
                            <button type="button" onClick={() => handleDeleteImage(img.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium">Remove</button>
                          </div>
                          {img.is_primary && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#ececf0] text-ink-950 text-[10px] font-semibold">Primary</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mb-3">No images yet.</p>
                  )}

                  {newImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {Array.from(newImages).map((file, i) => (
                        <div key={file.name + i} className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-24 object-cover" />
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-gray-900/70 text-white text-[10px] font-semibold">New</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setNewImages(Array.from(e.target.files || []))}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gray-100 dark:file:bg-gray-800 file:text-gray-700 dark:file:text-gray-300 file:text-sm file:font-medium hover:file:bg-gray-200 dark:hover:file:bg-gray-700 transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-2">First uploaded image becomes the cover. Max 2MB each (jpeg, png, webp).</p>
                </div>

                {formError && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">{formError}</div>}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-[#ececf0] text-ink-950 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-60">{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
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

