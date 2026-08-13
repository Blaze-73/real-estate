import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import availabilityService from '../../services/availabilityService';
import MonthCalendar from '../../components/common/MonthCalendar';

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const CalendarManagement = () => {
  const dispatch = useDispatch();
  const { properties, loading } = useSelector((state) => state.properties);
  const [propertyId, setPropertyId] = useState('');
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [days, setDays] = useState({});
  const [blocks, setBlocks] = useState([]);
  const [frameLoading, setFrameLoading] = useState(false);
  const [blockForm, setBlockForm] = useState({ start_date: '', end_date: '', reason: '' });
  const [error, setError] = useState('');

  const selected = properties.find((p) => String(p._id || p.id) === propertyId);

  useEffect(() => {
    (async () => {
      const res = await dispatch(fetchProperties()).unwrap();
      const list = res.properties || res.data || res || [];
      if (list.length) setPropertyId(String(list[0]._id || list[0].id));
    })();
  }, [dispatch]);

  useEffect(() => {
    let active = true;
    if (!propertyId) return undefined;
    async function load() {
      setFrameLoading(true);
      setError('');
      try {
        const [cal, blockList] = await Promise.all([
          availabilityService.getCalendar(selected?.slug || propertyId, monthKey(calMonth)),
          availabilityService.getBlocks(propertyId),
        ]);
        if (!active) return;
        setDays(cal.days || {});
        setBlocks(Array.isArray(blockList) ? blockList : blockList.data || []);
      } catch (err) {
        if (active) setError(err?.response?.data?.message || 'Failed to load calendar');
      } finally {
        if (active) setFrameLoading(false);
      }
    }
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, calMonth]);

  const handleSubmitBlock = async (e) => {
    e.preventDefault();
    if (!propertyId || !blockForm.start_date || !blockForm.end_date) return;
    setFrameLoading(true);
    setError('');
    try {
      await availabilityService.createBlock(propertyId, blockForm);
      setBlockForm({ start_date: '', end_date: '', reason: '' });
      const [cal, blockList] = await Promise.all([
        availabilityService.getCalendar(selected?.slug || propertyId, monthKey(calMonth)),
        availabilityService.getBlocks(propertyId),
      ]);
      setDays(cal.days || {});
      setBlocks(Array.isArray(blockList) ? blockList : blockList.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to block dates');
    } finally {
      setFrameLoading(false);
    }
  };

  const handleUnblock = async (blockId) => {
    setFrameLoading(true);
    setError('');
    try {
      await availabilityService.deleteBlock(blockId);
      const [cal, blockList] = await Promise.all([
        availabilityService.getCalendar(selected?.slug || propertyId, monthKey(calMonth)),
        availabilityService.getBlocks(propertyId),
      ]);
      setDays(cal.days || {});
      setBlocks(Array.isArray(blockList) ? blockList : blockList.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove block');
    } finally {
      setFrameLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#38BDF8]";

  const counts = useMemo(() => {
    const values = Object.values(days);
    return {
      booked: values.filter((s) => s === 'booked').length,
      blocked: values.filter((s) => s === 'blocked').length,
      free: values.filter((s) => s === 'free').length,
    };
  }, [days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Availability, bookings and blocked dates</p>
        </div>
        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputCls + ' w-64'}>
          <option value="">Select a property</option>
          {properties.map((p) => (
            <option key={p._id || p.id} value={p._id || p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {error && <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            {loading || frameLoading ? (
              <p className="text-sm text-gray-400 py-10 text-center">Loading...</p>
            ) : !propertyId ? (
              <p className="text-sm text-gray-400 py-10 text-center">Select a property to view its calendar.</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">‹</button>
                    <span className="text-base font-semibold text-gray-900 dark:text-white min-w-[170px] text-center">
                      {calMonth.toLocaleString('en', { month: 'long', year: 'numeric' })}
                    </span>
                    <button type="button" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">›</button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-500/15 border border-sky-300 dark:border-sky-700" />{counts.booked} booked</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700" />{counts.blocked} blocked</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />{counts.free} free</span>
                  </div>
                </div>
                <MonthCalendar month={calMonth} dayStatus={days} selectable={false} />
              </>
            )}
          </div>

          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mt-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Block Dates</h2>
            <form onSubmit={handleSubmitBlock} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="date" value={blockForm.start_date} onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })} className={inputCls} required />
              <input type="date" min={blockForm.start_date || undefined} value={blockForm.end_date} onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })} className={inputCls} required />
              <input type="text" value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} placeholder="Reason (optional)" className={inputCls} />
              <div className="md:col-span-3">
                <button type="submit" disabled={frameLoading} className="px-5 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-sm font-semibold transition-colors disabled:opacity-50">Block selected range</button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Blocks</h2>
          {blocks.length === 0 ? (
            <p className="text-sm text-gray-400">No blocked dates.</p>
          ) : (
            <div className="space-y-3">
              {blocks.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{b.start_date} → {b.end_date}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{b.reason || 'No reason'}</p>
                  </div>
                  <button type="button" onClick={() => handleUnblock(b.id)} className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-medium">Unblock</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarManagement;