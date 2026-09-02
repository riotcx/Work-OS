import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const funnelRouter = Router();

funnelRouter.get("/stages", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM funnel_stages";
  const params: unknown[] = [];
  if (area_id) { query += " WHERE area_id = ?"; params.push(area_id); }
  query += " ORDER BY sort_order ASC";
  const stages = db.prepare(query).all(...params) as any[];
  for (const s of stages) {
    const latest = db.prepare("SELECT * FROM funnel_entries WHERE funnel_stage_id = ? ORDER BY recorded_at DESC LIMIT 1").get(s.id) as any;
    s.latest_value = latest?.value ?? 0;
  }
  res.json(stages);
});

funnelRouter.post("/stages", (req, res) => {
  const { name, description, sort_order, area_id } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  db.prepare("INSERT INTO funnel_stages (id, name, description, sort_order, area_id, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, name.trim(), description ?? "", sort_order ?? 0, area_id ?? null, new Date().toISOString());
  res.status(201).json(db.prepare("SELECT * FROM funnel_stages WHERE id = ?").get(id));
});

funnelRouter.put("/stages/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM funnel_stages WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Etapa no encontrada" });
  const { name, description, sort_order, area_id } = req.body;
  db.prepare("UPDATE funnel_stages SET name = COALESCE(?, name), description = COALESCE(?, description), sort_order = COALESCE(?, sort_order), area_id = ? WHERE id = ?")
    .run(name ?? null, description ?? null, sort_order ?? null, area_id ?? null, req.params.id);
  res.json(db.prepare("SELECT * FROM funnel_stages WHERE id = ?").get(req.params.id));
});

funnelRouter.delete("/stages/:id", (req, res) => {
  db.prepare("DELETE FROM funnel_stages WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

funnelRouter.get("/entries", (req, res) => {
  const { area_id, stage_id } = req.query;
  let query = "SELECT * FROM funnel_entries WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  if (stage_id) { query += " AND funnel_stage_id = ?"; params.push(stage_id); }
  query += " ORDER BY recorded_at DESC";
  res.json(db.prepare(query).all(...params));
});

funnelRouter.post("/entries", (req, res) => {
  const { funnel_stage_id, value, area_id } = req.body;
  if (!funnel_stage_id) return res.status(400).json({ error: "funnel_stage_id es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO funnel_entries (id, funnel_stage_id, value, area_id, recorded_at, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, funnel_stage_id, value ?? 0, area_id ?? null, now, now);
  res.status(201).json(db.prepare("SELECT * FROM funnel_entries WHERE id = ?").get(id));
});
