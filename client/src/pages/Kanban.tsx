import { useState, type DragEvent } from "react";
import { useWorkOS } from "../store";
import { QuickAdd } from "../components/QuickAdd";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../components/TaskModal";
import type { Task, TaskStatus } from "../types";
import { STATUS_LABELS, STATUS_ORDER } from "../types";
import { MAX_EN_EJECUCION } from "../constants";

const COLUMN_COLORS: Record<string, string> = {
  captura: "#5AC8FA",
  definido: "#8B92A3",
  priorizado: "#B58AF5",
  esta_semana: "#3DDC97",
  hoy: "#F5A623",
  en_ejecucion: "#E5484D",
  revision: "#F5C542",
  completado: "#3DDC97",
};

export function Kanban() {
  const { tasks, areas, activeAreaFilter, setAreaFilter, moveTask, deleteTask } = useWorkOS();
  const [editing, setEditing] = useState<Task | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [wipWarning, setWipWarning] = useState(false);

  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const activeArea = activeAreaFilter ? areaById[activeAreaFilter] : null;

  const visibleTasks = activeAreaFilter
    ? tasks.filter((t) => t.area_id === activeAreaFilter)
    : tasks;

  const enEjecucionTasks = tasks.filter((t) => t.status === "en_ejecucion");

  const handleDrop = (e: DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id");
    if (!id) { setDragOverCol(null); return; }

    if (status === "en_ejecucion" && enEjecucionTasks.length >= 1) {
      const taskBeingMoved = tasks.find((t) => t.id === id);
      if (taskBeingMoved && taskBeingMoved.status !== "en_ejecucion") {
        setWipWarning(true);
        setDragOverCol(null);
        return;
      }
    }

    moveTask(id, status);
    setDragOverCol(null);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-ink">
          Kanban {activeArea && <span className="text-muted">· {activeArea.icon} {activeArea.name}</span>}
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={activeAreaFilter ?? ""}
            onChange={(e) => setAreaFilter(e.target.value || null)}
            className="bg-panelRaised border border-border rounded-md px-2 py-1 text-xs text-ink outline-none focus:border-signal/50"
          >
            <option value="">Todas las áreas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-muted mb-4">Arrastra las tarjetas entre columnas. Cada columna representa una decisión.</p>

      <div className="mb-4 max-w-xl">
        <QuickAdd defaultStatus="captura" />
      </div>

      {/* WIP Warning */}
      {wipWarning && (
        <div className="mb-4 bg-danger/10 border border-danger/30 rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-danger font-medium">⚠️ WIP Limit alcanzado</p>
            <p className="text-xs text-muted mt-0.5">
              Ya tienes una tarea en ejecución. Finalízala, páusala o reemplázala antes de iniciar otra.
            </p>
          </div>
          <button onClick={() => setWipWarning(false)} className="text-xs text-faint hover:text-ink ml-4">
            Entendido
          </button>
        </div>
      )}

      <div className="flex-1 flex gap-2 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => {
          const colTasks = visibleTasks.filter((t) => t.status === status);
          const isWipCol = status === "en_ejecucion";
          const color = COLUMN_COLORS[status] || "#2A2E37";

          return (
            <div
              key={status}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(status); }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, status)}
              className={`w-56 shrink-0 flex flex-col rounded-lg border transition-colors ${
                dragOverCol === status
                  ? "border-signal/50 bg-signal/5"
                  : "border-border bg-panel/50"
              }`}
            >
              <div className="px-3 py-2.5 border-b border-border flex items-center justify-between" style={{ borderLeftWidth: 3, borderLeftColor: color }}>
                <div className="flex items-center gap-2">
                  <span className="font-hud text-[10px] text-faint tracking-widest">
                    {STATUS_LABELS[status].toUpperCase()}
                  </span>
                  {isWipCol && enEjecucionTasks.length >= 1 && (
                    <span className="text-[9px] font-hud text-danger px-1 py-0.5 rounded bg-danger/10">
                      WIP {enEjecucionTasks.length}/1
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-hud text-faint">{colTasks.length}</span>
              </div>
              <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto min-h-[80px]">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    area={task.area_id ? areaById[task.area_id] : undefined}
                    draggable
                    onClick={() => setEditing(task)}
                    onComplete={
                      status !== "completado" ? () => moveTask(task.id, "completado") : undefined
                    }
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-[11px] text-faint text-center py-4">
                    {status === "captura" ? "Captura ideas sin filtrar" :
                     status === "hoy" ? "Máx 3 prioridades" :
                     status === "en_ejecucion" ? "Máx 1 en ejecución" :
                     "Vacío"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && <TaskModal task={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
