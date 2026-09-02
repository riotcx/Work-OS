import { useState, useEffect } from "react";
import { useWorkOS } from "../store";

interface OverviewData {
  tasks: { total: number; completed: number; todayDone: number };
  projects: { active: number; total: number; completed: number };
  sprint: { id: string; name: string; total: number; completed: number; remaining: number; carryover: number; progress: number } | null;
  focus: { totalSeconds: number; totalSessions: number };
  goals: { total: number; active: number };
  areaCounts: { id: string; name: string; icon: string; total_tasks: number; done_tasks: number }[];
  alignment: { total: number; aligned: number; project_aligned: number; orphan: number };
  weeklyCompletions: { date: string; count: number }[];
  focusTimeByDay: { date: string; seconds: number }[];
  insights: string[];
  generatedAt: string;
}

interface TrendsData {
  completions: { date: string; count: number }[];
  creations: { date: string; count: number }[];
  focus: { date: string; seconds: number }[];
}

export function Analytics() {
  const { areas } = useWorkOS();
  const [data, setData] = useState<OverviewData | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [overview, trend] = await Promise.all([
          fetch("/api/analytics/overview").then((r) => r.json()),
          fetch(`/api/analytics/trends?days=${days}`).then((r) => r.json()),
        ]);
        setData(overview);
        setTrends(trend);
      } catch (err) {
        console.error("Error loading analytics", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [days]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl">
        <h1 className="text-xl font-semibold text-ink mb-6">📊 Analytics</h1>
        <p className="text-sm text-muted">Cargando datos...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 max-w-5xl">
        <h1 className="text-xl font-semibold text-ink mb-6">📊 Analytics</h1>
        <div className="text-center py-12 bg-panel border border-border rounded-lg">
          <p className="text-sm text-muted">No hay datos disponibles todavía.</p>
          <p className="text-xs text-faint mt-1">Completa tareas y sesiones Focus para generar analytics.</p>
        </div>
      </div>
    );
  }

  const fmtTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const completionRate = data.tasks.total > 0 ? Math.round((data.tasks.completed / data.tasks.total) * 100) : 0;
  const orphanPct = data.alignment.total > 0 ? Math.round((data.alignment.orphan / data.alignment.total) * 100) : 0;

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">📊 Analytics</h1>
          <p className="text-sm text-muted">Inteligencia de ejecución basada en tus datos reales.</p>
        </div>
        <div className="flex gap-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs px-3 py-1 rounded-md border transition-colors ${days === d ? "border-signal/40 bg-signal/10 text-signal" : "border-border text-muted hover:text-ink"}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "EJECUCIÓN", value: `${completionRate}%` },
          { label: "TAREAS HOY", value: data.tasks.todayDone },
          { label: "FOCUS TOTAL", value: fmtTime(data.focus.totalSeconds) },
          { label: "PROYECTOS ACTIVOS", value: data.projects.active },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-panel border border-border rounded-lg px-3 py-2.5 text-center">
            <div className="text-[10px] font-hud text-faint tracking-widest">{kpi.label}</div>
            <div className="text-lg font-semibold text-ink font-hud mt-0.5">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Sprint */}
      {data.sprint && (
        <div className="bg-panel border border-border rounded-lg px-5 py-4 mb-6">
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">{data.sprint.name.toUpperCase()}</h2>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 h-2 bg-panelRaised rounded-full overflow-hidden">
              <div className="h-full bg-signal transition-all" style={{ width: `${data.sprint.progress}%` }} />
            </div>
            <span className="text-sm font-semibold text-ink font-hud">{data.sprint.progress}%</span>
          </div>
          <div className="flex gap-6 text-sm">
            <span className="text-done">{data.sprint.completed} completadas</span>
            <span className="text-muted">{data.sprint.remaining} pendientes</span>
            <span className="text-faint">{data.sprint.carryover} carryover</span>
          </div>
        </div>
      )}

      {/* Completions Trend */}
      <div className="bg-panel border border-border rounded-lg px-5 py-4 mb-6">
        <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">TENDENCIA DE EJECUCIÓN</h2>
        <div className="flex items-end gap-1 h-32">
          {trends && trends.completions && trends.completions.length > 0 ? (
            trends.completions.slice(-28).map((d, i) => {
              const max = Math.max(...trends.completions.map((c) => c.count), 1);
              const h = Math.max(4, (d.count / max) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count}`}>
                  <div className="w-full bg-signal/40 hover:bg-signal rounded-t transition-colors" style={{ height: `${h}%` }} />
                  {i % 7 === 0 && <span className="text-[8px] text-faint">{d.date.slice(5)}</span>}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted w-full text-center">Sin datos de completions aún.</p>
          )}
        </div>
      </div>

      {/* Area breakdown + Alignment */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-panel border border-border rounded-lg px-5 py-4">
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">TRABAJO POR ÁREA</h2>
          <div className="flex flex-col gap-2">
            {data.areaCounts.map((a) => {
              const pct = a.total_tasks > 0 ? Math.round((a.done_tasks / a.total_tasks) * 100) : 0;
              return (
                <div key={a.id} className="flex items-center gap-2">
                  <span className="text-xs w-24 truncate">{a.icon} {a.name}</span>
                  <div className="flex-1 h-1.5 bg-panelRaised rounded-full overflow-hidden">
                    <div className="h-full bg-signal transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-hud text-faint w-12 text-right">{a.done_tasks}/{a.total_tasks}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-panel border border-border rounded-lg px-5 py-4">
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">ALINEACIÓN</h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-done">Alineadas (Goal+Project)</span>
                <span className="font-hud text-done">{data.alignment.aligned}</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-signal">Solo Project</span>
                <span className="font-hud text-signal">{data.alignment.project_aligned}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Huérfanas</span>
                <span className="font-hud text-muted">{data.alignment.orphan}</span>
              </div>
            </div>
            {orphanPct > 0 && (
              <p className="text-xs text-faint">
                {orphanPct}% de tus tareas activas no tienen proyecto asociado.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      {data.insights.length > 0 && (
        <div className="bg-panel border border-border rounded-lg px-5 py-4">
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">🧠 INSIGHTS</h2>
          <div className="flex flex-col gap-2">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted">
                <span className="text-signal mt-0.5">→</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
