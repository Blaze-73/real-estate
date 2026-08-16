import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import paymentService from '../../services/paymentService';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await paymentService.getAll({ per_page: 100, status: statusFilter || undefined });
      setPayments(data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await paymentService.getAll({ per_page: 100, status: statusFilter || undefined });
        setPayments(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [statusFilter]);

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pending = payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { total, pending };
  }, [payments]);

  const handleMarkPaid = async (id) => {
    try {
      await paymentService.markPaid(id);
      await fetchPayments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark payment as paid');
    }
  };

  const label = (p) => {
    if (p.reservation) {
      return `${p.reservation.booking_reference} Â· ${p.reservation.property?.title || ''}`;
    }
    if (p.rental) {
      return `${p.rental.property?.title || 'Rental'} Â· ${p.rental.tenant_name || p.rental.client_name || ''}`;
    }
    return 'â€”';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Financial overview and payment records</p>
      </div>

      {error && <div className="p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: stats.total, color: 'from-[#1f94af] to-[#117490]' },
          { label: 'Collected', value: payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0), color: 'from-[#10B981] to-[#059669]' },
          { label: 'Pending Deposits', value: stats.pending, color: 'from-[#F59E0B] to-[#D97706]' },
        ].map((card, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-ink-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value.toLocaleString()} MAD</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {['', 'paid', 'pending', 'overdue'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[#1f94af] text-white'
                  : 'bg-gray-100 dark:bg-ink-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-ink-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={6} /></div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-ink-900/50">
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Reference / Property</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Method</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right p-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-gray-900 dark:text-white font-medium">{label(p)}</td>
                    <td className="p-4 text-gray-900 dark:text-white">{(Number(p.amount)).toLocaleString()} MAD</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 capitalize">{p.payment_method}</td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{p.payment_date}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        p.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>{p.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      {p.status !== 'paid' && (
                        <button onClick={() => handleMarkPaid(p.id)} className="px-3 py-1.5 rounded-lg bg-[#1f94af] text-white hover:bg-[#117490] transition-colors text-xs font-medium">Mark Paid</button>
                      )}
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

export default PaymentsManagement;
