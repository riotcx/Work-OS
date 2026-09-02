import { useState, type FormEvent } from "react";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import { useWorkOS } from "../store";
import type { Project, ProjectStatus } from "../types";
import { PROJECT_STATUS_LABELS } from "../types";

const STATUSES: ProjectStatus[] = ["activo", "pausado", "archivado"];

export function Projects() {
  const { projects, areas, addProject, updateProject, deleteProject } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [filter, setFilter] = useState<ProjectStatus | "todas">("todas");
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [editName, setEditName] = useState("");
  const [editAreaId, setEditAreaId] = useState("");
  const [editStatus, setEditStatus] = useState<ProjectStatus>("activo");

  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const filtered = filter === "todas"
    ? projects
    : projects.filter((p) => p.status === filter);

  const grouped: Record<string, Project[]> = {};
  for (const p of filtered) {
    const key = p.status;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addProject({ name: name.trim(), area_id: areaId || null });
    setName("");
    setAreaId("");
    setCreating(false);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updateProject(editing.id, { name: editName, area_id: editAreaId || null, status: editStatus });
    setEditing(null);
  };

  const startEdit = (p: Project) => {
    setEditing(p);
    setEditName(p.name);
    setEditAreaId(p.area_id ?? "");
    setEditStatus((p.status as ProjectStatus) || "activo");
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink">📦 Proyectos</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 font-hud text-xs tracking-wide px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"
        >
          <Plus size={14} />
          NUEVO
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["todas", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1 rounded-md border transition-colors ${
              filter === s
                ? "border-signal/40 bg-signal/10 text-signal"
                : "border-border text-muted hover:text-ink hover:border-borderLight"
            }`}
          >
            {s === "todas" ? "Todas" : PROJECT_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Create form */}
      {creating && (
        <form onSubmit={handleCreate} className="mb-6 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-hud text-xs text-faint tracking-widest">NUEVO PROYECTO</span>
            <button type="button" onClick={() => setCreating(false)} className="text-faint hover:text-ink">
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del proyecto"
              autoFocus
              className="flex-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
            />
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
            >
              <option value="">Sin área</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
              ))}
            </select>
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40">
              CREAR
            </button>
          </div>
        </form>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setEditing(null)}>
          <form
            onSubmit={handleUpdate}
            onClick={(e) => e.stopPropagation()}
            className="bg-panel border border-border rounded-lg w-full max-w-sm shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-hud text-xs text-faint tracking-widest">EDITAR PROYECTO</span>
              <button type="button" onClick={() => setEditing(null)} className="text-faint hover:text-ink">
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={editAreaId}
                  onChange={(e) => setEditAreaId(e.target.value)}
                  className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
                >
                  <option value="">Sin área</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                  ))}
                </select>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                  className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between mt-2">
                <button
                  type="button"
                  onClick={() => { deleteProject(editing.id); setEditing(null); }}
                  className="flex items-center gap-1 text-xs text-faint hover:text-danger"
                >
                  <Trash2 size={12} />
                  Eliminar
                </button>
                <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40">
                  GUARDAR
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Project list */}
      {projects.length === 0 ? (
        <p className="text-sm text-faint">No hay proyectos todavía. Crea uno arriba.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-faint">No hay proyectos con este filtro.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {STATUSES.map((status) => {
            const items = grouped[status];
            if (!items || items.length === 0) return null;
            return (
              <div key={status}>
                <h2 className="font-hud text-xs text-faint tracking-widest mb-2">
                  {PROJECT_STATUS_LABELS[status].toUpperCase()} ({items.length})
                </h2>
                <div className="flex flex-col gap-2">
                  {items.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-panelRaised border border-border rounded-md px-4 py-3 hover:border-borderLight transition-colors group"
                    >
                      <div>
                        <p className="text-sm text-ink">{p.name}</p>
                        {p.area_id && areaById[p.area_id] && (
                          <p className="text-xs text-faint mt-0.5">
                            {areaById[p.area_id].icon} {areaById[p.area_id].name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => startEdit(p)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-faint hover:text-ink hover:bg-panel transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
