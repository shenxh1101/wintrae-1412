import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import { mockMapMarkers } from '@/data/map-markers';
import { useAppStore, currentUser } from '@/store';
import { QueueNumber, MarkerType, markerTypeLabels } from '@/types';
import { formatDate } from '@/utils';
import styles from './index.module.scss';

const markerIcons: Record<MarkerType, string> = {
  stall: '🏪',
  service: '🛎️',
  donation: '❤️'
};

const QueuePage: React.FC = () => {
  const queueNumbers = useAppStore((s) => s.queueNumbers);
  const addQueueNumber = useAppStore((s) => s.addQueueNumber);
  const cancelQueueNumber = useAppStore((s) => s.cancelQueueNumber);

  const myQueues = useMemo(() => {
    return queueNumbers.filter((q) => q.status !== 'completed' && q.status !== 'cancelled');
  }, [queueNumbers]);

  const currentCalling = useMemo(() => {
    const waiting = queueNumbers.filter((q) => q.status === 'waiting' || q.status === 'calling');
    if (waiting.length === 0) return { dropoff: 0, pickup: 0 };
    const minDropoff = Math.min(...waiting.filter((q) => q.type === 'dropoff').map((q) => q.number), 0);
    const minPickup = Math.min(...waiting.filter((q) => q.type === 'pickup').map((q) => q.number), 0);
    return { dropoff: minDropoff, pickup: minPickup };
  }, [queueNumbers]);

  const getQueueTypeLabel = (type: QueueNumber['type']) => {
    return type === 'dropoff' ? '送件登记' : '取件领取';
  };

  const getQueueTypeIcon = (type: QueueNumber['type']) => {
    return type === 'dropoff' ? '📦' : '🎁';
  };

  const getQueuePrefix = (type: QueueNumber['type']) => {
    return type === 'dropoff' ? 'S' : 'P';
  };

  const getStatusLabel = (status: QueueNumber['status']) => {
    const map = {
      waiting: '等待叫号',
      calling: '正在叫号',
      completed: '已完成',
      cancelled: '已取消'
    };
    return map[status];
  };

  const getStatusClass = (status: QueueNumber['status']) => {
    switch (status) {
      case 'waiting':
        return styles.statusWaiting;
      case 'calling':
        return styles.statusCalling;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const getWaitCount = (queue: QueueNumber) => {
    if (queue.waitCount !== undefined) return queue.waitCount;
    const sameMarker = queueNumbers.filter(
      (q) => q.markerId === queue.markerId && q.status === 'waiting' && q.number < queue.number
    );
    return sameMarker.length;
  };

  const isCurrentCalling = (queue: QueueNumber) => {
    if (queue.currentCalling !== undefined) return queue.currentCalling === queue.number;
    const sameMarkerWaiting = queueNumbers
      .filter((q) => q.markerId === queue.markerId && q.status === 'waiting')
      .sort((a, b) => a.number - b.number);
    return sameMarkerWaiting.length > 0 && sameMarkerWaiting[0].id === queue.id;
  };

  const handleTakeNumber = (type: QueueNumber['type']) => {
    const typeLabel = getQueueTypeLabel(type);
    
    const filteredMarkers = type === 'dropoff' 
      ? mockMapMarkers.filter((m) => m.type === 'donation' || m.type === 'service')
      : mockMapMarkers;
    
    const markerItems = filteredMarkers.map((m) => ({
      label: `${markerIcons[m.type]} ${markerTypeLabels[m.type]} · ${m.name}`,
      value: m
    }));

    Taro.showActionSheet({
      itemList: markerItems.map((m) => m.label),
      success: (res) => {
        const selectedMarker = markerItems[res.tapIndex].value;
        
        Taro.showModal({
          title: `取号确认`,
          content: `确定要在【${selectedMarker.name}】领取【${typeLabel}】的排队号吗？`,
          confirmColor: '#52C41A',
          success: (modalRes) => {
            if (modalRes.confirm) {
              const sameMarkerQueues = queueNumbers.filter(
                (q) => q.markerId === selectedMarker.id && q.type === type
              );
              const maxNumber = sameMarkerQueues.length > 0 
                ? Math.max(...sameMarkerQueues.map((q) => q.number))
                : 0;
              const newNumber = maxNumber + 1;
              const waitCount = sameMarkerQueues.filter((q) => q.status === 'waiting').length;
              
              addQueueNumber({
                number: newNumber,
                type,
                markerId: selectedMarker.id,
                markerName: selectedMarker.name,
                markerType: selectedMarker.type,
                status: 'waiting',
                waitCount,
                currentCalling: Math.max(1, newNumber - waitCount),
                estimatedTime: waitCount > 0 ? `约${waitCount * 5}分钟后` : '即将叫号'
              });
              
              console.log('[Queue] 领取新号 at marker:', selectedMarker.id, newNumber);
              Taro.showToast({
                title: `取号成功！${getQueuePrefix(type)}${newNumber.toString().padStart(3, '0')}`,
                icon: 'success',
                duration: 2000
              });
            }
          }
        });
      }
    });
  };

  const handleCancelQueue = (queueId: string) => {
    Taro.showModal({
      title: '取消排队',
      content: '确定要取消该排队号吗？',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          cancelQueueNumber(queueId);
          console.log('[Queue] 取消排队:', queueId);
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      }
    });
  };

  const handleRemind = (queueId: string) => {
    console.log('[Queue] 设置提醒:', queueId);
    Taro.showToast({
      title: '已开启叫号提醒',
      icon: 'success'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>🏫 阳光社区旧物交换活动</Text>
        <Text className={styles.headerSubtitle}>6月22日 上午9:00-12:00 · 社区活动中心</Text>

        <View className={styles.currentCalling}>
          <View className={styles.callingCard}>
            <Text className={styles.callingLabel}>
              <Text className={styles.callingIcon}>📦</Text>
              送件登记 当前叫号
            </Text>
            <View>
              <Text className={styles.callingNumber}>S{currentCalling.dropoff}</Text>
              <Text className={styles.callingBadge}>叫号中</Text>
            </View>
          </View>
          <View className={styles.callingCard}>
            <Text className={styles.callingLabel}>
              <Text className={styles.callingIcon}>🎁</Text>
              取件领取 当前叫号
            </Text>
            <View>
              <Text className={styles.callingNumber}>P{currentCalling.pickup}</Text>
              <Text className={styles.callingBadge}>叫号中</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.actionSection}>
        <View className={styles.actionCard}>
          <Text className={styles.actionTitle}>🎫 领取排队号</Text>
          <View className={styles.actionButtons}>
            <View
              className={classnames(styles.actionBtn, styles.btnGreen)}
              onClick={() => handleTakeNumber('dropoff')}
            >
              <Text className={styles.actionBtnIcon}>📦</Text>
              <Text className={styles.actionBtnText}>送件登记</Text>
              <Text className={styles.actionBtnDesc}>登记捐赠/交换物品</Text>
            </View>
            <View
              className={classnames(styles.actionBtn, styles.btnOrange)}
              onClick={() => handleTakeNumber('pickup')}
            >
              <Text className={styles.actionBtnIcon}>🎁</Text>
              <Text className={styles.actionBtnText}>取件领取</Text>
              <Text className={styles.actionBtnDesc}>领取预约/交换物品</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.myQueueSection}>
        <Text className={styles.sectionTitle}>
          <Text>📋</Text>
          我的排队号
        </Text>

        {myQueues.length === 0 ? (
          <View
            style={{
              padding: '80rpx 0',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '16rpx',
              boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.08)'
            }}
          >
            <Text style={{ fontSize: '80rpx' }}>🎟️</Text>
            <Text
              style={{
                display: 'block',
                marginTop: '24rpx',
                fontSize: '28rpx',
                color: '#86909C'
              }}
            >
              暂无排队号，快去领取吧！
            </Text>
          </View>
        ) : (
          myQueues.map((queue) => (
            <View
              key={queue.id}
              className={classnames(
                styles.queueCard,
                queue.status === 'calling' && styles.queueCardCalling
              )}
            >
              <View className={styles.queueHeader}>
                <Text
                  className={classnames(
                    styles.queueTypeBadge,
                    queue.type === 'dropoff' ? styles.typeDropoff : styles.typePickup
                  )}
                >
                  {getQueueTypeIcon(queue.type)}
                  {getQueueTypeLabel(queue.type)}
                </Text>
                <Text className={classnames(styles.queueStatusBadge, getStatusClass(queue.status))}>
                  {isCurrentCalling(queue) ? '正在叫号' : getStatusLabel(queue.status)}
                </Text>
              </View>

              {queue.markerName && (
                <View className={styles.queueMarker}>
                  {queue.markerType && (
                    <Tag
                      text={markerTypeLabels[queue.markerType]}
                      type={queue.markerType === 'donation' ? 'warning' : 'primary'}
                      size="sm"
                    />
                  )}
                  <Text className={styles.markerName}>
                    {markerIcons[queue.markerType as MarkerType]} {queue.markerName}
                  </Text>
                </View>
              )}

              <View className={styles.queueNumberDisplay}>
                <Text className={styles.queueNumberPrefix}>您的排队号</Text>
                <Text className={styles.queueNumberBig}>
                  {getQueuePrefix(queue.type)}{queue.number.toString().padStart(3, '0')}
                </Text>
                {isCurrentCalling(queue) && (
                  <View className={styles.callingAnimation}>
                    <Text className={styles.callingPulse}>🔔 正在叫您的号</Text>
                  </View>
                )}
              </View>

              <View className={styles.queueInfo}>
                <View className={styles.infoItem}>
                  <Text className={styles.infoValue}>
                    {queue.status === 'waiting' ? `${getWaitCount(queue)} 位` : '-'}
                  </Text>
                  <Text className={styles.infoLabel}>前方等待</Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.infoValue}>
                    {queue.status === 'waiting' && queue.estimatedTime
                      ? queue.estimatedTime
                      : isCurrentCalling(queue)
                      ? '请尽快前往'
                      : '-'}
                  </Text>
                  <Text className={styles.infoLabel}>预计时间</Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.infoValue}>{formatDate(queue.createdAt).slice(5, 16)}</Text>
                  <Text className={styles.infoLabel}>取号时间</Text>
                </View>
              </View>

              {(queue.status === 'waiting' || queue.status === 'calling') && (
                <View className={styles.queueActions}>
                  <View
                    className={styles.cancelBtn}
                    onClick={() => handleCancelQueue(queue.id)}
                  >
                    取消排队
                  </View>
                  {queue.status === 'waiting' && (
                    <View
                      className={styles.remindBtn}
                      onClick={() => handleRemind(queue.id)}
                    >
                      🔔 叫号提醒
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <View className={styles.tipsSection}>
        <View className={styles.tipsCard}>
          <Text className={styles.tipsTitle}>
            <Text>💡</Text>
            温馨提示
          </Text>
          <View className={styles.tipsList}>
            <Text className={styles.tipItem}>
              叫号后请在5分钟内到达对应窗口，过号需重新取号
            </Text>
            <Text className={styles.tipItem}>
              送件登记请携带好物品，志愿者将帮助您分类登记
            </Text>
            <Text className={styles.tipItem}>
              取件领取请出示预约凭证或交换单二维码
            </Text>
            <Text className={styles.tipItem}>
              如有问题请前往【服务台】咨询志愿者
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default QueuePage;
