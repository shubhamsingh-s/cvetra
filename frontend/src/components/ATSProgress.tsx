export default function ATSProgress({ value = 0 }: { value?: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div className="bg-white/5 h-3 rounded-full overflow-hidden">
        <div style={{ width: `${pct}%` }} className="h-3 bg-emerald-500 rounded-full" />
      </div>
      <div className="text-xs mt-1">ATS Score: {pct}%</div>
    </div>
  );
}
