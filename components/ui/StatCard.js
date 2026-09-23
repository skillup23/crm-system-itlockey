export default function StatCard({
  title,
  count,
  color = 'border-l-blue-500',
  textColor = 'text-blue-600',
}) {
  return (
    <div
      className={`bg-white rounded-xl p-3 sm:p-5 border border-slate-200 border-l-4 ${color} shadow-sm`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
        {title}
      </p>
      <p className={`text-3xl font-extrabold ${textColor}`}>{count}</p>
    </div>
  );
}
