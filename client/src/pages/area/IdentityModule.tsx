import { useState, type FormEvent } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useWorkOS } from "../../store";
import type { IdentityIdea, Community } from "../../types";

interface Props { areaId: string; ideas: IdentityIdea[]; communities: Community[]; }

const CATEGORIES = ["filosofía", "historias", "preguntas", "comunidad", "valores", "experiencias", "aprendizajes", "ideas", "otro"];

export function IdentityModule({ areaId, ideas, communities }: Props) {
  const { addIdentityIdea, updateIdentityIdea, deleteIdentityIdea } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<IdentityIdea | null>(null);
  const [form, setForm] = useState({ title: "", idea: "", category: "", objective: "", community_id: "" });
  const [editForm, setEditForm] = useState<Partial<IdentityIdea>>({});

  const resetForm = () => setForm({ title: "", idea: "", category: "", objective: "", community_id: "" });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addIdentityIdea({ ...form, community_id: form.community_id || null, area_id: areaId, status: "idea" });
    resetForm(); setCreating(false);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updateIdentityIdea(editing.id, editForm);
    setEditing(null);
  };

  const startEdit = (i: IdentityIdea) => {
    setEditing(i);
    setEditForm({ title: i.title, idea: i.idea, category: i.category, objective: i.objective, community_id: i.community_id });
  };

  const communityById = Object.fromEntries(communities.map((c) => [c.id, c]));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-ink">🧬 Identidad</h1>
          <p className="text-sm text-muted">Crear identidad y conexión humana con la comunidad.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs tracking-wide px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25">
          <Plus size={14} /> IDEA
        </button>
      </div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 mt-4 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR IDEA" : "NUEVA IDEA DE IDENTIDAD"}</span>
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
              placeholder="Describe la idea, filosofía o pensamiento..."
              rows={3}
              className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editing ? editForm.category || "" : form.category}
                onChange={(e) => editing ? setEditForm({ ...editForm, category: e.target.value }) : setForm({ ...form, category: e.target.value })}
                className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              >
                <option value="">Categoría</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                value={editing ? editForm.objective || "" : form.objective}
                onChange={(e) => editing ? setEditForm({ ...editForm, objective: e.target.value }) : setForm({ ...form, objective: e.target.value })}
                placeholder="Objetivo"
                className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              />
            </div>
            {communities.length > 0 && (
              <select
                value={editing ? editForm.community_id || "" : form.community_id}
                onChange={(e) => editing ? setEditForm({ ...editForm, community_id: e.target.value }) : setForm({ ...form, community_id: e.target.value })}
                className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              >
                <option value="">Sin comunidad</option>
                {communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
          <div className="flex justify-between mt-3">
            {editing && (
              <button type="button" onClick={() => { deleteIdentityIdea(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger">
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
          <p className="text-sm text-muted">Todavía no tienes ideas de identidad.</p>
          <p className="text-xs text-faint mt-1">Almacena filosofías, valores, preguntas e historias para tu comunidad.</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {ideas.map((i) => (
            <div
              key={i.id}
              onClick={() => startEdit(i)}
              className="bg-panelRaised border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-ink">{i.title}</p>
                  {i.idea && <p className="text-xs text-muted mt-1 line-clamp-2">{i.idea}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    {i.category && (
                      <span className="text-[10px] font-hud px-1.5 py-0.5 rounded border border-border text-faint capitalize">
                        {i.category}
                      </span>
                    )}
                    {i.community_id && communityById[i.community_id] && (
                      <span className="text-[10px] text-faint">
                        {communityById[i.community_id].name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteIdentityIdea(i.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-faint hover:text-danger transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
