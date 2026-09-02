import { Home, Swords, Kanban as KanbanIcon, FolderKanban, ListTodo, Settings, Globe, Target, Timer, Calendar, BarChart3, BookOpen } from "lucide-react";
import { useWorkOS } from "../store";
import type { View } from "../App";

interface SidebarProps {
  view: View;
  onNavigate: (v: View) => void;
}

export function Sidebar({ view, onNavigate }: SidebarProps) {
  const { areas, tasks, activeAreaId, setActiveArea } = useWorkOS();

  const link = (v: View) => {
    onNavigate(v);
    if (v !== "area") setActiveArea(null);
  };

  const enEjecucion = tasks.filter((t) => t.status === "en_ejecucion").length;

  return (
    <aside className="w-56 shrink-0 h-screen bg-panel border-r border-border flex flex-col">
      <div className="px-5 py-4 border-b border-border">
        <button onClick={() => link("home")} className="flex items-center gap-2 font-hud text-sm text-ink tracking-widest hover:text-signal transition-colors">
          <span>⚔️</span>
          <span>WORK OS</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <NavButton active={view === "today"} icon={Swords} label="Hoy" onClick={() => link("today")} />
          <NavButton active={view === "kanban"} icon={KanbanIcon} label="Kanban" onClick={() => link("kanban")} />
          {enEjecucion > 0 && (
            <button
              onClick={() => link("focus")}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-left text-signal bg-signal/10 border border-signal/20 hover:bg-signal/15 transition-colors animate-pulse"
            >
              <Timer size={15} />
              Focus
              <span className="text-[10px] font-hud ml-auto">{enEjecucion}</span>
            </button>
          )}
          <NavButton active={view === "sprint"} icon={Calendar} label="Sprint" onClick={() => link("sprint")} />
          <NavButton active={view === "week"} icon={Calendar} label="Semana" onClick={() => link("week")} />
          <NavButton active={view === "goals"} icon={Target} label="Objetivos" onClick={() => link("goals")} />
        </div>

        <div className="border-t border-border" />

        <div className="flex flex-col gap-0.5">
          <NavButton active={view === "analytics"} icon={BarChart3} label="Analytics" onClick={() => link("analytics")} />
          <NavButton active={view === "review"} icon={BookOpen} label="Review" onClick={() => link("review")} />
        </div>

        <div className="border-t border-border" />

        <div>
          <div className="px-3 pb-1.5 text-[10px] font-hud text-faint tracking-[0.15em]">ÁREAS</div>
          <div className="flex flex-col gap-0.5">
            {areas.map((area) => {
              const count = tasks.filter((t) => t.area_id === area.id && t.status !== "completado").length;
              const active = activeAreaId === area.id;
              return (
                <button
                  key={area.id}
                  onClick={() => { setActiveArea(area.id); onNavigate("area"); }}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-left transition-colors ${
                    active ? "text-ink bg-panelRaised/60" : "text-muted hover:text-ink hover:bg-panelRaised/40"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{area.icon}</span>
                    <span className="truncate">{area.name}</span>
                  </span>
                  {count > 0 && <span className="text-[10px] font-hud text-faint">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="flex flex-col gap-0.5">
          <NavButton active={view === "projects"} icon={FolderKanban} label="Proyectos" onClick={() => link("projects")} />
          <NavButton active={view === "tasks"} icon={ListTodo} label="Tareas" onClick={() => link("tasks")} />
        </div>

        <div className="border-t border-border" />

        <div className="flex flex-col gap-0.5">
          <NavButton active={view === "ecosystem"} icon={Globe} label="Ecosistema" onClick={() => link("ecosystem")} />
        </div>
      </nav>

      <div className="border-t border-border px-3 py-2 flex flex-col gap-0.5">
        <NavButton active={view === "settings"} icon={Settings} label="Configuración" onClick={() => link("settings")} />
      </div>

      <div className="px-5 py-3 border-t border-border text-[10px] text-faint font-hud">
        v0.1 · local-first
      </div>
    </aside>
  );
}

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Home; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors text-left ${active ? "bg-panelRaised text-ink shadow-signal" : "text-muted hover:text-ink hover:bg-panelRaised/60"}`}>
      <Icon size={15} strokeWidth={2} className={active ? "text-signal" : ""} />
      {label}
    </button>
  );
}
