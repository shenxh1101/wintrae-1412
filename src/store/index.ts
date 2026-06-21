import { create } from 'zustand';
import Taro from '@tarojs/taro';
import {
  Item,
  ExchangeOrder,
  ExchangeMessage,
  CreditReminder,
  ItemLog,
  QueueNumber,
  ItemLogAction
} from '@/types';
import { mockItems } from '@/data/items';
import { mockExchanges } from '@/data/exchanges';
import { mockCurrentUser, mockCreditReminders, mockItemLogs, mockQueueNumbers } from '@/data/user';
import { generateId } from '@/utils';

const STORAGE_KEY_ITEMS = 'sw_community_items_v1';
const STORAGE_KEY_EXCHANGES = 'sw_community_exchanges_v1';
const STORAGE_KEY_CREDIT = 'sw_community_credit_v1';
const STORAGE_KEY_ITEMLOGS = 'sw_community_itemlogs_v1';
const STORAGE_KEY_QUEUE = 'sw_community_queue_v1';

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
  creditReminders: CreditReminder[];
  itemLogs: ItemLog[];
  queueNumbers: QueueNumber[];

  addItem: (item: Item) => void;
  updateItem: (id: string, patch: Partial<Item>, skipLog?: boolean) => void;
  removeItem: (id: string) => void;

  addExchange: (order: ExchangeOrder) => void;
  updateExchange: (id: string, patch: Partial<ExchangeOrder>) => void;
  addMessage: (exchangeId: string, message: ExchangeMessage) => void;
  confirmArrival: (exchangeId: string, role: 'publisher' | 'requester') => void;

  addCreditReminder: (reminder: Omit<CreditReminder, 'id' | 'createdAt' | 'read'>) => void;
  markCreditReminderRead: (id: string) => void;

  addItemLog: (log: Omit<ItemLog, 'id' | 'createdAt'>) => void;

  addQueueNumber: (queue: Omit<QueueNumber, 'id' | 'createdAt'>) => void;
  updateQueueNumber: (id: string, patch: Partial<QueueNumber>) => void;
  cancelQueueNumber: (id: string) => void;

  clearLocalData: () => void;
}

const autoGenCreditReminder = (
  ex: ExchangeOrder,
  patch: Partial<ExchangeOrder>,
  isPublisher: boolean,
  currentUserId: string
): Omit<CreditReminder, 'id' | 'createdAt' | 'read'> | null => {
  const myRole = isPublisher ? 'publisher' : 'requester';

  if (patch.status === 'cancelled' && ex.status !== 'cancelled') {
    const isSelfCancel =
      (isPublisher && patch.cancelReason?.includes('拒绝')) ||
      (!isPublisher && patch.cancelReason?.includes('撤销')) ||
      patch.cancelReason?.includes('取消');
    if (isSelfCancel) {
      return {
        type: 'warning',
        eventType: 'exchange_cancelled',
        title: '您取消了交换',
        content: `您取消了与${isPublisher ? ex.requesterName : ex.publisherName}关于「${ex.itemTitle}」的交换。频繁取消可能影响您的信用分。`,
        exchangeId: ex.id,
        itemTitle: ex.itemTitle,
        creditChange: 0
      };
    }
  }

  if (patch.status === 'completed' && ex.status !== 'completed') {
    const bothArrived =
      ex.arrivalPublisher?.confirmed && ex.arrivalRequester?.confirmed;
    const onTime = bothArrived && ex.meetTime;
    return {
      type: 'success',
      eventType: onTime ? 'on_time' : 'exchange_completed',
      title: onTime ? '按时完成交换 +3分' : '完成交换 +2分',
      content: `您与${isPublisher ? ex.requesterName : ex.publisherName}关于「${ex.itemTitle}」的交换已成功完成${onTime ? '，双方按时到场' : ''}！`,
      exchangeId: ex.id,
      itemTitle: ex.itemTitle,
      creditChange: onTime ? 3 : 2
    };
  }

  if (patch.rating && patch.rating >= 4 && !ex.rating) {
    return {
      type: 'success',
      eventType: 'good_rating',
      title: '收到好评 +1分',
      content: `您在「${ex.itemTitle}」的交换中获得了${patch.rating}星好评！`,
      exchangeId: ex.id,
      itemTitle: ex.itemTitle,
      creditChange: 1
    };
  }

  if (patch.rating && patch.rating <= 2 && !ex.rating) {
    return {
      type: 'warning',
      eventType: 'bad_rating',
      title: '收到差评提醒',
      content: `您在「${ex.itemTitle}」的交换中获得了${patch.rating}星评价，请重视每次交换体验。`,
      exchangeId: ex.id,
      itemTitle: ex.itemTitle,
      creditChange: -2
    };
  }

  return null;
};

