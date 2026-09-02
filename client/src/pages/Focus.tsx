import { useState, useEffect, useRef } from "react";
import { Pause, Play, CheckCircle, X } from "lucide-react";
import { useWorkOS } from "../store";

interface FocusProps {
  onExit: () => void;
}

export function Focus({ onExit }: FocusProps) {
  const { tasks, areas, projects, goals, sprint, startFocus, updateFocus, moveTask } = useWorkOS();
  const [session, setSession] = useState<any>(null);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeTask = tasks.find((t) => t.status === "en_ejecucion");
  const area = activeTask?.area_id ? areas.find((a) => a.id === activeTask.area_id) : null;
  const project = activeTask?.project_id ? projects.find((p) => p.id === activeTask.project_id) : null;
  const goal = project?.area_id ? goals.find((g) => g.area_id === project.area_id) : null;

  useEffect(() => {
    const init = async () => {
      if (!activeTask) return;
      try {
        const s = await startFocus({ task_id: activeTask.id, area_id: activeTask.area_id });
        setSession(s);
        setSeconds(s.duration_seconds || 0);
      } catch (err) {
        console.error("Focus init failed:", err);
      }
    };
    init();
  }, [activeTask, startFocus]);

  useEffect(() => {
    if (session && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session, isPaused]);

  const handlePause = async () => {
    if (!session) return;
    if (isPaused) {
      setIsPaused(false);
    } else {
      setIsPaused(true);
      await updateFocus(session.id, { status: "paused", duration_seconds: seconds });
    }
  };

  const handleComplete = async () => {
    if (session) {
      await updateFocus(session.id, { status: "completed", duration_seconds: seconds });
    }
    if (activeTask) {
      await moveTask(activeTask.id, "completado");
    }
    onExit();
  };

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (!activeTask) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-base">
        <div className="text-center">
          <div className="text-6xl mb-6">⚡</div>
          <h1 className="text-xl font-semibold text-ink mb-2">Sin tarea en ejecución</h1>
          <p className="text-sm text-muted mb-6 max-w-sm mx-auto">
            Ve al Kanban y mueve una tarea a "En Ejecución" antes de iniciar Focus.
          </p>
          <button
            onClick={onExit}
            className="font-hud text-xs px-4 py-2 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25"
          >
            VOLVER AL KANBAN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-base px-6">
      {/* Context breadcrumb */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 text-xs text-faint font-hud tracking-widest mb-1">
          {goal && <span>🎯 {goal.title}</span>}
          {goal && project && <span className="text-border">→</span>}
          {project && <span>📦 {project.name}</span>}
          {sprint && <span className="text-border">→</span>}
          {sprint && <span>📅 {sprint.name}</span>}
        </div>
        {area && (
          <p className="text-sm text-muted">
            {area.icon} {area.name}
          </p>
        )}
      </div>

      {/* Main task */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-ink mb-2">{activeTask.title}</h1>
        {activeTask.description && (
          <p className="text-sm text-muted max-w-md">{activeTask.description}</p>
        )}
      </div>

      {/* Timer */}
      <div className="text-7xl font-hud text-signal tracking-wider mb-10 tabular-nums">
        {formatTime(seconds)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePause}
          className={`flex items-center gap-2 font-hud text-sm px-6 py-3 rounded-lg border transition-all ${
            isPaused
              ? "bg-signal/15 text-signal border-signal/40 hover:bg-signal/25"
              : "bg-panelRaised text-muted border-border hover:text-ink hover:border-borderLight"
          }`}
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
          {isPaused ? "REANUDAR" : "PAUSAR"}
        </button>
        <button
          onClick={handleComplete}
          className="flex items-center gap-2 font-hud text-sm px-6 py-3 rounded-lg bg-done/15 text-done border border-done/40 hover:bg-done/25 transition-all"
        >
          <CheckCircle size={18} />
          COMPLETAR
        </button>
        <button
          onClick={onExit}
          className="flex items-center gap-2 font-hud text-sm px-4 py-3 rounded-lg text-faint hover:text-muted transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Bottom hint */}
      <p className="text-xs text-faint mt-10">
        {isPaused ? "Focus pausado" : "En ejecución"} · WIP limit activo · Solo una tarea a la vez
      </p>
    </div>
  );
}
