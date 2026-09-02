import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const opportunitiesRouter = Router();

const VALID_STATUSES = ["nueva","contactada","conversación","propuesta","negociación","ganada","perdida"];

opportunitiesRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM opportunities WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY created_at DESC";
  res.json(db.prepare(query).all(...params));
});

opportunitiesRouter.post("/", (req, res) => {
  const { name, company, type, source, service_id, value, currency, status, area_id, next_action, notes } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  const finalStatus = VALID_STATUSES.includes(status) ? status : "nueva";
  db.prepare("INSERT INTO opportunities (id, name, company, type, source, service_id, value, currency, status, area_id, next_action, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, name.trim(), company ?? "", type ?? "", source ?? "", service_id ?? null, value ?? 0, currency ?? "USD", finalStatus, area_id ?? null, next_action ?? "", notes ?? "", now, now);
  res.status(201).json(db.prepare("SELECT * FROM opportunities WHERE id = ?").get(id));
});

opportunitiesRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM opportunities WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Oportunidad no encontrada" });
  const { status } = req.body;
  if (status && !VALID_STATUSES.includes(status)) return res.status(400).json({ error: "status inválido" });
  const fields = ["name","company","type","source","service_id","value","currency","status","area_id","next_action","notes"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE opportunities SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  res.json(db.prepare("SELECT * FROM opportunities WHERE id = ?").get(req.params.id));
});

opportunitiesRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM opportunities WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
