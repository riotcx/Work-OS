import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const contentIdeasRouter = Router();

const VALID_STATUSES = ["idea", "borrador", "listo", "publicado", "analizado"];

contentIdeasRouter.get("/", (req, res) => {
  const { area_id, status } = req.query;
  let query = "SELECT * FROM content_ideas WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  if (status) { query += " AND status = ?"; params.push(status); }
  query += " ORDER BY priority ASC, created_at DESC";
  const ideas = db.prepare(query).all(...params) as any[];
  for (const idea of ideas) {
    idea.platforms = db.prepare("SELECT platform_id FROM content_idea_platforms WHERE content_idea_id = ?").all(idea.id).map((r: any) => r.platform_id);
  }
  res.json(ideas);
});

contentIdeasRouter.post("/", (req, res) => {
  const { title, idea, format, objective, status, due_date, priority, cta, content, result, metrics, notes, area_id, platforms } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "title es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  const finalStatus = VALID_STATUSES.includes(status) ? status : "idea";
  db.prepare(`INSERT INTO content_ideas (id, title, idea, format, objective, status, due_date, priority, cta, content, result, metrics, notes, area_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, title.trim(), idea ?? "", format ?? "", objective ?? "", finalStatus, due_date ?? null, priority ?? "P2", cta ?? "", content ?? "", result ?? "", metrics ?? "", notes ?? "", area_id ?? null, now, now);
  if (Array.isArray(platforms) && platforms.length > 0) {
    const insert = db.prepare("INSERT OR IGNORE INTO content_idea_platforms (content_idea_id, platform_id) VALUES (?, ?)");
    for (const pid of platforms) insert.run(id, pid);
  }
  const created = db.prepare("SELECT * FROM content_ideas WHERE id = ?").get(id) as any;
  created.platforms = platforms ?? [];
  res.status(201).json(created);
});

contentIdeasRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM content_ideas WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Idea de contenido no encontrada" });
  const { title, idea, format, objective, status, due_date, priority, cta, content, result, metrics, notes, area_id, platforms } = req.body;
  if (status && !VALID_STATUSES.includes(status)) return res.status(400).json({ error: "status inválido" });
  const fields = ["title","idea","format","objective","status","due_date","priority","cta","content","result","metrics","notes","area_id"];
  const sets = fields.map(f => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map(f => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE content_ideas SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  if (Array.isArray(platforms)) {
    db.prepare("DELETE FROM content_idea_platforms WHERE content_idea_id = ?").run(req.params.id);
    const insert = db.prepare("INSERT OR IGNORE INTO content_idea_platforms (content_idea_id, platform_id) VALUES (?, ?)");
    for (const pid of platforms) insert.run(req.params.id, pid);
  }
  const updated = db.prepare("SELECT * FROM content_ideas WHERE id = ?").get(req.params.id) as any;
  updated.platforms = db.prepare("SELECT platform_id FROM content_idea_platforms WHERE content_idea_id = ?").all(req.params.id).map((r: any) => r.platform_id);
  res.json(updated);
});

contentIdeasRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM content_ideas WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
