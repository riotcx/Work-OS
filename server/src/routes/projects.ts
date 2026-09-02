import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const projectsRouter = Router();

projectsRouter.get("/", (_req, res) => {
  const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
  res.json(projects);
});

projectsRouter.post("/", (req, res) => {
  const { name, description, image_url, url, github_url, area_id, category, problem, solution, result, role, project_type, status, featured, notes } = req.body;
  if (!name) return res.status(400).json({ error: "name es requerido" });

  const id = nanoid(10);
  const created_at = new Date().toISOString();
  db.prepare(
    "INSERT INTO projects (id, name, description, image_url, url, github_url, area_id, category, problem, solution, result, role, project_type, status, featured, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, name, description ?? "", image_url ?? "", url ?? "", github_url ?? "", area_id ?? null, category ?? "", problem ?? "", solution ?? "", result ?? "", role ?? "", project_type ?? "", status ?? "activo", featured ? 1 : 0, notes ?? "", created_at);

  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  res.status(201).json(project);
});

projectsRouter.put("/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Proyecto no encontrado" });

  const { name, description, image_url, url, github_url, area_id, category, problem, solution, result, role, project_type, status, featured, completed_at, notes } = req.body;
  const fields = ["name","description","image_url","url","github_url","category","problem","solution","result","role","project_type","status","featured","completed_at","notes","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => f === "featured" ? (req.body[f] != null ? (req.body[f] ? 1 : 0) : null) : req.body[f] ?? null);
  vals.push(id);
  db.prepare(`UPDATE projects SET ${sets} WHERE id = ?`).run(...vals);

  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  res.json(project);
});

projectsRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  res.status(204).end();
});
