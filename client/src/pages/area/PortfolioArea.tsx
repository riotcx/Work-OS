import { useEffect, useState } from "react";
import { useWorkOS } from "../../store";

interface Props { areaId: string; onNavigateToKanban: () => void; }

export function PortfolioArea({ areaId, onNavigateToKanban }: Props) {
  const { areas, tasks, projects, skills, technologies, proofItems, achievements, caseStudies, profiles, loadAreaData } = useWorkOS();
  const area = areas.find((a) => a.id === areaId);
  const areaProjects = projects.filter((p) => p.area_id === areaId);
  const featuredProjects = areaProjects.filter((p) => p.featured);
  const areaSkills = skills.filter((s) => s.area_id === areaId);
  const featuredSkills = areaSkills.filter((s) => s.featured);
  const areaTech = technologies.filter((t) => t.area_id === areaId);
  const profile = profiles.find((p) => p.area_id === areaId);

  useEffect(() => { if (areaId) loadAreaData(areaId); }, [areaId]);

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><span className="text-3xl">{area?.icon}</span><div><h1 className="text-2xl font-semibold text-ink">{area?.name}</h1><p className="text-sm text-muted">Professional Evidence Center</p></div></div>
        {profile?.title && <p className="text-xs text-muted ml-12 mb-1">{profile.title}</p>}
        <button onClick={onNavigateToKanban} className="text-xs px-3 py-1 rounded-md border border-border text-muted hover:text-ink ml-12">📋 Kanban</button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[{ label: "PROYECTOS", value: areaProjects.length }, { label: "SKILLS", value: areaSkills.length }, { label: "TECHS", value: areaTech.length }, { label: "EVIDENCIA", value: proofItems.length + achievements.length }].map((k) => (
          <div key={k.label} className="bg-panel border border-border rounded-lg px-3 py-2 text-center"><div className="text-[10px] font-hud text-faint">{k.label}</div><div className="text-lg font-semibold text-ink font-hud">{k.value}</div></div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: "🚀", title: "Proyectos", desc: `${featuredProjects.length} destacados de ${areaProjects.length}`, color: "#F5A623" },
          { icon: "📖", title: "Case Studies", desc: `${caseStudies.length} casos documentados`, color: "#3DDC97" },
          { icon: "⚡", title: "Skills", desc: `${featuredSkills.length}/${areaSkills.length} habilidades`, color: "#5AC8FA" },
          { icon: "💻", title: "Tecnologías", desc: `${areaTech.length} registradas`, color: "#B58AF5" },
          { icon: "🏆", title: "Credenciales", desc: `${achievements.length} logros· ${proofItems.length} evidencias`, color: "#E5484D" },
          { icon: "⭐", title: "Social Proof", desc: "Testimonios y resultados", color: "#F5C542" },
        ].map((m) => (
          <div key={m.title} className="bg-panel border border-border rounded-xl px-4 py-4" style={{ borderLeftWidth: 3, borderLeftColor: m.color }}>
            <div className="text-xl mb-2">{m.icon}</div>
            <h3 className="text-sm font-semibold text-ink">{m.title}</h3>
            <p className="text-xs text-signal font-hud mt-1">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <div className="mb-6">
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">PROYECTOS DESTACADOS</h2>
          <div className="grid grid-cols-2 gap-3">
            {featuredProjects.map((p) => (
              <div key={p.id} className="bg-panel border border-border rounded-lg px-4 py-3">
                <p className="text-sm text-ink font-medium">{p.name}</p>
                {p.description && <p className="text-xs text-muted mt-1 line-clamp-2">{p.description}</p>}
                {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-info mt-1 block">GitHub ↗</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills summary */}
      {featuredSkills.length > 0 && (
        <div>
          <h2 className="font-hud text-[10px] text-faint tracking-widest mb-3">⭐ SKILLS DESTACADAS</h2>
          <div className="flex flex-wrap gap-2">
            {featuredSkills.map((s) => (
              <span key={s.id} className="text-xs px-3 py-1.5 rounded-lg bg-panel border border-border text-ink">{s.name} · {s.level}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
