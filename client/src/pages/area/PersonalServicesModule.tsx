import { useState, type FormEvent } from "react";
import { Plus, X, Trash2, Star } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Service, Skill } from "../../types";

export function PersonalServicesModule({ areaId }: { areaId: string }) {
  const { services, skills, addService, updateService, deleteService } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [f, setF] = useState<Record<string, any>>({ name: "", description: "", category: "", price_min: 0, price_max: 0, currency: "USD", time_estimate: "", featured: false, skills: [] });
  const [ef, setEf] = useState<Record<string, any>>({});

  const resetF = () => setF({ name: "", description: "", category: "", price_min: 0, price_max: 0, currency: "USD", time_estimate: "", featured: false, skills: [] });

  const handleCreate = async (e: FormEvent) => { e.preventDefault(); if (!f.name.trim()) return; await addService({ ...f, area_id: areaId }); resetF(); setCreating(false); };
  const handleUpdate = async (e: FormEvent) => { e.preventDefault(); if (!editing) return; await updateService(editing.id, ef); setEditing(null); };
  const startEdit = (s: Service) => { setEditing(s); setEf({ name: s.name, description: s.description, category: s.category, price_min: s.price_min, price_max: s.price_max, currency: s.currency, time_estimate: s.time_estimate, featured: !!s.featured, skills: s.skills || [] }); };

  const areaServices = services.filter((s) => s.area_id === areaId);
  const featured = areaServices.filter((s) => s.featured);
  const areaSkills = skills.filter((s) => s.area_id === areaId);
  const skillById = Object.fromEntries(areaSkills.map((s) => [s.id, s]));

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2"><div><h1 className="text-xl font-semibold text-ink">💼 Servicios</h1><p className="text-sm text-muted">Qué puedes vender y qué habilidades lo respaldan.</p></div><button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"><Plus size={14} /> SERVICIO</button></div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 mt-4 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3"><span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR" : "NUEVO SERVICIO"}</span><button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button></div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={editing ? ef.name || "" : f.name} onChange={(e) => editing ? setEf({ ...ef, name: e.target.value }) : setF({ ...f, name: e.target.value })} placeholder="Nombre *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
              <input value={editing ? ef.category || "" : f.category} onChange={(e) => editing ? setEf({ ...ef, category: e.target.value }) : setF({ ...f, category: e.target.value })} placeholder="Categoría" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            </div>
            <textarea value={editing ? ef.description || "" : f.description} onChange={(e) => editing ? setEf({ ...ef, description: e.target.value }) : setF({ ...f, description: e.target.value })} placeholder="Descripción" rows={2} className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none" />
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-[10px] font-hud text-faint tracking-widest">PRECIO MIN</label><input type="number" value={editing ? ef.price_min || 0 : f.price_min} onChange={(e) => editing ? setEf({ ...ef, price_min: Number(e.target.value) }) : setF({ ...f, price_min: Number(e.target.value) })} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" /></div>
              <div><label className="text-[10px] font-hud text-faint tracking-widest">PRECIO MAX</label><input type="number" value={editing ? ef.price_max || 0 : f.price_max} onChange={(e) => editing ? setEf({ ...ef, price_max: Number(e.target.value) }) : setF({ ...f, price_max: Number(e.target.value) })} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" /></div>
              <div><label className="text-[10px] font-hud text-faint tracking-widest">MONEDA</label><select value={editing ? ef.currency || "USD" : f.currency} onChange={(e) => editing ? setEf({ ...ef, currency: e.target.value }) : setF({ ...f, currency: e.target.value })} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"><option value="USD">USD</option><option value="CLP">CLP</option><option value="EUR">EUR</option></select></div>
            </div>
            <input value={editing ? ef.time_estimate || "" : f.time_estimate} onChange={(e) => editing ? setEf({ ...ef, time_estimate: e.target.value }) : setF({ ...f, time_estimate: e.target.value })} placeholder="Tiempo estimado (ej: 2 semanas)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />

            {areaSkills.length > 0 && (
              <div>
                <label className="text-[10px] font-hud text-faint tracking-widest">HABILIDADES RELACIONADAS</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {areaSkills.map((s) => {
                    const selected = (editing ? ef.skills || [] : f.skills || []) as string[];
                    return (
                      <button key={s.id} type="button" onClick={() => editing ? setEf({ ...ef, skills: selected.includes(s.id) ? selected.filter((id: string) => id !== s.id) : [...selected, s.id] }) : setF({ ...f, skills: selected.includes(s.id) ? selected.filter((id: string) => id !== s.id) : [...selected, s.id] })} className={`text-xs px-2 py-1 rounded-md border ${selected.includes(s.id) ? "border-signal/40 bg-signal/10 text-signal" : "border-border text-muted hover:text-ink"}`}>{s.name}</button>
                    );
                  })}
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer"><input type="checkbox" checked={editing ? !!ef.featured : !!f.featured} onChange={(e) => editing ? setEf({ ...ef, featured: e.target.checked }) : setF({ ...f, featured: e.target.checked })} /> ⭐ Servicio Destacado</label>
          </div>
          <div className="flex justify-between mt-3">
            {editing && <button type="button" onClick={() => { deleteService(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger"><Trash2 size={12} /> Eliminar</button>}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">{editing ? "GUARDAR" : "CREAR"}</button>
          </div>
        </form>
      )}

      {areaServices.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg mt-4"><p className="text-sm text-muted">No hay servicios definidos.</p><p className="text-xs text-faint mt-1">Define los servicios que puedes vender profesionalmente.</p></div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {featured.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {featured.map((s) => <ServiceCard key={s.id} service={s} skills={areaSkills} onClick={() => startEdit(s)} />)}
            </div>
          )}
          {areaServices.filter((s) => !s.featured).length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {areaServices.filter((s) => !s.featured).map((s) => <ServiceCard key={s.id} service={s} skills={areaSkills} onClick={() => startEdit(s)} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ service, skills, onClick }: { service: Service; skills: Skill[]; onClick: () => void }) {
  const skillById = Object.fromEntries(skills.map((s) => [s.id, s]));
  const serviceSkills = (service.skills || []).map((sid) => skillById[sid]).filter(Boolean);
  const priceStr = service.price_min > 0 ? `${service.currency === "CLP" ? "$" : "$"}${service.price_min.toLocaleString()}${service.price_max > service.price_min ? ` - ${service.price_max.toLocaleString()}` : ""}` : "Sin precio";

  return (
    <div onClick={onClick} className="bg-panel border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors group">
      <p className="text-sm text-ink font-medium">{service.featured ? "⭐ " : ""}{service.name}</p>
      {service.description && <p className="text-xs text-muted mt-0.5 line-clamp-1">{service.description}</p>}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-signal font-hud">{priceStr} {service.currency}</span>
        {service.time_estimate && <span className="text-[10px] text-faint">{service.time_estimate}</span>}
      </div>
      {serviceSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {serviceSkills.map((s) => <span key={s.id} className="text-[10px] px-1.5 py-0.5 rounded bg-panelRaised text-faint">{s.name}</span>)}
        </div>
      )}
    </div>
  );
}