const autoGenItemLog = (
  item: Item | undefined,
  patch: Partial<Item>,
  operatorId: string,
  operatorName: string
): Omit<ItemLog, 'id' | 'createdAt'> | null => {
  if (!item) return null;

  const oldStatus = item.status;
  const newStatus = patch.status;

  let action: ItemLogAction | null = null;
  let changes: string | undefined;

  if (newStatus && newStatus !== oldStatus) {
    if (newStatus === 'offline') action = 'offline';
    else if (oldStatus === 'offline' && newStatus === 'available') action = 'online';
    else if (newStatus === 'reserved') action = 'reserved';
    else if (newStatus === 'exchanged') action = 'exchanged';
  }

  if (!action && Object.keys(patch).some((k) => k !== 'updatedAt')) {
    action = 'edited';
    const changedFields: string[] = [];
    if (patch.title !== undefined && patch.title !== item.title) changedFields.push('标题');
    if (patch.description !== undefined && patch.description !== item.description) changedFields.push('描述');
    if (patch.category !== undefined && patch.category !== item.category) changedFields.push('品类');
    if (patch.condition !== undefined && patch.condition !== item.condition) changedFields.push('新旧程度');
    if (patch.exchangeType !== undefined && patch.exchangeType !== item.exchangeType) changedFields.push('交换方式');
    if (patch.availableTime !== undefined && patch.availableTime !== item.availableTime) changedFields.push('可取时间');
    if (patch.canDeliver !== undefined && patch.canDeliver !== item.canDeliver) changedFields.push('可送达');
    if (patch.images !== undefined && JSON.stringify(patch.images) !== JSON.stringify(item.images)) changedFields.push('图片');
    changes = changedFields.length > 0 ? `修改了：${changedFields.join('、')}` : '编辑了物品信息';
  }

  if (!action) return null;

  return {
    itemId: item.id,
    itemTitle: patch.title || item.title,
    action: action!,
    oldStatus,
    newStatus: newStatus || oldStatus,
    changes,
    operatorId,
    operatorName
  };
};

