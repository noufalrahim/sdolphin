import { create } from 'zustand';

export interface FileItem {
  name: string;
  type: 'd' | '-' | 'l';
  size: number;
  modifyTime: number;
  rights: { user: string; group: string; other: string };
  owner: string;
  group: string;
}

interface ExplorerStore {
  currentPath: string;
  homePath: string;
  files: FileItem[];
  selection: string[];
  viewMode: 'grid' | 'list';
  showHidden: boolean;
  history: string[];
  historyIndex: number;
  
  setCurrentPath: (path: string) => void;
  setHomePath: (path: string) => void;
  setFiles: (files: FileItem[]) => void;
  setSelection: (names: string[]) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setShowHidden: (show: boolean) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  pushHistory: (path: string) => void;
}

export const useExplorerStore = create<ExplorerStore>((set) => ({
  currentPath: '/',
  homePath: '/',
  files: [],
  selection: [],
  viewMode: 'list',
  showHidden: false,
  history: ['/'],
  historyIndex: 0,

  setCurrentPath: (path) => set({ currentPath: path }),
  setHomePath: (homePath) => set({ homePath }),
  setFiles: (files) => set({ files }),
  setSelection: (selection) => set({ selection }),
  setViewMode: (viewMode) => set({ viewMode }),
  setShowHidden: (showHidden) => set({ showHidden }),
  
  pushHistory: (path) => set((state) => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(path);
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1,
      currentPath: path
    };
  }),

  navigateBack: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      return {
        historyIndex: newIndex,
        currentPath: state.history[newIndex]
      };
    }
    return state;
  }),

  navigateForward: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      return {
        historyIndex: newIndex,
        currentPath: state.history[newIndex]
      };
    }
    return state;
  }),
}));
