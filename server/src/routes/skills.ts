import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const skillsRouter = Router();

skillsRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM skills WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY featured DESC, created_at DESC";
  const skills = db.prepare(query).all(...params) as any[];
  for (const s of skills) {
    s.projects = db.prepare("SELECT project_id FROM skill_projects WHERE skill_id = ?").all(s.id).map((r: any) => r.project_id);
    s.technologies = db.prepare("SELECT technology_id FROM skill_technologies WHERE skill_id = ?").all(s.id).map((r: any) => r.technology_id);
  }
  res.json(skills);
});

skillsRouter.post("/", (req, res) => {
  const { name, category, level, description, experience, featured, status, area_id, notes, projects, technologies } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO skills (id, name, category, level, description, experience, featured, status, area_id, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, name.trim(), category ?? "", level ?? "intermedio", description ?? "", experience ?? "", featured ? 1 : 0, status ?? "activo", area_id ?? null, notes ?? "", now, now);
  if (Array.isArray(projects)) {
    const ins = db.prepare("INSERT OR IGNORE INTO skill_projects (skill_id, project_id) VALUES (?, ?)");
    for (const pid of projects) ins.run(id, pid);
  }
  if (Array.isArray(technologies)) {
    const ins = db.prepare("INSERT OR IGNORE INTO skill_technologies (skill_id, technology_id) VALUES (?, ?)");
    for (const tid of technologies) ins.run(id, tid);
  }
  const created = db.prepare("SELECT * FROM skills WHERE id = ?").get(id) as any;
  created.projects = projects ?? [];
  created.technologies = technologies ?? [];
  res.status(201).json(created);
});

skillsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM skills WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Skill no encontrada" });
  const fields = ["name","category","level","description","experience","featured","status","area_id","notes"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => {
    if (f === "featured") return req.body[f] != null ? (req.body[f] ? 1 : 0) : null;
    return req.body[f] ?? null;
  });
  vals.push(req.params.id);
  db.prepare(`UPDATE skills SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  const { projects, technologies } = req.body;
  if (Array.isArray(projects)) {
    db.prepare("DELETE FROM skill_projects WHERE skill_id = ?").run(req.params.id);
    const ins = db.prepare("INSERT OR IGNORE INTO skill_projects (skill_id, project_id) VALUES (?, ?)");
    for (const pid of projects) ins.run(req.params.id, pid);
  }
  if (Array.isArray(technologies)) {
    db.prepare("DELETE FROM skill_technologies WHERE skill_id = ?").run(req.params.id);
    const ins = db.prepare("INSERT OR IGNORE INTO skill_technologies (skill_id, technology_id) VALUES (?, ?)");
    for (const tid of technologies) ins.run(req.params.id, tid);
  }
  const updated = db.prepare("SELECT * FROM skills WHERE id = ?").get(req.params.id) as any;
  updated.projects = db.prepare("SELECT project_id FROM skill_projects WHERE skill_id = ?").all(req.params.id).map((r: any) => r.project_id);
  updated.technologies = db.prepare("SELECT technology_id FROM skill_technologies WHERE skill_id = ?").all(req.params.id).map((r: any) => r.technology_id);
  res.json(updated);
});

skillsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM skills WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
