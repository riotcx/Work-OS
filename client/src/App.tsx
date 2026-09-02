import { useEffect, useState, useCallback } from "react";
import { useWorkOS } from "./store";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { SprintTracker } from "./components/SprintTracker";
import { Home } from "./pages/Home";
import { Today } from "./pages/Today";
import { Kanban } from "./pages/Kanban";
import { Projects } from "./pages/Projects";
import { Tasks } from "./pages/Tasks";
import { Ecosystem } from "./pages/Ecosystem";
import { Goals } from "./pages/Goals";
import { Settings } from "./pages/Settings";
import { AreaDetail } from "./pages/AreaDetail";
import { Focus } from "./pages/Focus";
import { Sprint } from "./pages/Sprint";
import { Analytics } from "./pages/Analytics";
import { Review } from "./pages/Review";
import { Week } from "./pages/Week";

export type View = "home" | "today" | "kanban" | "projects" | "tasks" | "ecosystem" | "goals" | "settings" | "area" | "focus" | "sprint" | "analytics" | "review" | "week";

export default function App() {
  const { loadAll, loading, error, activeAreaId, loadSprints } = useWorkOS();
  const [view, setView] = useState<View>("home");
  const [connected, setConnected] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadAll();
    loadSprints();
  }, [loadAll, loadSprints]);

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      setConnected(res.ok);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-base">
        <p className="font-hud text-sm text-faint tracking-widest animate-pulse">
          CARGANDO WORK OS…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-base gap-3 px-6 text-center">
        <p className="font-hud text-sm text-danger tracking-widest">NO SE PUDO CONECTAR</p>
        <p className="text-sm text-muted max-w-sm">
          {error}. Verifica que el servidor esté corriendo.
        </p>
      </div>
    );
  }

  if (view === "focus") {
    return <Focus onExit={() => setView("kanban")} />;
  }

  return (
    <div className="h-screen w-screen flex bg-base overflow-hidden">
      {/* Sidebar - hidden on mobile, slide-out drawer */}
      <div className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setSidebarOpen(false)} />
      <div className={`fixed left-0 top-0 bottom-0 z-40 transition-transform md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar view={view} onNavigate={(v) => { setView(v); setSidebarOpen(false); }} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-panel md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="font-hud text-sm text-ink tracking-widest">
            ⚔️ WORK OS
          </button>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-done" : "bg-danger"}`} title={connected ? "Conectado" : "Sin conexión"} />
          </div>
        </div>
        <div className="hidden md:flex">{/* SprintTracker visible on desktop */}</div>
        <SprintTracker />
        <div className="flex-1 overflow-y-auto pb-14 md:pb-0">
          {view === "home" && <Home />}
          {view === "today" && <Today onNavigate={setView} />}
          {view === "kanban" && <Kanban />}
          {view === "projects" && <Projects />}
          {view === "tasks" && <Tasks />}
          {view === "ecosystem" && <Ecosystem onNavigate={setView} />}
          {view === "goals" && <Goals />}
          {view === "settings" && <Settings />}
          {view === "sprint" && <Sprint onNavigate={setView} />}
          {view === "week" && <Week />}
          {view === "analytics" && <Analytics />}
          {view === "review" && <Review />}
          {view === "area" && activeAreaId && (
            <AreaDetail areaId={activeAreaId} onNavigateToKanban={() => setView("kanban")} />
          )}
        </div>
      </div>

      <MobileNav view={view} onNavigate={setView} />
    </div>
  );
}
