import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

export const profilesRouter = Router();

profilesRouter.get("/", (req, res) => {
  const { area_id } = req.query;
  let query = "SELECT * FROM profiles";
  const params: unknown[] = [];
  if (area_id) { query += " WHERE area_id = ?"; params.push(area_id); }
  res.json(db.prepare(query).all(...params));
});

profilesRouter.post("/", (req, res) => {
  const { area_id } = req.body;
  if (!area_id) return res.status(400).json({ error: "area_id es requerido" });
  const existing = db.prepare("SELECT * FROM profiles WHERE area_id = ?").get(area_id);
  if (existing) return res.status(409).json({ error: "Ya existe un perfil para esta área" });
  const id = nanoid(10);
  const now = new Date().toISOString();
  const fields = ["name","title","avatar","short_bio","long_bio","location","languages","availability","professional_type","specialty","years_experience","professional_goal","current_status","tagline","email","website"];
  const vals = fields.map((f) => req.body[f] ?? "");
  db.prepare(`INSERT INTO profiles (id, area_id, ${fields.join(",")}, created_at, updated_at) VALUES (?, ?, ${fields.map(() => "?").join(",")}, ?, ?)`)
    .run(id, area_id, ...vals, now, now);
  res.status(201).json(db.prepare("SELECT * FROM profiles WHERE id = ?").get(id));
});

profilesRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM profiles WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Perfil no encontrado" });
  const fields = ["name","title","avatar","short_bio","long_bio","location","languages","availability","professional_type","specialty","years_experience","professional_goal","current_status","tagline","email","website"];
  const sets = fields.map((f) => `${f} = COALESCE(?, ${f})`).join(", ");
  const vals = fields.map((f) => req.body[f] ?? null);
  vals.push(req.params.id);
  db.prepare(`UPDATE profiles SET ${sets}, updated_at = ? WHERE id = ?`).run(...vals, new Date().toISOString());
  res.json(db.prepare("SELECT * FROM profiles WHERE id = ?").get(req.params.id));
});

profilesRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM profiles WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
