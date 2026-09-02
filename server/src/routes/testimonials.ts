import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const testimonialsRouter = Router();

testimonialsRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM testimonials WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY featured DESC, created_at DESC";
  res.json(db.prepare(query).all(...params));
});

testimonialsRouter.post("/", (req, res) => {
  const { client_id, text, rating, service, project_id, url, publish_permission, featured, area_id } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "text es requerido" });
  const id = nanoid(10);
  db.prepare("INSERT INTO testimonials (id, client_id, text, rating, service, project_id, url, publish_permission, featured, area_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, client_id ?? null, text.trim(), rating ?? 5, service ?? "", project_id ?? null, url ?? "", publish_permission ? 1 : 0, featured ? 1 : 0, area_id ?? null, new Date().toISOString());
  res.status(201).json(db.prepare("SELECT * FROM testimonials WHERE id = ?").get(id));
});

testimonialsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM testimonials WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Testimonio no encontrado" });
  const fields = ["client_id","text","rating","service","project_id","url","publish_permission","featured","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => (f === "publish_permission" || f === "featured") ? (req.body[f] != null ? (req.body[f] ? 1 : 0) : null) : req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE testimonials SET ${sets} WHERE id = ?`).run(...vals);
  res.json(db.prepare("SELECT * FROM testimonials WHERE id = ?").get(req.params.id));
});

testimonialsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM testimonials WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
