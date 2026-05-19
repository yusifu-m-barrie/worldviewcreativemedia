import { create } from "zustand";

interface UIState {
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileMenuOpen: false,
  searchOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
}));
