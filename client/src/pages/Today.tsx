import { useState } from "react";
import { Timer } from "lucide-react";
import { useWorkOS } from "../store";
import { QuickAdd } from "../components/QuickAdd";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../components/TaskModal";
import type { Task } from "../types";
import type { View as AppView } from "../App";

interface TodayProps {
  onNavigate?: (v: AppView) => void;
}

export function Today({ onNavigate }: TodayProps) {
  const { tasks, areas, goals, projects, sprint, moveTask, deleteTask } = useWorkOS();
  const [editing, setEditing] = useState<Task | null>(null);

  const hoyTasks = tasks.filter((t) => t.status === "hoy" || t.status === "en_ejecucion");
  const completadas = tasks.filter((t) => t.status === "completado");
  const todayStr = new Date().toISOString().slice(0, 10);
  const scheduledToday = tasks.filter((t) =>
    t.due_date && t.due_date.slice(0, 10) === todayStr &&
    t.status !== "hoy" && t.status !== "en_ejecucion" && t.status !== "completado"
  );
  const ayerCompletadas = completadas.filter((t) => {
    if (!t.completed_at) return false;
    const comp = new Date(t.completed_at);
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    return comp.toDateString() === ayer.toDateString();
  });

  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));
  const goalByArea = Object.fromEntries(goals.map((g) => [g.area_id, g]));

  const p1 = hoyTasks.filter((t) => t.priority === "P1").slice(0, 3);
  const others = hoyTasks.filter((t) => !p1.includes(t));
  const enEjecucion = tasks.find((t) => t.status === "en_ejecucion");

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="p-6 max-w-2xl">
      {/* Morning startup */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink capitalize">{today}</h1>
        {sprint && (
          <p className="text-sm text-muted mt-1">
            {sprint.name} · Día {Math.min(7, Math.floor((Date.now() - new Date(sprint.start_date).getTime()) / 86400000) + 1)} / 7
          </p>
        )}
      </div>

      {/* Yesterday's context */}
      {ayerCompletadas.length > 0 && (
        <div className="mb-6">
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-2">AYER ({ayerCompletadas.length})</h2>
          <div className="flex flex-wrap gap-1.5">
            {ayerCompletadas.map((t) => (
              <span key={t.id} className="text-xs px-2 py-1 rounded bg-panelRaised text-muted line-through">
                {t.title.length > 30 ? t.title.slice(0, 30) + "…" : t.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Focus CTA */}
      {enEjecucion && (
        <div className="mb-5 bg-signal/5 border border-signal/20 rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink font-medium">{enEjecucion.title}</p>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-faint">
              {enEjecucion.area_id && areaById[enEjecucion.area_id] && (
                <span>{areaById[enEjecucion.area_id].icon} {areaById[enEjecucion.area_id].name}</span>
              )}
              {enEjecucion.project_id && projectById[enEjecucion.project_id] && (
                <span>· 📦 {projectById[enEjecucion.project_id].name}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigate?.("focus")}
            className="flex items-center gap-1.5 font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25 animate-pulse"
          >
            <Timer size={14} />
            FOCUS
          </button>
        </div>
      )}

      <div className="mt-4">
        <QuickAdd defaultStatus="hoy" />
      </div>

      <div className="mt-7">
        <h2 className="font-hud text-xs text-signal tracking-widest mb-2">
          🔥 PRIORIDADES ({p1.length}/3)
        </h2>
        {p1.length === 0 ? (
          <p className="text-sm text-faint">Agrega hasta 3 tareas P1 arriba.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {p1.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                area={task.area_id ? areaById[task.area_id] : undefined}
                onClick={() => setEditing(task)}
                onComplete={() => moveTask(task.id, "completado")}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>

      {others.length > 0 && (
        <div className="mt-7">
          <h2 className="font-hud text-xs text-faint tracking-widest mb-2">OTRAS TAREAS</h2>
          <div className="flex flex-col gap-2">
            {others.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                area={task.area_id ? areaById[task.area_id] : undefined}
                onClick={() => setEditing(task)}
                onComplete={() => moveTask(task.id, "completado")}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        </div>
      )}

      {scheduledToday.length > 0 && (
        <div className="mt-7">
          <h2 className="font-hud text-xs text-info tracking-widest mb-2">📅 PROGRAMADAS HOY ({scheduledToday.length})</h2>
          <div className="flex flex-col gap-2">
            {scheduledToday.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                area={task.area_id ? areaById[task.area_id] : undefined}
                onClick={() => setEditing(task)}
                onComplete={() => moveTask(task.id, "completado")}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        </div>
      )}

      {completadas.length > 0 && (
        <div className="mt-7">
          <h2 className="font-hud text-xs text-done tracking-widest mb-2">COMPLETADO ({completadas.length})</h2>
          <div className="flex flex-col gap-2">
            {completadas.slice(0, 10).map((task) => {
              const taskProject = task.project_id ? projectById[task.project_id] : null;
              const taskGoal = taskProject?.area_id ? goalByArea[taskProject.area_id] : null;
              return (
                <div key={task.id} onClick={() => setEditing(task)} className="bg-panelRaised border border-border rounded-md px-3 py-2 cursor-pointer hover:border-borderLight transition-colors">
                  <p className="text-xs text-muted line-through">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-faint">
                    {taskGoal && <span>🎯 {taskGoal.title}</span>}
                    {taskProject && <span>📦 {taskProject.name}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editing && <TaskModal task={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
