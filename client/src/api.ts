import type { Area, Project, Sprint, Task, TaskStatus, Goal, Platform, Community, ContentIdea, IdentityIdea, FunnelStage, FunnelEntry, Metric, Profile, Skill, Technology, Service, Opportunity, Achievement, ProofItem, CareerEntry, Offer, Client, Delivery, Testimonial, Document, FocusSession, Transaction, CaseStudy, Routine, Habit, PersonalAdminItem } from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

const crud = (path: string) => ({
  list: (areaId?: string) => request<any[]>(`${path}${areaId ? `?area_id=${areaId}` : ""}`),
  create: (data: any) => request<any>(path, { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`${path}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`${path}/${id}`, { method: "DELETE" }),
});

export const api = {
  getAreas: () => request<Area[]>("/areas"),
  getProjects: () => request<Project[]>("/projects"),
  getCurrentSprint: () => request<Sprint | null>("/sprints/current"),
  getTasks: () => request<Task[]>("/tasks"),
  createTask: (data: Partial<Task>) => request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<Task>) => request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  moveTask: (id: string, status: TaskStatus) => request<Task>(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),

  createProject: (data: Partial<Project>) => request<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<Project>) => request<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<void>(`/projects/${id}`, { method: "DELETE" }),

  getGoals: () => request<Goal[]>("/goals"),
  createGoal: (data: Partial<Goal>) => request<Goal>("/goals", { method: "POST", body: JSON.stringify(data) }),
  updateGoal: (id: string, data: Partial<Goal>) => request<Goal>(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteGoal: (id: string) => request<void>(`/goals/${id}`, { method: "DELETE" }),

  platforms: crud("/platforms"),
  communities: crud("/communities"),
  contentIdeas: {
    list: (areaId?: string, status?: string) => request<ContentIdea[]>(`/content-ideas${areaId ? `?area_id=${areaId}${status ? `&status=${status}` : ""}` : ""}`),
    create: (data: any) => request<ContentIdea>("/content-ideas", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<ContentIdea>(`/content-ideas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/content-ideas/${id}`, { method: "DELETE" }),
  },
  identityIdeas: crud("/identity-ideas"),
  funnel: {
    stages: crud("/funnel/stages"),
    entries: {
      create: (data: any) => request<FunnelEntry>("/funnel/entries", { method: "POST", body: JSON.stringify(data) }),
    },
  },
  metrics: crud("/metrics"),

  profiles: crud("/profiles"),
  skills: crud("/skills"),
  technologies: crud("/technologies"),
  services: crud("/services"),
  opportunities: crud("/opportunities"),
  achievements: crud("/achievements"),
  proofItems: crud("/proof-items"),
  career: crud("/career"),
  offers: crud("/offers"),
  clients: crud("/clients"),
  deliveries: crud("/deliveries"),
  testimonials: crud("/testimonials"),
  documents: crud("/documents"),
  focus: {
    list: (areaId?: string) => request<FocusSession[]>(`/focus${areaId ? `?area_id=${areaId}` : ""}`),
    create: (data: Partial<FocusSession>) => request<FocusSession>("/focus", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<FocusSession>) => request<FocusSession>(`/focus/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  sprints: {
    list: () => request<Sprint[]>("/sprints"),
    current: () => request<Sprint | null>("/sprints/current"),
    get: (id: string) => request<Sprint>(`/sprints/${id}`),
    byWeek: (weekId: string) => request<Sprint>(`/sprints/week/${weekId}`),
    create: (data: Partial<Sprint>) => request<Sprint>("/sprints", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Sprint>) => request<Sprint>(`/sprints/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/sprints/${id}`, { method: "DELETE" }),
  },
  transactions: crud("/transactions"),
  caseStudies: crud("/case-studies"),
  routines: crud("/routines"),
  habits: {
    list: (areaId?: string) => request<Habit[]>(`/habits${areaId ? `?area_id=${areaId}` : ""}`),
    create: (data: Partial<Habit>) => request<Habit>("/habits", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Habit>) => request<Habit>(`/habits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/habits/${id}`, { method: "DELETE" }),
    log: (id: string, data: { date?: string; status?: string }) => request<any>(`/habits/${id}/log`, { method: "POST", body: JSON.stringify(data) }),
    deleteLog: (id: string, date: string) => request<void>(`/habits/${id}/log/${date}`, { method: "DELETE" }),
  },
  personalAdmin: crud("/personal-admin"),
};