export const useAppStore = create<AppState>((set, get) => {
  const persist = (
    partial: Partial<
      Pick<
        AppState,
        'items' | 'exchanges' | 'creditReminders' | 'itemLogs' | 'queueNumbers'
      >
    >
  ) => {
    const next = { ...get(), ...partial };
    saveToStorage(STORAGE_KEY_ITEMS, next.items);
    saveToStorage(STORAGE_KEY_EXCHANGES, next.exchanges);
    saveToStorage(STORAGE_KEY_CREDIT, next.creditReminders);
    saveToStorage(STORAGE_KEY_ITEMLOGS, next.itemLogs);
    saveToStorage(STORAGE_KEY_QUEUE, next.queueNumbers);
    return partial;
  };

  const initialItems = loadFromStorage<Item[]>(STORAGE_KEY_ITEMS, mockItems);
  const initialExchanges = loadFromStorage<ExchangeOrder[]>(STORAGE_KEY_EXCHANGES, mockExchanges);
  const initialCredit = loadFromStorage<CreditReminder[]>(STORAGE_KEY_CREDIT, mockCreditReminders);
  const initialLogs = loadFromStorage<ItemLog[]>(STORAGE_KEY_ITEMLOGS, mockItemLogs);
  const initialQueue = loadFromStorage<QueueNumber[]>(STORAGE_KEY_QUEUE, mockQueueNumbers);

  return {
    items: initialItems,
    exchanges: initialExchanges,
    creditReminders: initialCredit,
    itemLogs: initialLogs,
    queueNumbers: initialQueue,

    addItem: (item) => {
      const items = [item, ...get().items];
      const itemLogs = [
        {
          id: generateId(),
          itemId: item.id,
          itemTitle: item.title,
          action: 'created' as const,
          newStatus: item.status,
          operatorId: item.publisherId,
          operatorName: item.publisherName,
          createdAt: new Date().toLocaleString()
        },
        ...get().itemLogs
      ];
      set(persist({ items, itemLogs }));
      console.log('[Store] addItem & log:', item.id);
    },

    updateItem: (id, patch, skipLog = false) => {
      const items = get().items.map((it) =>
        it.id === id ? { ...it, ...patch, updatedAt: new Date().toLocaleString() } as Item : it
      );

      const partial: any = { items };

      if (!skipLog) {
        const original = get().items.find((it) => it.id === id);
        const log = autoGenItemLog(original, patch, mockCurrentUser.id, mockCurrentUser.name);
        if (log) {
          partial.itemLogs = [
            { ...log, id: generateId(), createdAt: new Date().toLocaleString() },
            ...get().itemLogs
          ];
        }
      }

      set(persist(partial));
      console.log('[Store] updateItem:', id, patch);
    },

    removeItem: (id) => {
      const items = get().items.filter((it) => it.id !== id);
      const original = get().items.find((it) => it.id === id);
      const partial: any = { items };

      if (original) {
        partial.itemLogs = [
          {
            id: generateId(),
            itemId: id,
            itemTitle: original.title,
            action: 'deleted' as const,
            oldStatus: original.status,
            operatorId: mockCurrentUser.id,
            operatorName: mockCurrentUser.name,
            createdAt: new Date().toLocaleString()
          },
          ...get().itemLogs
        ];
      }

      set(persist(partial));
      console.log('[Store] removeItem:', id);
    },

    addExchange: (order) => {
      const exchanges = [order, ...get().exchanges];
      set(persist({ exchanges }));
      console.log('[Store] addExchange:', order.id);
    },

    updateExchange: (id, patch) => {
      const exchanges = get().exchanges.map((ex) =>
        ex.id === id ? { ...ex, ...patch, updatedAt: new Date().toLocaleString() } : ex
      );

      const partial: any = { exchanges };

      const original = get().exchanges.find((ex) => ex.id === id);
      if (original) {
        const isPublisher = original.publisherId === mockCurrentUser.id;
        const credit = autoGenCreditReminder(original, patch, isPublisher, mockCurrentUser.id);
        if (credit) {
          partial.creditReminders = [
            { ...credit, id: generateId(), createdAt: new Date().toLocaleString(), read: false },
            ...get().creditReminders
          ];
        }

        if (patch.status === 'reserved' && original.status !== 'reserved') {
          get().updateItem(original.itemId, { status: 'reserved' }, true);
        }
        if (patch.status === 'exchanged' && original.status !== 'exchanged') {
          get().updateItem(original.itemId, { status: 'exchanged' }, true);
        }
        if (patch.status === 'completed' && original.status !== 'completed') {
          get().updateItem(original.itemId, { status: 'exchanged' }, true);
        }
        if (patch.status === 'cancelled' && original.status !== 'cancelled' && original.status !== 'pending') {
          get().updateItem(original.itemId, { status: 'available' }, true);
        }
      }

      set(persist(partial));
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

    confirmArrival: (exchangeId, role) => {
      const exchanges = get().exchanges.map((ex) => {
        if (ex.id !== exchangeId) return ex;
        const key = role === 'publisher' ? 'arrivalPublisher' : 'arrivalRequester';
        const updated = {
          ...ex,
          [key]: {
            confirmed: true,
            confirmedAt: new Date().toLocaleString()
          },
          updatedAt: new Date().toLocaleString()
        };

        if (updated.arrivalPublisher?.confirmed && updated.arrivalRequester?.confirmed) {
          get().addMessage(exchangeId, {
            id: generateId(),
            exchangeId,
            senderId: mockCurrentUser.id,
            senderName: mockCurrentUser.name,
            senderAvatar: mockCurrentUser.avatar,
            content: '【系统】双方已确认到场，请完成物品交接。',
            createdAt: new Date().toLocaleString()
          });
        } else {
          get().addMessage(exchangeId, {
            id: generateId(),
            exchangeId,
            senderId: mockCurrentUser.id,
            senderName: mockCurrentUser.name,
            senderAvatar: mockCurrentUser.avatar,
            content: `【系统】${role === 'publisher' ? '发布者' : '申请者'}已确认到场。`,
            createdAt: new Date().toLocaleString()
          });
        }

        return updated;
      });

      const reminder: Omit<CreditReminder, 'id' | 'createdAt' | 'read'> = {
        type: 'success',
        eventType: 'on_time',
        title: '已确认到场',
        content: `您已在约定地点确认到场，请等待对方确认。`,
        exchangeId,
        itemTitle: exchanges.find((e) => e.id === exchangeId)?.itemTitle,
        creditChange: 0
      };

      const creditReminders = [
        { ...reminder, id: generateId(), createdAt: new Date().toLocaleString(), read: false },
        ...get().creditReminders
      ];

      set(persist({ exchanges, creditReminders }));
      console.log('[Store] confirmArrival:', exchangeId, role);
    },

    addCreditReminder: (reminder) => {
      const creditReminders = [
        { ...reminder, id: generateId(), createdAt: new Date().toLocaleString(), read: false },
        ...get().creditReminders
      ];
      set(persist({ creditReminders }));
      console.log('[Store] addCreditReminder:', reminder.title);
    },

    markCreditReminderRead: (id) => {
      const creditReminders = get().creditReminders.map((cr) =>
        cr.id === id ? { ...cr, read: true } : cr
      );
      set(persist({ creditReminders }));
      console.log('[Store] markCreditReminderRead:', id);
    },

    addItemLog: (log) => {
      const itemLogs = [
        { ...log, id: generateId(), createdAt: new Date().toLocaleString() },
        ...get().itemLogs
      ];
      set(persist({ itemLogs }));
      console.log('[Store] addItemLog:', log.action, log.itemId);
    },

    addQueueNumber: (queue) => {
      const queueNumbers = [
        { ...queue, id: generateId(), createdAt: new Date().toLocaleString() },
        ...get().queueNumbers
      ];
      set(persist({ queueNumbers }));
      console.log('[Store] addQueueNumber:', queue.number, queue.markerName);
    },

    updateQueueNumber: (id, patch) => {
      const queueNumbers = get().queueNumbers.map((q) =>
        q.id === id ? { ...q, ...patch } : q
      );
      set(persist({ queueNumbers }));
      console.log('[Store] updateQueueNumber:', id, patch);
    },

    cancelQueueNumber: (id) => {
      const queueNumbers = get().queueNumbers.map((q) =>
        q.id === id ? { ...q, status: 'cancelled' as const } : q
      );
      set(persist({ queueNumbers }));
      console.log('[Store] cancelQueueNumber:', id);
    },

    clearLocalData: () => {
      saveToStorage(STORAGE_KEY_ITEMS, mockItems);
      saveToStorage(STORAGE_KEY_EXCHANGES, mockExchanges);
      saveToStorage(STORAGE_KEY_CREDIT, mockCreditReminders);
      saveToStorage(STORAGE_KEY_ITEMLOGS, mockItemLogs);
      saveToStorage(STORAGE_KEY_QUEUE, mockQueueNumbers);
      set({
        items: mockItems,
        exchanges: mockExchanges,
        creditReminders: mockCreditReminders,
        itemLogs: mockItemLogs,
        queueNumbers: mockQueueNumbers
      });
      console.log('[Store] local data fully reset to mocks');
    }
  };
});

export const currentUserId = mockCurrentUser.id;
export const currentUser = mockCurrentUser;
