import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore, currentUserId } from '@/store';
import {
  ItemStatus,
  categoryLabels,
  conditionLabels,
  exchangeTypeLabels,
  itemStatusLabels
} from '@/types';
import { formatTime } from '@/utils';
import styles from './index.module.scss';
import classnames from 'classnames';

const PublishHistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const items = useAppStore((s) => s.items);
  const updateItem = useAppStore((s) => s.updateItem);
  const removeItem = useAppStore((s) => s.removeItem);

  const myItems = useMemo(() => {
    return items.filter((item) => item.publisherId === currentUserId);
  }, [items]);

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'available', label: '可交换' },
    { key: 'reserved', label: '已预留' },
    { key: 'exchanged', label: '已交换' },
    { key: 'offline', label: '已下架' }
  ];

  const stats = useMemo(() => {
    return {
      total: myItems.length,
      available: myItems.filter((i) => i.status === 'available').length,
      exchanged: myItems.filter((i) => i.status === 'exchanged').length
    };
  }, [myItems]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return myItems;
    return myItems.filter((item) => item.status === activeTab);
  }, [myItems, activeTab]);

  const getStatusClass = (status: ItemStatus) => {
    switch (status) {
      case 'available':
        return styles.statusAvailable;
      case 'reserved':
        return styles.statusReserved;
      case 'exchanged':
        return styles.statusExchanged;
      case 'offline':
        return styles.statusOffline;
      default:
        return '';
    }
  };

  const handleCardClick = (itemId: string) => {
    Taro.navigateTo({ url: `/pages/item-detail/index?id=${itemId}` });
  };

  const handleEdit = (itemId: string) => {
    Taro.navigateTo({ url: `/pages/item-edit/index?id=${itemId}` });
  };

  const handleViewLog = (itemId: string, title: string) => {
    Taro.navigateTo({ url: `/pages/item-log/index?itemId=${itemId}&title=${encodeURIComponent(title)}` });
  };

  const handleToggleOffline = (itemId: string, currentStatus: ItemStatus) => {
    const isOffline = currentStatus === 'offline';
    Taro.showModal({
      title: isOffline ? '重新上架' : '下架物品',
      content: isOffline ? '确定要将该物品重新上架吗？' : '确定要将该物品下架吗？',
      confirmColor: '#52C41A',
      success: (res) => {
        if (res.confirm) {
          updateItem(itemId, { status: isOffline ? 'available' : 'offline' });
          console.log('[PublishHistory] 物品状态变更:', itemId, isOffline ? '上架' : '下架');
          Taro.showToast({
            title: isOffline ? '已重新上架' : '已下架',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleDelete = (itemId: string) => {
    Taro.showModal({
      title: '删除物品',
      content: '确定要删除该发布记录吗？此操作不可恢复。',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          removeItem(itemId);
          console.log('[PublishHistory] 删除物品:', itemId);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.total}</Text>
            <Text className={styles.statLabel}>累计发布</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.available}</Text>
            <Text className={styles.statLabel}>进行中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.exchanged}</Text>
            <Text className={styles.statLabel}>已成功</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.tabActive)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      <View className={styles.listContainer}>
        {filteredItems.length === 0 ? (
          <View
            style={{
              padding: '120rpx 0',
              textAlign: 'center'
            }}
          >
            <Text style={{ fontSize: '80rpx' }}>📦</Text>
            <Text
              style={{
                display: 'block',
                marginTop: '24rpx',
                fontSize: '28rpx',
                color: '#86909C'
              }}
            >
              暂无相关发布记录
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View
              key={item.id}
              className={styles.listCard}
              onClick={() => handleCardClick(item.id)}
            >
              <View className={styles.cardHeader}>
                <Text className={classnames(styles.statusTag, getStatusClass(item.status))}>
                  {itemStatusLabels[item.status]}
                </Text>
                <View className={styles.headerActions}>
                  <View
                    className={styles.logBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewLog(item.id, item.title);
                    }}
                  >
                    📋 记录
                  </View>
                  <Text className={styles.cardTime}>{formatTime(item.createdAt)}</Text>
                </View>
              </View>

              <View className={styles.cardBody}>
                <Image
                  className={styles.cardImage}
                  src={item.images[0]}
                  mode="aspectFill"
                />
                <View className={styles.cardContent}>
                  <View>
                    <Text className={styles.cardTitle}>{item.title}</Text>
                    <Text className={styles.cardDesc}>{item.description}</Text>
                  </View>
                  <View className={styles.tagsRow}>
                    <Text className={styles.tagItem}>{categoryLabels[item.category]}</Text>
                    <Text className={classnames(styles.tagItem, styles.tagOrange)}>
                      {conditionLabels[item.condition]}
                    </Text>
                    <Text className={classnames(styles.tagItem, styles.tagBlue)}>
                      {exchangeTypeLabels[item.exchangeType]}
                    </Text>
                    {item.canDeliver && (
                      <Text className={styles.tagItem}>🚚 可送达</Text>
                    )}
                  </View>
                </View>
              </View>

              <View className={styles.footer}>
                <View className={styles.metaInfo}>
                  <Text>🕐 {item.availableTime}</Text>
                </View>
                <View className={styles.actions}>
                  {(item.status === 'available' || item.status === 'reserved') && (
                    <>
                      <View
                        className={classnames(styles.actionBtn, styles.btnOutline)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item.id);
                        }}
                      >
                        编辑
                      </View>
                      <View
                        className={classnames(styles.actionBtn, styles.btnDanger)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleOffline(item.id, item.status);
                        }}
                      >
                        下架
                      </View>
                    </>
                  )}
                  {item.status === 'offline' && (
                    <>
                      <View
                        className={classnames(styles.actionBtn, styles.btnPrimary)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleOffline(item.id, item.status);
                        }}
                      >
                        重新上架
                      </View>
                      <View
                        className={classnames(styles.actionBtn, styles.btnDanger)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        删除
                      </View>
                    </>
                  )}
                  {item.status === 'exchanged' && (
                    <View
                      className={classnames(styles.actionBtn, styles.btnOutline)}
                      onClick={(e) => {
                        e.stopPropagation();
                        Taro.showToast({ title: '查看交换详情', icon: 'none' });
                      }}
                    >
                      查看交换
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default PublishHistoryPage;
