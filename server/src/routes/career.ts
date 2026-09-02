import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const careerRouter = Router();

careerRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM career_entries WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY start_date DESC, created_at DESC";
  res.json(db.prepare(query).all(...params));
});

careerRouter.post("/", (req, res) => {
  const { type, title, organization, location, start_date, end_date, description, area_id } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "title es requerido" });
  const id = nanoid(10);
  db.prepare("INSERT INTO career_entries (id, type, title, organization, location, start_date, end_date, description, area_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, type ?? "work", title.trim(), organization ?? "", location ?? "", start_date ?? null, end_date ?? null, description ?? "", area_id ?? null, new Date().toISOString());
  res.status(201).json(db.prepare("SELECT * FROM career_entries WHERE id = ?").get(id));
});

careerRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM career_entries WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Entrada no encontrada" });
  const fields = ["type","title","organization","location","start_date","end_date","description","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE career_entries SET ${sets} WHERE id = ?`).run(...vals);
  res.json(db.prepare("SELECT * FROM career_entries WHERE id = ?").get(req.params.id));
});

careerRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM career_entries WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
