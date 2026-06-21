import { User, CreditReminder, BlacklistUser, VolunteerNotice, QueueNumber } from '@/types';

export const mockCurrentUser: User = {
  id: 'user-me',
  name: '社区居民小明',
  avatar: 'https://picsum.photos/id/1012/200/200',
  phone: '138****8888',
  creditScore: 98,
  isVolunteer: true,
  community: '阳光社区'
};

export const mockCreditReminders: CreditReminder[] = [
  {
    id: 'credit-001',
    type: 'success',
    eventType: 'exchange_completed',
    title: '信用分提升',
    content: '您完成了一次成功的交换，信用分+2分，当前98分',
    exchangeId: 'ex-001',
    itemTitle: '儿童绘本 10本',
    creditChange: 2,
    createdAt: '2026-06-18 16:00:00',
    read: false
  },
  {
    id: 'credit-002',
    type: 'info',
    eventType: 'system',
    title: '活动提醒',
    content: '本周六社区将举办大型旧物交换活动，欢迎参与！',
    createdAt: '2026-06-20 10:00:00',
    read: true
  }
];

export const mockItemLogs: ItemLog[] = [];

export const mockBlacklist: BlacklistUser[] = [
  {
    id: 'black-001',
    name: '匿名用户*3',
    avatar: 'https://picsum.photos/id/1015/200/200',
    reason: '约定交换时间爽约，且无法联系',
    createdAt: '2026-05-10 14:00:00'
  }
];

export const mockNotices: VolunteerNotice[] = [
  {
    id: 'notice-001',
    title: '【重要】6月22日活动现场志愿者排班',
    content: '请各志愿者于6月22日上午8:30准时到活动中心集合，分配摊位值守任务。服装区：李姐、小王；书籍区：张老师、小赵；家电区：陈工、小孙...',
    createdAt: '2026-06-21 18:00:00',
    priority: 'high'
  },
  {
    id: 'notice-002',
    title: '活动现场物资领取通知',
    content: '志愿者可于活动当天在服务台领取志愿者马甲、工作牌、饮用水和午餐券。请大家保管好工作牌，活动结束后统一归还。',
    createdAt: '2026-06-20 15:30:00',
    priority: 'normal'
  },
  {
    id: 'notice-003',
    title: '交换纠纷处理流程培训',
    content: '为提高活动服务质量，将于本周五晚7点在线举办纠纷处理培训，请所有志愿者准时参加。内容包括：身份验证、物品鉴定、纠纷调解流程等。',
    createdAt: '2026-06-19 09:00:00',
    priority: 'normal'
  },
  {
    id: 'notice-004',
    title: '捐赠物品整理志愿招募',
    content: '近期收到大量爱心捐赠物品，需要志愿者帮忙整理分类。时间：6月23日下午2点，地点：社区仓库。有意者请在群内报名。',
    createdAt: '2026-06-22 08:00:00',
    priority: 'low'
  }
];

export const mockQueueNumbers: QueueNumber[] = [
  {
    id: 'queue-001',
    number: 23,
    type: 'dropoff',
    markerId: 'marker-001',
    markerName: '社区服务总台',
    markerType: 'service',
    status: 'waiting',
    estimatedTime: '约15分钟后',
    currentCalling: 15,
    waitCount: 8,
    createdAt: '2026-06-22 09:30:00'
  },
  {
    id: 'queue-002',
    number: 45,
    type: 'pickup',
    markerId: 'marker-007',
    markerName: '爱心捐赠点',
    markerType: 'donation',
    status: 'calling',
    currentCalling: 45,
    waitCount: 0,
    createdAt: '2026-06-22 09:35:00'
  }
];

export const mockCurrentCalling = {
  dropoff: 15,
  pickup: 45
};
