import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "work-os.db");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  area_type TEXT NOT NULL DEFAULT 'product'
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,
  category TEXT DEFAULT '',
  problem TEXT DEFAULT '',
  solution TEXT DEFAULT '',
  result TEXT DEFAULT '',
  role TEXT DEFAULT '',
  project_type TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'activo',
  featured INTEGER DEFAULT 0,
  completed_at TEXT,
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sprints (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'captura',
  priority TEXT NOT NULL DEFAULT 'P2',
  area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  sprint_id TEXT REFERENCES sprints(id) ON DELETE SET NULL,
  due_date TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,
  target TEXT DEFAULT '',
  current TEXT DEFAULT '0',
  status TEXT NOT NULL DEFAULT 'activo',
  timeframe TEXT NOT NULL DEFAULT 'año',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '',
  url TEXT DEFAULT '',
  handle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  purpose TEXT DEFAULT '',
  type TEXT DEFAULT 'social',
  status TEXT NOT NULL DEFAULT 'activo',
  audience_count INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  post_frequency TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  last_activity TEXT,
  priority TEXT DEFAULT 'P2',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS communities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT DEFAULT '',
  url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  purpose TEXT DEFAULT '',
  member_count INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  activity_frequency TEXT DEFAULT '',
  created_date TEXT,
  status TEXT NOT NULL DEFAULT 'activo',
  goal TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  idea TEXT DEFAULT '',
  format TEXT DEFAULT '',
  objective TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'idea',
  due_date TEXT,
  priority TEXT DEFAULT 'P2',
  cta TEXT DEFAULT '',
  content TEXT DEFAULT '',
  result TEXT DEFAULT '',
  metrics TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_idea_platforms (
  content_idea_id TEXT REFERENCES content_ideas(id) ON DELETE CASCADE,
  platform_id TEXT REFERENCES platforms(id) ON DELETE CASCADE,
  PRIMARY KEY (content_idea_id, platform_id)
);

CREATE TABLE IF NOT EXISTS identity_ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  idea TEXT DEFAULT '',
  category TEXT DEFAULT '',
  objective TEXT DEFAULT '',
  community_id TEXT REFERENCES communities(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'idea',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS funnel_stages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS funnel_entries (
  id TEXT PRIMARY KEY,
  funnel_stage_id TEXT REFERENCES funnel_stages(id) ON DELETE CASCADE,
  value INTEGER NOT NULL DEFAULT 0,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  recorded_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  unit TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'adquisicion',
  source TEXT NOT NULL DEFAULT 'manual',
  platform_id TEXT REFERENCES platforms(id) ON DELETE SET NULL,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  recorded_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  title TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  short_bio TEXT DEFAULT '',
  long_bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  languages TEXT DEFAULT '',
  availability TEXT DEFAULT '',
  professional_type TEXT DEFAULT '',
  specialty TEXT DEFAULT '',
  years_experience TEXT DEFAULT '',
  professional_goal TEXT DEFAULT '',
  current_status TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  level TEXT DEFAULT 'intermedio',
  description TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  featured INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'activo',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_projects (
  skill_id TEXT REFERENCES skills(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (skill_id, project_id)
);

CREATE TABLE IF NOT EXISTS technologies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_technologies (
  skill_id TEXT REFERENCES skills(id) ON DELETE CASCADE,
  technology_id TEXT REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (skill_id, technology_id)
);

CREATE TABLE IF NOT EXISTS project_technologies (
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  technology_id TEXT REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  price_min REAL DEFAULT 0,
  price_max REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  time_estimate TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'activo',
  featured INTEGER DEFAULT 0,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_skills (
  service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
  skill_id TEXT REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, skill_id)
);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  type TEXT DEFAULT '',
  source TEXT DEFAULT '',
  service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
  value REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'nueva',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  next_action TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS proof_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT DEFAULT '',
  url TEXT DEFAULT '',
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  skill_id TEXT REFERENCES skills(id) ON DELETE SET NULL,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS career_entries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'work',
  title TEXT NOT NULL,
  organization TEXT DEFAULT '',
  location TEXT DEFAULT '',
  start_date TEXT,
  end_date TEXT,
  description TEXT DEFAULT '',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
  price_min REAL DEFAULT 0,
  price_max REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  delivery_time TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'activo',
  featured INTEGER DEFAULT 0,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offer_items (
  id TEXT PRIMARY KEY,
  offer_id TEXT REFERENCES offers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  location TEXT DEFAULT '',
  source TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'activo',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  offer_id TEXT REFERENCES offers(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pendiente',
  due_date TEXT,
  price REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  text TEXT NOT NULL DEFAULT '',
  rating INTEGER DEFAULT 5,
  service TEXT DEFAULT '',
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  url TEXT DEFAULT '',
  publish_permission INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  product_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
  offer_id TEXT REFERENCES offers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'activo',
  tags TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'ingreso',
  date TEXT NOT NULL,
  category TEXT DEFAULT '',
  source TEXT DEFAULT '',
  description TEXT DEFAULT '',
  method TEXT DEFAULT '',
  status TEXT DEFAULT 'completado',
  reference TEXT DEFAULT '',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS case_studies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  problem TEXT DEFAULT '',
  context TEXT DEFAULT '',
  solution TEXT DEFAULT '',
  process_text TEXT DEFAULT '',
  technologies TEXT DEFAULT '',
  result TEXT DEFAULT '',
  metrics TEXT DEFAULT '',
  learning TEXT DEFAULT '',
  images TEXT DEFAULT '',
  links TEXT DEFAULT '',
  featured INTEGER DEFAULT 0,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  time TEXT DEFAULT '',
  days TEXT DEFAULT '',
  duration_minutes INTEGER DEFAULT 0,
  steps TEXT DEFAULT '',
  active INTEGER DEFAULT 1,
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  frequency TEXT DEFAULT 'daily',
  target_value INTEGER DEFAULT 1,
  unit TEXT DEFAULT '',
  streak INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  category TEXT DEFAULT '',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS personal_admin (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'document',
  due_date TEXT,
  status TEXT DEFAULT 'activo',
  cost REAL DEFAULT 0,
  notes TEXT DEFAULT '',
  area_id TEXT REFERENCES areas(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_entries (
  id TEXT PRIMARY KEY,
  sprint_id TEXT REFERENCES sprints(id) ON DELETE CASCADE,
  what_worked TEXT DEFAULT '',
  what_didnt TEXT DEFAULT '',
  what_learned TEXT DEFAULT '',
  what_change TEXT DEFAULT '',
  created_at TEXT NOT NULL
);
`);

// --- Migrations: columns for existing tables ---
function ensureColumn(table: string, column: string, def: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
  }
}

// areas: area_type
ensureColumn("areas", "area_type", "TEXT NOT NULL DEFAULT 'product'");

// projects: extended fields
for (const [col, def] of [
  ["description", "TEXT DEFAULT ''"],
  ["image_url", "TEXT DEFAULT ''"],
  ["url", "TEXT DEFAULT ''"],
  ["github_url", "TEXT DEFAULT ''"],
  ["category", "TEXT DEFAULT ''"],
  ["problem", "TEXT DEFAULT ''"],
  ["solution", "TEXT DEFAULT ''"],
  ["result", "TEXT DEFAULT ''"],
  ["role", "TEXT DEFAULT ''"],
  ["project_type", "TEXT DEFAULT ''"],
  ["featured", "INTEGER DEFAULT 0"],
  ["completed_at", "TEXT"],
  ["notes", "TEXT DEFAULT ''"],
] as const) {
  ensureColumn("projects", col, def);
}

// --- Seed: 6 áreas fijas ---
const areaCount = db.prepare("SELECT COUNT(*) as c FROM areas").get() as { c: number };
if (areaCount.c === 0) {
  const insertArea = db.prepare(
    "INSERT INTO areas (id, name, icon, color, sort_order, area_type) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const seedAreas = [
    { name: "Negocio", icon: "🚀", color: "#F5A623", sort: 0, area_type: "product" },
    { name: "Marca", icon: "📣", color: "#3DDC97", sort: 1, area_type: "personal_brand" },
    { name: "Finanzas", icon: "💰", color: "#F5C542", sort: 2, area_type: "financial" },
    { name: "Empresa", icon: "🏢", color: "#E5484D", sort: 3, area_type: "company" },
    { name: "Proyectos", icon: "💻", color: "#5AC8FA", sort: 4, area_type: "portfolio" },
    { name: "Personal", icon: "🧠", color: "#B58AF5", sort: 5, area_type: "personal" },
  ];
  for (const a of seedAreas) {
    insertArea.run(nanoid(10), a.name, a.icon, a.color, a.sort, a.area_type);
  }
}

// --- Migration: rename old Kanban statuses to new workflow ---
const statusMigrations: [string, string][] = [
  ["backlog", "captura"],
  ["en_curso", "en_ejecucion"],
  ["hecho", "completado"],
];
for (const [oldS, newS] of statusMigrations) {
  db.prepare("UPDATE tasks SET status = ? WHERE status = ?").run(newS, oldS);
}

// --- Seed: objetivos (vacío por defecto) ---

// --- Seed: sprint actual ---
function currentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(monday), end: fmt(sunday) };
}

const activeSprint = db.prepare("SELECT * FROM sprints WHERE status = 'activo' LIMIT 1").get();
if (!activeSprint) {
  const { start, end } = currentWeekRange();
  db.prepare("INSERT INTO sprints (id, name, start_date, end_date, status) VALUES (?, ?, ?, ?, 'activo')")
    .run(nanoid(10), `Sprint ${start} — ${end}`, start, end);
}

export function getActiveSprint() {
  return db.prepare("SELECT * FROM sprints WHERE status = 'activo' LIMIT 1").get();
}

export function getAreaById(id: string) {
  return db.prepare("SELECT * FROM areas WHERE id = ?").get(id);
}
