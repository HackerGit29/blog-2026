import { create } from 'zustand';

interface PortfolioState {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  activeTab: 0,
  setActiveTab: (index) => set({ activeTab: index }),
}));
