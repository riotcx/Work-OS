import { useEffect, useState, type FormEvent } from "react";
import { Plus, X, Check } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Habit, Routine, PersonalAdminItem } from "../../types";

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const LIFE_AREAS = ["Salud", "Trabajo", "Casa", "Finanzas", "Aprendizaje", "Relaciones"];

interface Props { areaId: string; onNavigateToKanban: () => void; }

export function PersonalArea({ areaId, onNavigateToKanban }: Props) {
  const { areas, tasks, habits, routines, personalAdminItems, loadAreaData, addHabit, updateHabit, deleteHabit, logHabit, addRoutine, updateRoutine, deleteRoutine, addPersonalAdmin, updatePersonalAdmin, deletePersonalAdmin } = useWorkOS();
  const [tab, setTab] = useState<"habits" | "routines" | "admin">("habits");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({ name: "", category: "", frequency: "daily" });

  const area = areas.find((a) => a.id === areaId);
  const areaHabits = habits.filter((h) => h.area_id === areaId);
  const areaRoutines = routines.filter((r) => r.area_id === areaId);
  const areaAdmin = personalAdminItems.filter((p: PersonalAdminItem) => p.area_id === areaId);
  const activeHabits = areaHabits.filter((h) => h.active);
  const todayCompleted = activeHabits.filter((h) => h.today_log?.status === "completed").length;

  useEffect(() => { if (areaId) loadAreaData(areaId); }, [areaId]);

  const handleAddHabit = async (e: FormEvent) => { e.preventDefault(); if (!form.name) return; await addHabit({ ...form, area_id: areaId }); setForm({ name: "", category: "", frequency: "daily" }); setShowForm(false); };
  const handleToggle = async (h: Habit) => {
    const today = new Date().toISOString().slice(0, 10);
    if (h.today_log) await logHabit(h.id, { date: today, status: h.today_log.status === "completed" ? "missed" : "completed" });
    else await logHabit(h.id, { date: today, status: "completed" });
  };
  const handleAddAdmin = async (e: FormEvent) => { e.preventDefault(); if (!form.name) return; await addPersonalAdmin({ title: form.name, type: form.type || "document", due_date: form.due_date, area_id: areaId }); setForm({ name: "", type: "document", due_date: "" }); setShowForm(false); };

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2"><span className="text-3xl">{area?.icon}</span><div><h1 className="text-2xl font-semibold text-ink">{area?.name}</h1><p className="text-sm text-muted">Life Administration Center</p></div></div>
        <button onClick={onNavigateToKanban} className="text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink ml-12">📋 Kanban</button>
      </div>

      {/* Life Dashboard */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-panel border border-border rounded-lg px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-hud text-[10px] text-faint tracking-widest">HÁBITOS</span>
            <span className="text-xs text-done font-hud">{todayCompleted}/{activeHabits.length}</span>
          </div>
          <div className="w-full h-1.5 bg-panelRaised rounded-full overflow-hidden">
            <div className="h-full bg-signal transition-all" style={{ width: `${activeHabits.length > 0 ? Math.round((todayCompleted / activeHabits.length) * 100) : 0}%` }} />
          </div>
        </div>
        <div className="bg-panel border border-border rounded-lg px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-hud text-[10px] text-faint tracking-widest">RESUMEN</span>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-muted">{activeHabits.length} hábitos</span>
            <span className="text-muted">{areaRoutines.length} rutinas</span>
            <span className="text-muted">{areaAdmin.length} admin</span>
          </div>
        </div>
      </div>

      {/* Life Areas */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {LIFE_AREAS.map((la) => (
          <div key={la} className="bg-panel border border-border rounded-lg px-3 py-2 text-center text-xs text-muted hover:border-borderLight cursor-pointer">{la}</div>
        ))}
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { id: "habits", icon: "✅", title: "Hábitos", desc: `${activeHabits.length} activos`, color: "#3DDC97" },
          { id: "routines", icon: "🔁", title: "Rutinas", desc: `${areaRoutines.length} definidas`, color: "#5AC8FA" },
          { id: "admin", icon: "📋", title: "Admin Personal", desc: `${areaAdmin.length} pendientes`, color: "#B58AF5" },
          { id: "resources", icon: "📚", title: "Recursos", desc: "Docs, notas, ideas", color: "#F5A623" },
          { id: "kanban", icon: "📋", title: "Kanban", desc: `${tasks.filter((t) => t.area_id === areaId).length} tareas`, color: "#E5484D" },
          { id: "life", icon: "🌎", title: "Áreas de Vida", desc: "Salud, Casa, Finanzas...", color: "#F5C542" },
        ].map((m) => (
          <button key={m.id} onClick={() => { if (m.id === "habits") { setTab("habits"); setShowForm(true); } else if (m.id === "routines") setTab("routines"); else if (m.id === "admin") { setTab("admin"); setShowForm(true); } else if (m.id === "kanban") onNavigateToKanban(); }} className="bg-panel border border-border rounded-xl px-4 py-4 text-left hover:border-borderLight transition-all" style={{ borderLeftWidth: 3, borderLeftColor: m.color }}>
            <div className="text-xl mb-2">{m.icon}</div>
            <h3 className="text-sm font-semibold text-ink">{m.title}</h3>
            <p className="text-xs text-signal font-hud mt-1">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Habits quick view */}
      {activeHabits.length > 0 && (
        <div className="mb-6">
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-2">HÁBITOS HOY</h2>
          <div className="flex flex-col gap-1">
            {activeHabits.map((h) => {
              const done = h.today_log?.status === "completed";
              return (
                <button key={h.id} onClick={() => handleToggle(h)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-panelRaised/40 transition-colors">
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${done ? "bg-done border-done" : "border-border"}`}>
                    {done && <Check size={12} className="text-base" />}
                  </span>
                  <span className={`text-sm ${done ? "line-through text-muted" : "text-ink"}`}>{h.name}</span>
                  <span className="text-[10px] font-hud text-done ml-auto">{h.streak}d</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin items */}
      {areaAdmin.length > 0 && (
        <div>
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-2">ADMINISTRACIÓN</h2>
          <div className="flex flex-col gap-2">
            {areaAdmin.map((item: PersonalAdminItem) => (
              <div key={item.id} className="flex items-center justify-between bg-panelRaised border border-border rounded-md px-3 py-2">
                <div><p className="text-sm text-ink">{item.title}</p>{item.due_date && <p className="text-xs text-faint">{item.due_date}</p>}</div>
                <span className={`text-[10px] font-hud px-1.5 py-0.5 rounded ${item.status === "activo" ? "bg-signal/10 text-signal" : "bg-panel text-muted"}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
