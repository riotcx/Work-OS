import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const clientsRouter = Router();

clientsRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM clients WHERE 1=1";
  const params: unknown[] = [];
  if (area_id) { query += " AND area_id = ?"; params.push(area_id); }
  query += " ORDER BY created_at DESC";
  res.json(db.prepare(query).all(...params));
});

clientsRouter.post("/", (req, res) => {
  const { name, company, contact_name, email, phone, whatsapp, linkedin, instagram, location, source, notes, status, area_id } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "name es requerido" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  db.prepare("INSERT INTO clients (id, name, company, contact_name, email, phone, whatsapp, linkedin, instagram, location, source, notes, status, area_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, name.trim(), company ?? "", contact_name ?? "", email ?? "", phone ?? "", whatsapp ?? "", linkedin ?? "", instagram ?? "", location ?? "", source ?? "", notes ?? "", status ?? "activo", area_id ?? null, now, now);
  res.status(201).json(db.prepare("SELECT * FROM clients WHERE id = ?").get(id));
});

clientsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Cliente no encontrado" });
  const fields = ["name","company","contact_name","email","phone","whatsapp","linkedin","instagram","location","source","notes","status","area_id"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE clients SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  res.json(db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id));
});

clientsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM clients WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
