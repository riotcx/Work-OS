import { useState } from "react";
import { useWorkOS } from "../store";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../components/TaskModal";
import type { Task } from "../types";
import { getCurrentWeek } from "../weekUtils";

export function Home() {
  const { tasks, areas, sprint, goals, projects } = useWorkOS();
  const [editing, setEditing] = useState<Task | null>(null);

  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const hoyTasks = tasks.filter((t) => t.status === "hoy");
  const enCurso = tasks.filter((t) => t.status === "en_ejecucion");

  const sprintTasks = tasks.filter((t) => t.sprint_id === sprint?.id);
  const sprintDone = sprintTasks.filter((t) => t.status === "completado").length;
  const sprintTotal = sprintTasks.length;
  const sprintPct = sprintTotal > 0 ? Math.round((sprintDone / sprintTotal) * 100) : 0;

  const { startDate, endDate } = getCurrentWeek();
  const thisWeekStart = startDate + "T00:00:00";
  const thisWeekEnd = endDate + "T23:59:59";
  const weekDone = tasks.filter((t) => t.status === "completado" && t.completed_at && t.completed_at >= thisWeekStart && t.completed_at <= thisWeekEnd).length;
  const weekTotal = tasks.filter((t) => t.sprint_id === sprint?.id || (t.created_at >= thisWeekStart && t.created_at <= thisWeekEnd)).length;

  const areaGoals = areas.filter((a) => goals.some((g) => g.area_id === a.id));
  if (areaGoals.length === 0) {
    areas.slice(0, 3);
  }
  const goalByArea: Record<string, { title: string; target: string; current: string }> = {};
  for (const g of goals) {
    if (g.area_id) goalByArea[g.area_id] = { title: g.title, target: g.target, current: g.current };
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const today = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  const p1 = hoyTasks.filter((t) => t.priority === "P1").slice(0, 3);
  const rest = hoyTasks.filter((t) => !p1.includes(t));

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink">{greeting}</h1>
        <p className="text-sm text-muted mt-1 capitalize">{today}</p>
        {sprint && (
          <p className="text-xs text-faint font-hud mt-1">
            {sprint.name} · {sprint.start_date} — {sprint.end_date}
          </p>
        )}
      </div>

      {/* Bloque 1 — Sprint */}
      <div className="bg-panel border border-border rounded-lg px-5 py-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-hud text-xs text-signal tracking-widest">
            {sprint ? sprint.name.toUpperCase() : "SPRINT"}
          </h2>
          <span className="text-xs text-faint font-hud">{sprintPct}%</span>
        </div>
        <div className="w-full h-2 bg-panelRaised rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-signal transition-all duration-500"
            style={{ width: `${sprintPct}%` }}
          />
        </div>
        <p className="text-sm text-muted">
          {sprintDone} / {sprintTotal} tareas
        </p>
      </div>

      {/* Bloque 2 — Objetivos */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {areaGoals.map((area) => {
          const goal = goalByArea[area.id];
          const count = tasks.filter((t) => t.area_id === area.id && t.status !== "completado").length;
          return (
            <div key={area.id} className="bg-panel border border-border rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{area.icon}</span>
                <span className="text-sm font-medium text-ink">{area.name.toUpperCase()}</span>
              </div>
              {goal && (
                <p className="text-xs text-muted mb-1 line-clamp-1">{goal.title}</p>
              )}
              <div className="text-xs text-faint font-hud">{count} activas</div>
            </div>
          );
        })}
      </div>

      {/* Bloque 3 — Hoy */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-hud text-xs text-faint tracking-widest">⚡ HOY</h2>
        </div>
        {p1.length === 0 && rest.length === 0 && enCurso.length === 0 ? (
          <p className="text-sm text-faint">
            No tienes tareas para hoy. Ve a la vista Hoy para definir tus 3 prioridades del día.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...p1, ...rest].slice(0, 6).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                area={task.area_id ? areaById[task.area_id] : undefined}
                onClick={() => setEditing(task)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bloque 4 — Resumen */}
      <div className="bg-panel border border-border rounded-lg px-5 py-4">
        <h2 className="font-hud text-xs text-faint tracking-widest mb-2">COMPLETADO ESTA SEMANA</h2>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-done font-semibold">{weekDone}</span>
            <span className="text-muted ml-1">tareas</span>
          </div>
          <div>
            <span className="text-done font-semibold">{projects.length}</span>
            <span className="text-muted ml-1">proyectos</span>
          </div>
          <div>
            <span className="text-done font-semibold">{areas.length}</span>
            <span className="text-muted ml-1">áreas</span>
          </div>
        </div>
      </div>

      {editing && <TaskModal task={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
