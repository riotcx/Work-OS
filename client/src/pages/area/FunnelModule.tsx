import { useState, type FormEvent } from "react";
import { Plus, X, Trash2, ArrowDown } from "lucide-react";
import { useWorkOS } from "../../store";
import type { FunnelStage } from "../../types";

interface Props { areaId: string; stages: FunnelStage[]; }

export function FunnelModule({ areaId, stages }: Props) {
  const { addFunnelStage, updateFunnelStage, deleteFunnelStage, addFunnelEntry } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<FunnelStage | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editForm, setEditForm] = useState<Partial<FunnelStage>>({});
  const [entryValues, setEntryValues] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const maxOrder = stages.reduce((max, s) => Math.max(max, s.sort_order), 0);
    await addFunnelStage({ ...form, sort_order: maxOrder + 1, area_id: areaId });
    setForm({ name: "", description: "" });
    setCreating(false);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await updateFunnelStage(editing.id, editForm);
    setEditing(null);
  };

  const startEdit = (s: FunnelStage) => {
    setEditing(s);
    setEditForm({ name: s.name, description: s.description });
  };

  const handleUpdateValue = async (stageId: string) => {
    const value = entryValues[stageId];
    if (value === undefined || value < 0) return;
    setSaving((prev) => ({ ...prev, [stageId]: true }));
    try {
      await addFunnelEntry({ funnel_stage_id: stageId, value, area_id: areaId });
      setEntryValues((prev) => { const n = { ...prev }; delete n[stageId]; return n; });
    } finally {
      setSaving((prev) => ({ ...prev, [stageId]: false }));
    }
  };

  const getDefaultStages = () => {
    if (stages.length > 0) return stages;
    return [
      { name: "Adquisición", description: "Personas que descubren el producto" },
      { name: "Interés", description: "Personas interesadas" },
      { name: "Comunidad", description: "Miembros de la comunidad" },
      { name: "Registro", description: "Usuarios registrados" },
      { name: "Activación", description: "Usuarios que usan el producto" },
      { name: "Retención", description: "Usuarios que se quedan" },
    ].map((d, i) => ({ ...d, sort_order: i + 1 }));
  };

  const displayStages = stages.length > 0 ? stages : [];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-ink">🔻 Funnel</h1>
          <p className="text-sm text-muted">Convierte atención en usuarios activos.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 font-hud text-xs tracking-wide px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25">
          <Plus size={14} /> ETAPA
        </button>
      </div>

      {(creating || editing) && (
        <form onSubmit={editing ? handleUpdate : handleCreate} className="mb-6 mt-4 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-hud text-xs text-faint tracking-widest">{editing ? "EDITAR ETAPA" : "NUEVA ETAPA"}</span>
            <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="text-faint hover:text-ink"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={editing ? editForm.name || "" : form.name}
              onChange={(e) => editing ? setEditForm({ ...editForm, name: e.target.value }) : setForm({ ...form, name: e.target.value })}
              placeholder="Nombre de la etapa *"
              className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              autoFocus
            />
            <input
              value={editing ? editForm.description || "" : form.description}
              onChange={(e) => editing ? setEditForm({ ...editForm, description: e.target.value }) : setForm({ ...form, description: e.target.value })}
              placeholder="Descripción"
              className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
            />
          </div>
          <div className="flex justify-between mt-3">
            {editing && (
              <button type="button" onClick={() => { deleteFunnelStage(editing.id); setEditing(null); }} className="flex items-center gap-1 text-xs text-faint hover:text-danger">
                <Trash2 size={12} /> Eliminar
              </button>
            )}
            <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 ml-auto">
              {editing ? "GUARDAR" : "CREAR"}
            </button>
          </div>
        </form>
      )}

      {displayStages.length === 0 ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg mt-4">
          <p className="text-sm text-muted">No hay etapas en el funnel.</p>
          <p className="text-xs text-faint mt-1">Define las etapas de tu embudo de conversión.</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-0">
          {displayStages.map((stage, idx) => (
            <div key={stage.id || idx} className="w-full flex flex-col items-center">
              <div className="w-full bg-panel border border-border rounded-lg px-5 py-4 hover:border-borderLight transition-colors group relative">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-hud text-faint">0{idx + 1}</span>
                      <h3 className="text-sm font-semibold text-ink">{stage.name}</h3>
                    </div>
                    {stage.description && <p className="text-xs text-muted">{stage.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-lg font-semibold text-signal font-hud">
                        {(stage.latest_value || 0).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={entryValues[stage.id] ?? ""}
                          onChange={(e) => setEntryValues({ ...entryValues, [stage.id]: Number(e.target.value) })}
                          placeholder="Actualizar"
                          className="w-24 bg-panelRaised border border-border rounded px-2 py-1 text-xs text-ink outline-none focus:border-signal/50"
                          min={0}
                        />
                        <button
                          onClick={() => handleUpdateValue(stage.id)}
                          disabled={entryValues[stage.id] === undefined}
                          className="text-[10px] font-hud px-2 py-1 rounded bg-signal/15 text-signal border border-signal/40 disabled:opacity-30"
                        >
                          {saving[stage.id] ? "..." : "OK"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(stage); }}
                      className="p-1.5 rounded text-faint hover:text-ink"
                    >
                      <X size={12} className="rotate-45" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteFunnelStage(stage.id); }}
                      className="p-1.5 rounded text-faint hover:text-danger"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
              {idx < displayStages.length - 1 && (
                <div className="py-1 text-faint">
                  <ArrowDown size={16} />
                </div>
              )}
            </div>
          ))}
          {displayStages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 w-full mt-6">
              {(() => {
                const total = displayStages[0]?.latest_value || 1;
                const last = displayStages[displayStages.length - 1]?.latest_value || 0;
                const rate = total > 0 ? Math.round((last / total) * 100) : 0;
                return (
                  <>
                    <div className="bg-panel border border-border rounded-lg px-3 py-2 text-center">
                      <div className="text-[10px] font-hud text-faint tracking-widest">TASA</div>
                      <div className="text-sm font-semibold text-ink font-hud">{rate}%</div>
                    </div>
                    <div className="bg-panel border border-border rounded-lg px-3 py-2 text-center">
                      <div className="text-[10px] font-hud text-faint tracking-widest">ETAPAS</div>
                      <div className="text-sm font-semibold text-ink font-hud">{displayStages.length}</div>
                    </div>
                    <div className="bg-panel border border-border rounded-lg px-3 py-2 text-center">
                      <div className="text-[10px] font-hud text-faint tracking-widest">FINAL</div>
                      <div className="text-sm font-semibold text-ink font-hud">{last.toLocaleString()}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
