import { MapMarker } from '@/types';

export const mockMapMarkers: MapMarker[] = [
  {
    id: 'marker-001',
    type: 'service',
    name: '社区服务总台',
    description: '活动咨询、失物招领、志愿者登记处',
    latitude: 39.908823,
    longitude: 116.397470,
    status: 'open',
    volunteer: '王主任'
  },
  {
    id: 'marker-002',
    type: 'stall',
    name: 'A区 - 服装交换区',
    description: '服装、鞋帽、箱包类物品交换',
    latitude: 39.908923,
    longitude: 116.397670,
    status: 'open',
    volunteer: '李志愿者'
  },
  {
    id: 'marker-003',
    type: 'stall',
    name: 'B区 - 书籍文具区',
    description: '书籍、文具、办公用品交换',
    latitude: 39.908723,
    longitude: 116.397670,
    status: 'open',
    volunteer: '张老师'
  },
  {
    id: 'marker-004',
    type: 'stall',
    name: 'C区 - 家电数码区',
    description: '小家电、数码产品、配件交换',
    latitude: 39.908823,
    longitude: 116.397270,
    status: 'busy',
    volunteer: '陈工程师'
  },
  {
    id: 'marker-005',
    type: 'stall',
    name: 'D区 - 母婴儿童区',
    description: '母婴用品、儿童玩具、童车交换',
    latitude: 39.908723,
    longitude: 116.397270,
    status: 'open',
    volunteer: '赵妈妈'
  },
  {
    id: 'marker-006',
    type: 'stall',
    name: 'E区 - 家居厨具区',
    description: '家具、厨具、家居用品交换',
    latitude: 39.909023,
    longitude: 116.397470,
    status: 'open',
    volunteer: '孙阿姨'
  },
  {
    id: 'marker-007',
    type: 'donation',
    name: '爱心捐赠点',
    description: '接收无偿捐赠物品，用于帮扶困难家庭',
    latitude: 39.908623,
    longitude: 116.397470,
    status: 'open',
    volunteer: '志愿者小刘'
  },
  {
    id: 'marker-008',
    type: 'service',
    name: '休息饮水区',
    description: '提供饮用水、休息座椅、临时寄存服务',
    latitude: 39.908823,
    longitude: 116.397870,
    status: 'open'
  }
];
