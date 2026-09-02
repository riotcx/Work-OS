import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const tasksRouter = Router();

const VALID_STATUSES = ["captura", "definido", "priorizado", "esta_semana", "hoy", "en_ejecucion", "revision", "completado"];
const VALID_PRIORITIES = ["P1", "P2", "P3"];

tasksRouter.get("/", (req, res) => {
  const { status, area_id, sprint_id } = req.query;
  let query = "SELECT * FROM tasks WHERE 1=1";
  const params: unknown[] = [];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }
  if (area_id) {
    query += " AND area_id = ?";
    params.push(area_id);
  }
  if (sprint_id) {
    query += " AND sprint_id = ?";
    params.push(sprint_id);
  }
  query += " ORDER BY CASE priority WHEN 'P1' THEN 0 WHEN 'P2' THEN 1 ELSE 2 END, created_at DESC";

  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

tasksRouter.post("/", (req, res) => {
  const { title, description, status, priority, area_id, project_id, sprint_id, due_date } =
    req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "title es requerido" });
  }
  const finalStatus = VALID_STATUSES.includes(status) ? status : "captura";
  const finalPriority = VALID_PRIORITIES.includes(priority) ? priority : "P2";

  const id = nanoid(10);
  const created_at = new Date().toISOString();

  db.prepare(
    `INSERT INTO tasks (id, title, description, status, priority, area_id, project_id, sprint_id, due_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    title.trim(),
    description ?? "",
    finalStatus,
    finalPriority,
    area_id ?? null,
    project_id ?? null,
    sprint_id ?? null,
    due_date ?? null,
    created_at
  );

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  res.status(201).json(task);
});

tasksRouter.put("/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as any;
  if (!existing) return res.status(404).json({ error: "Tarea no encontrada" });

  const { title, description, status, priority, area_id, project_id, sprint_id, due_date } = req.body;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "status inválido" });
  }
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: "priority inválida" });
  }

  const hasStatus = req.body.hasOwnProperty("status");
  const finalStatus = hasStatus ? (status ?? existing.status) : existing.status;
  const completed_at = hasStatus && finalStatus === "completado" ? new Date().toISOString()
    : (hasStatus && finalStatus !== "completado" ? null : undefined);

  db.prepare(
    `UPDATE tasks SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      priority = COALESCE(?, priority),
      area_id = COALESCE(?, area_id),
      project_id = COALESCE(?, project_id),
      sprint_id = COALESCE(?, sprint_id),
      due_date = COALESCE(?, due_date),
      completed_at = CASE WHEN ? = 'completado' THEN ? WHEN ? = 'reset' THEN NULL ELSE completed_at END
     WHERE id = ?`
  ).run(
    title ?? null,
    description ?? null,
    status ?? null,
    priority ?? null,
    area_id ?? null,
    project_id ?? null,
    sprint_id ?? null,
    due_date ?? null,
    hasStatus && finalStatus === "completado" ? finalStatus : "",
    hasStatus && finalStatus === "completado" ? completed_at : null,
    hasStatus && finalStatus !== "completado" ? "reset" : "",
    id
  );

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  res.json(task);
});

// Mover una tarea de columna (drag & drop) — endpoint ligero, solo status
tasksRouter.patch("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "status inválido" });
  }

  const completed_at = status === "completado" ? new Date().toISOString() : null;
  db.prepare(
    "UPDATE tasks SET status = ?, completed_at = CASE WHEN ? = 'completado' THEN ? WHEN ? != 'completado' THEN NULL ELSE completed_at END WHERE id = ?"
  ).run(status, status, completed_at, status, id);

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
  res.json(task);
});

tasksRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  res.status(204).end();
});
