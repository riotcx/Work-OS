import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const transactionsRouter = Router();

transactionsRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM transactions WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY date DESC, created_at DESC LIMIT 200";
  res.json(db.prepare(query).all(...params));
});

transactionsRouter.post("/", (req, res) => {
  const { amount, type, date, category, source, description, method, status, reference, area_id } = req.body;
  if (amount == null) return res.status(400).json({ error: "amount es requerido" });
  const id = nanoid(10);
  db.prepare("INSERT INTO transactions (id, amount, type, date, category, source, description, method, status, reference, area_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, amount, type ?? "ingreso", date ?? new Date().toISOString().slice(0, 10), category ?? "", source ?? "", description ?? "", method ?? "", status ?? "completado", reference ?? "", area_id ?? null, new Date().toISOString());
  res.status(201).json(db.prepare("SELECT * FROM transactions WHERE id = ?").get(id));
});

transactionsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM transactions WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Transacción no encontrada" });
  const fields = ["amount","type","date","category","source","description","method","status","reference","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE transactions SET ${sets} WHERE id = ?`).run(...vals);
  res.json(db.prepare("SELECT * FROM transactions WHERE id = ?").get(req.params.id));
});

transactionsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM transactions WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
