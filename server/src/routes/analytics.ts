import { Router } from "express";
import { db } from "../db.js";

export const analyticsRouter = Router();

analyticsRouter.get("/overview", (_req, res) => {
  const now = new Date().toISOString();

  const totalTasks = (db.prepare("SELECT COUNT(*) as c FROM tasks").get() as any).c;
  const completedTasks = (db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'completado'").get() as any).c;
  const activeProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'activo'").get() as any).c;
  const totalProjects = (db.prepare("SELECT COUNT(*) as c FROM projects").get() as any).c;
  const completedProjects = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status IN ('completado','archivado') OR completed_at IS NOT NULL").get() as any).c;

  const activeSprint = db.prepare("SELECT * FROM sprints WHERE status = 'activo' LIMIT 1").get() as any;
  let sprintData = null;
  if (activeSprint) {
    const sprintTasks = db.prepare("SELECT * FROM tasks WHERE sprint_id = ?").all(activeSprint.id) as any[];
    const sprintDone = sprintTasks.filter((t: any) => t.status === "completado").length;
    const sprintTotal = sprintTasks.length;
    sprintData = {
      id: activeSprint.id,
      name: activeSprint.name,
      start_date: activeSprint.start_date,
      end_date: activeSprint.end_date,
      total: sprintTotal,
      completed: sprintDone,
      remaining: sprintTotal - sprintDone,
      carryover: sprintTasks.filter((t: any) => t.status !== "completado").length,
      progress: sprintTotal > 0 ? Math.round((sprintDone / sprintTotal) * 100) : 0,
    };
  }

  const totalFocusSeconds = (db.prepare("SELECT COALESCE(SUM(duration_seconds), 0) as s FROM focus_sessions WHERE status = 'completed'").get() as any).s;
  const totalFocusSessions = (db.prepare("SELECT COUNT(*) as c FROM focus_sessions WHERE status = 'completed'").get() as any).c;

  const today = now.slice(0, 10);
  const todayDone = (db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'completado' AND completed_at >= ? AND completed_at < ?").get(today + "T00:00:00", today + "T23:59:59") as any).c;

  const totalGoals = (db.prepare("SELECT COUNT(*) as c FROM goals").get() as any).c;
  const activeGoals = (db.prepare("SELECT COUNT(*) as c FROM goals WHERE status = 'activo'").get() as any).c;

  const areaCounts = db.prepare(`
    SELECT a.id, a.name, a.icon, a.area_type,
      COUNT(t.id) as total_tasks,
      SUM(CASE WHEN t.status = 'completado' THEN 1 ELSE 0 END) as done_tasks
    FROM areas a
    LEFT JOIN tasks t ON t.area_id = a.id
    GROUP BY a.id
    ORDER BY a.sort_order
  `).all();

  const alignmentStats = db.prepare(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN project_id IS NOT NULL AND area_id IS NOT NULL THEN 1 ELSE 0 END), 0) as aligned,
      COALESCE(SUM(CASE WHEN project_id IS NOT NULL AND area_id IS NULL THEN 1 ELSE 0 END), 0) as project_aligned,
      COALESCE(SUM(CASE WHEN project_id IS NULL THEN 1 ELSE 0 END), 0) as orphan
    FROM tasks WHERE status != 'completado'
  `).get() as any;

  const weeklyCompletions = db.prepare(`
    SELECT DATE(completed_at) as date, COUNT(*) as count
    FROM tasks
    WHERE completed_at IS NOT NULL AND completed_at >= DATE('now', '-28 days')
    GROUP BY DATE(completed_at)
    ORDER BY date ASC
  `).all();

  const focusTimeByDay = db.prepare(`
    SELECT DATE(created_at) as date, COALESCE(SUM(duration_seconds), 0) as seconds
    FROM focus_sessions
    WHERE status = 'completed' AND created_at >= DATE('now', '-28 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all();

  const insights: string[] = [];
  if (totalTasks > 0) {
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    if (completionRate < 50) insights.push(`Tu tasa de finalización general es del ${completionRate}%. Considera cerrar o eliminar tareas que ya no sean relevantes.`);
    else if (completionRate > 80) insights.push(`Excelente tasa de finalización: ${completionRate}%.`);
  }

  if (activeSprint && sprintData!.total > 0) {
    if (sprintData!.remaining > 10) insights.push(`Te quedan ${sprintData!.remaining} tareas pendientes en este sprint. Evalúa si puedes completarlas o si debes reducirlas.`);
    if (sprintData!.progress < 30 && sprintData!.total > 5) insights.push(`El sprint actual tiene solo ${sprintData!.progress}% de progreso. Considera ajustar tu plan.`);
  }

  if (alignmentStats) {
    const orphanPct = alignmentStats.total > 0 ? Math.round((alignmentStats.orphan / alignmentStats.total) * 100) : 0;
    if (orphanPct > 50) insights.push(`${orphanPct}% de tus tareas activas no están asociadas a ningún proyecto. Asígnalas para darles contexto.`);
  }

  if (activeProjects > 5) insights.push(`Tienes ${activeProjects} proyectos activos. Demasiados proyectos simultáneos pueden diluir tu ejecución.`);

  res.json({
    tasks: { total: totalTasks, completed: completedTasks, todayDone },
    projects: { active: activeProjects, total: totalProjects, completed: completedProjects },
    sprint: sprintData,
    focus: { totalSeconds: totalFocusSeconds, totalSessions: totalFocusSessions },
    goals: { total: totalGoals, active: activeGoals },
    areaCounts,
    alignment: alignmentStats,
    weeklyCompletions,
    focusTimeByDay,
    insights,
    generatedAt: now,
  });
});

analyticsRouter.get("/trends", (req, res) => {
  const days = parseInt(req.query.days as string) || 30;

  const completions = db.prepare(`
    SELECT DATE(completed_at) as date, COUNT(*) as count
    FROM tasks WHERE completed_at IS NOT NULL AND completed_at >= DATE('now', ? || ' days')
    GROUP BY DATE(completed_at) ORDER BY date
  `).all(`-${days}`);

  const creations = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM tasks WHERE created_at >= DATE('now', ? || ' days')
    GROUP BY DATE(created_at) ORDER BY date
  `).all(`-${days}`);

  const focus = db.prepare(`
    SELECT DATE(created_at) as date, COALESCE(SUM(duration_seconds), 0) as seconds
    FROM focus_sessions WHERE status = 'completed' AND created_at >= DATE('now', ? || ' days')
    GROUP BY DATE(created_at) ORDER BY date
  `).all(`-${days}`);

  res.json({ completions, creations, focus });
});

analyticsRouter.get("/sprints", (_req, res) => {
  const sprints = db.prepare("SELECT * FROM sprints ORDER BY start_date DESC LIMIT 10").all() as any[];
  const result = sprints.map((s: any) => {
    const sprintTasks = db.prepare("SELECT * FROM tasks WHERE sprint_id = ?").all(s.id) as any[];
    const done = sprintTasks.filter((t: any) => t.status === "completado").length;
    const total = sprintTasks.length;
    return {
      ...s,
      total_tasks: total,
      completed_tasks: done,
      carryover: total - done,
      completion_rate: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });
  res.json(result);
});
