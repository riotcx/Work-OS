import { useState, type FormEvent } from "react";
import { Plus, X, Trash2, Star } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Project } from "../../types";

export function PersonalProjectsModule({ areaId }: { areaId: string }) {
  const { projects, addProject, updateProject, deleteProject } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [f, setF] = useState<Record<string, any>>({ name: "", description: "", url: "", github_url: "", category: "", project_type: "", role: "", problem: "", solution: "", result: "", featured: false, status: "activo" });
  const [ef, setEf] = useState<Record<string, any>>({});

  const areaProjects = projects.filter((p) => p.area_id === areaId);
  const featured = areaProjects.filter((p) => p.featured);

  const resetF = () => setF({ name: "", description: "", url: "", github_url: "", category: "", project_type: "", role: "", problem: "", solution: "", result: "", featured: false, status: "activo" });

  const handleCreate = async (e: FormEvent) => { e.preventDefault(); if (!f.name.trim()) return; await addProject({ ...f, area_id: areaId }); resetF(); setCreating(false); };
  const handleUpdate = async (e: FormEvent) => { e.preventDefault(); if (!editing) return; await updateProject(editing.id, ef); setEditing(null); };
  const startEdit = (p: Project) => { setEditing(p); setEf({ name: p.name, description: p.description, url: p.url, github_url: p.github_url, category: p.category, project_type: p.project_type, role: p.role, problem: p.problem, solution: p.solution, result: p.result, featured: !!p.featured, status: p.status }); };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2"><div><h1 className="text-xl font-semibold text-ink">🚀 Proyectos</h1><p className="text-sm text-muted">Todo lo que has construido. Tu evidencia profesional.</p></div><button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"><Plus size={14} /> PROYECTO</button></div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 mt-4 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3"><span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR" : "NUEVO PROYECTO"}</span><button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button></div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={editing ? ef.name || "" : f.name} onChange={(e) => editing ? setEf({ ...ef, name: e.target.value }) : setF({ ...f, name: e.target.value })} placeholder="Nombre *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
              <input value={editing ? ef.category || "" : f.category} onChange={(e) => editing ? setEf({ ...ef, category: e.target.value }) : setF({ ...f, category: e.target.value })} placeholder="Categoría (SaaS, Web, Mobile...)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            </div>
            <textarea value={editing ? ef.description || "" : f.description} onChange={(e) => editing ? setEf({ ...ef, description: e.target.value }) : setF({ ...f, description: e.target.value })} placeholder="Descripción" rows={2} className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input value={editing ? ef.url || "" : f.url} onChange={(e) => editing ? setEf({ ...ef, url: e.target.value }) : setF({ ...f, url: e.target.value })} placeholder="URL / Demo" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
              <input value={editing ? ef.github_url || "" : f.github_url} onChange={(e) => editing ? setEf({ ...ef, github_url: e.target.value }) : setF({ ...f, github_url: e.target.value })} placeholder="GitHub URL" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={editing ? ef.role || "" : f.role} onChange={(e) => editing ? setEf({ ...ef, role: e.target.value }) : setF({ ...f, role: e.target.value })} placeholder="Rol (ej: Solo Founder)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
              <select value={editing ? ef.status || "activo" : f.status} onChange={(e) => editing ? setEf({ ...ef, status: e.target.value }) : setF({ ...f, status: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50">
                <option value="activo">Activo</option><option value="pausado">Pausado</option><option value="archivado">Archivado</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer"><input type="checkbox" checked={editing ? !!ef.featured : !!f.featured} onChange={(e) => editing ? setEf({ ...ef, featured: e.target.checked }) : setF({ ...f, featured: e.target.checked })} /> 🚀 Proyecto Destacado</label>
          </div>
          <div className="flex justify-between mt-3">
            {editing && <button type="button" onClick={() => { deleteProject(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger"><Trash2 size={12} /> Eliminar</button>}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">{editing ? "GUARDAR" : "CREAR"}</button>
          </div>
        </form>
      )}

      {areaProjects.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg mt-4"><p className="text-sm text-muted">No hay proyectos.</p><p className="text-xs text-faint mt-1">Agrega proyectos que demuestren lo que sabes hacer.</p></div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {featured.length > 0 && (
            <div>
              <h2 className="font-hud text-[10px] text-faint tracking-widest mb-2">DESTACADOS</h2>
              {featured.map((p) => <ProjectCard key={p.id} project={p} onClick={() => startEdit(p)} />)}
            </div>
          )}
          {areaProjects.filter((p) => !p.featured).length > 0 && (
            <div>
              <h2 className="font-hud text-[10px] text-faint tracking-widest mb-2">TODOS</h2>
              {areaProjects.filter((p) => !p.featured).map((p) => <ProjectCard key={p.id} project={p} onClick={() => startEdit(p)} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-panelRaised border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors mb-2 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink font-medium">{project.featured ? "🚀 " : ""}{project.name}</p>
          {project.description && <p className="text-xs text-muted mt-0.5 line-clamp-1">{project.description}</p>}
          <div className="flex items-center gap-2 mt-1">
            {project.category && <span className="text-[10px] font-hud text-faint">{project.category}</span>}
            {project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-info hover:underline">demo</a>}
            {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-info hover:underline">github</a>}
          </div>
        </div>
        <span className={`text-[10px] font-hud px-1.5 py-0.5 rounded ${project.status === "activo" ? "bg-done/10 text-done" : project.status === "pausado" ? "bg-signal/10 text-signal" : "bg-panel text-muted"}`}>{project.status}</span>
      </div>
    </div>
  );
}
