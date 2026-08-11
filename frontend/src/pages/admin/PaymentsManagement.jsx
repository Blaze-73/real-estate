import { motion } from 'framer-motion';

const PaymentsManagement = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Financial overview and payment records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: '0 MAD', color: 'from-[#38BDF8] to-[#0EA5E9]' },
          { label: 'Monthly Revenue', value: '0 MAD', color: 'from-[#10B981] to-[#059669]' },
          { label: 'Pending Payments', value: '0 MAD', color: 'from-[#F59E0B] to-[#D97706]' },
        ].map((card, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-[#1E293B] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No payment records</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Payment records will appear here once rentals are active.</p>
      </div>
    </div>
  );
};

export default PaymentsManagement;
