import { useState, type FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useWorkOS } from "../store";
import type { Goal, GoalTimeframe } from "../types";

const TIMEFRAMES: { value: GoalTimeframe; label: string }[] = [
  { value: "largo_plazo", label: "Largo plazo" },
  { value: "año", label: "Año" },
  { value: "sprint", label: "Sprint" },
];

export function Goals() {
  const { goals, areas, addGoal, updateGoal, deleteGoal } = useWorkOS();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [timeframe, setTimeframe] = useState<GoalTimeframe>("año");

  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addGoal({ title: title.trim(), description, area_id: areaId || null, target, current, timeframe });
    setTitle("");
    setDescription("");
    setAreaId("");
    setTarget("");
    setCurrent("");
    setTimeframe("año");
    setCreating(false);
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">🎯 Objetivos</h1>
          <p className="text-sm text-muted mt-1">Aquí gestionas resultados, no tareas.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 font-hud text-xs tracking-wide px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"
        >
          <Plus size={14} />
          NUEVO
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mb-6 bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-hud text-xs text-faint tracking-widest">NUEVO OBJETIVO</span>
            <button type="button" onClick={() => setCreating(false)} className="text-faint hover:text-ink">
              <X size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del objetivo"
              autoFocus
              className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              rows={2}
              className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 placeholder:text-faint resize-none"
            />
            <div className="grid grid-cols-3 gap-3">
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              >
                <option value="">Sin área</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                ))}
              </select>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as GoalTimeframe)}
                className="bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
              >
                {TIMEFRAMES.map((tf) => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
              <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40">
                CREAR
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-hud text-faint tracking-widest">OBJETIVO (target)</label>
                <input
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder='Ej: "100,000 usuarios"'
                  className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 placeholder:text-faint"
                />
              </div>
              <div>
                <label className="text-[10px] font-hud text-faint tracking-widest">ACTUAL</label>
                <input
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder='Ej: "6 usuarios"'
                  className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 placeholder:text-faint"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Timeframe groups */}
      {TIMEFRAMES.map((tf) => {
        const tfGoals = goals.filter((g) => g.timeframe === tf.value);
        if (tfGoals.length === 0) return null;
        return (
          <div key={tf.value} className="mb-6">
            <h2 className="font-hud text-xs text-faint tracking-widest mb-3">{tf.label.toUpperCase()}</h2>
            <div className="flex flex-col gap-3">
              {tfGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  area={goal.area_id ? areaById[goal.area_id] : undefined}
                  onUpdate={(data) => updateGoal(goal.id, data)}
                  onDelete={() => deleteGoal(goal.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {goals.length === 0 && (
        <p className="text-sm text-faint">No hay objetivos definidos. Crea uno arriba.</p>
      )}
    </div>
  );
}

function GoalCard({
  goal,
  area,
  onUpdate,
  onDelete,
}: {
  goal: Goal;
  area?: { name: string; icon: string; color: string };
  onUpdate: (data: Partial<Goal>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState(goal.current);

  const handleSave = () => {
    onUpdate({ current: currentVal });
    setEditing(false);
  };

  return (
    <div className="bg-panel border border-border rounded-lg px-5 py-4 hover:border-borderLight transition-colors group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {area && <span>{area.icon}</span>}
            <h3 className="text-sm font-semibold text-ink">{goal.title}</h3>
            {area && (
              <span className="text-xs text-faint">{area.name}</span>
            )}
          </div>
          {goal.description && (
            <p className="text-xs text-muted mb-2">{goal.description}</p>
          )}
          {goal.target && (
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-[200px] h-1.5 bg-panelRaised rounded-full overflow-hidden">
                <div
                  className="h-full bg-signal transition-all"
                  style={{ width: `${Math.min(100, Math.round((Number(goal.current.replace(/[^0-9]/g, "")) / Math.max(1, Number(goal.target.replace(/[^0-9]/g, "")))) * 100))}%` }}
                />
              </div>
              {editing ? (
                <div className="flex items-center gap-1">
                  <input
                    value={currentVal}
                    onChange={(e) => setCurrentVal(e.target.value)}
                    className="w-24 bg-panelRaised border border-border rounded px-2 py-0.5 text-xs text-ink outline-none focus:border-signal/50"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  />
                  <button onClick={handleSave} className="text-[10px] font-hud text-signal">OK</button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-faint font-hud hover:text-signal transition-colors"
                >
                  {goal.current || "0"} / {goal.target}
                </button>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-faint hover:text-danger transition-all ml-2"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
