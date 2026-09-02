import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import "./db.js";
import { tasksRouter } from "./routes/tasks.js";
import { areasRouter } from "./routes/areas.js";
import { projectsRouter } from "./routes/projects.js";
import { sprintsRouter } from "./routes/sprints.js";
import { goalsRouter } from "./routes/goals.js";
import { platformsRouter } from "./routes/platforms.js";
import { communitiesRouter } from "./routes/communities.js";
import { contentIdeasRouter } from "./routes/content-ideas.js";
import { identityIdeasRouter } from "./routes/identity-ideas.js";
import { funnelRouter } from "./routes/funnel.js";
import { metricsRouter } from "./routes/metrics.js";
import { profilesRouter } from "./routes/profiles.js";
import { skillsRouter } from "./routes/skills.js";
import { technologiesRouter } from "./routes/technologies.js";
import { servicesRouter } from "./routes/services.js";
import { opportunitiesRouter } from "./routes/opportunities.js";
import { achievementsRouter } from "./routes/achievements.js";
import { proofItemsRouter } from "./routes/proof-items.js";
import { careerRouter } from "./routes/career.js";
import { offersRouter } from "./routes/offers.js";
import { clientsRouter } from "./routes/clients.js";
import { deliveriesRouter } from "./routes/deliveries.js";
import { testimonialsRouter } from "./routes/testimonials.js";
import { documentsRouter } from "./routes/documents.js";
import { focusRouter } from "./routes/focus.js";
import { analyticsRouter } from "./routes/analytics.js";
import { reviewRouter } from "./routes/review.js";
import { transactionsRouter } from "./routes/transactions.js";
import { caseStudiesRouter } from "./routes/case-studies.js";
import { routinesRouter } from "./routes/routines.js";
import { habitsRouter } from "./routes/habits.js";
import { personalAdminRouter } from "./routes/personal-admin.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const allowedOrigins = [
  `http://localhost:${PORT}`,
  `http://localhost:5173`,
  `http://127.0.0.1:${PORT}`,
  `http://127.0.0.1:5173`,
];

const tailscaleIP = process.env.TAILSCALE_IP;
if (tailscaleIP) {
  allowedOrigins.push(`http://${tailscaleIP}:${PORT}`);
  allowedOrigins.push(`https://${tailscaleIP}:${PORT}`);
}

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some((a) => origin.startsWith(a.replace(`:${PORT}`, "")))) {
      cb(null, true);
    } else {
      cb(null, true);
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

app.use("/api/tasks", tasksRouter);
app.use("/api/areas", areasRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/sprints", sprintsRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/platforms", platformsRouter);
app.use("/api/communities", communitiesRouter);
app.use("/api/content-ideas", contentIdeasRouter);
app.use("/api/identity-ideas", identityIdeasRouter);
app.use("/api/funnel", funnelRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api/profiles", profilesRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/technologies", technologiesRouter);
app.use("/api/services", servicesRouter);
app.use("/api/opportunities", opportunitiesRouter);
app.use("/api/achievements", achievementsRouter);
app.use("/api/proof-items", proofItemsRouter);
app.use("/api/career", careerRouter);
app.use("/api/offers", offersRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/deliveries", deliveriesRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/focus", focusRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/review", reviewRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/case-studies", caseStudiesRouter);
app.use("/api/routines", routinesRouter);
app.use("/api/habits", habitsRouter);
app.use("/api/personal-admin", personalAdminRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir, { maxAge: "1h" }));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
  console.log(`📱 Sirviendo frontend desde ${publicDir}`);
}

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("API Error:", err.message);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`⚔️  Work OS corriendo en http://0.0.0.0:${PORT}`);
  if (tailscaleIP) {
    console.log(`🌐 Acceso remoto: http://${tailscaleIP}:${PORT}`);
  }
});
