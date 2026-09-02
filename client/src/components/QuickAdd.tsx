import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useWorkOS } from "../store";
import type { Priority, TaskStatus } from "../types";

interface QuickAddProps {
  defaultStatus: TaskStatus;
  placeholder?: string;
}

// Parsea algo como: "Crear landing Fiverr P1 #ingresos"
function parseQuickAdd(raw: string, areaNames: { id: string; name: string }[]) {
  let text = raw.trim();
  let priority: Priority = "P2";

  const priorityMatch = text.match(/\bP([123])\b/i);
  if (priorityMatch) {
    priority = `P${priorityMatch[1]}` as Priority;
    text = text.replace(priorityMatch[0], "").trim();
  }

  let area_id: string | null = null;
  const tagMatch = text.match(/#(\S+)/);
  if (tagMatch) {
    const tag = tagMatch[1].toLowerCase();
    const found = areaNames.find(
      (a) => a.name.toLowerCase().replace(/\s+/g, "") .includes(tag) || tag.includes(a.name.toLowerCase().split(" ")[0])
    );
    if (found) area_id = found.id;
    text = text.replace(tagMatch[0], "").trim();
  }

  return { title: text.replace(/\s{2,}/g, " ").trim(), priority, area_id };
}

export function QuickAdd({ defaultStatus, placeholder }: QuickAddProps) {
  const { areas, addTask } = useWorkOS();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    const { title, priority, area_id } = parseQuickAdd(value, areas);
    if (!title) {
      setSubmitting(false);
      return;
    }
    try {
      await addTask({ title, priority, area_id, status: defaultStatus });
      setValue("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 bg-panelRaised border border-border rounded-md px-3 py-2 focus-within:border-signal/50 transition-colors">
        <Plus size={16} className="text-faint shrink-0" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "Crear landing Fiverr P1 #ingresos"}
          className="bg-transparent outline-none text-sm text-ink placeholder:text-faint w-full"
        />
      </div>
      <button
        type="submit"
        disabled={!value.trim() || submitting}
        className="font-hud text-xs tracking-wide px-3 py-2 rounded-md bg-signal/15 text-signal border border-signal/40 hover:bg-signal/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        AGREGAR
      </button>
    </form>
  );
}
