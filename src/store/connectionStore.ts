import { create } from 'zustand';

interface Connection {
  id: string;
  name?: string;
  host: string;
  port: number;
  username: string;
}

interface ConnectionStore {
  connections: Connection[];
  currentConnection: Connection | null;
  addConnection: (conn: Connection) => void;
  setCurrentConnection: (conn: Connection | null) => void;
  removeConnection: (id: string) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  connections: JSON.parse(localStorage.getItem('connections') || '[]'),
  currentConnection: null,
  addConnection: (conn) => set((state) => {
    const newConnections = [...state.connections, conn];
    localStorage.setItem('connections', JSON.stringify(newConnections));
    return { connections: newConnections };
  }),
  setCurrentConnection: (conn) => set({ currentConnection: conn }),
  removeConnection: (id) => set((state) => {
    const newConnections = state.connections.filter(c => c.id !== id);
    localStorage.setItem('connections', JSON.stringify(newConnections));
    return { connections: newConnections };
  }),
}));
