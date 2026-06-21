export default defineAppConfig({
  pages: [
    'pages/browse/index',
    'pages/publish/index',
    'pages/exchange/index',
    'pages/map/index',
    'pages/profile/index',
    'pages/item-detail/index',
    'pages/exchange-detail/index',
    'pages/publish-history/index',
    'pages/item-edit/index',
    'pages/item-log/index',
    'pages/queue/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#52C41A',
    navigationBarTitleText: '社区旧物交换',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F6FFED'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#52C41A',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/browse/index',
        text: '浏览'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/exchange/index',
        text: '交换单'
      },
      {
        pagePath: 'pages/map/index',
        text: '活动地图'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
