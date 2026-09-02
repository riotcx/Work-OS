export type TaskStatus = "captura" | "definido" | "priorizado" | "esta_semana" | "hoy" | "en_ejecucion" | "revision" | "completado";
export type Priority = "P1" | "P2" | "P3";
export type ProjectStatus = "activo" | "pausado" | "archivado";
export type GoalTimeframe = "largo_plazo" | "año" | "sprint";
export type ContentStatus = "idea" | "borrador" | "listo" | "publicado" | "analizado";
export type OppStatus = "nueva" | "contactada" | "conversación" | "propuesta" | "negociación" | "ganada" | "perdida";

export interface Area {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  area_type: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  image_url: string;
  url: string;
  github_url: string;
  area_id: string | null;
  category: string;
  problem: string;
  solution: string;
  result: string;
  role: string;
  project_type: string;
  status: string;
  featured: number;
  completed_at: string | null;
  notes: string;
  created_at: string;
}

export interface Sprint {
  id: string; name: string; start_date: string; end_date: string; status: string;
  tasks?: Task[];
}

export interface FocusSession {
  id: string; task_id: string | null; started_at: string; ended_at: string | null;
  duration_seconds: number; status: string; area_id: string | null; created_at: string;
}

export interface Task {
  id: string; title: string; description: string; status: TaskStatus; priority: Priority;
  area_id: string | null; project_id: string | null; sprint_id: string | null;
  due_date: string | null; created_at: string; completed_at: string | null;
}

export interface Goal {
  id: string; title: string; description: string; area_id: string | null;
  target: string; current: string; status: string; timeframe: GoalTimeframe; created_at: string;
}

export interface Platform {
  id: string; name: string; icon: string; url: string; handle: string; description: string;
  purpose: string; type: string; status: string; audience_count: number; followers: number;
  reach: number; post_frequency: string; notes: string; last_activity: string | null;
  priority: string; area_id: string | null; created_at: string; updated_at: string;
}

export interface Community {
  id: string; name: string; platform: string; url: string; description: string; purpose: string;
  member_count: number; active_users: number; activity_frequency: string; created_date: string | null;
  status: string; goal: string; notes: string; area_id: string | null; created_at: string; updated_at: string;
}

export interface ContentIdea {
  id: string; title: string; idea: string; format: string; objective: string; status: ContentStatus;
  due_date: string | null; priority: string; cta: string; content: string; result: string;
  metrics: string; notes: string; area_id: string | null; platforms: string[]; created_at: string; updated_at: string;
}

export interface IdentityIdea {
  id: string; title: string; idea: string; category: string; objective: string;
  community_id: string | null; status: string; area_id: string | null; created_at: string; updated_at: string;
}

export interface FunnelStage { id: string; name: string; description: string; sort_order: number; area_id: string | null; created_at: string; latest_value?: number; }
export interface FunnelEntry { id: string; funnel_stage_id: string; value: number; area_id: string | null; recorded_at: string; created_at: string; }
export interface Metric { id: string; name: string; value: number; unit: string; category: string; source: string; platform_id: string | null; area_id: string | null; recorded_at: string; created_at: string; }

export interface Profile {
  id: string; area_id: string; name: string; title: string; avatar: string;
  short_bio: string; long_bio: string; location: string; languages: string;
  availability: string; professional_type: string; specialty: string;
  years_experience: string; professional_goal: string; current_status: string;
  tagline: string; email: string; website: string; created_at: string; updated_at: string;
}

export interface Skill {
  id: string; name: string; category: string; level: string; description: string;
  experience: string; featured: number; status: string; area_id: string | null;
  notes: string; projects: string[]; technologies: string[]; created_at: string; updated_at: string;
}

export interface Technology {
  id: string; name: string; category: string; area_id: string | null;
  skills: string[]; projects: string[]; created_at: string;
}

export interface Service {
  id: string; name: string; description: string; category: string; price_min: number;
  price_max: number; currency: string; time_estimate: string; status: string;
  featured: number; area_id: string | null; notes: string; skills: string[];
  created_at: string; updated_at: string;
}

export interface Opportunity {
  id: string; name: string; company: string; type: string; source: string;
  service_id: string | null; value: number; currency: string; status: OppStatus;
  area_id: string | null; next_action: string; notes: string; created_at: string; updated_at: string;
}

