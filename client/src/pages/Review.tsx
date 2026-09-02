import { useState, useEffect, type FormEvent } from "react";
import { useWorkOS } from "../store";
import { getCurrentWeekRange } from "../constants";

interface SprintReview {
  sprint: { id: string; name: string; start_date: string; end_date: string; status: string };
  tasks: { total: number; done: number; pending: number; doneList: any[]; pendingList: any[] };
  planByArea: Record<string, { total: number; done: number }>;
  focus: { sessions: number; totalSeconds: number };
  review: { id: string; what_worked: string; what_didnt: string; what_learned: string; what_change: string } | null;
}

export function Review() {
  const { sprint, sprints, areas, loadSprints, closeSprint, createSprint } = useWorkOS();
  const [data, setData] = useState<SprintReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ what_worked: "", what_didnt: "", what_learned: "", what_change: "" });
  const [saved, setSaved] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [creatingSprint, setCreatingSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");

  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));

  useEffect(() => { loadSprints(); }, []);

  const sprintId = selectedSprintId || sprint?.id;

  useEffect(() => {
    if (!sprintId) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/review/sprint/${sprintId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.review) {
          setReviewForm({
            what_worked: d.review.what_worked || "",
            what_didnt: d.review.what_didnt || "",
            what_learned: d.review.what_learned || "",
            what_change: d.review.what_change || "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sprintId]);

  const handleSaveReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!sprintId) return;
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sprint_id: sprintId, ...reviewForm }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCloseAndReview = async () => {
    if (!sprint) return;
    await closeSprint(sprint.id);
    setSelectedSprintId(sprint.id);
    await loadSprints();
    setTimeout(() => {
      fetch(`/api/review/sprint/${sprint.id}`)
        .then((r) => r.json())
        .then(setData)
        .catch(console.error);
    }, 300);
  };

  const handleCreateNewSprint = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;
    const { start, end } = getCurrentWeekRange();
    await createSprint({
      name: newSprintName.trim(),
      start_date: start,
      end_date: end,
    });
    setNewSprintName("");
    setCreatingSprint(false);
    setSelectedSprintId(null);
    await loadSprints();
  };

  const fmtTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl">
        <h1 className="text-xl font-semibold text-ink mb-6">🧘 Review</h1>
        <p className="text-sm text-muted">Cargando datos del sprint...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">🧘 Review</h1>
          <p className="text-sm text-muted">Reflexión semanal basada en tus datos reales.</p>
        </div>
        {sprints.length > 0 && (
          <select
            value={sprintId || ""}
            onChange={(e) => setSelectedSprintId(e.target.value || null)}
            className="bg-panelRaised border border-border rounded-md px-2 py-1 text-sm text-ink outline-none focus:border-signal/50"
          >
            <option value="">Sprint actual</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {!data || !data.sprint ? (
        <div className="text-center py-12 bg-panel border border-border rounded-lg">
          <p className="text-sm text-muted">No hay datos de sprint disponibles.</p>
          {sprint && sprint.status === "activo" && (
            <button onClick={handleCloseAndReview} className="mt-4 font-hud text-xs px-4 py-2 rounded-md bg-signal/15 text-signal border border-signal/40">
              CERRAR SPRINT Y REVISAR
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Sprint Results */}
          <div className="bg-panel border border-border rounded-lg px-5 py-4 mb-6">
            <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">
              {data.sprint.name} · {data.sprint.start_date} → {data.sprint.end_date}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] ${data.sprint.status === "activo" ? "bg-done/10 text-done" : "bg-panelRaised text-muted"}`}>
                {data.sprint.status}
              </span>
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "PLANEADAS", value: data.tasks.total },
                { label: "COMPLETADAS", value: data.tasks.done },
                { label: "PENDIENTES", value: data.tasks.pending },
                { label: "TASA", value: `${data.tasks.total > 0 ? Math.round((data.tasks.done / data.tasks.total) * 100) : 0}%` },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-panelRaised border border-border rounded-lg px-3 py-2">
                  <div className="text-[10px] font-hud text-faint tracking-widest">{kpi.label}</div>
                  <div className="text-xl font-semibold text-ink font-hud mt-1">{kpi.value}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 text-sm">
              <span className="text-muted">⏱️ Focus: <span className="text-ink font-hud">{fmtTime(data.focus.totalSeconds)}</span></span>
              <span className="text-muted">📊 Sesiones: <span className="text-ink font-hud">{data.focus.sessions}</span></span>
            </div>

            {/* Carryover */}
            {data.tasks.pending > 0 && (
              <div className="mt-3 bg-danger/5 border border-danger/20 rounded-md px-3 py-2">
                <p className="text-xs text-danger font-medium">{data.tasks.pending} tareas quedaron pendientes</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.tasks.pendingList.slice(0, 5).map((t: any) => (
                    <span key={t.id} className="text-[10px] px-2 py-0.5 rounded bg-panelRaised text-muted">
                      {t.title.length > 25 ? t.title.slice(0, 25) + "…" : t.title}
                    </span>
                  ))}
                  {data.tasks.pendingList.length > 5 && (
                    <span className="text-[10px] text-faint">+{data.tasks.pendingList.length - 5}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reflection form */}
          <form onSubmit={handleSaveReview} className="bg-panel border border-border rounded-lg px-5 py-4 mb-6">
            <h2 className="font-hud text-[10px] text-faint tracking-widest mb-4">REFLEXIÓN</h2>
            <div className="flex flex-col gap-4">
              {[
                { key: "what_worked", label: "¿Qué funcionó?", placeholder: "Lo que salió bien este sprint..." },
                { key: "what_didnt", label: "¿Qué no funcionó?", placeholder: "Lo que podría haber sido mejor..." },
                { key: "what_learned", label: "¿Qué aprendí?", placeholder: "Lecciones de esta semana..." },
                { key: "what_change", label: "¿Qué cambiaré?", placeholder: "Ajustes para el próximo sprint..." },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-muted mb-1 block">{field.label}</label>
                  <textarea
                    value={(reviewForm as any)[field.key]}
                    onChange={(e) => setReviewForm({ ...reviewForm, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    rows={2}
                    className="w-full bg-panelRaised border border-border rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-signal/50 resize-none placeholder:text-faint"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              {saved && <span className="text-xs text-done font-hud">✓ Review guardada</span>}
              <button type="submit" className="font-hud text-xs px-4 py-2 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25 ml-auto">
                GUARDAR REVIEW
              </button>
            </div>
          </form>

          {/* Plan By Area */}
          {Object.keys(data.planByArea).length > 0 && (
            <div className="bg-panel border border-border rounded-lg px-5 py-4 mb-6">
              <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">PLAN VS REALIDAD POR ÁREA</h2>
              <div className="flex flex-col gap-2">
                {Object.entries(data.planByArea).map(([areaId, stats]) => {
                  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                  return (
                    <div key={areaId} className="flex items-center gap-2">
                      <span className="text-xs w-28 truncate">
                        {areaById[areaId] ? `${areaById[areaId].icon} ${areaById[areaId].name}` : areaId}
                      </span>
                      <div className="flex-1 h-1.5 bg-panelRaised rounded-full overflow-hidden">
                        <div className="h-full bg-signal transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-hud text-faint">{stats.done}/{stats.total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {data.sprint.status === "activo" && (
              <button onClick={handleCloseAndReview} className="font-hud text-xs px-4 py-2 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25">
                CERRAR SPRINT
              </button>
            )}
            <button onClick={() => setCreatingSprint(true)} className="font-hud text-xs px-4 py-2 rounded-md border border-border text-muted hover:text-ink">
              + NUEVO SPRINT
            </button>
          </div>

          {creatingSprint && (
            <form onSubmit={handleCreateNewSprint} className="mt-4 bg-panel border border-border rounded-lg p-4 max-w-md">
              <span className="font-hud text-xs text-faint tracking-widest block mb-2">NUEVO SPRINT</span>
              <div className="flex items-center gap-2">
                <input
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  placeholder="Sprint #..."
                  autoFocus
                  className="flex-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50"
                />
                <button type="submit" className="font-hud text-xs px-3 py-1.5 rounded-md bg-signal/15 text-signal border border-signal/40">
                  CREAR
                </button>
              </div>
            </form>
          )}

          {/* System Insight */}
          {data.tasks.total > 0 && data.tasks.pending > 0 && (
            <div className="mt-6 bg-panel border border-border rounded-lg px-5 py-4">
              <h2 className="font-hud text-[10px] text-faint tracking-widest mb-2">🧠 SYSTEM INSIGHT</h2>
              <p className="text-xs text-muted">
                {data.tasks.pending > data.tasks.done
                  ? `Completaste ${data.tasks.done} de ${data.tasks.total} tareas (${Math.round((data.tasks.done / data.tasks.total) * 100)}%). Quedaron ${data.tasks.pending} pendientes. Considera reducir el WIP del próximo sprint.`
                  : `Completaste ${data.tasks.done} de ${data.tasks.total} tareas (${Math.round((data.tasks.done / data.tasks.total) * 100)}%). Buen ritmo de ejecución.`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
