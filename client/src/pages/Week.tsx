import { useState, useEffect, type DragEvent } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useWorkOS } from "../store";
import { QuickAdd } from "../components/QuickAdd";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../components/TaskModal";
import type { Task, Sprint } from "../types";
import { PRIORITY_COLOR } from "../types";
import { SPRINT_CAPACITY, formatTime } from "../constants";

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function getSprintDays(sprint: Sprint): Date[] {
  const start = new Date(sprint.start_date + "T00:00:00");
  const end = new Date(sprint.end_date + "T00:00:00");
  const days: Date[] = [];
  const d = new Date(start);
  while (d <= end && days.length < 14) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isSameDay(a: string | null, b: Date): boolean {
  if (!a) return false;
  return a.slice(0, 10) === fmtDate(b);
}

export function Week() {
  const { tasks, areas, projects, goals, sprint, sprints, focusSessions, updateTask, addTask, loadSprints } = useWorkOS();
  const [editing, setEditing] = useState<Task | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [dragOverUnscheduled, setDragOverUnscheduled] = useState(false);
  const [showAdd, setShowAdd] = useState<string | null>(null);

  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));
  const goalByArea = Object.fromEntries(goals.map((g) => [g.area_id, g]));

  const days = sprint ? getSprintDays(sprint) : [];
  const sprintTasks = tasks.filter((t) => t.sprint_id === sprint?.id);
  const done = sprintTasks.filter((t) => t.status === "completado").length;
  const total = sprintTasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const sprintFocus = focusSessions
    .filter((fs) => sprintTasks.some((t) => t.id === fs.task_id))
    .reduce((s, fs) => s + (fs.duration_seconds || 0), 0);

  const unscheduled = sprintTasks.filter((t) => !t.due_date);

  const handleDrop = async (e: DragEvent, targetDate: string | null) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id");
    if (!id) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await updateTask(id, { due_date: targetDate, sprint_id: sprint?.id });
    setDragOverDay(null);
    setDragOverUnscheduled(false);
  };

  const handleQuickCreate = async (date: string, title: string) => {
    if (!title.trim() || !sprint) return;
    await addTask({ title: title.trim(), due_date: date, sprint_id: sprint.id, status: "priorizado" });
    setShowAdd(null);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">📅 Semana</h1>
          {sprint && (
            <p className="text-sm text-muted">
              {sprint.name} · {sprint.start_date} → {sprint.end_date}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadSprints()}
            className="text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink"
          >
            ↻
          </button>
        </div>
      </div>

      {!sprint ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted">No hay sprint activo.</p>
            <p className="text-xs text-faint mt-1">Crea un sprint para comenzar a planificar tu semana.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-1.5 bg-panelRaised rounded-full overflow-hidden">
              <div className="h-full bg-signal transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-hud text-muted">{done}/{total} · {pct}%</span>
            <span className="text-xs text-faint">⚡ {formatTime(sprintFocus)} focus</span>
          </div>

          {/* Grid: 7 days */}
          <div className="flex-1 flex gap-2 overflow-x-auto pb-4 min-h-0">
            {/* Unscheduled column */}
            <div
              className="w-44 shrink-0 flex flex-col"
              onDragOver={(e) => { e.preventDefault(); setDragOverUnscheduled(true); }}
              onDragLeave={() => setDragOverUnscheduled(false)}
              onDrop={(e) => handleDrop(e, null)}
            >
              <div className={`px-3 py-2 rounded-t-lg border text-center mb-1 ${dragOverUnscheduled ? "border-signal/50 bg-signal/5" : "border-border bg-panel"}`}>
                <span className="font-hud text-[10px] text-faint tracking-widest">📥 SIN PROGRAMAR</span>
                <span className="text-[10px] font-hud text-faint ml-1">{unscheduled.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 px-1">
                {unscheduled.map((task) => (
                  <MiniTaskCard
                    key={task.id}
                    task={task}
                    area={task.area_id ? areaById[task.area_id] : undefined}
                    project={task.project_id ? projectById[task.project_id] : undefined}
                    goal={task.area_id ? goalByArea[task.area_id] : undefined}
                    onClick={() => setEditing(task)}
                  />
                ))}
                {unscheduled.length === 0 && (
                  <p className="text-[10px] text-faint text-center py-4">Todas programadas</p>
                )}
              </div>
            </div>

            {/* Day columns */}
            {days.map((day, i) => {
              const dateStr = fmtDate(day);
              const dayTasks = sprintTasks.filter((t) => isSameDay(t.due_date, day));
              const dayNum = day.getDate();
              const isToday = fmtDate(new Date()) === dateStr;
              const isSunday = day.getDay() === 0;
              const isOver = dragOverDay === dateStr;

              return (
                <div
                  key={i}
                  className="w-44 shrink-0 flex flex-col"
                  onDragOver={(e) => { e.preventDefault(); setDragOverDay(dateStr); }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={(e) => handleDrop(e, dateStr)}
                >
                  <div className={`px-3 py-2 rounded-t-lg border text-center mb-1 transition-colors ${isOver ? "border-signal/50 bg-signal/5" : isToday ? "border-signal bg-signal/5" : "border-border bg-panel"}`}>
                    <div className="font-hud text-[10px] text-faint tracking-widest">
                      {DAY_NAMES[i]?.substring(0, 3).toUpperCase() || `D${i + 1}`}
                    </div>
                    <div className={`text-sm font-semibold mt-0.5 ${isToday ? "text-signal" : "text-ink"}`}>
                      {dayNum}
                    </div>
                    {isSunday && (
                      <div className="text-[9px] text-faint mt-0.5">Review</div>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 px-1">
                    {dayTasks.map((task) => (
                      <MiniTaskCard
                        key={task.id}
                        task={task}
                        area={task.area_id ? areaById[task.area_id] : undefined}
                        project={task.project_id ? projectById[task.project_id] : undefined}
                        goal={task.area_id ? goalByArea[task.area_id] : undefined}
                        onClick={() => setEditing(task)}
                      />
                    ))}
                    {dayTasks.length === 0 && (
                      <p className="text-[10px] text-faint text-center py-4">
                        {isToday ? "—" : ""}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAdd(dateStr)}
                    className="text-[10px] font-hud text-faint hover:text-signal py-1.5 text-center border-t border-border/50 mt-1"
                  >
                    + Agregar
                  </button>
                  {showAdd === dateStr && (
                    <div className="px-1 pb-1">
                      <input
                        autoFocus
                        placeholder="Tarea..."
                        className="w-full bg-panelRaised border border-border rounded px-2 py-1 text-xs text-ink outline-none focus:border-signal/50"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleQuickCreate(dateStr, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                          if (e.key === "Escape") setShowAdd(null);
                        }}
                        onBlur={() => setTimeout(() => setShowAdd(null), 200)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {editing && <TaskModal task={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function MiniTaskCard({
  task,
  area,
  project,
  goal,
  onClick,
}: {
  task: Task;
  area?: { name: string; icon: string };
  project?: { name: string };
  goal?: { title: string };
  onClick: () => void;
}) {
  const isDone = task.status === "completado";
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/task-id", task.id)}
      onClick={onClick}
      className="bg-panelRaised border border-border rounded-md px-2 py-1.5 hover:border-borderLight cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDone ? "bg-done" : task.priority === "P1" ? "bg-danger" : task.priority === "P2" ? "bg-signal" : "bg-border"}`} />
        <p className={`text-[11px] leading-tight flex-1 ${isDone ? "line-through text-muted" : "text-ink"}`}>
          {task.title}
        </p>
      </div>
      {area && (
        <div className="flex items-center gap-1 mt-1 text-[9px] text-faint">
          <span>{area.icon}</span>
          {goal && <span title={goal.title} className="truncate max-w-[80px]">🎯</span>}
        </div>
      )}
    </div>
  );
}
