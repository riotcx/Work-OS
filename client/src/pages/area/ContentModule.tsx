import { useState, type FormEvent } from "react";
import { Plus, X, Trash2, ArrowRight } from "lucide-react";
import { useWorkOS } from "../../store";
import type { ContentIdea, Platform } from "../../types";
import { CONTENT_STATUS_LABELS, CONTENT_STATUS_ORDER } from "../../types";

interface Props { areaId: string; ideas: ContentIdea[]; platforms: Platform[]; }

export function ContentModule({ areaId, ideas, platforms }: Props) {
  const { addContentIdea, updateContentIdea, deleteContentIdea } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ContentIdea | null>(null);
  const [form, setForm] = useState({ title: "", idea: "", format: "", objective: "", platforms: [] as string[], priority: "P2" });
  const [editForm, setEditForm] = useState<Partial<ContentIdea> & { platforms?: string[] }>({});

  const resetForm = () => setForm({ title: "", idea: "", format: "", objective: "", platforms: [], priority: "P2" });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addContentIdea({ ...form, area_id: areaId, status: "idea" });
    resetForm(); setCreating(false);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updateContentIdea(editing.id, editForm);
    setEditing(null);
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const idx = CONTENT_STATUS_ORDER.indexOf(currentStatus as any);
    if (idx < CONTENT_STATUS_ORDER.length - 1) {
      await updateContentIdea(id, { status: CONTENT_STATUS_ORDER[idx + 1] });
    }
  };

  const startEdit = (i: ContentIdea) => {
    setEditing(i);
    setEditForm({ title: i.title, idea: i.idea, format: i.format, objective: i.objective, status: i.status, priority: i.priority, platforms: i.platforms });
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-ink">✍️ Contenido</h1>
          <p className="text-sm text-muted">Convertir atención en publicaciones.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs tracking-wide px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25">
          <Plus size={14} /> IDEA
        </button>
      </div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 mt-4 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR IDEA" : "NUEVA IDEA DE CONTENIDO"}</span>
            <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button>
          </div>
          <div className="flex flex-col gap-3">
            <input
              value={editing ? editForm.title || "" : form.title}
              onChange={(e) => editing ? setEditForm({ ...editForm, title: e.target.value }) : setForm({ ...form, title: e.target.value })}
              placeholder="Título de la idea *"
              className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              autoFocus
            />
            <textarea
              value={editing ? editForm.idea || "" : form.idea}
              onChange={(e) => editing ? setEditForm({ ...editForm, idea: e.target.value }) : setForm({ ...form, idea: e.target.value })}
              placeholder="Describe la idea..."
              rows={3}
              className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                value={editing ? editForm.format || "" : form.format}
                onChange={(e) => editing ? setEditForm({ ...editForm, format: e.target.value }) : setForm({ ...form, format: e.target.value })}
                placeholder="Formato (post/video/hilo)"
                className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              />
              <input
                value={editing ? editForm.objective || "" : form.objective}
                onChange={(e) => editing ? setEditForm({ ...editForm, objective: e.target.value }) : setForm({ ...form, objective: e.target.value })}
                placeholder="Objetivo"
                className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              />
              <select
                value={editing ? editForm.priority || "P2" : form.priority}
                onChange={(e) => editing ? setEditForm({ ...editForm, priority: e.target.value }) : setForm({ ...form, priority: e.target.value })}
                className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              >
                <option value="P1">P1</option><option value="P2">P2</option><option value="P3">P3</option>
              </select>
            </div>
            {platforms.length > 0 && (
              <div>
                <label className="text-[10px] font-hud text-faint tracking-widest">PUBLICAR EN</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {platforms.map((p) => {
                    const selected = (editing ? editForm.platforms : form.platforms) || [];
                    const checked = selected.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          const current = editing ? [...(editForm.platforms || [])] : [...form.platforms];
                          const updated = checked ? current.filter((id) => id !== p.id) : [...current, p.id];
                          editing ? setEditForm({ ...editForm, platforms: updated }) : setForm({ ...form, platforms: updated });
                        }}
                        className={`text-xs px-2 py-1 rounded-md border transition-colors ${checked ? "border-signal/40 bg-signal/10 text-signal" : "border-border text-muted hover:text-ink"}`}
                      >
                        {p.icon} {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-3">
            {editing && (
              <button type="button" onClick={() => { deleteContentIdea(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger">
                <Trash2 size={12} /> Eliminar
              </button>
            )}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">
              {editing ? "GUARDAR" : "CREAR"}
            </button>
          </div>
        </form>
      )}

      {ideas.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg mt-4">
          <p className="text-sm text-muted">Todavía no tienes ideas de contenido.</p>
          <p className="text-xs text-faint mt-1">Crea ideas y publícalas en tus plataformas.</p>
        </div>
      ) : (
        <div className="mt-4">
          {CONTENT_STATUS_ORDER.map((status) => {
            const items = ideas.filter((i) => i.status === status);
            if (items.length === 0) return null;
            return (
              <div key={status} className="mb-6">
                <h2 className="font-hud text-xs text-faint tracking-widest mb-2">{CONTENT_STATUS_LABELS[status].toUpperCase()} ({items.length})</h2>
                <div className="flex flex-col gap-2">
                  {items.map((idea) => (
                    <div key={idea.id} className="flex items-center justify-between bg-panelRaised border border-border rounded-lg px-4 py-3 hover:border-borderLight transition-colors group">
                      <div onClick={() => startEdit(idea)} className="flex-1 cursor-pointer">
                        <p className="text-sm text-ink">{idea.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {idea.format && <span className="text-[10px] text-faint">{idea.format}</span>}
                          {idea.platforms && idea.platforms.length > 0 && (
                            <span className="text-[10px] text-faint">{idea.platforms.length} plataformas</span>
                          )}
                        </div>
                      </div>
                      {status !== "analizado" && (
                        <button
                          onClick={() => handleStatusChange(idea.id, idea.status)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-faint hover:text-signal hover:bg-signal/10 transition-all"
                          title="Avanzar"
                        >
                          <ArrowRight size={14} />
                        </button>
                      )}
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
