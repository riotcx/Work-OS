import { Check, Trash2 } from "lucide-react";
import type { Area, Task } from "../types";
import { PRIORITY_COLOR } from "../types";

interface TaskCardProps {
  task: Task;
  area?: Area;
  draggable?: boolean;
  onClick?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

export function TaskCard({ task, area, draggable, onClick, onComplete, onDelete }: TaskCardProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", task.id);
      }}
      onClick={onClick}
      className="group bg-panelRaised border border-border rounded-md px-3 py-2.5 hover:border-borderLight transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm text-ink leading-snug ${task.status === "completado" ? "line-through text-muted" : ""}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onComplete && task.status !== "completado" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              title="Marcar como hecho"
              className="p-1 rounded text-faint hover:text-done hover:bg-done/10"
            >
              <Check size={13} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Eliminar"
              className="p-1 rounded text-faint hover:text-danger hover:bg-danger/10"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className={`text-[10px] font-hud px-1.5 py-0.5 rounded border ${PRIORITY_COLOR[task.priority]}`}>
          {task.priority}
        </span>
        {area && (
          <span className="text-[10px] text-faint flex items-center gap-1">
            <span>{area.icon}</span>
            <span className="truncate max-w-[90px]">{area.name}</span>
          </span>
        )}
      </div>
    </div>
  );
}
