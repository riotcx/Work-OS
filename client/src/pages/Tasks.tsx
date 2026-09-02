import { useState } from "react";
import { useWorkOS } from "../store";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../components/TaskModal";
import type { Task, TaskStatus } from "../types";
import { STATUS_LABELS, PRIORITY_COLOR } from "../types";

export function Tasks() {
  const { tasks, areas, projects } = useWorkOS();
  const [editing, setEditing] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "todas">("todas");
  const [search, setSearch] = useState("");

  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));

  let filtered = tasks;
  if (statusFilter !== "todas") {
    filtered = filtered.filter((t) => t.status === statusFilter);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(q));
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-xl font-semibold text-ink mb-1">✓ Tareas</h1>
      <p className="text-sm text-muted mb-4">Vista administrativa de todas las tareas.</p>

      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tarea..."
          className="flex-1 max-w-sm bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 placeholder:text-faint"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "todas")}
          className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
        >
          <option value="todas">Todos los estados</option>
          {(["captura", "esta_semana", "hoy", "en_ejecucion", "revision", "completado"] as TaskStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-faint">No se encontraron tareas.</p>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-hud text-[10px] text-faint tracking-widest">TAREA</th>
                <th className="pb-2 pr-4 font-hud text-[10px] text-faint tracking-widest">ÁREA</th>
                <th className="pb-2 pr-4 font-hud text-[10px] text-faint tracking-widest">PROYECTO</th>
                <th className="pb-2 pr-4 font-hud text-[10px] text-faint tracking-widest">P</th>
                <th className="pb-2 pr-4 font-hud text-[10px] text-faint tracking-widest">ESTADO</th>
                <th className="pb-2 font-hud text-[10px] text-faint tracking-widest">FECHA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setEditing(task)}
                  className="border-b border-border/50 hover:bg-panelRaised/40 cursor-pointer transition-colors"
                >
                  <td className={`py-2.5 pr-4 ${task.status === "completado" ? "line-through text-muted" : "text-ink"}`}>
                    {task.title}
                  </td>
                  <td className="py-2.5 pr-4 text-muted text-xs">
                    {task.area_id && areaById[task.area_id]
                      ? `${areaById[task.area_id].icon} ${areaById[task.area_id].name}`
                      : "—"}
                  </td>
                  <td className="py-2.5 pr-4 text-muted text-xs">
                    {task.project_id && projectById[task.project_id]
                      ? projectById[task.project_id].name
                      : "—"}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-[10px] font-hud px-1.5 py-0.5 rounded border ${PRIORITY_COLOR[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-muted">{STATUS_LABELS[task.status]}</td>
                  <td className="py-2.5 text-xs text-faint font-hud">
                    {task.created_at ? new Date(task.created_at).toLocaleDateString("es-ES") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <TaskModal task={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
