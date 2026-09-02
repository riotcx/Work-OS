import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const communitiesRouter = Router();

communitiesRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM communities";
  const params: unknown[] = [];
  if (area_id) { query += " WHERE area_id = ?"; params.push(area_id); }
  query += " ORDER BY created_at DESC";
  res.json(db.prepare(query).all(...params));
});

communitiesRouter.post("/", (req, res) => {
  const { name, platform, url, description, purpose, member_count, active_users, activity_frequency, created_date, status, goal, notes, area_id } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO communities (id, name, platform, url, description, purpose, member_count, active_users, activity_frequency, created_date, status, goal, notes, area_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name.trim(), platform ?? "", url ?? "", description ?? "", purpose ?? "", member_count ?? 0, active_users ?? 0, activity_frequency ?? "", created_date ?? null, status ?? "activo", goal ?? "", notes ?? "", area_id ?? null, now, now);
  res.status(201).json(db.prepare("SELECT * FROM communities WHERE id = ?").get(id));
});

communitiesRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM communities WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Comunidad no encontrada" });
  const fields = ["name","platform","url","description","purpose","member_count","active_users","activity_frequency","created_date","status","goal","notes","area_id"];
  const sets = fields.map(f => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map(f => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE communities SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  res.json(db.prepare("SELECT * FROM communities WHERE id = ?").get(req.params.id));
});

communitiesRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM communities WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
