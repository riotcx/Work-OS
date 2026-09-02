import { useState, type FormEvent } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Opportunity, OppStatus } from "../../types";
import { OPP_STATUS_LABELS, OPP_STATUS_ORDER } from "../../types";

export function PersonalOpportunitiesModule({ areaId }: { areaId: string }) {
  const { opportunities, addOpportunity, updateOpportunity, deleteOpportunity } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [f, setF] = useState<Record<string, any>>({ name: "", company: "", type: "", source: "", value: 0, currency: "USD", status: "nueva", next_action: "", notes: "" });
  const [ef, setEf] = useState<Record<string, any>>({});

  const resetF = () => setF({ name: "", company: "", type: "", source: "", value: 0, currency: "USD", status: "nueva", next_action: "", notes: "" });

  const handleCreate = async (e: FormEvent) => { e.preventDefault(); if (!f.name.trim()) return; await addOpportunity({ ...f, area_id: areaId }); resetF(); setCreating(false); };
  const handleUpdate = async (e: FormEvent) => { e.preventDefault(); if (!editing) return; await updateOpportunity(editing.id, ef); setEditing(null); };
  const startEdit = (o: Opportunity) => { setEditing(o); setEf({ name: o.name, company: o.company, type: o.type, source: o.source, value: o.value, currency: o.currency, status: o.status, next_action: o.next_action, notes: o.notes }); };

  const areaOpps = opportunities.filter((o) => o.area_id === areaId);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2"><div><h1 className="text-xl font-semibold text-ink">🎯 Oportunidades</h1><p className="text-sm text-muted">Pipeline de oportunidades profesionales.</p></div><button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"><Plus size={14} /> NUEVA</button></div>

      <div className="flex gap-2 mb-4 mt-4">
        {OPP_STATUS_ORDER.map((s) => {
          const count = areaOpps.filter((o) => o.status === s).length;
          return (
            <span key={s} className="text-[10px] font-hud text-faint tracking-widest">{OPP_STATUS_LABELS[s].toUpperCase()} {count}</span>
          );
        })}
      </div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3"><span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR" : "NUEVA OPORTUNIDAD"}</span><button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button></div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={editing ? ef.name || "" : f.name} onChange={(e) => editing ? setEf({ ...ef, name: e.target.value }) : setF({ ...f, name: e.target.value })} placeholder="Nombre / Título *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
              <input value={editing ? ef.company || "" : f.company} onChange={(e) => editing ? setEf({ ...ef, company: e.target.value }) : setF({ ...f, company: e.target.value })} placeholder="Empresa / Persona" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input value={editing ? ef.type || "" : f.type} onChange={(e) => editing ? setEf({ ...ef, type: e.target.value }) : setF({ ...f, type: e.target.value })} placeholder="Tipo (freelance, consultoría...)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
              <input value={editing ? ef.source || "" : f.source} onChange={(e) => editing ? setEf({ ...ef, source: e.target.value }) : setF({ ...f, source: e.target.value })} placeholder="Fuente (Fiverr, LinkedIn...)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
              <div className="flex gap-2">
                <input type="number" value={editing ? ef.value || 0 : f.value} onChange={(e) => editing ? setEf({ ...ef, value: Number(e.target.value) }) : setF({ ...f, value: Number(e.target.value) })} placeholder="Valor" className="flex-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
                <select value={editing ? ef.currency || "USD" : f.currency} onChange={(e) => editing ? setEf({ ...ef, currency: e.target.value }) : setF({ ...f, currency: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"><option value="USD">USD</option><option value="CLP">CLP</option></select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={editing ? ef.status || "nueva" : f.status} onChange={(e) => editing ? setEf({ ...ef, status: e.target.value }) : setF({ ...f, status: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50">
                {OPP_STATUS_ORDER.map((s) => <option key={s} value={s}>{OPP_STATUS_LABELS[s]}</option>)}
              </select>
              <input value={editing ? ef.next_action || "" : f.next_action} onChange={(e) => editing ? setEf({ ...ef, next_action: e.target.value }) : setF({ ...f, next_action: e.target.value })} placeholder="Próxima acción" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            </div>
            <textarea value={editing ? ef.notes || "" : f.notes} onChange={(e) => editing ? setEf({ ...ef, notes: e.target.value }) : setF({ ...f, notes: e.target.value })} placeholder="Notas" rows={2} className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none" />
          </div>
          <div className="flex justify-between mt-3">
            {editing && <button type="button" onClick={() => { deleteOpportunity(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger"><Trash2 size={12} /> Eliminar</button>}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">{editing ? "GUARDAR" : "CREAR"}</button>
          </div>
        </form>
      )}

      {areaOpps.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg mt-4"><p className="text-sm text-muted">No hay oportunidades registradas.</p><p className="text-xs text-faint mt-1">Registra oportunidades profesionales para hacer seguimiento.</p></div>
      ) : (
        <div className="mt-4">
          {OPP_STATUS_ORDER.map((status) => {
            const items = areaOpps.filter((o) => o.status === status);
            if (items.length === 0) return null;
            return (
              <div key={status} className="mb-6">
                <h2 className="font-hud text-[10px] text-faint tracking-widest mb-2">{OPP_STATUS_LABELS[status].toUpperCase()} ({items.length})</h2>
                <div className="flex flex-col gap-2">
                  {items.map((o) => (
                    <div key={o.id} onClick={() => startEdit(o)} className="bg-panelRaised border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors group">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-ink">{o.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {o.company && <span className="text-xs text-muted">{o.company}</span>}
                            {o.value > 0 && <span className="text-xs text-signal font-hud">{o.currency === "CLP" ? "$" : "$"}{o.value.toLocaleString()}</span>}
                          </div>
                        </div>
                        {o.next_action && <span className="text-[10px] text-faint line-clamp-1 max-w-[120px]">{o.next_action}</span>}
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
