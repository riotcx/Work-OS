import { Home, Swords, Calendar, Timer, BarChart3 } from "lucide-react";
import type { View } from "../App";

const MOBILE_ITEMS: { id: View; label: string; icon: typeof Home }[] = [
  { id: "today", label: "Hoy", icon: Swords },
  { id: "week", label: "Semana", icon: Calendar },
  { id: "focus", label: "Focus", icon: Timer },
  { id: "kanban", label: "Kanban", icon: BarChart3 },
];

export function MobileNav({ view, onNavigate }: { view: View; onNavigate: (v: View) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-panel border-t border-border z-40 flex items-center justify-around py-1.5 safe-area-bottom md:hidden">
      {MOBILE_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-md text-[10px] transition-colors ${
              active ? "text-signal" : "text-faint"
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
            <span className="font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
