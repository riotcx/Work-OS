import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const platformsRouter = Router();

platformsRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM platforms";
  const params: unknown[] = [];
  if (area_id) { query += " WHERE area_id = ?"; params.push(area_id); }
  query += " ORDER BY priority ASC, created_at DESC";
  res.json(db.prepare(query).all(...params));
});

platformsRouter.post("/", (req, res) => {
  const { name, icon, url, handle, description, purpose, type, status, audience_count, followers, reach, post_frequency, notes, last_activity, priority, area_id } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO platforms (id, name, icon, url, handle, description, purpose, type, status, audience_count, followers, reach, post_frequency, notes, last_activity, priority, area_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name.trim(), icon ?? "", url ?? "", handle ?? "", description ?? "", purpose ?? "", type ?? "social", status ?? "activo", audience_count ?? 0, followers ?? 0, reach ?? 0, post_frequency ?? "", notes ?? "", last_activity ?? null, priority ?? "P2", area_id ?? null, now, now);
  res.status(201).json(db.prepare("SELECT * FROM platforms WHERE id = ?").get(id));
});

platformsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM platforms WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Plataforma no encontrada" });
  const fields = ["name","icon","url","handle","description","purpose","type","status","audience_count","followers","reach","post_frequency","notes","last_activity","priority","area_id"];
  const sets = fields.map(f => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map(f => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE platforms SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  res.json(db.prepare("SELECT * FROM platforms WHERE id = ?").get(req.params.id));
});

platformsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM platforms WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
