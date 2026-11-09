import { create } from "zustand";

export interface PostRaceStore {
  isSummaryOpen: boolean;
  hasAutoOpened: boolean;
  openSummary: () => void;
  closeSummary: () => void;
  setSummaryOpen: (open: boolean) => void;
  handleSessionTransition: (prevStatus: string, nextStatus: string) => boolean;
  reset: () => void;
}

export const usePostRaceStore = create<PostRaceStore>((set, get) => ({
  isSummaryOpen: false,
  hasAutoOpened: false,

  openSummary: () => set({ isSummaryOpen: true }),

  closeSummary: () => set({ isSummaryOpen: false }),

  setSummaryOpen: (open) => set({ isSummaryOpen: open }),

  handleSessionTransition: (
    prevStatus: string,
    nextStatus: string
  ): boolean => {
    const isCompleted = nextStatus.toLowerCase() === "completed";
    const wasCompleted = prevStatus.toLowerCase() === "completed";
    const { hasAutoOpened } = get();

    if (isCompleted) {
      if (!wasCompleted || !hasAutoOpened) {
        set({ isSummaryOpen: true, hasAutoOpened: true });
        return true;
      }
      return false;
    }

    // When status transitions out of completed (e.g. into active)
    if (hasAutoOpened || get().isSummaryOpen) {
      set({ hasAutoOpened: false, isSummaryOpen: false });
    }
    return false;
  },

  reset: () => set({ isSummaryOpen: false, hasAutoOpened: false }),
}));
