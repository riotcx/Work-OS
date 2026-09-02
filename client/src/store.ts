import { create } from "zustand";
import { api } from "./api";
import type { Area, Sprint, Task, TaskStatus, Project, Goal, Platform, Community, ContentIdea, IdentityIdea, FunnelStage, Metric, Profile, Skill, Technology, Service, Opportunity, Achievement, ProofItem, CareerEntry, Offer, Client, Delivery, Testimonial, Document, FocusSession, Transaction, CaseStudy, Routine, Habit, PersonalAdminItem } from "./types";

function arrayToggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

interface WorkOSState {
  areas: Area[]; sprint: Sprint | null;   tasks: Task[]; projects: Project[]; goals: Goal[];
  platforms: Platform[]; communities: Community[]; contentIdeas: ContentIdea[]; identityIdeas: IdentityIdea[];
  funnelStages: FunnelStage[]; metrics: Metric[];
  profiles: Profile[]; skills: Skill[]; technologies: Technology[];
  services: Service[]; opportunities: Opportunity[]; achievements: Achievement[];
  proofItems: ProofItem[]; careerEntries: CareerEntry[];
  offers: Offer[]; clients: Client[]; deliveries: Delivery[]; testimonials: Testimonial[]; documents: Document[];
  focusSessions: FocusSession[]; sprints: Sprint[];
  transactions: Transaction[]; caseStudies: CaseStudy[]; routines: Routine[]; habits: Habit[]; personalAdminItems: PersonalAdminItem[];
  loading: boolean; error: string | null;
  activeAreaFilter: string | null; activeAreaId: string | null;

