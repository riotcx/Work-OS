import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const metricsRouter = Router();

metricsRouter.get("/", (req, res) => {
  const { area_id, category } = req.query;
  let query = "SELECT * FROM metrics WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  if (category) { query += " AND category = ?"; params.push(category); }
  query += " ORDER BY recorded_at DESC";
  res.json(db.prepare(query).all(...params));
});

metricsRouter.post("/", (req, res) => {
  const { name, value, unit, category, source, platform_id, area_id } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO metrics (id, name, value, unit, category, source, platform_id, area_id, recorded_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, name.trim(), value ?? 0, unit ?? "", category ?? "adquisicion", source ?? "manual", platform_id ?? null, area_id ?? null, now, now);
  res.status(201).json(db.prepare("SELECT * FROM metrics WHERE id = ?").get(id));
});

metricsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM metrics WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Métrica no encontrada" });
  const fields = ["name","value","unit","category","source","platform_id","area_id"];
  const sets = fields.map(f => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map(f => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE metrics SET ${sets} WHERE id = ?`).run(...vals);
  res.json(db.prepare("SELECT * FROM metrics WHERE id = ?").get(req.params.id));
});

metricsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM metrics WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
