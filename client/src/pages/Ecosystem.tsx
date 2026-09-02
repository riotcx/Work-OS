import { useWorkOS } from "../store";
import type { View } from "../App";

interface EcosystemProps {
  onNavigate?: (v: View) => void;
}

export function Ecosystem({ onNavigate }: EcosystemProps) {
  const { areas, tasks, goals, setActiveArea } = useWorkOS();

  const goalByArea: Record<string, { title: string; target: string; current: string }> = {};
  for (const g of goals) {
    if (g.area_id) goalByArea[g.area_id] = { title: g.title, target: g.target, current: g.current };
  }

  const areaDescriptions: Record<string, string> = {
    Negocio: "Tu iniciativa principal. Construir, escalar y monetizar.",
    Marca: "Presencia pública. Posicionamiento y reputación.",
    Finanzas: "Ingresos, gastos y objetivos financieros.",
    Empresa: "Organización legal, operaciones y estructura.",
    Proyectos: "Productos y cosas que estás construyendo.",
    Personal: "Vida personal. Salud, hábitos y crecimiento.",
  };

  const handleAreaClick = (areaId: string) => {
    setActiveArea(areaId);
    if (onNavigate) onNavigate("area");
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-semibold text-ink mb-1">🌐 Ecosistema</h1>
      <p className="text-sm text-muted mb-6">
        Cada área representa una dimensión independiente de tu trabajo. Mantiéngalas separadas.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {areas.map((area) => {
          const goal = goalByArea[area.id];
          const active = tasks.filter((t) => t.area_id === area.id && t.status !== "completado").length;
          const areaTasks = tasks.filter((t) => t.area_id === area.id);
          const done = areaTasks.filter((t) => t.status === "completado").length;
          const total = areaTasks.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <button
              key={area.id}
              onClick={() => handleAreaClick(area.id)}
              className="bg-panel border border-border rounded-lg px-5 py-4 text-left hover:border-borderLight hover:bg-panelRaised/20 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{area.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{area.name}</h3>
                  <p className="text-xs text-muted">{areaDescriptions[area.name] ?? ""}</p>
                </div>
              </div>

              {goal && (
                <div className="mb-2">
                  <p className="text-xs text-faint line-clamp-1">{goal.title}</p>
                  {goal.target && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-panelRaised rounded-full overflow-hidden">
                        <div
                          className="h-full bg-signal transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-hud text-faint">
                        {goal.current} / {goal.target}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-faint">{active} activas</span>
                <span className="text-signal font-hud opacity-0 group-hover:opacity-100 transition-opacity">
                  ABRIR →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
