import { useState, type FormEvent } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Client } from "../../types";

export function CompanyClientsModule({ areaId }: { areaId: string }) {
  const { clients, addClient, updateClient, deleteClient } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [f, setF] = useState<Record<string, any>>({ name: "", company: "", contact_name: "", email: "", phone: "", whatsapp: "", linkedin: "", location: "", source: "", notes: "" });
  const [ef, setEf] = useState<Record<string, any>>({});

  const resetF = () => setF({ name: "", company: "", contact_name: "", email: "", phone: "", whatsapp: "", linkedin: "", location: "", source: "", notes: "" });

  const handleCreate = async (e: FormEvent) => { e.preventDefault(); if (!f.name.trim()) return; await addClient({ ...f, area_id: areaId }); resetF(); setCreating(false); };
  const handleUpdate = async (e: FormEvent) => { e.preventDefault(); if (!editing) return; await updateClient(editing.id, ef); setEditing(null); };
  const startEdit = (c: Client) => { setEditing(c); setEf({ name: c.name, company: c.company, contact_name: c.contact_name, email: c.email, phone: c.phone, whatsapp: c.whatsapp, linkedin: c.linkedin, location: c.location, source: c.source, notes: c.notes }); };

  const areaClients = clients.filter((c) => c.area_id === areaId);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2"><div><h1 className="text-xl font-semibold text-ink">👥 Clientes</h1><p className="text-sm text-muted">Registro de clientes de la empresa.</p></div><button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"><Plus size={14} /> CLIENTE</button></div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 mt-4 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3"><span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR" : "NUEVO CLIENTE"}</span><button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button></div>
          <div className="grid grid-cols-2 gap-3">
            <input value={editing ? ef.name || "" : f.name} onChange={(e) => editing ? setEf({ ...ef, name: e.target.value }) : setF({ ...f, name: e.target.value })} placeholder="Nombre / Empresa *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
            <input value={editing ? ef.contact_name || "" : f.contact_name} onChange={(e) => editing ? setEf({ ...ef, contact_name: e.target.value }) : setF({ ...f, contact_name: e.target.value })} placeholder="Persona de contacto" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? ef.email || "" : f.email} onChange={(e) => editing ? setEf({ ...ef, email: e.target.value }) : setF({ ...f, email: e.target.value })} placeholder="Email" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? ef.phone || "" : f.phone} onChange={(e) => editing ? setEf({ ...ef, phone: e.target.value }) : setF({ ...f, phone: e.target.value })} placeholder="Teléfono" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? ef.whatsapp || "" : f.whatsapp} onChange={(e) => editing ? setEf({ ...ef, whatsapp: e.target.value }) : setF({ ...f, whatsapp: e.target.value })} placeholder="WhatsApp" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? ef.linkedin || "" : f.linkedin} onChange={(e) => editing ? setEf({ ...ef, linkedin: e.target.value }) : setF({ ...f, linkedin: e.target.value })} placeholder="LinkedIn" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? ef.location || "" : f.location} onChange={(e) => editing ? setEf({ ...ef, location: e.target.value }) : setF({ ...f, location: e.target.value })} placeholder="Ubicación" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? ef.source || "" : f.source} onChange={(e) => editing ? setEf({ ...ef, source: e.target.value }) : setF({ ...f, source: e.target.value })} placeholder="Fuente (Fiverr, LinkedIn...)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
          <textarea value={editing ? ef.notes || "" : f.notes} onChange={(e) => editing ? setEf({ ...ef, notes: e.target.value }) : setF({ ...f, notes: e.target.value })} placeholder="Notas" rows={2} className="mt-3 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none w-full" />
          <div className="flex justify-between mt-3">
            {editing && <button type="button" onClick={() => { deleteClient(editing.id); setEditing(null); }} className="text-xs text-faint hover:text-danger"><Trash2 size={12} /> Eliminar</button>}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">{editing ? "GUARDAR" : "CREAR"}</button>
          </div>
        </form>
      )}

      {areaClients.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg mt-4"><p className="text-sm text-muted">No hay clientes registrados.</p><p className="text-xs text-faint mt-1">Registra clientes para hacer seguimiento.</p></div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {areaClients.map((c) => (
            <div key={c.id} onClick={() => startEdit(c)} className="bg-panel border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors">
              <p className="text-sm text-ink font-medium">{c.name}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {c.contact_name && <span className="text-xs text-muted">{c.contact_name}</span>}
                {c.source && <span className="text-[10px] font-hud text-faint">{c.source}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                {c.email && <span>{c.email}</span>}
                {c.phone && <span>{c.phone}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
