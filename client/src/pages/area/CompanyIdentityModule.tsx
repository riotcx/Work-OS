import { useState, type FormEvent, useEffect } from "react";
import { useWorkOS } from "../../store";

export function CompanyIdentityModule({ areaId }: { areaId: string }) {
  const { profiles, addProfile, updateProfile } = useWorkOS();
  const profile = profiles.find((p) => p.area_id === areaId);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", title: "", website: "", email: "", short_bio: "", long_bio: "", tagline: "", location: "", professional_type: "", specialty: "" });

  useEffect(() => {
    if (profile) setForm({
      name: profile.name || "", title: profile.title || "", website: profile.website || "",
      email: profile.email || "", short_bio: profile.short_bio || "", long_bio: profile.long_bio || "",
      tagline: profile.tagline || "", location: profile.location || "",
      professional_type: profile.professional_type || "", specialty: profile.specialty || "",
    });
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (profile) await updateProfile(profile.id, form);
    else await addProfile({ ...form, area_id: areaId });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const u = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-ink mb-1">🏢 Identidad de Empresa</h1>
      <p className="text-sm text-muted mb-6">Configura cómo se presenta tu empresa.</p>
      <form onSubmit={handleSubmit} className="bg-panel border border-border rounded-lg p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-[10px] font-hud text-faint tracking-widest">NOMBRE</label><input value={form.name} onChange={(e) => u("name", e.target.value)} placeholder="Tu empresa" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" /></div>
          <div><label className="text-[10px] font-hud text-faint tracking-widest">INDUSTRIA / TAGLINE</label><input value={form.title} onChange={(e) => u("title", e.target.value)} placeholder="Software · Digital Products" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" /></div>
        </div>
        <div><label className="text-[10px] font-hud text-faint tracking-widest">DESCRIPCIÓN CORTA</label><textarea value={form.short_bio} onChange={(e) => u("short_bio", e.target.value)} placeholder="Construimos productos digitales y soluciones tecnológicas..." rows={2} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none" /></div>
        <div><label className="text-[10px] font-hud text-faint tracking-widest">DESCRIPCIÓN LARGA</label><textarea value={form.long_bio} onChange={(e) => u("long_bio", e.target.value)} placeholder="Historia, misión, valores..." rows={3} className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50 resize-none" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-[10px] font-hud text-faint tracking-widest">WEBSITE</label><input value={form.website} onChange={(e) => u("website", e.target.value)} placeholder="https://..." className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" /></div>
          <div><label className="text-[10px] font-hud text-faint tracking-widest">EMAIL</label><input value={form.email} onChange={(e) => u("email", e.target.value)} placeholder="contacto@..." className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" /></div>
          <div><label className="text-[10px] font-hud text-faint tracking-widest">UBICACIÓN</label><input value={form.location} onChange={(e) => u("location", e.target.value)} placeholder="Ciudad, País" className="w-full mt-1 bg-panelRaised border border-border rounded-md px-3 py-1.5 text-sm text-ink outline-none focus:border-signal/50" /></div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {saved && <span className="text-xs text-done font-hud">✓ Guardado</span>}
          <button type="submit" className="font-hud text-xs tracking-wide px-4 py-2 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25 ml-auto">GUARDAR</button>
        </div>
      </form>
    </div>
  );
}
