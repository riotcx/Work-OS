import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const focusRouter = Router();

focusRouter.get("/", (req, res) => {
  const { area_id, task_id } = req.query;
  let query = "SELECT * FROM focus_sessions WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  if (task_id) { query += " AND task_id = ?"; params.push(task_id); }
  query += " ORDER BY created_at DESC LIMIT 50";
  res.json(db.prepare(query).all(...params));
});

focusRouter.post("/", (req, res) => {
  const { task_id, area_id } = req.body;
  if (!task_id) return res.status(400).json({ error: "task_id es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO focus_sessions (id, task_id, started_at, status, area_id, created_at) VALUES (?, ?, ?, 'active', ?, ?)")
    .run(id, task_id, now, area_id ?? null, now);
  res.status(201).json(db.prepare("SELECT * FROM focus_sessions WHERE id = ?").get(id));
});

focusRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM focus_sessions WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Sesión no encontrada" });
  const { status, duration_seconds } = req.body;
  const ended_at = status === "completed" || status === "paused" ? new Date().toISOString() : null;
  db.prepare("UPDATE focus_sessions SET status = COALESCE(?, status), ended_at = COALESCE(?, ended_at), duration_seconds = COALESCE(?, duration_seconds) WHERE id = ?")
    .run(status ?? null, ended_at, duration_seconds ?? null, req.params.id);
  res.json(db.prepare("SELECT * FROM focus_sessions WHERE id = ?").get(req.params.id));
});
