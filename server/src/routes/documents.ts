import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const documentsRouter = Router();

documentsRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM documents WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY created_at DESC";
  res.json(db.prepare(query).all(...params));
});

documentsRouter.post("/", (req, res) => {
  const { title, category, url, description, product_id, service_id, offer_id, status, tags, notes, area_id } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: "title es requerido" });
  const id = nanoid(10);
  db.prepare("INSERT INTO documents (id, title, category, url, description, product_id, service_id, offer_id, status, tags, notes, area_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, title.trim(), category ?? "", url ?? "", description ?? "", product_id ?? null, service_id ?? null, offer_id ?? null, status ?? "activo", tags ?? "", notes ?? "", area_id ?? null, new Date().toISOString());
  res.status(201).json(db.prepare("SELECT * FROM documents WHERE id = ?").get(id));
});

documentsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM documents WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Documento no encontrado" });
  const fields = ["title","category","url","description","product_id","service_id","offer_id","status","tags","notes","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE documents SET ${sets} WHERE id = ?`).run(...vals);
  res.json(db.prepare("SELECT * FROM documents WHERE id = ?").get(req.params.id));
});

documentsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM documents WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
