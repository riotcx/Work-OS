import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const servicesRouter = Router();

servicesRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM services WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY featured DESC, created_at DESC";
  const services = db.prepare(query).all(...params) as any[];
  for (const s of services) {
    s.skills = db.prepare("SELECT skill_id FROM service_skills WHERE service_id = ?").all(s.id).map((r: any) => r.skill_id);
  }
  res.json(services);
});

servicesRouter.post("/", (req, res) => {
  const { name, description, category, price_min, price_max, currency, time_estimate, status, featured, area_id, notes, skills } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO services (id, name, description, category, price_min, price_max, currency, time_estimate, status, featured, area_id, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, name.trim(), description ?? "", category ?? "", price_min ?? 0, price_max ?? 0, currency ?? "USD", time_estimate ?? "", status ?? "activo", featured ? 1 : 0, area_id ?? null, notes ?? "", now, now);
  if (Array.isArray(skills)) {
    const ins = db.prepare("INSERT OR IGNORE INTO service_skills (service_id, skill_id) VALUES (?, ?)");
    for (const sid of skills) ins.run(id, sid);
  }
  const created = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as any;
  created.skills = skills ?? [];
  res.status(201).json(created);
});

servicesRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM services WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Servicio no encontrado" });
  const fields = ["name","description","category","price_min","price_max","currency","time_estimate","status","featured","area_id","notes"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => {
    if (f === "featured") return req.body[f] != null ? (req.body[f] ? 1 : 0) : null;
    return req.body[f] ?? null;
  });
  vals.push(req.params.id);
  db.prepare(`UPDATE services SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  if (Array.isArray(req.body.skills)) {
    db.prepare("DELETE FROM service_skills WHERE service_id = ?").run(req.params.id);
    const ins = db.prepare("INSERT OR IGNORE INTO service_skills (service_id, skill_id) VALUES (?, ?)");
    for (const sid of req.body.skills) ins.run(req.params.id, sid);
  }
  const updated = db.prepare("SELECT * FROM services WHERE id = ?").get(req.params.id) as any;
  updated.skills = db.prepare("SELECT skill_id FROM service_skills WHERE service_id = ?").all(req.params.id).map((r: any) => r.skill_id);
  res.json(updated);
});

servicesRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM services WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
