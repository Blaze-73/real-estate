import { motion } from 'framer-motion';

export const CardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="rounded-2xl overflow-hidden bg-white ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
  >
    <div className="h-48 bg-sand-200 animate-pulse dark:bg-ink-800" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-sand-200 dark:bg-ink-800 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-sand-200 dark:bg-ink-800 rounded animate-pulse w-1/2" />
      <div className="h-4 bg-sand-200 dark:bg-ink-800 rounded animate-pulse w-full" />
    </div>
  </motion.div>
);

export const TextSkeleton = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-sand-200 dark:bg-ink-800 rounded animate-pulse"
        style={{ width: `${100 - i * 20}%` }}
      />
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-3">
        <div className="h-4 bg-sand-200 dark:bg-ink-800 rounded animate-pulse flex-1" />
        <div className="h-4 bg-sand-200 dark:bg-ink-800 rounded animate-pulse flex-1" />
        <div className="h-4 bg-sand-200 dark:bg-ink-800 rounded animate-pulse w-20" />
      </div>
    ))}
  </div>
);

export const StatsCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-ink-900 rounded-xl p-6 ring-1 ring-ink-100 dark:ring-ink-800"
  >
    <div className="h-4 bg-sand-200 dark:bg-ink-800 rounded animate-pulse w-24 mb-3" />
    <div className="h-8 bg-sand-200 dark:bg-ink-800 rounded animate-pulse w-16 mb-2" />
    <div className="h-3 bg-sand-200 dark:bg-ink-800 rounded animate-pulse w-32" />
  </motion.div>
);
