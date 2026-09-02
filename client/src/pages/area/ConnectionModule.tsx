import { useState, type FormEvent } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Community } from "../../types";

interface Props { areaId: string; communities: Community[]; }

export function ConnectionModule({ areaId, communities }: Props) {
  const { addCommunity, updateCommunity, deleteCommunity } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Community | null>(null);
  const [form, setForm] = useState({ name: "", platform: "", url: "", description: "", purpose: "", member_count: 0, active_users: 0, goal: "" });
  const [editForm, setEditForm] = useState<Partial<Community>>({});

  const resetForm = () => setForm({ name: "", platform: "", url: "", description: "", purpose: "", member_count: 0, active_users: 0, goal: "" });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addCommunity({ ...form, area_id: areaId, status: "activo" });
    resetForm(); setCreating(false);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updateCommunity(editing.id, editForm);
    setEditing(null);
  };

  const startEdit = (c: Community) => {
    setEditing(c);
    setEditForm({ name: c.name, platform: c.platform, url: c.url, description: c.description, purpose: c.purpose, member_count: c.member_count, active_users: c.active_users, goal: c.goal });
  };

  const activeCount = communities.filter((c) => c.status === "activo").length;
  const totalMembers = communities.reduce((s, c) => s + (c.member_count || 0), 0);
  const totalActive = communities.reduce((s, c) => s + (c.active_users || 0), 0);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-ink">🤝 Conexión</h1>
          <p className="text-sm text-muted">¿Dónde convierto atención en interés y comunidad?</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs tracking-wide px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25">
          <Plus size={14} /> NUEVA
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 mt-4">
        {[{ label: "ACTIVAS", value: activeCount }, { label: "MIEMBROS", value: totalMembers.toLocaleString() }, { label: "ACTIVOS", value: totalActive.toLocaleString() }].map((s) => (
          <div key={s.label} className="bg-panel border border-border rounded-lg px-3 py-2 text-center">
            <div className="text-[10px] font-hud text-faint tracking-widest">{s.label}</div>
            <div className="text-sm font-semibold text-ink font-hud mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR COMUNIDAD" : "NUEVA COMUNIDAD"}</span>
            <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={editing ? editForm.name || "" : form.name} onChange={(e) => editing ? setEditForm({ ...editForm, name: e.target.value }) : setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
            <input value={editing ? editForm.platform || "" : form.platform} onChange={(e) => editing ? setEditForm({ ...editForm, platform: e.target.value }) : setForm({ ...form, platform: e.target.value })} placeholder="Plataforma (ej: Discord)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? editForm.url || "" : form.url} onChange={(e) => editing ? setEditForm({ ...editForm, url: e.target.value }) : setForm({ ...form, url: e.target.value })} placeholder="URL" className="col-span-2 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? editForm.description || "" : form.description} onChange={(e) => editing ? setEditForm({ ...editForm, description: e.target.value }) : setForm({ ...form, description: e.target.value })} placeholder="Descripción" className="col-span-2 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? editForm.purpose || "" : form.purpose} onChange={(e) => editing ? setEditForm({ ...editForm, purpose: e.target.value }) : setForm({ ...form, purpose: e.target.value })} placeholder="Propósito" className="col-span-2 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={editing ? editForm.member_count || 0 : form.member_count} onChange={(e) => editing ? setEditForm({ ...editForm, member_count: Number(e.target.value) }) : setForm({ ...form, member_count: Number(e.target.value) })} placeholder="Miembros" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
              <input type="number" value={editing ? editForm.active_users || 0 : form.active_users} onChange={(e) => editing ? setEditForm({ ...editForm, active_users: Number(e.target.value) }) : setForm({ ...form, active_users: Number(e.target.value) })} placeholder="Activos" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            </div>
            <input value={editing ? editForm.goal || "" : form.goal} onChange={(e) => editing ? setEditForm({ ...editForm, goal: e.target.value }) : setForm({ ...form, goal: e.target.value })} placeholder="Objetivo" className="col-span-2 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
          <div className="flex justify-between mt-3">
            {editing && (
              <button type="button" onClick={() => { deleteCommunity(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger">
                <Trash2 size={12} /> Eliminar
              </button>
            )}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">
              {editing ? "GUARDAR" : "CREAR"}
            </button>
          </div>
        </form>
      )}

      {communities.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg">
          <p className="text-sm text-muted">Todavía no tienes comunidades.</p>
          <p className="text-xs text-faint mt-1">Agrega las comunidades donde construyes relaciones con tu audiencia.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {communities.map((c) => (
            <div key={c.id} onClick={() => startEdit(c)} className="flex items-center justify-between bg-panelRaised border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors group">
              <div>
                <p className="text-sm text-ink">{c.name}</p>
                <p className="text-xs text-faint">{c.platform}{c.purpose ? ` · ${c.purpose}` : ""}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="font-hud">{c.member_count} miembros</span>
                {c.active_users > 0 && <span className="font-hud">{c.active_users} activos</span>}
                <span className={`w-1.5 h-1.5 rounded-full ${c.status === "activo" ? "bg-done" : "bg-faint"}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
