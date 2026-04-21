import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  activeDrawer: string | null;
  globalLoading: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  activeModal: null,
  activeDrawer: null,
  globalLoading: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  openDrawer: (id) => set({ activeDrawer: id }),
  closeDrawer: () => set({ activeDrawer: null }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
