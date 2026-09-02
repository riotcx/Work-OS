import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useWorkOS } from "../../store";
import { PersonalProfileModule } from "./PersonalProfileModule";
import { PersonalSkillsModule } from "./PersonalSkillsModule";
import { PersonalProjectsModule } from "./PersonalProjectsModule";
import { PersonalServicesModule } from "./PersonalServicesModule";
import { PersonalOpportunitiesModule } from "./PersonalOpportunitiesModule";
import { PersonalPresenceModule } from "./PersonalPresenceModule";

type ModuleView = "overview" | "profile" | "skills" | "projects" | "services" | "opportunities" | "presence";

interface Props {
  areaId: string;
  onNavigateToKanban: () => void;
}

export function PersonalBrandArea({ areaId, onNavigateToKanban }: Props) {
  const { areas, tasks, skills, projects, services, opportunities, platforms, profiles, technologies, achievements, proofItems, careerEntries, loadAreaData } = useWorkOS();
  const [moduleView, setModuleView] = useState<ModuleView>("overview");

  const area = areas.find((a) => a.id === areaId);
  const profile = profiles.find((p) => p.area_id === areaId);
  const areaTasks = tasks.filter((t) => t.area_id === areaId);
  const doneTasks = areaTasks.filter((t) => t.status === "completado").length;
  const featuredSkills = skills.filter((s) => s.featured);
  const featuredProjects = projects.filter((p) => p.featured);
  const areaProjects = projects.filter((p) => p.area_id === areaId);

  useEffect(() => { if (areaId) loadAreaData(areaId); }, [areaId, loadAreaData]);

  if (moduleView !== "overview") {
    return (
      <div className="p-6 h-full flex flex-col">
        <button onClick={() => setModuleView("overview")} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
          <ArrowLeft size={16} /> Volver a {area?.name}
        </button>
        {moduleView === "profile" && <PersonalProfileModule areaId={areaId} />}
        {moduleView === "skills" && <PersonalSkillsModule areaId={areaId} />}
        {moduleView === "projects" && <PersonalProjectsModule areaId={areaId} />}
        {moduleView === "services" && <PersonalServicesModule areaId={areaId} />}
        {moduleView === "opportunities" && <PersonalOpportunitiesModule areaId={areaId} />}
        {moduleView === "presence" && <PersonalPresenceModule areaId={areaId} />}
      </div>
    );
  }

  const readinessChecks = [
    { label: "Perfil", done: !!profile },
    { label: "Skills", done: skills.length > 0 },
    { label: "Proyectos", done: areaProjects.length > 0 },
    { label: "Servicios", done: services.length > 0 },
    { label: "Presencia", done: platforms.length > 0 },
    { label: "Evidencia", done: proofItems.length > 0 || achievements.length > 0 },
  ];
  const readinessPct = Math.round((readinessChecks.filter((c) => c.done).length / readinessChecks.length) * 100);

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{area?.icon}</span>
          <div>
            <h1 className="text-2xl font-semibold text-ink">{area?.name}</h1>
            <p className="text-sm text-muted">Professional Identity & Opportunity Center</p>
          </div>
        </div>
        {profile && (
          <div className="ml-12 mt-2">
            <p className="text-sm text-ink">{profile.title}</p>
            {profile.short_bio && <p className="text-xs text-muted mt-1 max-w-lg line-clamp-2">{profile.short_bio}</p>}
          </div>
        )}
        <div className="flex items-center gap-2 mt-3 ml-12">
          <button onClick={onNavigateToKanban} className="text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink">📋 Kanban</button>
          <button onClick={() => setModuleView("profile")} className="text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink">
            {profile ? "Editar perfil" : "+ Perfil"}
          </button>
          <span className="text-xs text-faint font-hud ml-2">{doneTasks}/{areaTasks.length} tareas</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "SKILLS", value: skills.length },
          { label: "PROYECTOS", value: areaProjects.length },
          { label: "SERVICIOS", value: services.length },
          { label: "OPORTUNIDADES", value: opportunities.length },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-panel border border-border rounded-lg px-3 py-2.5 text-center">
            <div className="text-[10px] font-hud text-faint tracking-widest mb-1">{kpi.label}</div>
            <div className="text-lg font-semibold text-ink font-hud">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Top Skills */}
        <div className="bg-panel border border-border rounded-xl px-5 py-4">
          <h3 className="font-hud text-[10px] text-faint tracking-widest mb-3">⭐ TOP SKILLS</h3>
          {featuredSkills.length === 0 && skills.length === 0 ? (
            <p className="text-xs text-muted">Agrega habilidades para tu perfil profesional.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {(featuredSkills.length > 0 ? featuredSkills : skills).slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-sm text-ink">{s.name}</span>
                  <span className="text-xs text-faint capitalize">{s.level}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setModuleView("skills")} className="text-xs text-signal font-hud mt-3 hover:underline">Gestionar skills →</button>
        </div>

        {/* Readiness */}
        <div className="bg-panel border border-border rounded-xl px-5 py-4">
          <h3 className="font-hud text-[10px] text-faint tracking-widest mb-3">PROFILE READINESS</h3>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-2 bg-panelRaised rounded-full overflow-hidden">
              <div className="h-full bg-signal transition-all" style={{ width: `${readinessPct}%` }} />
            </div>
            <span className="text-sm font-semibold text-signal font-hud">{readinessPct}%</span>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {readinessChecks.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-xs">
                <span className={c.done ? "text-done" : "text-faint"}>{c.done ? "✓" : "○"}</span>
                <span className={c.done ? "text-ink" : "text-muted"}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { id: "profile" as ModuleView, icon: "👤", title: "Perfil", desc: profile ? profile.name || "Configurado" : "Sin configurar", action: profile ? "Editar" : "Crear", color: "#5AC8FA" },
          { id: "skills" as ModuleView, icon: "⚡", title: "Habilidades", desc: `${skills.length} skills · ${technologies.length} tecnologías`, action: "Gestionar", color: "#3DDC97" },
          { id: "projects" as ModuleView, icon: "🚀", title: "Proyectos", desc: `${areaProjects.length} proyectos · ${featuredProjects.length} destacados`, action: "Ver todos", color: "#F5A623" },
          { id: "services" as ModuleView, icon: "💼", title: "Servicios", desc: `${services.length} servicios definidos`, action: "Gestionar", color: "#B58AF5" },
          { id: "opportunities" as ModuleView, icon: "🎯", title: "Oportunidades", desc: `${opportunities.length} en pipeline`, action: "Ver pipeline", color: "#E5484D" },
          { id: "presence" as ModuleView, icon: "🌐", title: "Presencia", desc: `${platforms.length} plataformas`, action: "Gestionar", color: "#F5C542" },
        ].map((mod) => (
          <button key={mod.id} onClick={() => setModuleView(mod.id)} className="bg-panel border border-border rounded-xl px-4 py-4 text-left hover:border-borderLight hover:bg-panelRaised/20 transition-all group" style={{ borderLeftWidth: 3, borderLeftColor: mod.color }}>
            <div className="flex items-start justify-between mb-2"><span className="text-xl">{mod.icon}</span><span className="text-[10px] font-hud text-faint tracking-widest opacity-0 group-hover:opacity-100">{mod.action} →</span></div>
            <h3 className="text-sm font-semibold text-ink">{mod.title}</h3>
            <p className="text-xs text-signal font-hud mt-1">{mod.desc}</p>
          </button>
        ))}
      </div>

      {/* Featured Projects preview */}
      {featuredProjects.length > 0 && (
        <div className="mb-6">
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">🚀 PROYECTOS DESTACADOS</h2>
          <div className="grid grid-cols-3 gap-3">
            {featuredProjects.map((p) => (
              <div key={p.id} className="bg-panel border border-border rounded-lg px-4 py-3 hover:border-borderLight transition-colors">
                <p className="text-sm text-ink font-medium">{p.name}</p>
                {p.description && <p className="text-xs text-muted mt-1 line-clamp-2">{p.description}</p>}
                {p.category && <span className="text-[10px] font-hud text-faint mt-2 block">{p.category}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof of Work */}
      {(proofItems.length > 0 || achievements.length > 0) && (
        <div>
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">🧠 PROOF OF WORK</h2>
          <div className="bg-panel border border-border rounded-lg px-5 py-4">
            <div className="flex gap-6 text-sm">
              <div><span className="text-done font-semibold">{proofItems.length}</span><span className="text-muted ml-1">evidencias</span></div>
              <div><span className="text-done font-semibold">{achievements.length}</span><span className="text-muted ml-1">logros</span></div>
              <div><span className="text-done font-semibold">{areaProjects.length}</span><span className="text-muted ml-1">proyectos</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
