import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useWorkOS } from "../../store";
import { CompanyIdentityModule } from "./CompanyIdentityModule";
import { CompanyOffersModule } from "./CompanyOffersModule";
import { CompanyClientsModule } from "./CompanyClientsModule";
import { CompanyOutboundModule } from "./CompanyOutboundModule";
import { CompanyDeliveriesModule } from "./CompanyDeliveriesModule";
import type { OppStatus } from "../../types";
import { OPP_STATUS_LABELS } from "../../types";

type ModuleView = "overview" | "identity" | "offers" | "clients" | "outbound" | "deliveries" | "testimonials" | "documents" | "products";

interface Props {
  areaId: string;
  onNavigateToKanban: () => void;
}

export function CompanyArea({ areaId, onNavigateToKanban }: Props) {
  const { areas, tasks, projects, profiles, services, offers, opportunities, clients, deliveries, testimonials, documents, platforms, loadAreaData } = useWorkOS();
  const [moduleView, setModuleView] = useState<ModuleView>("overview");

  const area = areas.find((a) => a.id === areaId);
  const profile = profiles.find((p) => p.area_id === areaId);
  const areaProjects = projects.filter((p) => p.area_id === areaId);
  const areaTasks = tasks.filter((t) => t.area_id === areaId);
  const doneTasks = areaTasks.filter((t) => t.status === "completado").length;

  const featuredOffers = offers.filter((o) => o.featured && o.status === "activo");
  const activeDeliveries = deliveries.filter((d) => d.status !== "entregado");
  const pipelineTotal = opportunities.reduce((s, o) => s + (o.value || 0), 0);
  const wonCount = opportunities.filter((o) => o.status === "ganada").length;

  useEffect(() => { if (areaId) loadAreaData(areaId); }, [areaId, loadAreaData]);

  if (moduleView !== "overview") {
    return (
      <div className="p-6 h-full flex flex-col">
        <button onClick={() => setModuleView("overview")} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4"><ArrowLeft size={16} /> Volver a {area?.name}</button>
        {moduleView === "identity" && <CompanyIdentityModule areaId={areaId} />}
        {moduleView === "offers" && <CompanyOffersModule areaId={areaId} />}
        {moduleView === "clients" && <CompanyClientsModule areaId={areaId} />}
        {moduleView === "outbound" && <CompanyOutboundModule areaId={areaId} />}
        {moduleView === "deliveries" && <CompanyDeliveriesModule areaId={areaId} />}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{area?.icon}</span>
          <div>
            <h1 className="text-2xl font-semibold text-ink">{area?.name}</h1>
            <p className="text-sm text-muted">Company Command Center</p>
          </div>
        </div>
        {profile && (
          <div className="ml-12 mt-2">
            {profile.title && <p className="text-sm text-ink">{profile.title}</p>}
            {profile.short_bio && <p className="text-xs text-muted mt-1 max-w-lg line-clamp-2">{profile.short_bio}</p>}
          </div>
        )}
        <div className="flex items-center gap-2 mt-3 ml-12 flex-wrap">
          <button onClick={onNavigateToKanban} className="text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink">📋 Kanban</button>
          <button onClick={() => setModuleView("identity")} className="text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink">{profile ? "Editar empresa" : "+ Empresa"}</button>
          <button onClick={() => setModuleView("offers")} className="text-xs px-3 py-1 rounded-md border border-border text-signal hover:bg-signal/10">+ Oferta</button>
          <button onClick={() => setModuleView("clients")} className="text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink">+ Cliente</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "PRODUCTOS", value: areaProjects.length },
          { label: "OFERTAS", value: offers.length },
          { label: "CLIENTES", value: clients.length },
          { label: "OPORTUNIDADES", value: opportunities.length },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-panel border border-border rounded-lg px-3 py-2.5 text-center">
            <div className="text-[10px] font-hud text-faint tracking-widest mb-1">{kpi.label}</div>
            <div className="text-lg font-semibold text-ink font-hud">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Revenue + Pipeline */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-panel border border-border rounded-xl px-5 py-4">
          <h3 className="font-hud text-[10px] text-faint tracking-widest mb-3">💰 PIPELINE</h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-semibold text-ink font-hud">{pipelineTotal > 0 ? `$${pipelineTotal.toLocaleString()}` : "—"}</span>
            <span className="text-xs text-muted">valor potencial</span>
          </div>
          <div className="text-xs text-muted">{wonCount} ganadas · {opportunities.filter((o) => o.status === "propuesta").length} cotizaciones abiertas</div>
        </div>
        <div className="bg-panel border border-border rounded-xl px-5 py-4">
          <h3 className="font-hud text-[10px] text-faint tracking-widest mb-3">📦 ENTREGAS</h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-semibold text-ink font-hud">{activeDeliveries.length}</span>
            <span className="text-xs text-muted">activas</span>
          </div>
          <div className="text-xs text-muted">{deliveries.filter((d) => d.status === "pendiente").length} pendientes · {deliveries.filter((d) => d.status === "en_produccion").length} en producción</div>
        </div>
      </div>

      {/* Quick Offers */}
      {featuredOffers.length > 0 && (
        <div className="mb-6">
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">🚀 OFERTAS DESTACADAS</h2>
          <div className="grid grid-cols-3 gap-3">
            {featuredOffers.map((o) => (
              <div key={o.id} className="bg-panel border border-border rounded-lg px-4 py-3 hover:border-borderLight transition-colors cursor-pointer" onClick={() => setModuleView("offers")}>
                <p className="text-sm text-ink font-medium">{o.name}</p>
                {o.description && <p className="text-xs text-muted mt-1 line-clamp-1">{o.description}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-signal font-hud">{o.currency === "CLP" ? "$" : "$"}{o.price_min > 0 ? o.price_min.toLocaleString() : "—"}</span>
                  {o.delivery_time && <span className="text-[10px] text-faint">{o.delivery_time}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Module Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { id: "identity" as ModuleView, icon: "🏢", title: "Identidad", desc: profile ? "Configurada" : "Sin configurar", color: "#5AC8FA" },
          { id: "products" as ModuleView, icon: "📦", title: "Productos", desc: `${areaProjects.length} productos`, color: "#F5A623" },
          { id: "offers" as ModuleView, icon: "💼", title: "Ofertas", desc: `${offers.length} ofertas · ${featuredOffers.length} destacadas`, color: "#3DDC97" },
          { id: "outbound" as ModuleView, icon: "🎯", title: "Outbound", desc: `${opportunities.length} en pipeline`, color: "#B58AF5" },
          { id: "clients" as ModuleView, icon: "👥", title: "Clientes", desc: `${clients.length} registrados`, color: "#E5484D" },
          { id: "deliveries" as ModuleView, icon: "📋", title: "Entregas", desc: `${activeDeliveries.length} pendientes`, color: "#F5C542" },
        ].map((mod) => (
          <button key={mod.id} onClick={() => setModuleView(mod.id)} className="bg-panel border border-border rounded-xl px-4 py-4 text-left hover:border-borderLight hover:bg-panelRaised/20 transition-all group" style={{ borderLeftWidth: 3, borderLeftColor: mod.color }}>
            <div className="flex items-start justify-between mb-2"><span className="text-xl">{mod.icon}</span><span className="text-[10px] font-hud text-faint tracking-widest opacity-0 group-hover:opacity-100">ABRIR →</span></div>
            <h3 className="text-sm font-semibold text-ink">{mod.title}</h3>
            <p className="text-xs text-signal font-hud mt-1">{mod.desc}</p>
          </button>
        ))}
      </div>

      {/* Proof of Work + Testimonials */}
      {(testimonials.length > 0 || areaProjects.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-panel border border-border rounded-lg px-5 py-4">
            <h3 className="font-hud text-[10px] text-faint tracking-widest mb-2">⭐ TESTIMONIOS</h3>
            {testimonials.length === 0 ? (
              <p className="text-xs text-muted">Sin testimonios aún.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {testimonials.filter((t) => t.featured).slice(0, 2).map((t) => (
                  <div key={t.id} className="text-xs text-muted italic line-clamp-2">"{t.text}"</div>
                ))}
                <span className="text-xs text-signal font-hud">{testimonials.length} testimonios</span>
              </div>
            )}
          </div>
          <div className="bg-panel border border-border rounded-lg px-5 py-4">
            <h3 className="font-hud text-[10px] text-faint tracking-widest mb-2">🧠 PROOF OF WORK</h3>
            <div className="flex gap-4 text-sm">
              <div><span className="text-done font-semibold">{areaProjects.length}</span><span className="text-muted ml-1">productos</span></div>
              <div><span className="text-done font-semibold">{documents.length}</span><span className="text-muted ml-1">docs</span></div>
              <div><span className="text-done font-semibold">{doneTasks}</span><span className="text-muted ml-1">tareas</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
