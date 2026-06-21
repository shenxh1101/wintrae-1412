// 品类枚举
export type ItemCategory = 
  | 'clothes' 
  | 'books' 
  | 'electronics' 
  | 'furniture' 
  | 'toys' 
  | 'kitchen' 
  | 'sports' 
  | 'other';

// 新旧程度
export type ItemCondition = 'new' | 'likeNew' | 'good' | 'fair' | 'worn';

// 期望交换方式
export type ExchangeType = 'swap' | 'gift' | 'both';

// 物品状态
export type ItemStatus = 'available' | 'reserved' | 'exchanged' | 'offline';

// 交换单状态
export type ExchangeStatus = 
  | 'pending' 
  | 'reserved' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled';

// 地图标记类型
export type MarkerType = 'stall' | 'service' | 'donation';

// 用户类型
export interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  creditScore: number;
  isVolunteer: boolean;
  community: string;
}

// 物品接口
export interface Item {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: ItemCategory;
  condition: ItemCondition;
  exchangeType: ExchangeType;
  availableTime: string;
  canDeliver: boolean;
  publisherId: string;
  publisherName: string;
  publisherAvatar: string;
  community: string;
  distance: number;
  status: ItemStatus;
  createdAt: string;
  expectSwapFor?: string;
}

// 交换留言
export interface ExchangeMessage {
  id: string;
  exchangeId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
}

// 交换单
export interface ExchangeOrder {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  publisherId: string;
  publisherName: string;
  publisherAvatar: string;
  status: ExchangeStatus;
  messages: ExchangeMessage[];
  meetLocation?: string;
  meetMarkerId?: string;
  meetMarkerType?: MarkerType;
  meetTime?: string;
  arrivalPublisher?: {
    confirmed: boolean;
    confirmedAt?: string;
  };
  arrivalRequester?: {
    confirmed: boolean;
    confirmedAt?: string;
  };
  cancelReason?: string;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  updatedAt: string;
}

// 到场状态中文映射
export const arrivalStatusLabels: Record<string, string> = {
  none: '未到场',
  one: '一方已到场',
  both: '双方已到场'
};

// 地图标记
export interface MapMarker {
  id: string;
  type: MarkerType;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  status: 'open' | 'busy' | 'closed';
  volunteer?: string;
}

// 志愿者公告
export interface VolunteerNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  priority: 'high' | 'normal' | 'low';
}

// 黑名单用户
export interface BlacklistUser {
  id: string;
  name: string;
  avatar: string;
  reason: string;
  createdAt: string;
}

// 信用提醒
export type CreditEventType = 
  | 'exchange_completed' 
  | 'exchange_cancelled' 
  | 'no_show' 
  | 'good_rating' 
  | 'bad_rating'
  | 'on_time'
  | 'system';

export interface CreditReminder {
  id: string;
  type: 'warning' | 'info' | 'success';
  eventType: CreditEventType;
  title: string;
  content: string;
  exchangeId?: string;
  itemTitle?: string;
  creditChange?: number;
  createdAt: string;
  read: boolean;
}

// 物品操作日志
export type ItemLogAction = 
  | 'created' 
  | 'edited' 
  | 'offline' 
  | 'online' 
  | 'reserved' 
  | 'exchanged'
  | 'deleted';

export interface ItemLog {
  id: string;
  itemId: string;
  itemTitle: string;
  action: ItemLogAction;
  oldStatus?: string;
  newStatus?: string;
  changes?: string;
  operatorId: string;
  operatorName: string;
  createdAt: string;
}

// 排队号码
export interface QueueNumber {
  id: string;
  number: number;
  type: 'dropoff' | 'pickup';
  markerId?: string;
  markerName?: string;
  markerType?: MarkerType;
  status: 'waiting' | 'calling' | 'completed' | 'cancelled';
  estimatedTime?: string;
  currentCalling?: number;
  waitCount?: number;
  createdAt: string;
}

// 信用事件类型中文映射
export const creditEventTypeLabels: Record<CreditEventType, string> = {
  exchange_completed: '完成交换',
  exchange_cancelled: '取消交换',
  no_show: '爽约',
  good_rating: '好评',
  bad_rating: '差评',
  on_time: '按时到场',
  system: '系统通知'
};

// 物品操作日志中文映射
export const itemLogActionLabels: Record<ItemLogAction, string> = {
  created: '发布物品',
  edited: '编辑物品',
  offline: '下架物品',
  online: '重新上架',
  reserved: '预留物品',
  exchanged: '完成交换',
  deleted: '删除物品'
};

// 品类中文映射
export const categoryLabels: Record<ItemCategory, string> = {
  clothes: '服装',
  books: '书籍',
  electronics: '数码',
  furniture: '家具',
  toys: '玩具',
  kitchen: '厨具',
  sports: '运动',
  other: '其他'
};

// 新旧程度中文映射
export const conditionLabels: Record<ItemCondition, string> = {
  new: '全新',
  likeNew: '几乎全新',
  good: '良好',
  fair: '一般',
  worn: '较旧'
};

// 交换方式中文映射
export const exchangeTypeLabels: Record<ExchangeType, string> = {
  swap: '以物换物',
  gift: '免费赠送',
  both: '都可'
};

// 物品状态中文映射
export const itemStatusLabels: Record<ItemStatus, string> = {
  available: '可交换',
  reserved: '已预留',
  exchanged: '已交换',
  offline: '已下架'
};

// 交换单状态中文映射
export const exchangeStatusLabels: Record<ExchangeStatus, string> = {
  pending: '待确认',
  reserved: '已预留',
  confirmed: '已约定',
  completed: '已完成',
  cancelled: '已取消'
};

// 地图标记中文映射
export const markerTypeLabels: Record<MarkerType, string> = {
  stall: '临时摊位',
  service: '服务台',
  donation: '捐赠点'
};
