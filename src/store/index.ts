import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Item, ExchangeOrder, ExchangeMessage } from '@/types';
import { mockItems } from '@/data/items';
import { mockExchanges } from '@/data/exchanges';
import { mockCurrentUser } from '@/data/user';

const STORAGE_KEY_ITEMS = 'sw_community_items_v1';
const STORAGE_KEY_EXCHANGES = 'sw_community_exchanges_v1';

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const val = Taro.getStorageSync(key);
    if (val === '' || val === undefined || val === null) return fallback;
    return JSON.parse(val) as T;
  } catch (err) {
    console.warn('[Store] loadFromStorage failed for', key, err);
    return fallback;
  }
};

const saveToStorage = (key: string, data: unknown) => {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (err) {
    console.warn('[Store] saveToStorage failed for', key, err);
  }
};

interface AppState {
  items: Item[];
  exchanges: ExchangeOrder[];

  addItem: (item: Item) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  removeItem: (id: string) => void;

  addExchange: (order: ExchangeOrder) => void;
  updateExchange: (id: string, patch: Partial<ExchangeOrder>) => void;
  addMessage: (exchangeId: string, message: ExchangeMessage) => void;

  clearLocalData: () => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const persist = (partial: Partial<Pick<AppState, 'items' | 'exchanges'>>) => {
    const next = { ...get(), ...partial };
    saveToStorage(STORAGE_KEY_ITEMS, next.items);
    saveToStorage(STORAGE_KEY_EXCHANGES, next.exchanges);
    return partial;
  };

  const initialItems = loadFromStorage<Item[]>(STORAGE_KEY_ITEMS, mockItems);
  const initialExchanges = loadFromStorage<ExchangeOrder[]>(STORAGE_KEY_EXCHANGES, mockExchanges);

  return {
    items: initialItems,
    exchanges: initialExchanges,

    addItem: (item) => {
      const items = [item, ...get().items];
      set(persist({ items }));
      console.log('[Store] addItem:', item.id, 'persisted');
    },

    updateItem: (id, patch) => {
      const items = get().items.map((it) =>
        it.id === id ? { ...it, ...patch, updatedAt: new Date().toLocaleString() } as Item : it
      );
      set(persist({ items }));
      console.log('[Store] updateItem:', id, patch);
    },

    removeItem: (id) => {
      const items = get().items.filter((it) => it.id !== id);
      set(persist({ items }));
      console.log('[Store] removeItem:', id);
    },

    addExchange: (order) => {
      const exchanges = [order, ...get().exchanges];
      set(persist({ exchanges }));
      console.log('[Store] addExchange:', order.id, 'persisted');
    },

    updateExchange: (id, patch) => {
      const exchanges = get().exchanges.map((ex) =>
        ex.id === id ? { ...ex, ...patch, updatedAt: new Date().toLocaleString() } : ex
      );
      set(persist({ exchanges }));
      console.log('[Store] updateExchange:', id, patch);
    },

    addMessage: (exchangeId, message) => {
      const exchanges = get().exchanges.map((ex) =>
        ex.id === exchangeId
          ? { ...ex, messages: [...ex.messages, message], updatedAt: new Date().toLocaleString() }
          : ex
      );
      set(persist({ exchanges }));
      console.log('[Store] addMessage to', exchangeId);
    },

    clearLocalData: () => {
      saveToStorage(STORAGE_KEY_ITEMS, mockItems);
      saveToStorage(STORAGE_KEY_EXCHANGES, mockExchanges);
      set({ items: mockItems, exchanges: mockExchanges });
      console.log('[Store] local data reset to mocks');
    }
  };
});

export const currentUserId = mockCurrentUser.id;
export const currentUser = mockCurrentUser;
