import { X, Trash2 } from "lucide-react";
import { useState } from "react";
import { useWorkOS } from "../store";
import type { Priority, Task, TaskStatus } from "../types";
import { STATUS_LABELS, STATUS_ORDER } from "../types";

export function TaskModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const { areas, updateTask, deleteTask } = useWorkOS();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [areaId, setAreaId] = useState(task.area_id ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);

  const handleSave = async () => {
    await updateTask(task.id, {
      title,
      description,
      priority,
      area_id: areaId || null,
      status,
    });
    onClose();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-panel border border-border rounded-lg w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-hud text-xs text-faint tracking-widest">EDITAR TAREA</span>
          <button onClick={onClose} className="text-faint hover:text-ink">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-panelRaised border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-signal/50"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            rows={3}
            className="bg-panelRaised border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-signal/50 placeholder:text-faint resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-hud text-faint tracking-widest">PRIORIDAD</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full mt-1 bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-hud text-faint tracking-widest">ÁREA</label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="w-full mt-1 bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              >
                <option value="">Sin área</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">ESTADO</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full mt-1 bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs text-faint hover:text-danger transition-colors"
          >
            <Trash2 size={13} />
            Eliminar
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-md text-muted hover:text-ink"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="font-hud text-xs tracking-wide px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"
            >
              GUARDAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
