import { useState, useEffect, useCallback } from "react";
import {
  getCurrentWeekId,
  addWeeks,
  canNavigate,
  getWeekInfo,
  type WeekInfo,
} from "./weekUtils";

export function useWeekNavigation() {
  const [currentWeekId, setCurrentWeekId] = useState(getCurrentWeekId);
  const [selectedWeekId, setSelectedWeekId] = useState(currentWeekId);

  const recalcCurrent = useCallback(() => {
    const newCurrent = getCurrentWeekId();
    setCurrentWeekId((prev) => {
      if (prev !== newCurrent) {
        setSelectedWeekId(newCurrent);
      }
      return newCurrent;
    });
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") recalcCurrent();
    };
    const onFocus = () => recalcCurrent();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    const interval = setInterval(recalcCurrent, 60 * 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [recalcCurrent]);

  const goBack = useCallback(() => {
    setSelectedWeekId((prev) => (canNavigate(prev, -1) ? addWeeks(prev, -1) : prev));
  }, []);

  const goForward = useCallback(() => {
    setSelectedWeekId((prev) => (canNavigate(prev, 1) ? addWeeks(prev, 1) : prev));
  }, []);

  const goToday = useCallback(() => {
    setSelectedWeekId(getCurrentWeekId());
  }, []);

  const selectedWeek: WeekInfo = getWeekInfo(selectedWeekId);
  const isCurrent = selectedWeekId === currentWeekId;
  const canGoBack = canNavigate(selectedWeekId, -1);
  const canGoForward = canNavigate(selectedWeekId, 1);

  return {
    currentWeekId,
    selectedWeekId,
    selectedWeek,
    isCurrent,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    goToday,
  };
}
