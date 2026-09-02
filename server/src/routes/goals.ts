import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const goalsRouter = Router();

goalsRouter.get("/", (_req, res) => {
  const goals = db.prepare("SELECT * FROM goals ORDER BY created_at DESC").all();
  res.json(goals);
});

goalsRouter.post("/", (req, res) => {
  const { title, description, area_id, target, current, timeframe } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "title es requerido" });
  }
  const id = nanoid(10);
  const created_at = new Date().toISOString();
  db.prepare(
    "INSERT INTO goals (id, title, description, area_id, target, current, status, timeframe, created_at) VALUES (?, ?, ?, ?, ?, ?, 'activo', ?, ?)"
  ).run(id, title.trim(), description ?? "", area_id ?? null, target ?? "", current ?? "0", timeframe ?? "año", created_at);
  const goal = db.prepare("SELECT * FROM goals WHERE id = ?").get(id);
  res.status(201).json(goal);
});

goalsRouter.put("/:id", (req, res) => {
  const { id } = req.params;
  const existing = db.prepare("SELECT * FROM goals WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Objetivo no encontrado" });

  const { title, description, area_id, target, current, status, timeframe } = req.body;
  db.prepare(
    `UPDATE goals SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      area_id = COALESCE(?, area_id),
      target = COALESCE(?, target),
      current = COALESCE(?, current),
      status = COALESCE(?, status),
      timeframe = COALESCE(?, timeframe)
     WHERE id = ?`
  ).run(title ?? null, description ?? null, area_id ?? null, target ?? null, current ?? null, status ?? null, timeframe ?? null, id);
  const goal = db.prepare("SELECT * FROM goals WHERE id = ?").get(id);
  res.json(goal);
});

goalsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM goals WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
