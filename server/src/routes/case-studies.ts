import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const caseStudiesRouter = Router();

caseStudiesRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM case_studies WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY featured DESC, created_at DESC";
  res.json(db.prepare(query).all(...params));
});

caseStudiesRouter.post("/", (req, res) => {
  const { title, project_id, problem, context, solution, process_text, technologies, result, metrics, learning, images, links, featured, area_id } = req.body;
  if (!title) return res.status(400).json({ error: "title es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO case_studies (id, title, project_id, problem, context, solution, process_text, technologies, result, metrics, learning, images, links, featured, area_id, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
    .run(id, title, project_id ?? null, problem ?? "", context ?? "", solution ?? "", process_text ?? "", technologies ?? "", result ?? "", metrics ?? "", learning ?? "", images ?? "", links ?? "", featured ? 1 : 0, area_id ?? null, now, now);
  res.status(201).json(db.prepare("SELECT * FROM case_studies WHERE id = ?").get(id));
});

caseStudiesRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM case_studies WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Caso de estudio no encontrado" });
  const fields = ["title","project_id","problem","context","solution","process_text","technologies","result","metrics","learning","images","links","featured","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => f === "featured" ? (req.body[f] != null ? (req.body[f] ? 1 : 0) : null) : req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE case_studies SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  res.json(db.prepare("SELECT * FROM case_studies WHERE id = ?").get(req.params.id));
});

caseStudiesRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM case_studies WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
