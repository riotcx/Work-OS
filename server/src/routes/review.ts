import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const reviewRouter = Router();

reviewRouter.get("/", (req, res) => {
  const { sprint_id } = req.query;
  let query = "SELECT * FROM review_entries";
  const params: unknown[] = [];
  if (sprint_id) { query += " WHERE sprint_id = ?"; params.push(sprint_id); }
  query += " ORDER BY created_at DESC";
  res.json(db.prepare(query).all(...params));
});

reviewRouter.get("/sprint/:id", (req, res) => {
  const sprint = db.prepare("SELECT * FROM sprints WHERE id = ?").get(req.params.id) as any;
  if (!sprint) return res.status(404).json({ error: "Sprint no encontrado" });

  const tasks = db.prepare("SELECT * FROM tasks WHERE sprint_id = ?").all(req.params.id) as any[];
  const done = tasks.filter((t: any) => t.status === "completado");
  const pending = tasks.filter((t: any) => t.status !== "completado");
  const total = tasks.length;

  const planByArea: Record<string, { total: number; done: number }> = {};
  for (const t of tasks) {
    if (!t.area_id) continue;
    if (!planByArea[t.area_id]) planByArea[t.area_id] = { total: 0, done: 0 };
    planByArea[t.area_id].total++;
    if (t.status === "completado") planByArea[t.area_id].done++;
  }

  const focusSessions = db.prepare(`
    SELECT fs.* FROM focus_sessions fs
    JOIN tasks t ON t.id = fs.task_id
    WHERE t.sprint_id = ? AND fs.status = 'completed'
  `).all(req.params.id) as any[];
  const totalFocusSeconds = focusSessions.reduce((s: number, fs: any) => s + (fs.duration_seconds || 0), 0);

  const entry = db.prepare("SELECT * FROM review_entries WHERE sprint_id = ?").get(req.params.id);

  res.json({
    sprint,
    tasks: { total, done: done.length, pending: pending.length, doneList: done, pendingList: pending },
    planByArea,
    focus: { sessions: focusSessions.length, totalSeconds: totalFocusSeconds },
    review: entry || null,
  });
});

reviewRouter.post("/", (req, res) => {
  const { sprint_id, what_worked, what_didnt, what_learned, what_change } = req.body;
  if (!sprint_id) return res.status(400).json({ error: "sprint_id es requerido" });

  const existing = db.prepare("SELECT * FROM review_entries WHERE sprint_id = ?").get(sprint_id);
  if (existing) {
    db.prepare("UPDATE review_entries SET what_worked = COALESCE(?, what_worked), what_didnt = COALESCE(?, what_didnt), what_learned = COALESCE(?, what_learned), what_change = COALESCE(?, what_change) WHERE sprint_id = ?")
      .run(what_worked ?? null, what_didnt ?? null, what_learned ?? null, what_change ?? null, sprint_id);
    res.json(db.prepare("SELECT * FROM review_entries WHERE sprint_id = ?").get(sprint_id));
    return;
  }

  const id = nanoid(10);
  db.prepare("INSERT INTO review_entries (id, sprint_id, what_worked, what_didnt, what_learned, what_change, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(id, sprint_id, what_worked ?? "", what_didnt ?? "", what_learned ?? "", what_change ?? "", new Date().toISOString());
  res.status(201).json(db.prepare("SELECT * FROM review_entries WHERE id = ?").get(id));
});

reviewRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM review_entries WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Review no encontrada" });
  const fields = ["what_worked","what_didnt","what_learned","what_change"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE review_entries SET ${sets} WHERE id = ?`).run(...vals);
  res.json(db.prepare("SELECT * FROM review_entries WHERE id = ?").get(req.params.id));
});
