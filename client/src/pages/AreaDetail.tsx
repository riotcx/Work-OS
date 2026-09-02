import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useWorkOS } from "../store";
import { AcquisitionModule } from "./area/AcquisitionModule";
import { ConnectionModule } from "./area/ConnectionModule";
import { AnalyticsModule } from "./area/AnalyticsModule";
import { ContentModule } from "./area/ContentModule";
import { IdentityModule } from "./area/IdentityModule";
import { FunnelModule } from "./area/FunnelModule";
import { PersonalBrandArea } from "./area/PersonalBrandArea";
import { CompanyArea } from "./area/CompanyArea";
import { FinancialArea } from "./area/FinancialArea";
import { PortfolioArea } from "./area/PortfolioArea";
import { PersonalArea } from "./area/PersonalArea";

type ModuleView = "overview" | "acquisition" | "connection" | "analytics" | "content" | "identity" | "funnel";

interface AreaDetailProps {
  areaId: string;
  onNavigateToKanban: () => void;
}

export function AreaDetail({ areaId, onNavigateToKanban }: AreaDetailProps) {
  const { areas } = useWorkOS();
  const area = areas.find((a) => a.id === areaId);
  if (!area) return <div className="p-6 text-sm text-faint">Área no encontrada.</div>;
  if (area.area_type === "personal_brand") return <PersonalBrandArea areaId={areaId} onNavigateToKanban={onNavigateToKanban} />;
  if (area.area_type === "company") return <CompanyArea areaId={areaId} onNavigateToKanban={onNavigateToKanban} />;
  if (area.area_type === "financial") return <FinancialArea areaId={areaId} onNavigateToKanban={onNavigateToKanban} />;
  if (area.area_type === "portfolio") return <PortfolioArea areaId={areaId} onNavigateToKanban={onNavigateToKanban} />;
  if (area.area_type === "personal") return <PersonalArea areaId={areaId} onNavigateToKanban={onNavigateToKanban} />;
  return <ProductGrowthArea areaId={areaId} area={area} onNavigateToKanban={onNavigateToKanban} />;
}

function ProductGrowthArea({ areaId, area, onNavigateToKanban }: { areaId: string; area: any; onNavigateToKanban: () => void }) {
  const { tasks, platforms, communities, contentIdeas, identityIdeas, funnelStages, metrics, goals, loadAreaData } = useWorkOS();
  const [moduleView, setModuleView] = useState<ModuleView>("overview");

  useEffect(() => { if (areaId) loadAreaData(areaId); }, [areaId, loadAreaData]);

  const areaGoals = goals.filter((g) => g.area_id === areaId);
  const areaTasks = tasks.filter((t) => t.area_id === areaId);
  const doneTasks = areaTasks.filter((t) => t.status === "completado").length;

  if (moduleView !== "overview") {
    return (
      <div className="p-6 h-full flex flex-col">
        <button onClick={() => setModuleView("overview")} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4"><ArrowLeft size={16} /> Volver a {area.name}</button>
        {moduleView === "acquisition" && <AcquisitionModule areaId={areaId} platforms={platforms} />}
        {moduleView === "connection" && <ConnectionModule areaId={areaId} communities={communities} />}
        {moduleView === "analytics" && <AnalyticsModule areaId={areaId} metrics={metrics} />}
        {moduleView === "content" && <ContentModule areaId={areaId} ideas={contentIdeas} platforms={platforms} />}
        {moduleView === "identity" && <IdentityModule areaId={areaId} ideas={identityIdeas} communities={communities} />}
        {moduleView === "funnel" && <FunnelModule areaId={areaId} stages={funnelStages} />}
      </div>
    );
  }

  const modules = [
    { id: "acquisition" as ModuleView, icon: "📡", title: "ADQUISICIÓN", desc: "Captar atención", value: `${platforms.filter((p: any) => p.status === "activo").length} plataformas`, color: "#5AC8FA" },
    { id: "connection" as ModuleView, icon: "🤝", title: "CONEXIÓN", desc: "Construir comunidad", value: `${communities.filter((c: any) => c.status === "activo").length} comunidades`, color: "#3DDC97" },
    { id: "analytics" as ModuleView, icon: "📊", title: "ANALYTICS", desc: "Medir", value: `${metrics.length} métricas`, color: "#B58AF5" },
    { id: "content" as ModuleView, icon: "✍️", title: "CONTENIDO", desc: "Convertir atención en publicaciones", value: `${contentIdeas.length} ideas`, color: "#F5A623" },
    { id: "identity" as ModuleView, icon: "🧬", title: "IDENTIDAD", desc: "Crear conexión", value: `${identityIdeas.length} ideas`, color: "#E5484D" },
    { id: "funnel" as ModuleView, icon: "🔻", title: "FUNNEL", desc: "Convertir", value: `${funnelStages.length} etapas`, color: "#F5C542" },
  ];

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><span className="text-3xl">{area.icon}</span><div><h1 className="text-2xl font-semibold text-ink">{area.name}</h1><p className="text-sm text-muted">Product Growth Center</p></div></div>
        {areaGoals.length > 0 && <p className="text-xs text-muted mt-1 ml-12 line-clamp-1">{areaGoals[0].title}{areaGoals[0].target && ` — Meta: ${areaGoals[0].target}`}</p>}
        <div className="flex items-center gap-2 mt-3 ml-12">
          <button onClick={onNavigateToKanban} className="text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink">📋 Kanban</button>
          <span className="text-xs text-faint font-hud">{doneTasks}/{areaTasks.length} tareas</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {modules.map((mod: any) => (
          <button key={mod.id} onClick={() => setModuleView(mod.id)} className="bg-panel border border-border rounded-xl px-5 py-5 text-left hover:border-borderLight hover:bg-panelRaised/20 transition-all group" style={{ borderLeftWidth: 3, borderLeftColor: mod.color }}>
            <div className="flex items-start justify-between mb-2"><span className="text-2xl">{mod.icon}</span><span className="text-[10px] font-hud text-faint tracking-widest opacity-0 group-hover:opacity-100">{mod.title}</span></div>
            <h3 className="text-sm font-semibold text-ink mb-0.5">{mod.title}</h3><p className="text-xs text-muted mb-3">{mod.desc}</p>
            <span className="text-xs text-signal font-hud">{mod.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
