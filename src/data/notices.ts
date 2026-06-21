import { VolunteerNotice } from '@/types';

export const mockVolunteerNotices: VolunteerNotice[] = [
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
    content: '为提高活动服务质量，将于本周五晚7点在线举办纠纷处理培训，请所有志愿者准时参加。',
    createdAt: '2026-06-19 09:00:00',
    priority: 'normal'
  },
  {
    id: 'notice-004',
    title: '捐赠物品整理志愿招募',
    content: '近期收到大量爱心捐赠物品，需要志愿者帮忙整理分类。时间：6月23日下午2点，地点：社区仓库。',
    createdAt: '2026-06-22 08:00:00',
    priority: 'low'
  }
];
