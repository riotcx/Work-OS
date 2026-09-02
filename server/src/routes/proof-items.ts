import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const proofItemsRouter = Router();

proofItemsRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM proof_items WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY created_at DESC";
  res.json(db.prepare(query).all(...params));
});

proofItemsRouter.post("/", (req, res) => {
  const { name, description, type, url, project_id, skill_id, area_id } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  db.prepare("INSERT INTO proof_items (id, name, description, type, url, project_id, skill_id, area_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, name.trim(), description ?? "", type ?? "", url ?? "", project_id ?? null, skill_id ?? null, area_id ?? null, new Date().toISOString());
  res.status(201).json(db.prepare("SELECT * FROM proof_items WHERE id = ?").get(id));
});

proofItemsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM proof_items WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Evidencia no encontrada" });
  const fields = ["name","description","type","url","project_id","skill_id","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE proof_items SET ${sets} WHERE id = ?`).run(...vals);
  res.json(db.prepare("SELECT * FROM proof_items WHERE id = ?").get(req.params.id));
});

proofItemsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM proof_items WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
