import { create } from 'zustand';
import { Item, ExchangeOrder, ExchangeMessage } from '@/types';
import { mockItems } from '@/data/items';
import { mockExchanges } from '@/data/exchanges';
import { mockCurrentUser } from '@/data/user';

interface AppState {
  items: Item[];
  exchanges: ExchangeOrder[];

  addItem: (item: Item) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  removeItem: (id: string) => void;

  addExchange: (order: ExchangeOrder) => void;
  updateExchange: (id: string, patch: Partial<ExchangeOrder>) => void;
  addMessage: (exchangeId: string, message: ExchangeMessage) => void;
}

export const useAppStore = create<AppState>((set) => ({
  items: [...mockItems],
  exchanges: [...mockExchanges],

  addItem: (item) =>
    set((state) => ({ items: [item, ...state.items] })),

  updateItem: (id, patch) =>
    set((state) => ({
      items: state.items.map((it) =>
        it.id === id ? { ...it, ...patch } : it
      )
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((it) => it.id !== id)
    })),

  addExchange: (order) =>
    set((state) => ({ exchanges: [order, ...state.exchanges] })),

  updateExchange: (id, patch) =>
    set((state) => ({
      exchanges: state.exchanges.map((ex) =>
        ex.id === id ? { ...ex, ...patch, updatedAt: new Date().toLocaleString() } : ex
      )
    })),

  addMessage: (exchangeId, message) =>
    set((state) => ({
      exchanges: state.exchanges.map((ex) =>
        ex.id === exchangeId
          ? { ...ex, messages: [...ex.messages, message], updatedAt: new Date().toLocaleString() }
          : ex
      )
    }))
}));

export const currentUserId = mockCurrentUser.id;
export const currentUser = mockCurrentUser;
