import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const habitsRouter = Router();

habitsRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM habits WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY category, name";
  const habits = db.prepare(query).all(...params) as any[];
  for (const h of habits) {
    const today = new Date().toISOString().slice(0, 10);
    h.today_log = db.prepare("SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?").get(h.id, today);
    h.logs = db.prepare("SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY date DESC LIMIT 14").all(h.id);
  }
  res.json(habits);
});

habitsRouter.post("/", (req, res) => {
  const { name, frequency, target_value, unit, active, category, area_id } = req.body;
  if (!name) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO habits (id, name, frequency, target_value, unit, streak, active, category, area_id, created_at, updated_at) VALUES (?,?,?,?,?,0,?,?,?,?,?)")
    .run(id, name, frequency ?? "daily", target_value ?? 1, unit ?? "", active != null ? (active ? 1 : 0) : 1, category ?? "", area_id ?? null, now, now);
  res.status(201).json(db.prepare("SELECT * FROM habits WHERE id = ?").get(id));
});

habitsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM habits WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Hábito no encontrado" });
  const fields = ["name","frequency","target_value","unit","streak","active","category","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE habits SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  res.json(db.prepare("SELECT * FROM habits WHERE id = ?").get(req.params.id));
});

habitsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM habits WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

habitsRouter.post("/:id/log", (req, res) => {
  const { date, status } = req.body;
  const today = date || new Date().toISOString().slice(0, 10);
  const existing = db.prepare("SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?").get(req.params.id, today);
  if (existing) {
    db.prepare("UPDATE habit_logs SET status = ? WHERE id = ?").run(status ?? "completed", (existing as any).id);
    const streak = db.prepare("SELECT COUNT(*) as c FROM habit_logs WHERE habit_id = ? AND status = 'completed' AND date >= DATE(?, '-7 days')").get(req.params.id, today) as any;
    db.prepare("UPDATE habits SET streak = ? WHERE id = ?").run(streak.c, req.params.id);
    res.json(db.prepare("SELECT * FROM habit_logs WHERE id = ?").get((existing as any).id));
  } else {
    const id = nanoid(10);
    db.prepare("INSERT INTO habit_logs (id, habit_id, date, status, created_at) VALUES (?,?,?,?,?)").run(id, req.params.id, today, status ?? "completed", new Date().toISOString());
    const streak = db.prepare("SELECT COUNT(*) as c FROM habit_logs WHERE habit_id = ? AND status = 'completed' AND date >= DATE(?, '-7 days')").get(req.params.id, today) as any;
    db.prepare("UPDATE habits SET streak = ? WHERE id = ?").run(streak.c, req.params.id);
    res.status(201).json(db.prepare("SELECT * FROM habit_logs WHERE id = ?").get(id));
  }
});

habitsRouter.delete("/:id/log/:date", (req, res) => {
  db.prepare("DELETE FROM habit_logs WHERE habit_id = ? AND date = ?").run(req.params.id, req.params.date);
  res.status(204).end();
});
