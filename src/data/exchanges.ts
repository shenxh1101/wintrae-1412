import { ExchangeOrder } from '@/types';

export const mockExchanges: ExchangeOrder[] = [
  {
    id: 'ex-001',
    itemId: 'item-004',
    itemTitle: '小米智能音箱 Pro',
    itemImage: 'https://picsum.photos/id/3/600/600',
    requesterId: 'user-me',
    requesterName: '我',
    requesterAvatar: 'https://picsum.photos/id/1012/200/200',
    publisherId: 'user-004',
    publisherName: '陈工程师',
    publisherAvatar: 'https://picsum.photos/id/338/200/200',
    status: 'reserved',
    messages: [
      {
        id: 'msg-001',
        exchangeId: 'ex-001',
        senderId: 'user-me',
        senderName: '我',
        senderAvatar: 'https://picsum.photos/id/1012/200/200',
        content: '您好，我对您的智能音箱很感兴趣，可以用我的蓝牙耳机交换吗？',
        createdAt: '2026-06-21 10:00:00'
      },
      {
        id: 'msg-002',
        exchangeId: 'ex-001',
        senderId: 'user-004',
        senderName: '陈工程师',
        senderAvatar: 'https://picsum.photos/id/338/200/200',
        content: '你好，请问是什么品牌的蓝牙耳机？使用多久了？',
        createdAt: '2026-06-21 10:15:00'
      },
      {
        id: 'msg-003',
        exchangeId: 'ex-001',
        senderId: 'user-me',
        senderName: '我',
        senderAvatar: 'https://picsum.photos/id/1012/200/200',
        content: '是小米的Air 2s，用了三个月左右，功能完好。',
        createdAt: '2026-06-21 10:30:00'
      },
      {
        id: 'msg-004',
        exchangeId: 'ex-001',
        senderId: 'user-004',
        senderName: '陈工程师',
        senderAvatar: 'https://picsum.photos/id/338/200/200',
        content: '可以，我们约定周六下午在活动现场交换吧？',
        createdAt: '2026-06-21 11:00:00'
      }
    ],
    meetLocation: '社区活动中心 2号摊位',
    meetTime: '2026-06-22 14:00',
    createdAt: '2026-06-21 10:00:00',
    updatedAt: '2026-06-21 11:00:00'
  },
  {
    id: 'ex-002',
    itemId: 'item-001',
    itemTitle: '儿童绘本套装 共12册',
    itemImage: 'https://picsum.photos/id/24/600/600',
    requesterId: 'user-020',
    requesterName: '刘妈妈',
    requesterAvatar: 'https://picsum.photos/id/1027/200/200',
    publisherId: 'user-me',
    publisherName: '我',
    publisherAvatar: 'https://picsum.photos/id/1012/200/200',
    status: 'pending',
    messages: [
      {
        id: 'msg-005',
        exchangeId: 'ex-002',
        senderId: 'user-020',
        senderName: '刘妈妈',
        senderAvatar: 'https://picsum.photos/id/1027/200/200',
        content: '您好！请问这套绘本还在吗？我家宝宝正好3岁多～',
        createdAt: '2026-06-22 09:00:00'
      }
    ],
    createdAt: '2026-06-22 09:00:00',
    updatedAt: '2026-06-22 09:00:00'
  },
  {
    id: 'ex-003',
    itemId: 'item-010',
    itemTitle: '电饭煲 4L大容量',
    itemImage: 'https://picsum.photos/id/326/600/600',
    requesterId: 'user-me',
    requesterName: '我',
    requesterAvatar: 'https://picsum.photos/id/1012/200/200',
    publisherId: 'user-010',
    publisherName: '冯阿姨',
    publisherAvatar: 'https://picsum.photos/id/570/200/200',
    status: 'completed',
    messages: [
      {
        id: 'msg-006',
        exchangeId: 'ex-003',
        senderId: 'user-me',
        senderName: '我',
        senderAvatar: 'https://picsum.photos/id/1012/200/200',
        content: '冯阿姨您好，我想要您的电饭煲',
        createdAt: '2026-06-15 14:00:00'
      },
      {
        id: 'msg-007',
        exchangeId: 'ex-003',
        senderId: 'user-010',
        senderName: '冯阿姨',
        senderAvatar: 'https://picsum.photos/id/570/200/200',
        content: '好的小伙子，你用什么换呀？',
        createdAt: '2026-06-15 15:00:00'
      },
      {
        id: 'msg-008',
        exchangeId: 'ex-003',
        senderId: 'user-me',
        senderName: '我',
        senderAvatar: 'https://picsum.photos/id/1012/200/200',
        content: '我有一个九成新的微波炉',
        createdAt: '2026-06-15 16:00:00'
      }
    ],
    meetLocation: '社区活动中心门口',
    meetTime: '2026-06-18 10:00',
    rating: 5,
    ratingComment: '冯阿姨人很好，电饭煲也很新，完美的一次交换！',
    createdAt: '2026-06-15 14:00:00',
    updatedAt: '2026-06-18 16:00:00'
  },
  {
    id: 'ex-004',
    itemId: 'item-005',
    itemTitle: '实木小书桌 儿童学习桌',
    itemImage: 'https://picsum.photos/id/230/600/600',
    requesterId: 'user-me',
    requesterName: '我',
    requesterAvatar: 'https://picsum.photos/id/1012/200/200',
    publisherId: 'user-005',
    publisherName: '赵老师',
    publisherAvatar: 'https://picsum.photos/id/1027/200/200',
    status: 'cancelled',
    messages: [
      {
        id: 'msg-009',
        exchangeId: 'ex-004',
        senderId: 'user-me',
        senderName: '我',
        senderAvatar: 'https://picsum.photos/id/1012/200/200',
        content: '赵老师您好，请问书桌还在吗？',
        createdAt: '2026-06-20 11:00:00'
      },
      {
        id: 'msg-010',
        exchangeId: 'ex-004',
        senderId: 'user-005',
        senderName: '赵老师',
        senderAvatar: 'https://picsum.photos/id/1027/200/200',
        content: '你好，在的',
        createdAt: '2026-06-20 12:00:00'
      }
    ],
    cancelReason: '尺寸测量不合适，暂时不需要了',
    createdAt: '2026-06-20 11:00:00',
    updatedAt: '2026-06-20 18:00:00'
  },
  {
    id: 'ex-005',
    itemId: 'item-007',
    itemTitle: '不粘锅套装 三件套',
    itemImage: 'https://picsum.photos/id/292/600/600',
    requesterId: 'user-030',
    requesterName: '钱先生',
    requesterAvatar: 'https://picsum.photos/id/177/200/200',
    publisherId: 'user-me',
    publisherName: '我',
    publisherAvatar: 'https://picsum.photos/id/1012/200/200',
    status: 'confirmed',
    messages: [
      {
        id: 'msg-011',
        exchangeId: 'ex-005',
        senderId: 'user-030',
        senderName: '钱先生',
        senderAvatar: 'https://picsum.photos/id/177/200/200',
        content: '您好！不粘锅套装还在吗？我需要一套',
        createdAt: '2026-06-22 07:30:00'
      },
      {
        id: 'msg-012',
        exchangeId: 'ex-005',
        senderId: 'user-me',
        senderName: '我',
        senderAvatar: 'https://picsum.photos/id/1012/200/200',
        content: '在的，您准备用什么交换？',
        createdAt: '2026-06-22 08:00:00'
      }
    ],
    meetLocation: '小区东门保安室旁',
    meetTime: '2026-06-23 19:30',
    createdAt: '2026-06-22 07:30:00',
    updatedAt: '2026-06-22 09:00:00'
  }
];
