import { useEffect } from "react";
import { useRaceStore } from "../store/useRaceStore";
import { usePostRaceStore } from "../store/usePostRaceStore";

export function attachSessionLifecycleObserver(
  raceStore = useRaceStore,
  postRaceStore = usePostRaceStore
): () => void {
  let prevStatus = raceStore.getState().sessionStatus;

  // If already completed on attachment and not auto-opened yet
  if (prevStatus?.toLowerCase() === "completed") {
    postRaceStore.getState().handleSessionTransition("", prevStatus);
  }

  const unsubscribe = raceStore.subscribe((state) => {
    const nextStatus = state.sessionStatus || "";
    if (nextStatus !== prevStatus) {
      postRaceStore.getState().handleSessionTransition(prevStatus, nextStatus);
      prevStatus = nextStatus;
    }
  });

  return unsubscribe;
}

export function useSessionLifecycle(): void {
  useEffect(() => {
    return attachSessionLifecycleObserver(useRaceStore, usePostRaceStore);
  }, []);
}
