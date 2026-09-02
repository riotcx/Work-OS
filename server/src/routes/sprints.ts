import { Router } from "express";
import { nanoid } from "nanoid";
import { db, getActiveSprint } from "../db.js";

export const sprintsRouter = Router();

sprintsRouter.get("/", (_req, res) => {
  const sprints = db.prepare("SELECT * FROM sprints ORDER BY start_date DESC LIMIT 10").all();
  res.json(sprints);
});

sprintsRouter.get("/current", (_req, res) => {
  const sprint = getActiveSprint();
  if (sprint) {
    const tasks = db.prepare("SELECT * FROM tasks WHERE sprint_id = ?").all((sprint as any).id);
    (sprint as any).tasks = tasks;
  }
  res.json(sprint ?? null);
});

sprintsRouter.get("/:id", (req, res) => {
  const sprint = db.prepare("SELECT * FROM sprints WHERE id = ?").get(req.params.id);
  if (!sprint) return res.status(404).json({ error: "Sprint no encontrado" });
  const tasks = db.prepare("SELECT * FROM tasks WHERE sprint_id = ?").all(req.params.id);
  (sprint as any).tasks = tasks;
  res.json(sprint);
});

sprintsRouter.post("/", (req, res) => {
  const { name, start_date, end_date } = req.body;
  if (!name) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  db.prepare("INSERT INTO sprints (id, name, start_date, end_date, status) VALUES (?, ?, ?, ?, 'activo')")
    .run(id, name, start_date ?? new Date().toISOString().slice(0, 10), end_date ?? "", );
  res.status(201).json(db.prepare("SELECT * FROM sprints WHERE id = ?").get(id));
});

sprintsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM sprints WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Sprint no encontrado" });
  const { name, start_date, end_date, status } = req.body;
  db.prepare("UPDATE sprints SET name = COALESCE(?, name), start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date), status = COALESCE(?, status) WHERE id = ?")
    .run(name ?? null, start_date ?? null, end_date ?? null, status ?? null, req.params.id);
  res.json(db.prepare("SELECT * FROM sprints WHERE id = ?").get(req.params.id));
});

sprintsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM sprints WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
