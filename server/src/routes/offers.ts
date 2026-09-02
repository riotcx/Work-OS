import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const offersRouter = Router();

offersRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM offers WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY featured DESC, created_at DESC";
  const offers = db.prepare(query).all(...params) as any[];
  for (const o of offers) {
    o.items = db.prepare("SELECT * FROM offer_items WHERE offer_id = ? ORDER BY sort_order ASC").all(o.id);
  }
  res.json(offers);
});

offersRouter.post("/", (req, res) => {
  const { name, description, service_id, price_min, price_max, currency, delivery_time, status, featured, area_id, items } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO offers (id, name, description, service_id, price_min, price_max, currency, delivery_time, status, featured, area_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, name.trim(), description ?? "", service_id ?? null, price_min ?? 0, price_max ?? 0, currency ?? "USD", delivery_time ?? "", status ?? "activo", featured ? 1 : 0, area_id ?? null, now, now);
  if (Array.isArray(items)) {
    const ins = db.prepare("INSERT INTO offer_items (id, offer_id, name, sort_order) VALUES (?, ?, ?, ?)");
    items.forEach((item: any, i: number) => {
      if (item.name) ins.run(nanoid(8), id, item.name, item.sort_order ?? i);
    });
  }
  const created = db.prepare("SELECT * FROM offers WHERE id = ?").get(id) as any;
  created.items = db.prepare("SELECT * FROM offer_items WHERE offer_id = ? ORDER BY sort_order ASC").all(id);
  res.status(201).json(created);
});

offersRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM offers WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Oferta no encontrada" });
  const fields = ["name","description","service_id","price_min","price_max","currency","delivery_time","status","featured","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => f === "featured" ? (req.body[f] != null ? (req.body[f] ? 1 : 0) : null) : req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE offers SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  if (Array.isArray(req.body.items)) {
    db.prepare("DELETE FROM offer_items WHERE offer_id = ?").run(req.params.id);
    const ins = db.prepare("INSERT INTO offer_items (id, offer_id, name, sort_order) VALUES (?, ?, ?, ?)");
    req.body.items.forEach((item: any, i: number) => {
      if (item.name) ins.run(nanoid(8), req.params.id, item.name, item.sort_order ?? i);
    });
  }
  const updated = db.prepare("SELECT * FROM offers WHERE id = ?").get(req.params.id) as any;
  updated.items = db.prepare("SELECT * FROM offer_items WHERE offer_id = ? ORDER BY sort_order ASC").all(req.params.id);
  res.json(updated);
});

offersRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM offers WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
