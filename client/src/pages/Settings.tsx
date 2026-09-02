import { useState } from "react";
import { Download, Upload, Trash2 } from "lucide-react";

type Theme = "dark" | "light";

export function Settings() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("workos-theme") as Theme) || "dark";
  });
  const [message, setMessage] = useState("");

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    localStorage.setItem("workos-theme", t);
    document.documentElement.classList.toggle("light", t === "light");
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/tasks");
      const tasks = await res.json();
      const blob = new Blob([JSON.stringify({ tasks, exportedAt: new Date().toISOString() }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `work-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Backup exportado correctamente.");
    } catch {
      setMessage("Error al exportar backup.");
    }
  };

  const handleReset = () => {
    if (confirm("¿Estás seguro? Esto eliminará todos los datos locales. Esta acción no se puede deshacer.")) {
      localStorage.clear();
      setMessage("Datos locales eliminados. Refresca la página.");
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-ink mb-6">⚙️ Settings</h1>

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="font-hud text-xs text-faint tracking-widest mb-3">APPEARANCE</h2>
        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            {(["dark", "light"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`px-4 py-2 rounded-md text-sm border transition-colors capitalize ${
                  theme === t
                    ? "border-signal/40 bg-signal/10 text-signal"
                    : "border-border text-muted hover:text-ink hover:border-borderLight"
                }`}
              >
                {t === "dark" ? "🌙 Dark" : "☀️ Light"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="mb-8">
        <h2 className="font-hud text-xs text-faint tracking-widest mb-3">DATA</h2>
        <div className="bg-panel border border-border rounded-lg p-4">
          <p className="text-sm text-muted mb-4">
            Work OS guarda tus datos localmente en SQLite. Exporta un backup periódicamente.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-border text-muted hover:text-ink hover:border-borderLight transition-colors"
            >
              <Download size={14} />
              Exportar backup
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-danger/30 text-faint hover:text-danger hover:border-danger/50 transition-colors"
            >
              <Trash2 size={14} />
              Resetear datos
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mb-8">
        <h2 className="font-hud text-xs text-faint tracking-widest mb-3">ABOUT</h2>
        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Versión</span>
              <span className="text-ink font-hud">v0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Arquitectura</span>
              <span className="text-ink">local-first</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Stack</span>
              <span className="text-ink">React + Express + SQLite</span>
            </div>
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section>
        <h2 className="font-hud text-xs text-faint tracking-widest mb-3">KEYBOARD SHORTCUTS</h2>
        <div className="bg-panel border border-border rounded-lg p-4">
          <div className="space-y-2 text-sm">
            {[
              { key: "⌘ K", desc: "Búsqueda universal (próximamente)" },
              { key: "N", desc: "Quick add (próximamente)" },
              { key: "F", desc: "Focus mode (próximamente)" },
              { key: "H", desc: "Ir a Inicio" },
              { key: "T", desc: "Ir a Hoy" },
              { key: "K", desc: "Ir a Kanban" },
            ].map((sc) => (
              <div key={sc.key} className="flex justify-between">
                <span className="text-muted">{sc.desc}</span>
                <kbd className="text-xs font-hud text-faint bg-panelRaised border border-border rounded px-2 py-0.5">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {message && (
        <div className="mt-4 text-sm text-signal font-hud bg-signal/5 border border-signal/20 rounded-md px-3 py-2">
          {message}
        </div>
      )}
    </div>
  );
}
