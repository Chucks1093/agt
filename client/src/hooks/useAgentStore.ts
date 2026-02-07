import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ConnectedAgent = {
	id: string;
	wallet_address: string;
	name: string | null;
};

type AgentStore = {
	agent: ConnectedAgent | null;
	setAgent: (agent: ConnectedAgent) => void;
	clearAgent: () => void;
};

function safeStorage() {
	// Next.js can evaluate modules during SSR; localStorage only exists in the browser.
	return createJSONStorage(() => {
		if (typeof window === 'undefined') {
			// Dummy storage for SSR/build. Must satisfy the Storage interface.
			const mem = new Map<string, string>();
			const storage: Storage = {
				get length() {
					return mem.size;
				},
				clear() {
					mem.clear();
				},
				key(index: number) {
					return Array.from(mem.keys())[index] ?? null;
				},
				getItem(key: string) {
					return mem.get(key) ?? null;
				},
				setItem(key: string, value: string) {
					mem.set(key, value);
				},
				removeItem(key: string) {
					mem.delete(key);
				},
			};
			return storage;
		}
		return window.localStorage;
	});
}

export const useAgentStore = create<AgentStore>()(
	persist(
		set => ({
			agent: null,
			setAgent: agent => set({ agent }),
			clearAgent: () => set({ agent: null }),
		}),
		{
			name: 'agt_agent_store',
			storage: safeStorage(),
			partialize: s => ({ agent: s.agent }),
		}
	)
);