  loadAll: () => Promise<void>;
  loadAreaData: (areaId: string) => Promise<void>;
  addTask: (d: Partial<Task>) => Promise<void>;
  updateTask: (id: string, d: Partial<Task>) => Promise<void>;
  moveTask: (id: string, s: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setAreaFilter: (id: string | null) => void;
  setActiveArea: (id: string | null) => void;

  addProject: (d: Partial<Project>) => Promise<void>;
  updateProject: (id: string, d: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addGoal: (d: Partial<Goal>) => Promise<void>;
  updateGoal: (id: string, d: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  addPlatform: (d: Partial<Platform>) => Promise<void>;
  updatePlatform: (id: string, d: Partial<Platform>) => Promise<void>;
  deletePlatform: (id: string) => Promise<void>;

  addCommunity: (d: Partial<Community>) => Promise<void>;
  updateCommunity: (id: string, d: Partial<Community>) => Promise<void>;
  deleteCommunity: (id: string) => Promise<void>;

  addContentIdea: (d: any) => Promise<void>;
  updateContentIdea: (id: string, d: any) => Promise<void>;
  deleteContentIdea: (id: string) => Promise<void>;

  addIdentityIdea: (d: Partial<IdentityIdea>) => Promise<void>;
  updateIdentityIdea: (id: string, d: Partial<IdentityIdea>) => Promise<void>;
  deleteIdentityIdea: (id: string) => Promise<void>;

  addFunnelStage: (d: Partial<FunnelStage>) => Promise<void>;
  updateFunnelStage: (id: string, d: Partial<FunnelStage>) => Promise<void>;
  deleteFunnelStage: (id: string) => Promise<void>;
  addFunnelEntry: (d: { funnel_stage_id: string; value: number; area_id?: string | null }) => Promise<void>;

  addMetric: (d: Partial<Metric>) => Promise<void>;
  updateMetric: (id: string, d: Partial<Metric>) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;

  addProfile: (d: Partial<Profile>) => Promise<void>;
  updateProfile: (id: string, d: Partial<Profile>) => Promise<void>;

  addSkill: (d: any) => Promise<void>;
  updateSkill: (id: string, d: any) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;

  addTechnology: (d: any) => Promise<void>;
  updateTechnology: (id: string, d: any) => Promise<void>;
  deleteTechnology: (id: string) => Promise<void>;

  addService: (d: any) => Promise<void>;
  updateService: (id: string, d: any) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  addOpportunity: (d: Partial<Opportunity>) => Promise<void>;
  updateOpportunity: (id: string, d: Partial<Opportunity>) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;

  addAchievement: (d: Partial<Achievement>) => Promise<void>;
  updateAchievement: (id: string, d: Partial<Achievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;

  addProofItem: (d: Partial<ProofItem>) => Promise<void>;
  updateProofItem: (id: string, d: Partial<ProofItem>) => Promise<void>;
  deleteProofItem: (id: string) => Promise<void>;

  addCareerEntry: (d: Partial<CareerEntry>) => Promise<void>;
  updateCareerEntry: (id: string, d: Partial<CareerEntry>) => Promise<void>;
  deleteCareerEntry: (id: string) => Promise<void>;
  addOffer: (d: any) => Promise<void>;
  updateOffer: (id: string, d: any) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  addClient: (d: Partial<Client>) => Promise<void>;
  updateClient: (id: string, d: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addDelivery: (d: Partial<Delivery>) => Promise<void>;
  updateDelivery: (id: string, d: Partial<Delivery>) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
  addTestimonial: (d: Partial<Testimonial>) => Promise<void>;
  updateTestimonial: (id: string, d: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  addDocument: (d: Partial<Document>) => Promise<void>;
  updateDocument: (id: string, d: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  startFocus: (data: Partial<FocusSession>) => Promise<FocusSession>;
  updateFocus: (id: string, data: Partial<FocusSession>) => Promise<void>;
  loadSprints: () => Promise<void>;
  closeSprint: (id: string) => Promise<void>;
  createSprint: (data: Partial<Sprint>) => Promise<Sprint>;
  addTransaction: (d: Partial<Transaction>) => Promise<void>;
  updateTransaction: (id: string, d: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCaseStudy: (d: Partial<CaseStudy>) => Promise<void>;
  updateCaseStudy: (id: string, d: Partial<CaseStudy>) => Promise<void>;
  deleteCaseStudy: (id: string) => Promise<void>;
  addRoutine: (d: Partial<Routine>) => Promise<void>;
  updateRoutine: (id: string, d: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  addHabit: (d: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, d: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  logHabit: (id: string, d: { date?: string; status?: string }) => Promise<void>;
  addPersonalAdmin: (d: Partial<PersonalAdminItem>) => Promise<void>;
  updatePersonalAdmin: (id: string, d: Partial<PersonalAdminItem>) => Promise<void>;
  deletePersonalAdmin: (id: string) => Promise<void>;
}

function makeCrud<T>(apiCreate: (d: any) => Promise<T>, apiUpdate: (id: string, d: any) => Promise<T>, apiDelete: (id: string) => Promise<void>, key: keyof WorkOSState) {
  return {
    [`add${String(key).charAt(0).toUpperCase() + String(key).slice(1)}`]: async (d: any) => {
      const item = await apiCreate(d);
      (useWorkOS.getState() as any)[key] = [item, ...(useWorkOS.getState() as any)[key]];
      useWorkOS.setState({ [key]: (useWorkOS.getState() as any)[key] } as any);
    },
    [`update${String(key).charAt(0).toUpperCase() + String(key).slice(1)}`]: async (id: string, d: any) => {
      const item = await apiUpdate(id, d);
      const arr = (useWorkOS.getState() as any)[key] as any[];
      useWorkOS.setState({ [key]: arr.map((x: any) => x.id === id ? item : x) } as any);
    },
    [`delete${String(key).charAt(0).toUpperCase() + String(key).slice(1)}`]: async (id: string) => {
      const prev = (useWorkOS.getState() as any)[key] as any[];
      useWorkOS.setState({ [key]: prev.filter((x: any) => x.id !== id) } as any);
      try { await apiDelete(id); } catch { useWorkOS.setState({ [key]: prev } as any); }
    },
  };
}

export const useWorkOS = create<WorkOSState>((set, get) => ({
  areas: [], sprint: null, tasks: [], projects: [], goals: [],
  platforms: [], communities: [], contentIdeas: [], identityIdeas: [],
  funnelStages: [], metrics: [],
  profiles: [], skills: [], technologies: [],
  services: [], opportunities: [], achievements: [],
  proofItems: [], careerEntries: [],
  offers: [], clients: [], deliveries: [], testimonials: [], documents: [],
  focusSessions: [], sprints: [],
  transactions: [], caseStudies: [], routines: [], habits: [], personalAdminItems: [],
  loading: true, error: null, activeAreaFilter: null, activeAreaId: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const [areas, sprint, tasks, projects, goals] = await Promise.all([
        api.getAreas(), api.getCurrentSprint(), api.getTasks(), api.getProjects(), api.getGoals(),
      ]);
      set({ areas, sprint, tasks, projects, goals, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "No se pudo conectar con el servidor", loading: false });
    }
  },

  loadAreaData: async (areaId) => {
    try {
      const [platforms, communities, contentIdeas, identityIdeas, funnelStages, metrics,
        profiles, skills, technologies, services, opportunities, achievements, proofItems, careerEntries,
        offers, clients, deliveries, testimonials, documents,
        transactions, caseStudies, routines, habits, personalAdminItems] = await Promise.all([
        api.platforms.list(areaId), api.communities.list(areaId), api.contentIdeas.list(areaId),
        api.identityIdeas.list(areaId), api.funnel.stages.list(areaId), api.metrics.list(areaId),
        api.profiles.list(areaId), api.skills.list(areaId), api.technologies.list(areaId),
        api.services.list(areaId), api.opportunities.list(areaId), api.achievements.list(areaId),
        api.proofItems.list(areaId), api.career.list(areaId),
        api.offers.list(areaId), api.clients.list(areaId), api.deliveries.list(areaId),
        api.testimonials.list(areaId), api.documents.list(areaId),
        api.transactions.list(areaId), api.caseStudies.list(areaId),
        api.routines.list(areaId), api.habits.list(areaId), api.personalAdmin.list(areaId),
      ]);
      set({ platforms, communities, contentIdeas, identityIdeas, funnelStages, metrics,
        profiles, skills, technologies, services, opportunities, achievements, proofItems, careerEntries,
        offers, clients, deliveries, testimonials, documents,
        transactions, caseStudies, routines, habits, personalAdminItems, activeAreaId: areaId });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error cargando datos del área" });
    }
  },

  addTask: async (d) => { const sprint = get().sprint; const t = await api.createTask({ ...d, sprint_id: sprint?.id ?? null }); set({ tasks: [t, ...get().tasks] }); },
  updateTask: async (id, d) => { const u = await api.updateTask(id, d); set({ tasks: get().tasks.map((t) => t.id === id ? u : t) }); },
  moveTask: async (id, s) => {
    const prev = get().tasks;
    set({ tasks: prev.map((t) => t.id === id ? { ...t, status: s } : t) });
    try { const u = await api.moveTask(id, s); set({ tasks: get().tasks.map((t) => t.id === id ? u : t) }); } catch { set({ tasks: prev }); }
  },
  deleteTask: async (id) => { const p = get().tasks; set({ tasks: p.filter((t) => t.id !== id) }); try { await api.deleteTask(id); } catch { set({ tasks: p }); } },
  setAreaFilter: (id) => set({ activeAreaFilter: id }),
  setActiveArea: (id) => set({ activeAreaId: id }),

  addProject: async (d) => { const p = await api.createProject(d); set({ projects: [p, ...get().projects] }); },
  updateProject: async (id, d) => { const u = await api.updateProject(id, d); set({ projects: get().projects.map((p) => p.id === id ? u : p) }); },
  deleteProject: async (id) => { const p = get().projects; set({ projects: p.filter((x) => x.id !== id) }); try { await api.deleteProject(id); } catch { set({ projects: p }); } },

  addGoal: async (d) => { const g = await api.createGoal(d); set({ goals: [g, ...get().goals] }); },
  updateGoal: async (id, d) => { const u = await api.updateGoal(id, d); set({ goals: get().goals.map((g) => g.id === id ? u : g) }); },
  deleteGoal: async (id) => { const p = get().goals; set({ goals: p.filter((g) => g.id !== id) }); try { await api.deleteGoal(id); } catch { set({ goals: p }); } },

  addPlatform: async (d) => { const i = await api.platforms.create(d); set({ platforms: [i, ...get().platforms] }); },
  updatePlatform: async (id, d) => { const u = await api.platforms.update(id, d); set({ platforms: get().platforms.map((x) => x.id === id ? u : x) }); },
  deletePlatform: async (id) => { const p = get().platforms; set({ platforms: p.filter((x) => x.id !== id) }); try { await api.platforms.delete(id); } catch { set({ platforms: p }); } },

  addCommunity: async (d) => { const i = await api.communities.create(d); set({ communities: [i, ...get().communities] }); },
  updateCommunity: async (id, d) => { const u = await api.communities.update(id, d); set({ communities: get().communities.map((x) => x.id === id ? u : x) }); },
  deleteCommunity: async (id) => { const p = get().communities; set({ communities: p.filter((x) => x.id !== id) }); try { await api.communities.delete(id); } catch { set({ communities: p }); } },

  addContentIdea: async (d) => { const i = await api.contentIdeas.create(d); set({ contentIdeas: [i, ...get().contentIdeas] }); },
  updateContentIdea: async (id, d) => { const u = await api.contentIdeas.update(id, d); set({ contentIdeas: get().contentIdeas.map((x) => x.id === id ? u : x) }); },
  deleteContentIdea: async (id) => { const p = get().contentIdeas; set({ contentIdeas: p.filter((x) => x.id !== id) }); try { await api.contentIdeas.delete(id); } catch { set({ contentIdeas: p }); } },

  addIdentityIdea: async (d) => { const i = await api.identityIdeas.create(d); set({ identityIdeas: [i, ...get().identityIdeas] }); },
  updateIdentityIdea: async (id, d) => { const u = await api.identityIdeas.update(id, d); set({ identityIdeas: get().identityIdeas.map((x) => x.id === id ? u : x) }); },
  deleteIdentityIdea: async (id) => { const p = get().identityIdeas; set({ identityIdeas: p.filter((x) => x.id !== id) }); try { await api.identityIdeas.delete(id); } catch { set({ identityIdeas: p }); } },

  addFunnelStage: async (d) => { const s = await api.funnel.stages.create(d); set({ funnelStages: [...get().funnelStages, s] }); },
  updateFunnelStage: async (id, d) => { const u = await api.funnel.stages.update(id, d); set({ funnelStages: get().funnelStages.map((s) => s.id === id ? u : s) }); },
  deleteFunnelStage: async (id) => { const p = get().funnelStages; set({ funnelStages: p.filter((s) => s.id !== id) }); try { await api.funnel.stages.delete(id); } catch { set({ funnelStages: p }); } },
  addFunnelEntry: async (d) => { await api.funnel.entries.create(d); const areaId = d.area_id ?? get().activeAreaId; if (areaId) { const stages = await api.funnel.stages.list(areaId); set({ funnelStages: stages }); } },

  addMetric: async (d) => { const m = await api.metrics.create(d); set({ metrics: [m, ...get().metrics] }); },
  updateMetric: async (id, d) => { const u = await api.metrics.update(id, d); set({ metrics: get().metrics.map((m) => m.id === id ? u : m) }); },
  deleteMetric: async (id) => { const p = get().metrics; set({ metrics: p.filter((m) => m.id !== id) }); try { await api.metrics.delete(id); } catch { set({ metrics: p }); } },

  addProfile: async (d) => { const i = await api.profiles.create(d); set({ profiles: [i, ...get().profiles] }); },
  updateProfile: async (id, d) => { const u = await api.profiles.update(id, d); set({ profiles: get().profiles.map((x) => x.id === id ? u : x) }); },

  addSkill: async (d) => { const i = await api.skills.create(d); set({ skills: [i, ...get().skills] }); },
  updateSkill: async (id, d) => { const u = await api.skills.update(id, d); set({ skills: get().skills.map((x) => x.id === id ? u : x) }); },
  deleteSkill: async (id) => { const p = get().skills; set({ skills: p.filter((x) => x.id !== id) }); try { await api.skills.delete(id); } catch { set({ skills: p }); } },

  addTechnology: async (d) => { const i = await api.technologies.create(d); set({ technologies: [i, ...get().technologies] }); },
  updateTechnology: async (id, d) => { const u = await api.technologies.update(id, d); set({ technologies: get().technologies.map((x) => x.id === id ? u : x) }); },
  deleteTechnology: async (id) => { const p = get().technologies; set({ technologies: p.filter((x) => x.id !== id) }); try { await api.technologies.delete(id); } catch { set({ technologies: p }); } },

  addService: async (d) => { const i = await api.services.create(d); set({ services: [i, ...get().services] }); },
  updateService: async (id, d) => { const u = await api.services.update(id, d); set({ services: get().services.map((x) => x.id === id ? u : x) }); },
  deleteService: async (id) => { const p = get().services; set({ services: p.filter((x) => x.id !== id) }); try { await api.services.delete(id); } catch { set({ services: p }); } },

  addOpportunity: async (d) => { const i = await api.opportunities.create(d); set({ opportunities: [i, ...get().opportunities] }); },
  updateOpportunity: async (id, d) => { const u = await api.opportunities.update(id, d); set({ opportunities: get().opportunities.map((x) => x.id === id ? u : x) }); },
  deleteOpportunity: async (id) => { const p = get().opportunities; set({ opportunities: p.filter((x) => x.id !== id) }); try { await api.opportunities.delete(id); } catch { set({ opportunities: p }); } },

  addAchievement: async (d) => { const i = await api.achievements.create(d); set({ achievements: [i, ...get().achievements] }); },
  updateAchievement: async (id, d) => { const u = await api.achievements.update(id, d); set({ achievements: get().achievements.map((x) => x.id === id ? u : x) }); },
  deleteAchievement: async (id) => { const p = get().achievements; set({ achievements: p.filter((x) => x.id !== id) }); try { await api.achievements.delete(id); } catch { set({ achievements: p }); } },

  addProofItem: async (d) => { const i = await api.proofItems.create(d); set({ proofItems: [i, ...get().proofItems] }); },
  updateProofItem: async (id, d) => { const u = await api.proofItems.update(id, d); set({ proofItems: get().proofItems.map((x) => x.id === id ? u : x) }); },
  deleteProofItem: async (id) => { const p = get().proofItems; set({ proofItems: p.filter((x) => x.id !== id) }); try { await api.proofItems.delete(id); } catch { set({ proofItems: p }); } },

  addCareerEntry: async (d) => { const i = await api.career.create(d); set({ careerEntries: [i, ...get().careerEntries] }); },
  updateCareerEntry: async (id, d) => { const u = await api.career.update(id, d); set({ careerEntries: get().careerEntries.map((x) => x.id === id ? u : x) }); },
  deleteCareerEntry: async (id) => { const p = get().careerEntries; set({ careerEntries: p.filter((x) => x.id !== id) }); try { await api.career.delete(id); } catch { set({ careerEntries: p }); } },

  addOffer: async (d) => { const i = await api.offers.create(d); set({ offers: [i, ...get().offers] }); },
  updateOffer: async (id, d) => { const u = await api.offers.update(id, d); set({ offers: get().offers.map((x) => x.id === id ? u : x) }); },
  deleteOffer: async (id) => { const p = get().offers; set({ offers: p.filter((x) => x.id !== id) }); try { await api.offers.delete(id); } catch { set({ offers: p }); } },

  addClient: async (d) => { const i = await api.clients.create(d); set({ clients: [i, ...get().clients] }); },
  updateClient: async (id, d) => { const u = await api.clients.update(id, d); set({ clients: get().clients.map((x) => x.id === id ? u : x) }); },
  deleteClient: async (id) => { const p = get().clients; set({ clients: p.filter((x) => x.id !== id) }); try { await api.clients.delete(id); } catch { set({ clients: p }); } },

  addDelivery: async (d) => { const i = await api.deliveries.create(d); set({ deliveries: [i, ...get().deliveries] }); },
  updateDelivery: async (id, d) => { const u = await api.deliveries.update(id, d); set({ deliveries: get().deliveries.map((x) => x.id === id ? u : x) }); },
  deleteDelivery: async (id) => { const p = get().deliveries; set({ deliveries: p.filter((x) => x.id !== id) }); try { await api.deliveries.delete(id); } catch { set({ deliveries: p }); } },

  addTestimonial: async (d) => { const i = await api.testimonials.create(d); set({ testimonials: [i, ...get().testimonials] }); },
  updateTestimonial: async (id, d) => { const u = await api.testimonials.update(id, d); set({ testimonials: get().testimonials.map((x) => x.id === id ? u : x) }); },
  deleteTestimonial: async (id) => { const p = get().testimonials; set({ testimonials: p.filter((x) => x.id !== id) }); try { await api.testimonials.delete(id); } catch { set({ testimonials: p }); } },

  addDocument: async (d) => { const i = await api.documents.create(d); set({ documents: [i, ...get().documents] }); },
  updateDocument: async (id, d) => { const u = await api.documents.update(id, d); set({ documents: get().documents.map((x) => x.id === id ? u : x) }); },
  deleteDocument: async (id) => { const p = get().documents; set({ documents: p.filter((x) => x.id !== id) }); try { await api.documents.delete(id); } catch { set({ documents: p }); } },

  startFocus: async (data) => {
    const session = await api.focus.create(data);
    set({ focusSessions: [session, ...get().focusSessions] });
    return session;
  },
  updateFocus: async (id, data) => {
    const u = await api.focus.update(id, data);
    set({ focusSessions: get().focusSessions.map((s) => s.id === id ? u : s) });
  },

  loadSprints: async () => {
    const list = await api.sprints.list();
    set({ sprints: list });
  },
  closeSprint: async (id) => {
    await api.sprints.update(id, { status: "cerrado" });
    const current = await api.sprints.current();
    set({ sprint: current, sprints: get().sprints.map((s) => s.id === id ? { ...s, status: "cerrado" } : s) });
  },
  createSprint: async (data) => {
    const s = await api.sprints.create(data);
    set({ sprint: s, sprints: [s, ...get().sprints] });
    return s;
  },

  addTransaction: async (d) => { const i = await api.transactions.create(d); set({ transactions: [i, ...get().transactions] }); },
  updateTransaction: async (id, d) => { const u = await api.transactions.update(id, d); set({ transactions: get().transactions.map((x) => x.id === id ? u : x) }); },
  deleteTransaction: async (id) => { const p = get().transactions; set({ transactions: p.filter((x) => x.id !== id) }); try { await api.transactions.delete(id); } catch { set({ transactions: p }); } },

  addCaseStudy: async (d) => { const i = await api.caseStudies.create(d); set({ caseStudies: [i, ...get().caseStudies] }); },
  updateCaseStudy: async (id, d) => { const u = await api.caseStudies.update(id, d); set({ caseStudies: get().caseStudies.map((x) => x.id === id ? u : x) }); },
  deleteCaseStudy: async (id) => { const p = get().caseStudies; set({ caseStudies: p.filter((x) => x.id !== id) }); try { await api.caseStudies.delete(id); } catch { set({ caseStudies: p }); } },

  addRoutine: async (d) => { const i = await api.routines.create(d); set({ routines: [i, ...get().routines] }); },
  updateRoutine: async (id, d) => { const u = await api.routines.update(id, d); set({ routines: get().routines.map((x) => x.id === id ? u : x) }); },
  deleteRoutine: async (id) => { const p = get().routines; set({ routines: p.filter((x) => x.id !== id) }); try { await api.routines.delete(id); } catch { set({ routines: p }); } },

  addHabit: async (d) => { const i = await api.habits.create(d); set({ habits: [i, ...get().habits] }); },
  updateHabit: async (id, d) => { const u = await api.habits.update(id, d); set({ habits: get().habits.map((x) => x.id === id ? u : x) }); },
  deleteHabit: async (id) => { const p = get().habits; set({ habits: p.filter((x) => x.id !== id) }); try { await api.habits.delete(id); } catch { set({ habits: p }); } },
  logHabit: async (id, d) => { await api.habits.log(id, d); },

  addPersonalAdmin: async (d) => { const i = await api.personalAdmin.create(d); set({ personalAdminItems: [i, ...get().personalAdminItems] }); },
  updatePersonalAdmin: async (id, d) => { const u = await api.personalAdmin.update(id, d); set({ personalAdminItems: get().personalAdminItems.map((x) => x.id === id ? u : x) }); },
  deletePersonalAdmin: async (id) => { const p = get().personalAdminItems; set({ personalAdminItems: p.filter((x) => x.id !== id) }); try { await api.personalAdmin.delete(id); } catch { set({ personalAdminItems: p }); } },
}));
