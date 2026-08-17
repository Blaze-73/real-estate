import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReservations, approveReservation, rejectReservation, cancelReservation } from '../../store/slices/reservationSlice';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  cancelled: 'bg-gray-100 dark:bg-ink-900 text-gray-600 dark:text-gray-400',
  archived: 'bg-gray-100 dark:bg-ink-900 text-gray-600 dark:text-gray-400',
};

const ReservationsManagement = () => {
  const dispatch = useDispatch();
  const { reservations, loading, error } = useSelector((state) => state.reservations);

  useEffect(() => { dispatch(fetchReservations()); }, [dispatch]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservations</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage reservation requests</p>
      </div>

      {error && <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

      <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} /></div>
        ) : reservations.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No reservations yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-ink-900/50">
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Ref</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Client</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Property</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Dates</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Guests</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Total</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Deposit</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right p-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r._id || r.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-gray-500 dark:text-gray-400">{r.booking_reference || r.reference || '—'}</td>
                    <td className="p-4 text-gray-900 dark:text-white font-medium">{r.guest_name || r.client?.name || r.name || 'N/A'}</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{r.property?.title || r.propertyTitle || 'N/A'}</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {r.check_in ? `${new Date(r.check_in).toLocaleDateString()} → ${new Date(r.check_out).toLocaleDateString()}` : (r.date ? new Date(r.date).toLocaleDateString() : 'N/A')}
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{r.guests || '—'}</td>
                    <td className="p-4 text-gray-900 dark:text-white">{r.total_price != null ? `${Number(r.total_price).toLocaleString()} MAD` : '—'}</td>
                    <td className="p-4">
                      {Number(r.deposit) > 0 ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.deposit_paid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                          {r.deposit_paid ? 'Deposit paid' : 'Deposit pending'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No deposit</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || statusColors.pending}`}>
                        {r.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => dispatch(approveReservation(r._id || r.id))} className="px-3 py-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-xs font-medium mr-2">Approve</button>
                          <button onClick={() => dispatch(cancelReservation(r._id || r.id))} className="px-3 py-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-xs font-medium mr-2">Cancel</button>
                          <button onClick={() => dispatch(rejectReservation(r._id || r.id))} className="px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-medium">Reject</button>
                        </>
                      )}
                      {r.status !== 'pending' && <span className="text-xs text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsManagement;

