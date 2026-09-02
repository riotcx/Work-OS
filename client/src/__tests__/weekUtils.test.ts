import { describe, it, expect } from "vitest";
import {
  getMonday,
  addWeeks,
  getCurrentWeekId,
  getWeekInfo,
  getWeekDays,
  isCurrentWeek,
  canNavigate,
  formatWeekRange,
  formatWeekHeader,
} from "../weekUtils";

describe("weekUtils", () => {
  describe("getMonday", () => {
    it("Lunes devuelve el mismo lunes", () => {
      const monday = new Date(2026, 7, 31); // 31 Ago 2026 (Lunes)
      const result = getMonday(monday);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(7); // Agosto
      expect(result.getDate()).toBe(31);
    });

    it("Martes devuelve el lunes anterior", () => {
      const tuesday = new Date(2026, 8, 1); // 1 Sep 2026 (Martes)
      const result = getMonday(tuesday);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(7); // Agosto
      expect(result.getDate()).toBe(31);
    });

    it("Miércoles devuelve el lunes anterior", () => {
      const wednesday = new Date(2026, 8, 2); // 2 Sep 2026 (Miércoles)
      const result = getMonday(wednesday);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(7);
      expect(result.getDate()).toBe(31);
    });

    it("Domingo devuelve el lunes anterior", () => {
      const sunday = new Date(2026, 8, 6); // 6 Sep 2026 (Domingo)
      const result = getMonday(sunday);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(7);
      expect(result.getDate()).toBe(31);
    });

    it("Lunes siguiente cambia de semana", () => {
      const nextMonday = new Date(2026, 8, 7); // 7 Sep 2026 (Lunes)
      const result = getMonday(nextMonday);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(8); // Septiembre
      expect(result.getDate()).toBe(7);
    });
  });

  describe("addWeeks", () => {
    it("addWeeks(weekId, 0) devuelve la misma semana", () => {
      expect(addWeeks("2026-08-31", 0)).toBe("2026-08-31");
    });

    it("addWeeks(weekId, 1) suma una semana", () => {
      expect(addWeeks("2026-08-31", 1)).toBe("2026-09-07");
    });

    it("addWeeks(weekId, -1) resta una semana", () => {
      expect(addWeeks("2026-08-31", -1)).toBe("2026-08-24");
    });

    it("addWeeks(weekId, -4) resta 4 semanas", () => {
      expect(addWeeks("2026-08-31", -4)).toBe("2026-08-03");
    });

    it("addWeeks(weekId, 4) suma 4 semanas", () => {
      expect(addWeeks("2026-08-31", 4)).toBe("2026-09-28");
    });

    it("Cambio de año funciona", () => {
      expect(addWeeks("2026-12-28", 1)).toBe("2027-01-04");
    });
  });

  describe("getWeekInfo", () => {
    it("Devuelve startDate y endDate correctos", () => {
      const info = getWeekInfo("2026-08-31");
      expect(info.weekId).toBe("2026-08-31");
      expect(info.startDate).toBe("2026-08-31");
      expect(info.endDate).toBe("2026-09-06");
    });

    it("Semana de cambio de año", () => {
      const info = getWeekInfo("2026-12-28");
      expect(info.startDate).toBe("2026-12-28");
      expect(info.endDate).toBe("2027-01-03");
    });
  });

  describe("getWeekDays", () => {
    it("Devuelve 7 días empezando por lunes", () => {
      const days = getWeekDays("2026-08-31");
      expect(days).toHaveLength(7);
      expect(days[0].getDay()).toBe(1); // Lunes
      expect(days[6].getDay()).toBe(0); // Domingo
    });
  });

  describe("canNavigate", () => {
    it("Navegar -4 semanas desde currentWeek está permitido", () => {
      const current = getCurrentWeekId();
      const target = addWeeks(current, -4);
      expect(canNavigate(target, -1)).toBe(false); // No puede ir a -5
    });

    it("Navegar +4 semanas desde currentWeek está permitido", () => {
      const current = getCurrentWeekId();
      const target = addWeeks(current, 4);
      expect(canNavigate(target, 1)).toBe(false); // No puede ir a +5
    });

    it("Navegar -5 semanas está bloqueado", () => {
      const current = getCurrentWeekId();
      const target = addWeeks(current, -5);
      expect(canNavigate(target, -1)).toBe(false);
    });

    it("Navegar +5 semanas está bloqueado", () => {
      const current = getCurrentWeekId();
      const target = addWeeks(current, 5);
      expect(canNavigate(target, 1)).toBe(false);
    });
  });

  describe("formatWeekRange", () => {
    it("Mismo mes", () => {
      const result = formatWeekRange("2026-08-31");
      expect(result).toBe("31 Ago — 6 Sep");
    });

    it("Formato contiene día inicio y fin", () => {
      const result = formatWeekRange("2026-09-07");
      expect(result).toContain("7");
      expect(result).toContain("13");
    });
  });

  describe("formatWeekHeader", () => {
    it("Incluye año", () => {
      const result = formatWeekHeader("2026-08-31");
      expect(result).toContain("2026");
    });
  });
});
