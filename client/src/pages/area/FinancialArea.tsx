import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useWorkOS } from "../../store";
import type { Transaction, Routine, Habit, PersonalAdminItem } from "../../types";

type ModuleView = "overview" | "sources" | "opportunities" | "transactions" | "goals" | "forecast";
const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

interface Props { areaId: string; onNavigateToKanban: () => void; }

export function FinancialArea({ areaId, onNavigateToKanban }: Props) {
  const { areas, tasks, goals, transactions, opportunities, services, profiles, loadAreaData, addTransaction, updateTransaction, deleteTransaction } = useWorkOS();
  const [view, setView] = useState<ModuleView>("overview");
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [f, setF] = useState<Record<string, any>>({ amount: 0, type: "ingreso", date: new Date().toISOString().slice(0, 10), category: "", source: "", description: "" });

  const area = areas.find((a) => a.id === areaId);
  const areaGoals = goals.filter((g) => g.area_id === areaId);
  const areaTx = transactions.filter((t) => t.area_id === areaId);
  const profile = profiles.find((p) => p.area_id === areaId);

  const totalIngresos = areaTx.filter((t) => t.type === "ingreso").reduce((s, t) => s + t.amount, 0);
  const totalGastos = areaTx.filter((t) => t.type === "gasto").reduce((s, t) => s + t.amount, 0);
  const balance = totalIngresos - totalGastos;
  const targetGoal = areaGoals.find((g) => g.target)?.target || "—";

  useEffect(() => { if (areaId) loadAreaData(areaId); }, [areaId]);

  const handleSubmit = async (e: FormEvent) => { e.preventDefault(); if (!f.amount) return; await addTransaction(f); setShowForm(false); setF({ amount: 0, type: "ingreso", date: new Date().toISOString().slice(0, 10), category: "", source: "", description: "" }); };

  if (view !== "overview") return <div className="p-6"><button onClick={() => setView("overview")} className="text-sm text-muted hover:text-ink mb-4 flex items-center gap-1"><ArrowLeft size={16} /> Volver</button><p className="text-sm text-muted">Módulo en desarrollo</p></div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><span className="text-3xl">{area?.icon}</span><div><h1 className="text-2xl font-semibold text-ink">{area?.name}</h1><p className="text-sm text-muted">Financial Command Center</p></div></div>
        <button onClick={onNavigateToKanban} className="text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink mt-2">📋 Kanban</button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ label: "INGRESOS", value: `$${totalIngresos.toLocaleString()}` }, { label: "GASTOS", value: `$${totalGastos.toLocaleString()}` }, { label: "BALANCE", value: `$${balance.toLocaleString()}` }].map((k) => (
          <div key={k.label} className="bg-panel border border-border rounded-lg px-4 py-3 text-center"><div className="text-[10px] font-hud text-faint tracking-widest">{k.label}</div><div className="text-lg font-semibold text-ink font-hud mt-0.5">{k.value}</div></div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { id: "sources", icon: "💵", title: "Fuentes", desc: "De dónde sale el dinero", btn: "Gestionar", color: "#3DDC97" },
          { id: "opportunities", icon: "🎯", title: "Oportunidades", desc: "Posibilidades de aumentar ingresos", btn: "Ver pipeline", color: "#F5A623" },
          { id: "transactions", icon: "🧾", title: "Transacciones", desc: "Registro de movimientos", btn: "Ver todas", color: "#5AC8FA" },
          { id: "goals", icon: "📈", title: "Metas Financieras", desc: "Objetivos económicos", btn: "Gestionar", color: "#B58AF5" },
          { id: "forecast", icon: "🔮", title: "Proyección", desc: "Hacia dónde vas financieramente", btn: "Analizar", color: "#E5484D" },
          { id: "kanban", icon: "📋", title: "Kanban", desc: `${tasks.filter((t) => t.area_id === areaId).length} tareas`, btn: "Abrir", color: "#F5C542" },
        ].map((m) => (
          <button key={m.id} onClick={() => m.id === "kanban" ? onNavigateToKanban() : m.id === "transactions" ? setShowForm(true) : null} className="bg-panel border border-border rounded-xl px-4 py-4 text-left hover:border-borderLight hover:bg-panelRaised/20 transition-all group" style={{ borderLeftWidth: 3, borderLeftColor: m.color }}>
            <div className="text-xl mb-2">{m.icon}</div>
            <h3 className="text-sm font-semibold text-ink">{m.title}</h3>
            <p className="text-xs text-signal font-hud mt-1">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Quick transaction list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-hud text-[10px] text-faint tracking-widest">ÚLTIMAS TRANSACCIONES</h2>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-xs text-signal font-hud"><Plus size={12} /> Nueva</button>
        </div>
        {areaTx.slice(0, 5).map((tx) => (
          <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/50 text-sm">
            <span className="text-ink">{tx.description || tx.category || tx.source || "—"}</span>
            <span className={`font-hud ${tx.type === "ingreso" ? "text-done" : "text-danger"}`}>{tx.type === "ingreso" ? "+" : "-"}${tx.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-panel border border-border rounded-lg w-full max-w-sm p-4">
            <div className="flex items-center justify-between mb-3"><span className="font-hud text-xs text-faint">NUEVA TRANSACCIÓN</span><button type="button" onClick={() => setShowForm(false)}><X size={14} className="text-faint" /></button></div>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-hud text-faint">MONTO</label><input type="number" value={f.amount} onChange={(e) => setF({...f, amount: Number(e.target.value)})} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" autoFocus /></div>
                <div><label className="text-[10px] font-hud text-faint">TIPO</label><select value={f.type} onChange={(e) => setF({...f, type: e.target.value})} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-2 py-1.5 text-sm text-ink"><option value="ingreso">Ingreso</option><option value="gasto">Gasto</option><option value="inversión">Inversión</option></select></div>
              </div>
              <div><label className="text-[10px] font-hud text-faint">FECHA</label><input type="date" value={f.date} onChange={(e) => setF({...f, date: e.target.value})} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink" /></div>
              <input value={f.source} onChange={(e) => setF({...f, source: e.target.value})} placeholder="Fuente (ej: Fiverr, Cliente...)" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
              <input value={f.description} onChange={(e) => setF({...f, description: e.target.value})} placeholder="Descripción" className="bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
            </div>
            <button type="submit" className="mt-3 w-full font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40">REGISTRAR</button>
          </form>
        </div>
      )}
    </div>
  );
}
