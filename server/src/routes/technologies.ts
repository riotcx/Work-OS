import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const technologiesRouter = Router();

technologiesRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM technologies";
  const params: unknown[] = [];
  if (area_id) { query += " WHERE area_id = ?"; params.push(area_id); }
  query += " ORDER BY created_at DESC";
  const techs = db.prepare(query).all(...params) as any[];
  for (const t of techs) {
    t.skills = db.prepare("SELECT skill_id FROM skill_technologies WHERE technology_id = ?").all(t.id).map((r: any) => r.skill_id);
    t.projects = db.prepare("SELECT project_id FROM project_technologies WHERE technology_id = ?").all(t.id).map((r: any) => r.project_id);
  }
  res.json(techs);
});

technologiesRouter.post("/", (req, res) => {
  const { name, category, area_id, skills, projects } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  db.prepare("INSERT INTO technologies (id, name, category, area_id, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(id, name.trim(), category ?? "", area_id ?? null, new Date().toISOString());
  if (Array.isArray(skills)) {
    const ins = db.prepare("INSERT OR IGNORE INTO skill_technologies (skill_id, technology_id) VALUES (?, ?)");
    for (const sid of skills) ins.run(sid, id);
  }
  if (Array.isArray(projects)) {
    const ins = db.prepare("INSERT OR IGNORE INTO project_technologies (project_id, technology_id) VALUES (?, ?)");
    for (const pid of projects) ins.run(pid, id);
  }
  res.status(201).json(db.prepare("SELECT * FROM technologies WHERE id = ?").get(id));
});

technologiesRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM technologies WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Tecnología no encontrada" });
  const { name, category, area_id, skills, projects } = req.body;
  db.prepare("UPDATE technologies SET name = COALESCE(?, name), category = COALESCE(?, category), area_id = ? WHERE id = ?")
    .run(name ?? null, category ?? null, area_id ?? null, req.params.id);
  if (Array.isArray(skills)) {
    db.prepare("DELETE FROM skill_technologies WHERE technology_id = ?").run(req.params.id);
    const ins = db.prepare("INSERT OR IGNORE INTO skill_technologies (skill_id, technology_id) VALUES (?, ?)");
    for (const sid of skills) ins.run(sid, req.params.id);
  }
  if (Array.isArray(projects)) {
    db.prepare("DELETE FROM project_technologies WHERE technology_id = ?").run(req.params.id);
    const ins = db.prepare("INSERT OR IGNORE INTO project_technologies (project_id, technology_id) VALUES (?, ?)");
    for (const pid of projects) ins.run(pid, req.params.id);
  }
  res.json(db.prepare("SELECT * FROM technologies WHERE id = ?").get(req.params.id));
});

technologiesRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM technologies WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
