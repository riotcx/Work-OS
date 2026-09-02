import { useState, type FormEvent } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Delivery } from "../../types";

const STATUSES = ["pendiente", "en_produccion", "revision", "entregado"] as const;
const STATUS_LABELS: Record<string, string> = { pendiente: "Pendiente", en_produccion: "En producción", revision: "Revisión", entregado: "Entregado" };

export function CompanyDeliveriesModule({ areaId }: { areaId: string }) {
  const { deliveries, clients, offers, projects, addDelivery, updateDelivery, deleteDelivery } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Delivery | null>(null);
  const [f, setF] = useState<Record<string, any>>({ name: "", client_id: "", offer_id: "", project_id: "", status: "pendiente", due_date: "", price: 0, currency: "CLP" });
  const [ef, setEf] = useState<Record<string, any>>({});

  const resetF = () => setF({ name: "", client_id: "", offer_id: "", project_id: "", status: "pendiente", due_date: "", price: 0, currency: "CLP" });

  const handleCreate = async (e: FormEvent) => { e.preventDefault(); if (!f.name.trim()) return; await addDelivery({ ...f, area_id: areaId }); resetF(); setCreating(false); };
  const handleUpdate = async (e: FormEvent) => { e.preventDefault(); if (!editing) return; await updateDelivery(editing.id, ef); setEditing(null); };
  const startEdit = (d: Delivery) => { setEditing(d); setEf({ name: d.name, client_id: d.client_id || "", offer_id: d.offer_id || "", project_id: d.project_id || "", status: d.status, due_date: d.due_date || "", price: d.price, currency: d.currency }); };

  const areaDeliveries = deliveries.filter((d) => d.area_id === areaId);
  const clientById = Object.fromEntries(clients.map((c) => [c.id, c]));
  const offerById = Object.fromEntries(offers.map((o) => [o.id, o]));
  const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2"><div><h1 className="text-xl font-semibold text-ink">📦 Entregas</h1><p className="text-sm text-muted">Seguimiento de trabajos vendidos.</p></div><button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"><Plus size={14} /> ENTREGA</button></div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 mt-4 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3"><span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR" : "NUEVA ENTREGA"}</span><button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button></div>
          <div className="flex flex-col gap-3">
            <input value={editing ? ef.name || "" : f.name} onChange={(e) => editing ? setEf({ ...ef, name: e.target.value }) : setF({ ...f, name: e.target.value })} placeholder="Nombre del trabajo *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
            <div className="grid grid-cols-2 gap-3">
              {clients.length > 0 && <select value={editing ? ef.client_id || "" : f.client_id} onChange={(e) => editing ? setEf({ ...ef, client_id: e.target.value }) : setF({ ...f, client_id: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"><option value="">Sin cliente</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
              {offers.length > 0 && <select value={editing ? ef.offer_id || "" : f.offer_id} onChange={(e) => editing ? setEf({ ...ef, offer_id: e.target.value }) : setF({ ...f, offer_id: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"><option value="">Sin oferta</option>{offers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select value={editing ? ef.status || "pendiente" : f.status} onChange={(e) => editing ? setEf({ ...ef, status: e.target.value }) : setF({ ...f, status: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50">
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <input type="date" value={editing ? ef.due_date || "" : f.due_date} onChange={(e) => editing ? setEf({ ...ef, due_date: e.target.value }) : setF({ ...f, due_date: e.target.value })} className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
              <div className="flex gap-2"><input type="number" value={editing ? ef.price || 0 : f.price} onChange={(e) => editing ? setEf({ ...ef, price: Number(e.target.value) }) : setF({ ...f, price: Number(e.target.value) })} placeholder="Precio" className="flex-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" /><select value={editing ? ef.currency || "CLP" : f.currency} onChange={(e) => editing ? setEf({ ...ef, currency: e.target.value }) : setF({ ...f, currency: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"><option value="CLP">CLP</option><option value="USD">USD</option></select></div>
            </div>
          </div>
          <div className="flex justify-between mt-3">
            {editing && <button type="button" onClick={() => { deleteDelivery(editing.id); setEditing(null); }} className="text-xs text-faint hover:text-danger"><Trash2 size={12} /> Eliminar</button>}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">{editing ? "GUARDAR" : "CREAR"}</button>
          </div>
        </form>
      )}

      {areaDeliveries.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg mt-4"><p className="text-sm text-muted">No hay entregas registradas.</p><p className="text-xs text-faint mt-1">Registra entregas para hacer seguimiento de trabajos.</p></div>
      ) : (
        <div className="mt-4">
          {STATUSES.map((status) => {
            const items = areaDeliveries.filter((d) => d.status === status);
            if (items.length === 0) return null;
            return (
              <div key={status} className="mb-6">
                <h2 className="font-hud text-[10px] text-faint tracking-widest mb-2">{STATUS_LABELS[status].toUpperCase()} ({items.length})</h2>
                <div className="flex flex-col gap-2">
                  {items.map((d) => (
                    <div key={d.id} onClick={() => startEdit(d)} className="bg-panelRaised border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-ink">{d.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {d.client_id && clientById[d.client_id] && <span className="text-xs text-muted">{clientById[d.client_id].name}</span>}
                            {d.offer_id && offerById[d.offer_id] && <span className="text-xs text-faint">{offerById[d.offer_id].name}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          {d.price > 0 && <span className="text-xs text-signal font-hud">{d.currency === "CLP" ? "$" : "$"}{d.price.toLocaleString()}</span>}
                          {d.due_date && <p className="text-[10px] text-faint">{d.due_date}</p>}
                        </div>
                      </div>
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
