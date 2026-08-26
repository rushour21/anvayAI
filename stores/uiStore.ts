"use client";

import { create } from "zustand";

/* Layout-only state — sidebar collapse and the right workspace panel.
   Kept separate from chatStore, which owns conversation data, not chrome. */

const RIGHT_PANEL_MIN = 320;
const RIGHT_PANEL_MAX = 720;
const RIGHT_PANEL_DEFAULT = 420;

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  rightPanelOpen: boolean;
  rightPanelWidth: number;
  openRightPanel: () => void;
  closeRightPanel: () => void;
  toggleRightPanel: () => void;
  setRightPanelWidth: (width: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  rightPanelOpen: false,
  rightPanelWidth: RIGHT_PANEL_DEFAULT,
  openRightPanel: () => set({ rightPanelOpen: true }),
  closeRightPanel: () => set({ rightPanelOpen: false }),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setRightPanelWidth: (width) =>
    set({
      rightPanelWidth: Math.min(RIGHT_PANEL_MAX, Math.max(RIGHT_PANEL_MIN, width)),
    }),
}));
