import { useState, type FormEvent } from "react";
import { Plus, X, Trash2, ExternalLink } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Platform } from "../../types";

interface Props { areaId: string; platforms: Platform[]; }

export function AcquisitionModule({ areaId, platforms }: Props) {
  const { addPlatform, updatePlatform, deletePlatform } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Platform | null>(null);
  const [form, setForm] = useState({ name: "", icon: "", url: "", handle: "", description: "", purpose: "", type: "social", followers: 0, reach: 0, priority: "P2" });
  const [editForm, setEditForm] = useState<Partial<Platform>>({});

  const resetForm = () => setForm({ name: "", icon: "", url: "", handle: "", description: "", purpose: "", type: "social", followers: 0, reach: 0, priority: "P2" });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addPlatform({ ...form, area_id: areaId, status: "activo" });
    resetForm();
    setCreating(false);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updatePlatform(editing.id, editForm);
    setEditing(null);
  };

  const startEdit = (p: Platform) => {
    setEditing(p);
    setEditForm({ name: p.name, icon: p.icon, url: p.url, handle: p.handle, description: p.description, purpose: p.purpose, type: p.type, followers: p.followers, reach: p.reach, priority: p.priority });
  };

  const activeCount = platforms.filter((p) => p.status === "activo").length;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-ink">📡 Adquisición</h1>
          <p className="text-sm text-muted">¿Dónde estoy consiguiendo alcance y atención?</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs tracking-wide px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25">
          <Plus size={14} /> NUEVA
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6 mt-4">
        {[{ label: "ACTIVAS", value: activeCount }, { label: "TOTAL", value: platforms.length }, { label: "ALCANCE", value: platforms.reduce((s, p) => s + (p.reach || 0), 0).toLocaleString() }, { label: "SEGUIDORES", value: platforms.reduce((s, p) => s + (p.followers || 0), 0).toLocaleString() }].map((s) => (
          <div key={s.label} className="bg-panel border border-border rounded-lg px-3 py-2 text-center">
            <div className="text-[10px] font-hud text-faint tracking-widest">{s.label}</div>
            <div className="text-sm font-semibold text-ink font-hud mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR PLATAFORMA" : "NUEVA PLATAFORMA"}</span>
            <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button>
          </div>
          <PlatformForm
            data={editing ? editForm : form}
            onChange={(d) => editing ? setEditForm({ ...editForm, ...d }) : setForm({ ...form, ...d })}
          />
          <div className="flex justify-between mt-3">
            {editing && (
              <button type="button" onClick={() => { deletePlatform(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger">
                <Trash2 size={12} /> Eliminar
              </button>
            )}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">
              {editing ? "GUARDAR" : "CREAR"}
            </button>
          </div>
        </form>
      )}

      {platforms.length === 0 ? (
        <EmptyState text="Todavía no tienes plataformas." action="Agrega las plataformas donde quieres construir alcance." />
      ) : (
        <div className="flex flex-col gap-2">
          {platforms.map((p) => (
            <div key={p.id} onClick={() => startEdit(p)} className="flex items-center justify-between bg-panelRaised border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-lg">{p.icon || "🔗"}</span>
                <div>
                  <p className="text-sm text-ink">{p.name}</p>
                  <p className="text-xs text-faint">{p.purpose || p.description || p.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted">
                {p.followers > 0 && <span className="font-hud">{p.followers.toLocaleString()} seg.</span>}
                {p.reach > 0 && <span className="font-hud">{p.reach.toLocaleString()} alcance</span>}
                <span className={`w-1.5 h-1.5 rounded-full ${p.status === "activo" ? "bg-done" : "bg-faint"}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformForm({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <input value={data.name || ""} onChange={(e) => onChange({ name: e.target.value })} placeholder="Nombre *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
      <input value={data.icon || ""} onChange={(e) => onChange({ icon: e.target.value })} placeholder="Icono (emoji)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
      <input value={data.url || ""} onChange={(e) => onChange({ url: e.target.value })} placeholder="URL" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
      <input value={data.handle || ""} onChange={(e) => onChange({ handle: e.target.value })} placeholder="Handle / Usuario" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
      <input value={data.description || ""} onChange={(e) => onChange({ description: e.target.value })} placeholder="Descripción" className="col-span-2 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
      <input value={data.purpose || ""} onChange={(e) => onChange({ purpose: e.target.value })} placeholder="Objetivo de uso" className="col-span-2 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
      <div className="grid grid-cols-2 gap-3">
        <input type="number" value={data.followers || 0} onChange={(e) => onChange({ followers: Number(e.target.value) })} placeholder="Seguidores" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
        <input type="number" value={data.reach || 0} onChange={(e) => onChange({ reach: Number(e.target.value) })} placeholder="Alcance" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
      </div>
      <select value={data.priority || "P2"} onChange={(e) => onChange({ priority: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50">
        <option value="P1">P1</option><option value="P2">P2</option><option value="P3">P3</option>
      </select>
      <select value={data.type || "social"} onChange={(e) => onChange({ type: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50">
        <option value="social">Social</option><option value="blog">Blog</option><option value="video">Video</option><option value="newsletter">Newsletter</option><option value="other">Otro</option>
      </select>
    </div>
  );
}

function EmptyState({ text, action }: { text: string; action: string }) {
  return (
    <div className="text-center py-12 bg-panel border border-border rounded-lg">
      <p className="text-sm text-muted">{text}</p>
      <p className="text-xs text-faint mt-1">{action}</p>
    </div>
  );
}
