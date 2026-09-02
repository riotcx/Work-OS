import { useState, type FormEvent } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Metric } from "../../types";

interface Props { areaId: string; metrics: Metric[]; }

const CATEGORIES = ["adquisicion", "conexion", "producto", "conversion"];

export function AnalyticsModule({ areaId, metrics }: Props) {
  const { addMetric, updateMetric, deleteMetric } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Metric | null>(null);
  const [form, setForm] = useState({ name: "", value: 0, unit: "", category: "adquisicion" });
  const [editForm, setEditForm] = useState<Partial<Metric>>({});
  const [catFilter, setCatFilter] = useState<string>("todas");

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addMetric({ ...form, area_id: areaId });
    setForm({ name: "", value: 0, unit: "", category: "adquisicion" });
    setCreating(false);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updateMetric(editing.id, editForm);
    setEditing(null);
  };

  const startEdit = (m: Metric) => {
    setEditing(m);
    setEditForm({ name: m.name, value: m.value, unit: m.unit, category: m.category });
  };

  const filtered = catFilter === "todas" ? metrics : metrics.filter((m) => m.category === catFilter);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-ink">📊 Analytics</h1>
          <p className="text-sm text-muted">¿Qué está funcionando realmente?</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs tracking-wide px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25">
          <Plus size={14} /> MÉTRICA
        </button>
      </div>

      <div className="flex gap-2 mb-4 mt-4">
        {(["todas", ...CATEGORIES] as const).map((c) => (
          <button key={c} onClick={() => setCatFilter(c)} className={`text-xs px-3 py-1 rounded-md capitalize border transition-colors ${catFilter === c ? "border-signal/40 bg-signal/10 text-signal" : "border-border text-muted hover:text-ink"}`}>
            {c === "todas" ? "Todas" : c}
          </button>
        ))}
      </div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR MÉTRICA" : "NUEVA MÉTRICA"}</span>
            <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={editing ? editForm.name || "" : form.name} onChange={(e) => editing ? setEditForm({ ...editForm, name: e.target.value }) : setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus />
            <input type="number" value={editing ? editForm.value || 0 : form.value} onChange={(e) => editing ? setEditForm({ ...editForm, value: Number(e.target.value) }) : setForm({ ...form, value: Number(e.target.value) })} placeholder="Valor" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <input value={editing ? editForm.unit || "" : form.unit} onChange={(e) => editing ? setEditForm({ ...editForm, unit: e.target.value }) : setForm({ ...form, unit: e.target.value })} placeholder="Unidad (%, K, etc.)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            <select value={editing ? editForm.category || "adquisicion" : form.category} onChange={(e) => editing ? setEditForm({ ...editForm, category: e.target.value }) : setForm({ ...form, category: e.target.value })} className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex justify-between mt-3">
            {editing && (
              <button type="button" onClick={() => { deleteMetric(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger">
                <Trash2 size={12} /> Eliminar
              </button>
            )}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">
              {editing ? "GUARDAR" : "CREAR"}
            </button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg">
          <p className="text-sm text-muted">No hay métricas registradas.</p>
          <p className="text-xs text-faint mt-1">Agrega métricas manualmente para medir tu progreso.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((m) => (
            <div key={m.id} onClick={() => startEdit(m)} className="flex items-center justify-between bg-panelRaised border border-border rounded-lg px-4 py-3 hover:border-borderLight cursor-pointer transition-colors">
              <div>
                <p className="text-sm text-ink">{m.name}</p>
                <p className="text-xs text-faint capitalize">{m.category}{m.platform_id ? " · plataforma" : ""}</p>
              </div>
              <span className="text-sm font-semibold text-signal font-hud">
                {m.value.toLocaleString()}{m.unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
