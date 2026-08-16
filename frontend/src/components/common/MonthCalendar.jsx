import { useTranslation } from 'react-i18next';

const MonthCalendar = ({
  month,
  dayStatus = {},
  selected = [],
  onSelect,
  selectable = true,
  disablePast = false,
}) => {
  const { t } = useTranslation();
  const WEEKDAYS = t('monthCal.days', { returnObjects: true });
  const year = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const startOffset = new Date(year, m, 1).getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  const iso = (d) => `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, idx) => {
          if (!d) return <div key={`blank-${idx}`} />;

          const dateStr = iso(d);
          const status = dayStatus[dateStr] || 'free';
          const isPast = disablePast && dateStr < todayStr;
          const unavailable = status !== 'free';
          const isSelected = selected.includes(dateStr);
          const disabled = !selectable || unavailable || isPast;

          let cls = 'flex items-center justify-center h-9 text-sm rounded-lg transition-colors ';
          if (isSelected) {
            cls += 'bg-[#1f94af] text-white font-semibold';
          } else if (status === 'booked') {
            cls += 'bg-sky-500/15 text-sky-700 dark:text-sky-300';
          } else if (status === 'blocked') {
            cls += 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 line-through';
          } else if (isPast) {
            cls += 'text-gray-300 dark:text-gray-600 cursor-not-allowed';
          } else {
            cls += 'text-gray-700 dark:text-gray-300';
            if (selectable) cls += ' hover:bg-sky-100 dark:hover:bg-gray-700 cursor-pointer';
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              aria-label={dateStr}
              onClick={() => onSelect && onSelect(dateStr)}
              className={cls}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
