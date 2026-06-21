import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  mockCurrentUser,
  mockCreditReminders,
  mockBlacklist,
  mockNotices,
  mockQueueNumbers
} from '@/data/user';
import { mockItems } from '@/data/items';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const user = mockCurrentUser;
  const myPublishedCount = mockItems.filter(
    (item) => item.publisherId === user.id
  ).length + 3;

  const quickActions = [
    {
      icon: '📦',
      label: '发布历史',
      type: 'green',
      action: () => Taro.navigateTo({ url: '/pages/publish-history/index' })
    },
    {
      icon: '🔔',
      label: '信用提醒',
      type: 'orange',
      badge: mockCreditReminders.length,
      action: () =>
        Taro.showModal({
          title: '信用提醒',
          content: mockCreditReminders.map((r) => `· ${r.title}`).join('\n'),
          showCancel: false,
          confirmColor: '#52C41A'
        })
    },
    {
      icon: '🚫',
      label: '黑名单',
      type: 'red',
      badge: mockBlacklist.length,
      action: () =>
        Taro.showModal({
          title: '黑名单用户',
          content: mockBlacklist.map((u) => `· ${u.name}\n  原因：${u.reason}`).join('\n\n'),
          showCancel: false,
          confirmColor: '#52C41A'
        })
    },
    {
      icon: '📢',
      label: '志愿者公告',
      type: 'blue',
      badge: mockNotices.filter((n) => n.priority === 'high').length,
      action: () =>
        Taro.showActionSheet({
          itemList: mockNotices.map((n) =>
            n.priority === 'high' ? `【重要】${n.title}` : n.title
          )
        })
    },
    {
      icon: '🎫',
      label: '排队取号',
      type: 'green',
      action: () => Taro.navigateTo({ url: '/pages/queue/index' })
    },
    {
      icon: '⭐',
      label: '我的收藏',
      type: 'orange',
      action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
    },
    {
      icon: '💬',
      label: '意见反馈',
      type: 'blue',
      action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
    },
    {
      icon: '⚙️',
      label: '设置',
      type: 'red',
      action: () => Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  ];

  const menuItems = [
    {
      icon: '📦',
      title: '发布历史',
      subtitle: `已发布 ${myPublishedCount} 件闲置物品`,
      action: () => Taro.navigateTo({ url: '/pages/publish-history/index' })
    },
    {
      icon: '📢',
      iconClass: 'info',
      title: '志愿者公告',
      subtitle: `最新公告：${mockNotices[0].title.slice(0, 20)}...`,
      badge: mockNotices.filter((n) => n.priority === 'high').length,
      action: () =>
        Taro.showActionSheet({
          itemList: mockNotices.map((n) =>
            n.priority === 'high' ? `【重要】${n.title}` : n.title
          )
        })
    },
    {
      icon: '🎫',
      title: '活动排队取号',
      subtitle: mockQueueNumbers.length > 0 ? `当前有 ${mockQueueNumbers.length} 个号` : '活动当天可取号',
      action: () => Taro.navigateTo({ url: '/pages/queue/index' })
    },
    {
      icon: '🔔',
      iconClass: 'warning',
      title: '信用提醒',
      subtitle:
        mockCreditReminders.length > 0
          ? mockCreditReminders[0].title
          : '暂无新的信用提醒',
      badge: mockCreditReminders.length,
      action: () =>
        Taro.showModal({
          title: '信用提醒',
          content: mockCreditReminders.map((r) => `· ${r.title}\n  ${r.content}`).join('\n\n'),
          showCancel: false,
          confirmColor: '#52C41A'
        })
    },
    {
      icon: '🚫',
      iconClass: 'error',
      title: '黑名单管理',
      subtitle: `已拉黑 ${mockBlacklist.length} 位用户`,
      action: () =>
        Taro.showModal({
          title: '黑名单用户',
          content: mockBlacklist.map((u) => `· ${u.name}\n  原因：${u.reason}`).join('\n\n'),
          showCancel: false,
          confirmColor: '#52C41A'
        })
    }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={user.avatar} mode="aspectFill" />
          <View className={styles.userMeta}>
            <Text className={styles.userName}>
              {user.name}
              {user.isVolunteer && (
                <Text className={styles.volunteerBadge}>🎖️ 志愿者</Text>
              )}
            </Text>
            <Text className={styles.userCommunity}>🏘️ {user.community}</Text>
            <Text className={styles.userPhone}>📱 {user.phone}</Text>
          </View>
        </View>

        <View className={styles.creditCard}>
          <View className={styles.creditScoreWrap}>
            <Text className={styles.creditScore}>{user.creditScore}</Text>
            <Text className={styles.creditLabel}>信用分</Text>
          </View>
          <View className={styles.creditActions}>
            <View className={styles.creditItem}>
              <Text className={styles.creditItemLabel}>
                <Text className={styles.creditItemIcon}>📈</Text>
                信用等级：优秀
              </Text>
              <Text className={styles.creditItemArrow}>›</Text>
            </View>
            <View className={styles.creditItem}>
              <Text className={styles.creditItemLabel}>
                <Text className={styles.creditItemIcon}>✅</Text>
                已完成交换 12 次
              </Text>
              <Text className={styles.creditItemArrow}>›</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>快捷入口</Text>
          <View className={styles.quickActions}>
            {quickActions.slice(0, 8).map((action, idx) => (
              <View
                key={idx}
                className={styles.actionItem}
                onClick={action.action}
              >
                <View className={`${styles.actionIcon} ${styles[action.type]}`}>
                  {action.icon}
                </View>
                <Text className={styles.actionLabel}>{action.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>功能列表</Text>
          <View className={styles.listCard}>
            {menuItems.map((item, idx) => (
              <View key={idx} className={styles.listItem} onClick={item.action}>
                <View className={`${styles.listIcon} ${item.iconClass ? styles[item.iconClass] : ''}`}>
                  {item.icon}
                </View>
                <View className={styles.listContent}>
                  <Text className={styles.listTitle}>{item.title}</Text>
                  <Text className={styles.listSubtitle}>{item.subtitle}</Text>
                </View>
                {item.badge && item.badge > 0 && (
                  <Text className={styles.listBadge}>{item.badge}</Text>
                )}
                <Text className={styles.listArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfilePage;
