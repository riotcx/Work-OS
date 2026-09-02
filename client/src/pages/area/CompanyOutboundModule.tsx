import { useState, type FormEvent } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Opportunity, OppStatus } from "../../types";
import { OPP_STATUS_LABELS, OPP_STATUS_ORDER } from "../../types";

export function CompanyOutboundModule({ areaId }: { areaId: string }) {
  const { opportunities, platforms, addOpportunity, updateOpportunity, deleteOpportunity, addPlatform } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [f, setF] = useState<Record<string, any>>({ name: "", company: "", type: "", source: "", value: 0, currency: "CLP", status: "nueva", next_action: "", notes: "" });
  const [ef, setEf] = useState<Record<string, any>>({});
  const [channelName, setChannelName] = useState("");

  const resetF = () => setF({ name: "", company: "", type: "", source: "", value: 0, currency: "CLP", status: "nueva", next_action: "", notes: "" });

  const handleCreate = async (e: FormEvent) => { e.preventDefault(); if (!f.name.trim()) return; await addOpportunity({ ...f, area_id: areaId }); resetF(); setCreating(false); };
  const handleUpdate = async (e: FormEvent) => { e.preventDefault(); if (!editing) return; await updateOpportunity(editing.id, ef); setEditing(null); };
  const startEdit = (o: Opportunity) => { setEditing(o); setEf({ name: o.name, company: o.company, type: o.type, source: o.source, value: o.value, currency: o.currency, status: o.status, next_action: o.next_action, notes: o.notes }); };

  const handleAddChannel = async () => {
    if (!channelName.trim()) return;
    await addPlatform({ name: channelName.trim(), area_id: areaId, type: "outbound" });
    setChannelName("");
  };

  const areaOpps = opportunities.filter((o) => o.area_id === areaId);
  const areaChannels = platforms.filter((p) => p.area_id === areaId && p.type === "outbound");
  const totalValue = areaOpps.reduce((s, o) => s + (o.value || 0), 0);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-2"><div><h1 className="text-xl font-semibold text-ink">🎯 Outbound</h1><p className="text-sm text-muted">Máquina de prospección y adquisición de clientes.</p></div><button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"><Plus size={14} /> PROSPECTO</button></div>

      {/* Funnel Summary */}
      <div className="grid grid-cols-5 gap-2 mb-6 mt-4">
        {OPP_STATUS_ORDER.slice(0, 5).map((s) => {
          const count = areaOpps.filter((o) => o.status === s).length;
          return (
            <div key={s} className="bg-panel border border-border rounded-lg px-3 py-2 text-center">
              <div className="text-[10px] font-hud text-faint tracking-widest">{OPP_STATUS_LABELS[s].toUpperCase()}</div>
              <div className="text-lg font-semibold text-ink font-hud">{count}</div>
            </div>
          );
        })}
      </div>

      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-hud text-faint mr-2">CANALES:</span>
        {areaChannels.length === 0 ? (
          <span className="text-xs text-muted">Sin canales</span>
        ) : (
          areaChannels.map((ch) => <span key={ch.id} className="text-[11px] px-2 py-1 rounded bg-panelRaised border border-border text-muted">{ch.name}</span>)
        )}
        <input value={channelName} onChange={(e) => setChannelName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddChannel()} placeholder="+ canal" className="w-32 bg-panelRaised border border-border rounded-md px-2 py-1 text-xs text-ink outline-none focus:border-signal/50" />
      </div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3"><span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR" : "NUEVO PROSPECTO"}</span><button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button></div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={editing ? ef.name || "" : f.name} onChange={(e) => editing ? setEf({ ...ef, name: e.target.value }) : setF({ ...f, name: e.target.value })} placeholder="Nombre / Empresa *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
              <input value={editing ? ef.source || "" : f.source} onChange={(e) => editing ? setEf({ ...ef, source: e.target.value }) : setF({ ...f, source: e.target.value })} placeholder="Fuente (Fiverr, LinkedIn...)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select value={editing ? ef.status || "nueva" : f.status} onChange={(e) => editing ? setEf({ ...ef, status: e.target.value }) : setF({ ...f, status: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50">
                {OPP_STATUS_ORDER.map((s) => <option key={s} value={s}>{OPP_STATUS_LABELS[s]}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="number" value={editing ? ef.value || 0 : f.value} onChange={(e) => editing ? setEf({ ...ef, value: Number(e.target.value) }) : setF({ ...f, value: Number(e.target.value) })} placeholder="Valor" className="flex-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
                <select value={editing ? ef.currency || "CLP" : f.currency} onChange={(e) => editing ? setEf({ ...ef, currency: e.target.value }) : setF({ ...f, currency: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"><option value="CLP">CLP</option><option value="USD">USD</option></select>
              </div>
            </div>
            <input value={editing ? ef.next_action || "" : f.next_action} onChange={(e) => editing ? setEf({ ...ef, next_action: e.target.value }) : setF({ ...f, next_action: e.target.value })} placeholder="Próxima acción" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <textarea value={editing ? ef.notes || "" : f.notes} onChange={(e) => editing ? setEf({ ...ef, notes: e.target.value }) : setF({ ...f, notes: e.target.value })} placeholder="Notas" rows={2} className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none" />
          </div>
          <div className="flex justify-between mt-3">
            {editing && <button type="button" onClick={() => { deleteOpportunity(editing.id); setEditing(null); }} className="text-xs text-faint hover:text-danger"><Trash2 size={12} /> Eliminar</button>}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">{editing ? "GUARDAR" : "CREAR"}</button>
          </div>
        </form>
      )}

      {areaOpps.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg mt-4"><p className="text-sm text-muted">Pipeline vacío.</p><p className="text-xs text-faint mt-1">Agrega prospectos para comenzar tu pipeline outbound.</p></div>
      ) : (
        <div className="mt-4">
          {OPP_STATUS_ORDER.map((status) => {
            const items = areaOpps.filter((o) => o.status === status);
            if (items.length === 0) return null;
            return (
              <div key={status} className="mb-4">
                <h2 className="font-hud text-[10px] text-faint tracking-widest mb-2">{OPP_STATUS_LABELS[status].toUpperCase()} ({items.length})</h2>
                <div className="flex flex-col gap-2">
                  {items.map((o) => (
                    <div key={o.id} onClick={() => startEdit(o)} className="bg-panelRaised border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-ink">{o.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {o.source && <span className="text-xs text-muted">{o.source}</span>}
                            {o.value > 0 && <span className="text-xs text-signal font-hud">{o.currency === "CLP" ? "$" : "$"}{o.value.toLocaleString()}</span>}
                          </div>
                        </div>
                        {o.next_action && <span className="text-[10px] text-faint max-w-[140px] line-clamp-1">{o.next_action}</span>}
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
