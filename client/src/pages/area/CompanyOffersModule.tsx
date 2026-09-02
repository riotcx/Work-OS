import { useState, type FormEvent } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Offer } from "../../types";

export function CompanyOffersModule({ areaId }: { areaId: string }) {
  const { offers, services, addOffer, updateOffer, deleteOffer } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [f, setF] = useState<Record<string, any>>({ name: "", description: "", service_id: "", price_min: 0, price_max: 0, currency: "CLP", delivery_time: "", featured: false, items: [] as { name: string }[] });
  const [ef, setEf] = useState<Record<string, any>>({});

  const resetF = () => setF({ name: "", description: "", service_id: "", price_min: 0, price_max: 0, currency: "CLP", delivery_time: "", featured: false, items: [] });

  const handleCreate = async (e: FormEvent) => { e.preventDefault(); if (!f.name.trim()) return; await addOffer({ ...f, area_id: areaId }); resetF(); setCreating(false); };
  const handleUpdate = async (e: FormEvent) => { e.preventDefault(); if (!editing) return; await updateOffer(editing.id, ef); setEditing(null); };
  const startEdit = (o: Offer) => { setEditing(o); setEf({ name: o.name, description: o.description, service_id: o.service_id || "", price_min: o.price_min, price_max: o.price_max, currency: o.currency, delivery_time: o.delivery_time, featured: !!o.featured, items: o.items || [] }); };

  const addItem = () => {
    const items = editing ? [...(ef.items || [])] : [...f.items];
    items.push({ name: "" });
    editing ? setEf({ ...ef, items }) : setF({ ...f, items });
  };

  const updateItem = (idx: number, name: string) => {
    const items = editing ? [...(ef.items || [])] : [...f.items];
    items[idx] = { ...items[idx], name };
    editing ? setEf({ ...ef, items }) : setF({ ...f, items });
  };

  const removeItem = (idx: number) => {
    const items = editing ? [...(ef.items || [])] : [...f.items];
    items.splice(idx, 1);
    editing ? setEf({ ...ef, items }) : setF({ ...f, items });
  };

  const areaServices = services.filter((s) => s.area_id === areaId);
  const featuredOffers = offers.filter((o) => o.featured);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2"><div><h1 className="text-xl font-semibold text-ink">💼 Ofertas</h1><p className="text-sm text-muted">Cómo empaquetas y vendes tus servicios.</p></div><button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"><Plus size={14} /> OFERTA</button></div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 mt-4 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3"><span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR" : "NUEVA OFERTA"}</span><button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button></div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={editing ? ef.name || "" : f.name} onChange={(e) => editing ? setEf({ ...ef, name: e.target.value }) : setF({ ...f, name: e.target.value })} placeholder="Nombre (ej: Landing Profesional) *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
              {areaServices.length > 0 && (
                <select value={editing ? ef.service_id || "" : f.service_id} onChange={(e) => editing ? setEf({ ...ef, service_id: e.target.value }) : setF({ ...f, service_id: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50">
                  <option value="">Sin servicio asociado</option>
                  {areaServices.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </div>
            <textarea value={editing ? ef.description || "" : f.description} onChange={(e) => editing ? setEf({ ...ef, description: e.target.value }) : setF({ ...f, description: e.target.value })} placeholder="Descripción" rows={2} className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none" />
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-[10px] font-hud text-faint tracking-widest">PRECIO</label><input type="number" value={editing ? ef.price_min || 0 : f.price_min} onChange={(e) => editing ? setEf({ ...ef, price_min: Number(e.target.value) }) : setF({ ...f, price_min: Number(e.target.value) })} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" /></div>
              <div><label className="text-[10px] font-hud text-faint tracking-widest">MONEDA</label><select value={editing ? ef.currency || "CLP" : f.currency} onChange={(e) => editing ? setEf({ ...ef, currency: e.target.value }) : setF({ ...f, currency: e.target.value })} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"><option value="CLP">CLP</option><option value="USD">USD</option></select></div>
              <div><label className="text-[10px] font-hud text-faint tracking-widest">TIEMPO</label><input value={editing ? ef.delivery_time || "" : f.delivery_time} onChange={(e) => editing ? setEf({ ...ef, delivery_time: e.target.value }) : setF({ ...f, delivery_time: e.target.value })} placeholder="3 días" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" /></div>
            </div>

            <div>
              <label className="text-[10px] font-hud text-faint tracking-widest">INCLUYE</label>
              <div className="flex flex-col gap-1.5 mt-1">
                {(editing ? (ef.items || []) : f.items).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-done">✓</span>
                    <input value={item.name} onChange={(e) => updateItem(idx, e.target.value)} placeholder="Elemento incluido" className="flex-1 bg-panelRaised border border-border rounded-md px-3 py-1 text-xs text-ink outline-none focus:border-signal/50" />
                    <button type="button" onClick={() => removeItem(idx)} className="text-faint hover:text-danger"><Trash2 size={12} /></button>
                  </div>
                ))}
                <button type="button" onClick={addItem} className="text-xs text-signal font-hud hover:underline self-start mt-1">+ Agregar elemento</button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer"><input type="checkbox" checked={editing ? !!ef.featured : !!f.featured} onChange={(e) => editing ? setEf({ ...ef, featured: e.target.checked }) : setF({ ...f, featured: e.target.checked })} /> 🚀 Oferta Destacada</label>
          </div>
          <div className="flex justify-between mt-3">
            {editing && <button type="button" onClick={() => { deleteOffer(editing.id); setEditing(null); }} className="text-xs text-faint hover:text-danger"><Trash2 size={12} /> Eliminar</button>}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">{editing ? "GUARDAR" : "CREAR"}</button>
          </div>
        </form>
      )}

      {offers.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg mt-4"><p className="text-sm text-muted">No hay ofertas creadas.</p><p className="text-xs text-faint mt-1">Crea ofertas para definir qué vende tu empresa.</p></div>
      ) : (
        <div className="mt-4">
          {featuredOffers.length > 0 && <div className="grid grid-cols-2 gap-3 mb-6">{featuredOffers.map((o) => <OfferCard key={o.id} offer={o} onClick={() => startEdit(o)} />)}</div>}
          {offers.filter((o) => !o.featured).length > 0 && <div className="grid grid-cols-2 gap-3">{offers.filter((o) => !o.featured).map((o) => <OfferCard key={o.id} offer={o} onClick={() => startEdit(o)} />)}</div>}
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer, onClick }: { offer: Offer; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-panel border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors group">
      <p className="text-sm text-ink font-medium">{offer.featured ? "🚀 " : ""}{offer.name}</p>
      {offer.description && <p className="text-xs text-muted mt-0.5 line-clamp-1">{offer.description}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-signal font-hud">{offer.currency === "CLP" ? "$" : "$"}{offer.price_min > 0 ? offer.price_min.toLocaleString() : "—"} {offer.currency}</span>
        {offer.delivery_time && <span className="text-[10px] text-faint">{offer.delivery_time}</span>}
      </div>
      {offer.items && offer.items.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {offer.items.slice(0, 3).map((item) => <span key={item.id} className="text-[10px] px-1.5 py-0.5 rounded bg-panelRaised text-faint">✓ {item.name}</span>)}
          {offer.items.length > 3 && <span className="text-[10px] text-faint">+{offer.items.length - 3}</span>}
        </div>
      )}
    </div>
  );
}
