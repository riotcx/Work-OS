import { useState, type FormEvent } from "react";
import { X, Calendar } from "lucide-react";
import { useWorkOS } from "../store";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../components/TaskModal";
import type { Task } from "../types";
import { STATUS_LABELS } from "../types";
import { SPRINT_CAPACITY } from "../constants";
import { getCurrentWeek } from "../weekUtils";
import type { View } from "../App";

interface SprintProps {
  onNavigate?: (v: View) => void;
}

export function Sprint({ onNavigate }: SprintProps) {
  const { sprint, sprints, tasks, projects, goals, areas, loadSprints, closeSprint, createSprint } = useWorkOS();
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));
  const goalById = Object.fromEntries(goals.map((g) => [g.area_id, g]));

  const sprintTasks = tasks.filter((t) => t.sprint_id === sprint?.id);
  const done = sprintTasks.filter((t) => t.status === "completado").length;
  const total = sprintTasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const capacity = SPRINT_CAPACITY;
  const remaining = capacity - total;

  const handleCloseSprint = async () => {
    if (!sprint) return;
    if (!confirm("¿Cerrar este sprint? Las tareas no completadas permanecerán en el Kanban.")) return;
    await closeSprint(sprint.id);
    await loadSprints();
  };

  const handleCreateSprint = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const { startDate, endDate } = getCurrentWeek();
    await createSprint({ name: newName.trim(), start_date: startDate, end_date: endDate });
    setNewName("");
    setCreating(false);
    await loadSprints();
  };

  if (!sprint) {
    return (
      <div className="p-6 max-w-3xl">
        <h1 className="text-xl font-semibold text-ink mb-6">📅 Sprint</h1>
        <div className="text-center py-12 bg-panel border border-border rounded-lg">
          <p className="text-sm text-muted">No hay sprint activo.</p>
          <button onClick={() => setCreating(true)} className="mt-4 font-hud text-xs px-4 py-2 rounded-md bg-signal/15 text-signal border border-signal/40">
            CREAR SPRINT
          </button>
        </div>
        {creating && (
          <form onSubmit={handleCreateSprint} className="mt-4 bg-panel border border-border rounded-lg p-4 max-w-md">
            <div className="flex items-center gap-2">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del sprint" autoFocus className="flex-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
              <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40">CREAR</button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">{sprint.name}</h1>
        <p className="text-sm text-muted">
          {sprint.start_date} → {sprint.end_date}
          <span className={`ml-3 text-xs font-hud px-2 py-0.5 rounded ${sprint.status === "activo" ? "bg-done/10 text-done" : "bg-panelRaised text-muted"}`}>
            {sprint.status}
          </span>
        </p>
        <button
          onClick={() => onNavigate?.("week")}
          className="flex items-center gap-1.5 mt-2 text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink hover:border-borderLight transition-colors"
        >
          <Calendar size={13} />
          Ver semana
        </button>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "COMPLETADO", value: `${done}/${total}` },
          { label: "PROGRESO", value: `${pct}%` },
          { label: "CAPACIDAD", value: `${total}/${capacity}` },
          { label: "DISPONIBLE", value: remaining > 0 ? remaining : "0 ⚠️" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-panel border border-border rounded-lg px-3 py-2 text-center">
            <div className="text-[10px] font-hud text-faint tracking-widest">{kpi.label}</div>
            <div className={`text-lg font-semibold font-hud mt-0.5 ${kpi.label === "DISPONIBLE" && remaining <= 0 ? "text-danger" : "text-ink"}`}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full h-2 bg-panelRaised rounded-full overflow-hidden mb-8">
        <div className="h-full bg-signal transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {total > capacity && (
        <div className="mb-6 bg-danger/10 border border-danger/30 rounded-lg px-4 py-3">
          <p className="text-sm text-danger font-medium">⚠️ Sobrecarga detectada</p>
          <p className="text-xs text-muted mt-0.5">Tienes {total} tareas comprometidas con capacidad de {capacity}. Considera reducir el alcance.</p>
        </div>
      )}

      {/* Tasks list */}
      <div className="mb-6">
        <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">TAREAS DEL SPRINT ({total})</h2>
        {sprintTasks.length === 0 ? (
          <p className="text-sm text-muted">No hay tareas en este sprint. Arrástralas desde el Kanban.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sprintTasks.sort((a, b) => {
              const pa = a.priority === "P1" ? 0 : a.priority === "P2" ? 1 : 2;
              const pb = b.priority === "P1" ? 0 : b.priority === "P2" ? 1 : 2;
              return pa - pb;
            }).map((task) => {
              const taskProject = task.project_id ? projectById[task.project_id] : null;
              const taskGoal = taskProject?.area_id ? goalById[taskProject.area_id] : null;
              return (
                <div key={task.id} onClick={() => setEditing(task)} className="bg-panelRaised border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${task.status === "completado" ? "line-through text-muted" : "text-ink"}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-faint">
                        {task.area_id && areaById[task.area_id] && <span>{areaById[task.area_id].icon} {areaById[task.area_id].name}</span>}
                        {taskProject && <span>· 📦 {taskProject.name}</span>}
                        {taskGoal && <span>· 🎯 {taskGoal.title}</span>}
                      </div>
                    </div>
                    <span className={`text-[10px] font-hud px-1.5 py-0.5 rounded ${task.priority === "P1" ? "bg-danger/10 text-danger" : task.priority === "P2" ? "bg-signal/10 text-signal" : "bg-panel text-muted"}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {sprint.status === "activo" && (
          <button onClick={handleCloseSprint} className="font-hud text-xs px-4 py-2 rounded-md border border-danger/30 text-faint hover:text-danger hover:border-danger/50 transition-colors">
            CERRAR SPRINT
          </button>
        )}
        <button onClick={() => setCreating(true)} className="font-hud text-xs px-4 py-2 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25">
          + NUEVO SPRINT
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreateSprint} className="mt-4 bg-panel border border-border rounded-lg p-4 max-w-md">
          <div className="flex items-center justify-between mb-2">
            <span className="font-hud text-xs text-faint tracking-widest">NUEVO SPRINT</span>
            <button type="button" onClick={() => setCreating(false)} className="text-faint hover:text-ink"><X size={14} /></button>
          </div>
          <div className="flex items-center gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Sprint #..." autoFocus className="flex-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40">CREAR</button>
          </div>
        </form>
      )}

      {editing && <TaskModal task={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
