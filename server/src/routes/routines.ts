import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const routinesRouter = Router();

routinesRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM routines WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY time ASC";
  res.json(db.prepare(query).all(...params));
});

routinesRouter.post("/", (req, res) => {
  const { name, time, days, duration_minutes, steps, active, area_id } = req.body;
  if (!name) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO routines (id, name, time, days, duration_minutes, steps, active, area_id, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
    .run(id, name, time ?? "", days ?? "", duration_minutes ?? 0, steps ?? "", active != null ? (active ? 1 : 0) : 1, area_id ?? null, now, now);
  res.status(201).json(db.prepare("SELECT * FROM routines WHERE id = ?").get(id));
});

routinesRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM routines WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Rutina no encontrada" });
  const fields = ["name","time","days","duration_minutes","steps","active","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => f === "active" ? (req.body[f] != null ? (req.body[f] ? 1 : 0) : null) : req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE routines SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  res.json(db.prepare("SELECT * FROM routines WHERE id = ?").get(req.params.id));
});

routinesRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM routines WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