export interface Achievement {
  id: string; name: string; description: string; icon: string;
  project_id: string | null; area_id: string | null; created_at: string;
}

export interface ProofItem {
  id: string; name: string; description: string; type: string; url: string;
  project_id: string | null; skill_id: string | null; area_id: string | null; created_at: string;
}

export interface CareerEntry {
  id: string; type: string; title: string; organization: string; location: string;
  start_date: string | null; end_date: string | null; description: string;
  area_id: string | null; created_at: string;
}

export interface Offer {
  id: string; name: string; description: string; service_id: string | null;
  price_min: number; price_max: number; currency: string; delivery_time: string;
  status: string; featured: number; area_id: string | null;
  items: { id: string; name: string; sort_order: number }[];
  created_at: string; updated_at: string;
}

export interface Client {
  id: string; name: string; company: string; contact_name: string; email: string;
  phone: string; whatsapp: string; linkedin: string; instagram: string;
  location: string; source: string; notes: string; status: string;
  area_id: string | null; created_at: string; updated_at: string;
}

export interface Delivery {
  id: string; name: string; client_id: string | null; offer_id: string | null;
  project_id: string | null; status: string; due_date: string | null;
  price: number; currency: string; area_id: string | null;
  created_at: string; updated_at: string;
}

export interface Testimonial {
  id: string; client_id: string | null; text: string; rating: number; service: string;
  project_id: string | null; url: string; publish_permission: number; featured: number;
  area_id: string | null; created_at: string;
}

export interface Document {
  id: string; title: string; category: string; url: string; description: string;
  product_id: string | null; service_id: string | null; offer_id: string | null;
  status: string; tags: string; notes: string; area_id: string | null; created_at: string;
}

export interface Transaction {
  id: string; amount: number; type: string; date: string; category: string;
  source: string; description: string; method: string; status: string;
  reference: string; area_id: string | null; created_at: string;
}

export interface CaseStudy {
  id: string; title: string; project_id: string | null; problem: string; context: string;
  solution: string; process_text: string; technologies: string; result: string;
  metrics: string; learning: string; images: string; links: string;
  featured: number; area_id: string | null; created_at: string; updated_at: string;
}

export interface Routine {
  id: string; name: string; time: string; days: string; duration_minutes: number;
  steps: string; active: number; area_id: string | null; created_at: string; updated_at: string;
}

export interface Habit {
  id: string; name: string; frequency: string; target_value: number; unit: string;
  streak: number; active: number; category: string; area_id: string | null;
  today_log?: { id: string; status: string; date: string } | null;
  logs?: { id: string; status: string; date: string }[];
  created_at: string; updated_at: string;
}

export interface PersonalAdminItem {
  id: string; title: string; type: string; due_date: string | null; status: string;
  cost: number; notes: string; area_id: string | null; created_at: string; updated_at: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  captura: "Captura", definido: "Definido", priorizado: "Priorizado",
  esta_semana: "Esta semana", hoy: "Hoy",
  en_ejecucion: "En ejecución", revision: "Revisión", completado: "Completado",
};

export const STATUS_ORDER: TaskStatus[] = ["captura", "definido", "priorizado", "esta_semana", "hoy", "en_ejecucion", "revision", "completado"];

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  idea: "Idea", borrador: "Borrador", listo: "Listo", publicado: "Publicado", analizado: "Analizado",
};

export const CONTENT_STATUS_ORDER: ContentStatus[] = ["idea", "borrador", "listo", "publicado", "analizado"];

export const OPP_STATUS_LABELS: Record<OppStatus, string> = {
  nueva: "Nueva", contactada: "Contactada", conversación: "Conversación",
  propuesta: "Propuesta", negociación: "Negociación", ganada: "Ganada", perdida: "Perdida",
};

export const OPP_STATUS_ORDER: OppStatus[] = ["nueva", "contactada", "conversación", "propuesta", "negociación", "ganada", "perdida"];

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  activo: "Activo", pausado: "Pausado", archivado: "Archivado",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  P1: "text-danger border-danger/40 bg-danger/10",
  P2: "text-signal border-signal/40 bg-signal/10",
  P3: "text-muted border-border bg-panelRaised",
};
