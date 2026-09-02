import { useState, type FormEvent } from "react";
import { Plus, X, Trash2, ExternalLink } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Platform } from "../../types";

export function PersonalPresenceModule({ areaId }: { areaId: string }) {
  const { platforms, addPlatform, updatePlatform, deletePlatform } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Platform | null>(null);
  const [f, setF] = useState({ name: "", icon: "", url: "", handle: "", description: "" });
  const [ef, setEf] = useState<Partial<Platform>>({});

  const resetF = () => setF({ name: "", icon: "", url: "", handle: "", description: "" });

  const handleCreate = async (e: FormEvent) => { e.preventDefault(); if (!f.name.trim()) return; await addPlatform({ ...f, area_id: areaId, type: "professional" }); resetF(); setCreating(false); };
  const handleUpdate = async (e: FormEvent) => { e.preventDefault(); if (!editing) return; await updatePlatform(editing.id, ef); setEditing(null); };
  const startEdit = (p: Platform) => { setEditing(p); setEf({ name: p.name, icon: p.icon, url: p.url, handle: p.handle, description: p.description }); };

  const areaPlatforms = platforms.filter((p) => p.area_id === areaId);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2"><div><h1 className="text-xl font-semibold text-ink">🌐 Presencia Digital</h1><p className="text-sm text-muted">Dónde existe tu identidad profesional.</p></div><button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"><Plus size={14} /> PLATAFORMA</button></div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 mt-4 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3"><span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR" : "NUEVA PLATAFORMA"}</span><button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button></div>
          <div className="grid grid-cols-2 gap-3">
            <input value={editing ? ef.name || "" : f.name} onChange={(e) => editing ? setEf({ ...ef, name: e.target.value }) : setF({ ...f, name: e.target.value })} placeholder="Nombre (ej: GitHub) *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
            <input value={editing ? ef.url || "" : f.url} onChange={(e) => editing ? setEf({ ...ef, url: e.target.value }) : setF({ ...f, url: e.target.value })} placeholder="URL" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? ef.handle || "" : f.handle} onChange={(e) => editing ? setEf({ ...ef, handle: e.target.value }) : setF({ ...f, handle: e.target.value })} placeholder="Handle / Usuario" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? ef.icon || "" : f.icon} onChange={(e) => editing ? setEf({ ...ef, icon: e.target.value }) : setF({ ...f, icon: e.target.value })} placeholder="Icono (emoji)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? ef.description || "" : f.description} onChange={(e) => editing ? setEf({ ...ef, description: e.target.value }) : setF({ ...f, description: e.target.value })} placeholder="Descripción" className="col-span-2 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
          <div className="flex justify-between mt-3">
            {editing && <button type="button" onClick={() => { deletePlatform(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger"><Trash2 size={12} /> Eliminar</button>}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">{editing ? "GUARDAR" : "CREAR"}</button>
          </div>
        </form>
      )}

      {areaPlatforms.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg mt-4"><p className="text-sm text-muted">No hay plataformas registradas.</p><p className="text-xs text-faint mt-1">Agrega las plataformas donde tienes presencia profesional.</p></div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {areaPlatforms.map((p) => (
            <div key={p.id} onClick={() => startEdit(p)} className="bg-panel border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors group">
              <div className="flex items-center gap-2 mb-1">
                <span>{p.icon || "🔗"}</span>
                <span className="text-sm text-ink font-medium">{p.name}</span>
              </div>
              {p.handle && <p className="text-xs text-muted">@{p.handle}</p>}
              {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-info hover:underline flex items-center gap-1 mt-1"><ExternalLink size={10} /> {p.url}</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
