import { useState, type FormEvent } from "react";
import { Plus, X, Trash2, Star } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Skill, Project, Technology } from "../../types";

export function PersonalSkillsModule({ areaId }: { areaId: string }) {
  const { skills, projects, technologies, addSkill, updateSkill, deleteSkill, addTechnology } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [f, setF] = useState<Record<string, any>>({ name: "", category: "", level: "intermedio", description: "", experience: "", featured: false, projects: [], technologies: [] });
  const [ef, setEf] = useState<Record<string, any>>({});
  const [techName, setTechName] = useState("");

  const resetF = () => setF({ name: "", category: "", level: "intermedio", description: "", experience: "", featured: false, projects: [], technologies: [] });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    await addSkill({ ...f, area_id: areaId });
    resetF(); setCreating(false);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updateSkill(editing.id, ef);
    setEditing(null);
  };

  const startEdit = (s: Skill) => { setEditing(s); setEf({ name: s.name, category: s.category, level: s.level, description: s.description, experience: s.experience, featured: !!s.featured, projects: s.projects || [], technologies: s.technologies || [] }); };

  const handleAddTech = async () => {
    if (!techName.trim()) return;
    await addTechnology({ name: techName.trim(), area_id: areaId });
    setTechName("");
  };

  const areaSkills = skills.filter((s) => s.area_id === areaId);
  const areaProjects = projects.filter((p) => p.area_id === areaId);
  const techById = Object.fromEntries(technologies.map((t) => [t.id, t]));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <div><h1 className="text-xl font-semibold text-ink">⚡ Habilidades</h1><p className="text-sm text-muted">Qué sabes hacer y cómo puedes demostrarlo.</p></div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"><Plus size={14} /> SKILL</button>
      </div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 mt-4 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3"><span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR SKILL" : "NUEVA SKILL"}</span><button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button></div>
          <div className="grid grid-cols-2 gap-3">
            <input value={editing ? ef.name || "" : f.name} onChange={(e) => editing ? setEf({ ...ef, name: e.target.value }) : setF({ ...f, name: e.target.value })} placeholder="Nombre *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
            <select value={editing ? ef.level || "intermedio" : f.level} onChange={(e) => editing ? setEf({ ...ef, level: e.target.value }) : setF({ ...f, level: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50">
              <option value="básico">Básico</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option><option value="experto">Experto</option>
            </select>
            <input value={editing ? ef.category || "" : f.category} onChange={(e) => editing ? setEf({ ...ef, category: e.target.value }) : setF({ ...f, category: e.target.value })} placeholder="Categoría (ej: Backend)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input type="checkbox" checked={editing ? !!ef.featured : !!f.featured} onChange={(e) => editing ? setEf({ ...ef, featured: e.target.checked }) : setF({ ...f, featured: e.target.checked })} className="rounded" />
              ⭐ Destacada
            </label>
          </div>
          <textarea value={editing ? ef.description || "" : f.description} onChange={(e) => editing ? setEf({ ...ef, description: e.target.value }) : setF({ ...f, description: e.target.value })} placeholder="Descripción de la habilidad..." rows={2} className="mt-3 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none w-full" />

          {areaProjects.length > 0 && (
            <div className="mt-3">
              <label className="text-[10px] font-hud text-faint tracking-widest">PROYECTOS RELACIONADOS</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {areaProjects.map((p) => {
                  const selected = (editing ? ef.projects || [] : f.projects || []) as string[];
                  return (
                    <button key={p.id} type="button" onClick={() => editing ? setEf({ ...ef, projects: selected.includes(p.id) ? selected.filter((id: string) => id !== p.id) : [...selected, p.id] }) : setF({ ...f, projects: selected.includes(p.id) ? selected.filter((id: string) => id !== p.id) : [...selected, p.id] })} className={`text-xs px-2 py-1 rounded-md border ${selected.includes(p.id) ? "border-signal/40 bg-signal/10 text-signal" : "border-border text-muted hover:text-ink"}`}>{p.name}</button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-3">
            {editing && <button type="button" onClick={() => { deleteSkill(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger"><Trash2 size={12} /> Eliminar</button>}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">{editing ? "GUARDAR" : "CREAR"}</button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-2 mb-4 mt-4">
        <input value={techName} onChange={(e) => setTechName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTech()} placeholder="Agregar tecnología (ej: React, Firebase)..." className="flex-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
        <button onClick={handleAddTech} className="font-hud text-xs px-3 py-1.5 rounded-md bg-panelRaised border border-border text-muted hover:text-ink">+</button>
      </div>

      {technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {technologies.map((t) => <span key={t.id} className="text-[11px] px-2 py-1 rounded bg-panelRaised border border-border text-muted">{t.name}</span>)}
        </div>
      )}

      {areaSkills.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg"><p className="text-sm text-muted">No hay habilidades definidas.</p><p className="text-xs text-faint mt-1">Crea habilidades y conéctalas con proyectos para generar evidencia.</p></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {areaSkills.map((s) => {
            const related = (s.projects || []).map((pid) => projects.find((p) => p.id === pid)).filter(Boolean);
            return (
              <div key={s.id} onClick={() => startEdit(s)} className="bg-panel border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-ink font-medium">{s.featured ? "⭐ " : ""}{s.name}</span>
                  <span className={`text-[10px] font-hud px-1.5 py-0.5 rounded ${s.level === "experto" ? "bg-signal/10 text-signal" : s.level === "avanzado" ? "bg-info/10 text-info" : "bg-panelRaised text-muted"}`}>{s.level}</span>
                </div>
                {s.description && <p className="text-xs text-muted mb-2 line-clamp-1">{s.description}</p>}
                {related.length > 0 && <div className="flex flex-wrap gap-1"><span className="text-[10px] text-faint">{related.length} proyectos</span></div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
