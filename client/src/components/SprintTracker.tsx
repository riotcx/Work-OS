import { useWorkOS } from "../store";

const DAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];

function daysElapsed(startDate: string, endDate: string): number {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T23:59:59");
  const now = new Date();
  if (now < start) return -1;
  if (now > end) return 7;
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return Math.min(Math.max(diff, 0), totalDays);
}

export function SprintTracker() {
  const { sprint, tasks } = useWorkOS();
  if (!sprint) return null;

  const elapsed = daysElapsed(sprint.start_date, sprint.end_date);
  const done = tasks.filter((t) => t.status === "completado" && t.sprint_id === sprint.id).length;
  const total = tasks.filter((t) => t.sprint_id === sprint.id).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4 px-5 py-2.5 border-b border-border bg-panel">
      <div className="font-hud text-[10px] text-faint tracking-widest whitespace-nowrap">
        {sprint.name}
      </div>
      <div className="flex-1 h-1.5 bg-panelRaised rounded-full overflow-hidden max-w-[200px]">
        <div className="h-full bg-signal transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-1.5">
        {DAY_LETTERS.map((letter, i) => {
          const isPast = i < elapsed;
          const isToday = i === elapsed;
          return (
            <div
              key={i}
              className={`w-7 h-7 rounded-sm flex items-center justify-center font-hud text-[11px] border transition-all ${
                isToday
                  ? "bg-signal/15 border-signal text-signal shadow-signal animate-pulse"
                  : isPast
                  ? "bg-panelRaised border-borderLight text-muted"
                  : "bg-transparent border-border text-faint"
              }`}
            >
              {letter}
            </div>
          );
        })}
      </div>
      <div className="font-hud text-[10px] text-faint whitespace-nowrap">
        {sprint.start_date} → {sprint.end_date}
      </div>
    </div>
  );
}
