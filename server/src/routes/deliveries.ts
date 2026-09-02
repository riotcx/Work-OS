import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const deliveriesRouter = Router();

const VALID_STATUSES = ["pendiente", "en_produccion", "revision", "entregado"];

deliveriesRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM deliveries WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY due_date ASC, created_at DESC";
  res.json(db.prepare(query).all(...params));
});

deliveriesRouter.post("/", (req, res) => {
  const { name, client_id, offer_id, project_id, status, due_date, price, currency, area_id } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  const finalStatus = VALID_STATUSES.includes(status) ? status : "pendiente";
  db.prepare("INSERT INTO deliveries (id, name, client_id, offer_id, project_id, status, due_date, price, currency, area_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, name.trim(), client_id ?? null, offer_id ?? null, project_id ?? null, finalStatus, due_date ?? null, price ?? 0, currency ?? "USD", area_id ?? null, now, now);
  res.status(201).json(db.prepare("SELECT * FROM deliveries WHERE id = ?").get(id));
});

deliveriesRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM deliveries WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Entrega no encontrada" });
  const { status } = req.body;
  if (status && !VALID_STATUSES.includes(status)) return res.status(400).json({ error: "status inválido" });
  const fields = ["name","client_id","offer_id","project_id","status","due_date","price","currency","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE deliveries SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  res.json(db.prepare("SELECT * FROM deliveries WHERE id = ?").get(req.params.id));
});

deliveriesRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM deliveries WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
