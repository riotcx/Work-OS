import { useState, type FormEvent, useEffect } from "react";
import { X } from "lucide-react";
import { useWorkOS } from "../../store";

export function PersonalProfileModule({ areaId }: { areaId: string }) {
  const { profiles, addProfile, updateProfile } = useWorkOS();
  const profile = profiles.find((p) => p.area_id === areaId);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "", title: "", avatar: "", short_bio: "", long_bio: "", location: "",
    languages: "", availability: "", professional_type: "", specialty: "",
    years_experience: "", professional_goal: "", current_status: "", tagline: "", email: "", website: "",
  });

  useEffect(() => {
    if (profile) setForm({
      name: profile.name || "", title: profile.title || "", avatar: profile.avatar || "",
      short_bio: profile.short_bio || "", long_bio: profile.long_bio || "", location: profile.location || "",
      languages: profile.languages || "", availability: profile.availability || "",
      professional_type: profile.professional_type || "", specialty: profile.specialty || "",
      years_experience: profile.years_experience || "", professional_goal: profile.professional_goal || "",
      current_status: profile.current_status || "", tagline: profile.tagline || "",
      email: profile.email || "", website: profile.website || "",
    });
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (profile) {
      await updateProfile(profile.id, form);
    } else {
      await addProfile({ ...form, area_id: areaId });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-ink mb-1">👤 Perfil Profesional</h1>
      <p className="text-sm text-muted mb-6">Define tu identidad profesional. Esta información representa quién eres y qué haces.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-panel border border-border rounded-lg p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">NOMBRE</label>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Tu nombre" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">TÍTULO PROFESIONAL</label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Software Developer · Founder" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-hud text-faint tracking-widest">BIO CORTA</label>
          <textarea value={form.short_bio} onChange={(e) => update("short_bio", e.target.value)} placeholder="Construyo productos digitales, SaaS y sistemas web..." rows={2} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none" />
        </div>

        <div>
          <label className="text-[10px] font-hud text-faint tracking-widest">BIO LARGA</label>
          <textarea value={form.long_bio} onChange={(e) => update("long_bio", e.target.value)} placeholder="Descripción detallada..." rows={4} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">UBICACIÓN</label>
            <input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="La Serena, Chile" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">IDIOMAS</label>
            <input value={form.languages} onChange={(e) => update("languages", e.target.value)} placeholder="Español, Inglés" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">DISPONIBILIDAD</label>
            <input value={form.availability} onChange={(e) => update("availability", e.target.value)} placeholder="Freelance · Consultoría" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">TIPO PROFESIONAL</label>
            <input value={form.professional_type} onChange={(e) => update("professional_type", e.target.value)} placeholder="Software Developer" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">ESPECIALIDAD</label>
            <input value={form.specialty} onChange={(e) => update("specialty", e.target.value)} placeholder="SaaS · Backend · Cloud" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">AÑOS EXP</label>
            <input value={form.years_experience} onChange={(e) => update("years_experience", e.target.value)} placeholder="5+" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">EMAIL</label>
            <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@ejemplo.com" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
          <div>
            <label className="text-[10px] font-hud text-faint tracking-widest">WEBSITE</label>
            <input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-hud text-faint tracking-widest">OBJETIVO PROFESIONAL</label>
          <input value={form.professional_goal} onChange={(e) => update("professional_goal", e.target.value)} placeholder="¿Qué buscas profesionalmente?" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          {saved && <span className="text-xs text-done font-hud">✓ Perfil guardado</span>}
          <button type="submit" className="font-hud text-xs tracking-wide px-4 py-2 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25 ml-auto">
            GUARDAR PERFIL
          </button>
        </div>
      </form>
    </div>
  );
}
