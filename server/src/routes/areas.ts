import { Router } from "express";
import { db } from "../db.js";

export const areasRouter = Router();

areasRouter.get("/", (_req, res) => {
  const areas = db.prepare("SELECT * FROM areas ORDER BY sort_order ASC").all();
  res.json(areas);
});
