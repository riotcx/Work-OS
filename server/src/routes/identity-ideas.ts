import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const identityIdeasRouter = Router();

identityIdeasRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM identity_ideas";
  const params: unknown[] = [];
  if (area_id) { query += " WHERE area_id = ?"; params.push(area_id); }
  query += " ORDER BY created_at DESC";
  res.json(db.prepare(query).all(...params));
});

identityIdeasRouter.post("/", (req, res) => {
  const { title, idea, category, objective, community_id, status, area_id } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "title es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO identity_ideas (id, title, idea, category, objective, community_id, status, area_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, title.trim(), idea ?? "", category ?? "", objective ?? "", community_id ?? null, status ?? "idea", area_id ?? null, now, now);
  res.status(201).json(db.prepare("SELECT * FROM identity_ideas WHERE id = ?").get(id));
});

identityIdeasRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM identity_ideas WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Idea de identidad no encontrada" });
  const fields = ["title","idea","category","objective","community_id","status","area_id"];
  const sets = fields.map(f => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map(f => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE identity_ideas SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  res.json(db.prepare("SELECT * FROM identity_ideas WHERE id = ?").get(req.params.id));
});

identityIdeasRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM identity_ideas WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
