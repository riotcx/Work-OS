import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const achievementsRouter = Router();

achievementsRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM achievements WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY created_at DESC";
  res.json(db.prepare(query).all(...params));
});

achievementsRouter.post("/", (req, res) => {
  const { name, description, icon, project_id, area_id } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  db.prepare("INSERT INTO achievements (id, name, description, icon, project_id, area_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(id, name.trim(), description ?? "", icon ?? "", project_id ?? null, area_id ?? null, new Date().toISOString());
  res.status(201).json(db.prepare("SELECT * FROM achievements WHERE id = ?").get(id));
});

achievementsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM achievements WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Logro no encontrado" });
  const fields = ["name","description","icon","project_id","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE achievements SET ${sets} WHERE id = ?`).run(...vals);
  res.json(db.prepare("SELECT * FROM achievements WHERE id = ?").get(req.params.id));
});

achievementsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM achievements WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
