import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import ExchangeCard from '@/components/ExchangeCard';
import EmptyState from '@/components/EmptyState';
import { mockExchanges } from '@/data/exchanges';
import { mockCurrentUser } from '@/data/user';
import { ExchangeStatus, exchangeStatusLabels } from '@/types';
import styles from './index.module.scss';

type TabKey = 'all' | 'pending' | 'ongoing' | 'completed' | 'cancelled';

const ExchangePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [activeRole, setActiveRole] = useState<'all' | 'publisher' | 'requester'>('all');

  const currentUserId = mockCurrentUser.id;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待确认' },
    { key: 'ongoing', label: '进行中' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' }
  ];

  const stats = useMemo(() => {
    const base = { pending: 0, ongoing: 0, completed: 0, cancelled: 0 };
    return mockExchanges.reduce((acc, ex) => {
      if (ex.status === 'pending') acc.pending++;
      else if (ex.status === 'reserved' || ex.status === 'confirmed') acc.ongoing++;
      else if (ex.status === 'completed') acc.completed++;
      else if (ex.status === 'cancelled') acc.cancelled++;
      return acc;
    }, base);
  }, []);

  const filteredExchanges = useMemo(() => {
    let result = [...mockExchanges];

    if (activeRole === 'publisher') {
      result = result.filter((ex) => ex.publisherId === currentUserId);
    } else if (activeRole === 'requester') {
      result = result.filter((ex) => ex.requesterId === currentUserId);
    }

    switch (activeTab) {
      case 'pending':
        result = result.filter((ex) => ex.status === 'pending');
        break;
      case 'ongoing':
        result = result.filter(
          (ex) => ex.status === 'reserved' || ex.status === 'confirmed'
        );
        break;
      case 'completed':
        result = result.filter((ex) => ex.status === 'completed');
        break;
      case 'cancelled':
        result = result.filter((ex) => ex.status === 'cancelled');
        break;
    }

    result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return result;
  }, [activeTab, activeRole, currentUserId]);

  const onPullDownRefresh = () => {
    setTimeout(() => {
      Taro.showToast({ title: '刷新成功', icon: 'success' });
      Taro.stopPullDownRefresh();
    }, 500);
  };

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.header}>
          <View className={styles.statsRow}>
            <View
              className={classnames(styles.statItem, activeTab === 'pending' && styles.active)}
              onClick={() => setActiveTab('pending')}
            >
              <Text className={styles.statCount}>{stats.pending}</Text>
              <Text className={styles.statLabel}>待确认</Text>
            </View>
            <View
              className={classnames(styles.statItem, activeTab === 'ongoing' && styles.active)}
              onClick={() => setActiveTab('ongoing')}
            >
              <Text className={styles.statCount}>{stats.ongoing}</Text>
              <Text className={styles.statLabel}>进行中</Text>
            </View>
            <View
              className={classnames(styles.statItem, activeTab === 'completed' && styles.active)}
              onClick={() => setActiveTab('completed')}
            >
              <Text className={styles.statCount}>{stats.completed}</Text>
              <Text className={styles.statLabel}>已完成</Text>
            </View>
            <View
              className={classnames(styles.statItem, activeTab === 'cancelled' && styles.active)}
              onClick={() => setActiveTab('cancelled')}
            >
              <Text className={styles.statCount}>{stats.cancelled}</Text>
              <Text className={styles.statLabel}>已取消</Text>
            </View>
          </View>

          <View className={styles.tabs}>
            {[
              { key: 'all' as const, label: '全部角色' },
              { key: 'publisher' as const, label: '我发布的' },
              { key: 'requester' as const, label: '我申请的' }
            ].map((tab) => (
              <View
                key={tab.key}
                className={classnames(styles.tabItem, activeRole === tab.key && styles.active)}
                onClick={() => setActiveRole(tab.key)}
              >
                {tab.label}
              </View>
            ))}
          </View>
        </View>

        {filteredExchanges.length > 0 ? (
          <View className={styles.list}>
            {filteredExchanges.map((ex) => (
              <ExchangeCard
                key={ex.id}
                exchange={ex}
                currentUserId={currentUserId}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="🤝"
            title="暂无交换单"
            description="去浏览页看看有没有心仪的闲置物品吧～"
          />
        )}
      </View>
    </View>
  );
};

export default ExchangePage;
