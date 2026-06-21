import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  mockQueueNumbers,
  mockCurrentCalling
} from '@/data/user';
import { QueueNumber } from '@/types';
import { formatDate } from '@/utils';
import styles from './index.module.scss';
import classnames from 'classnames';

const QueuePage: React.FC = () => {
  const [myQueues, setMyQueues] = useState<QueueNumber[]>(mockQueueNumbers);
  const [currentCalling, setCurrentCalling] = useState(mockCurrentCalling);

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
    const current = queue.type === 'dropoff' ? currentCalling.dropoff : currentCalling.pickup;
    const wait = queue.number - current;
    return wait > 0 ? wait : 0;
  };

  const handleTakeNumber = (type: QueueNumber['type']) => {
    const typeLabel = getQueueTypeLabel(type);
    Taro.showModal({
      title: `取号确认`,
      content: `确定要领取【${typeLabel}】的排队号吗？`,
      confirmColor: '#52C41A',
      success: (res) => {
        if (res.confirm) {
          const newNumber = type === 'dropoff' ? currentCalling.dropoff + 20 : currentCalling.pickup + 20;
          const newQueue: QueueNumber = {
            id: `queue-${Date.now()}`,
            number: newNumber,
            type,
            status: 'waiting',
            estimatedTime: type === 'dropoff' ? '约20分钟后' : '约15分钟后',
            createdAt: new Date().toLocaleString()
          };
          setMyQueues([newQueue, ...myQueues]);
          console.log('[Queue] 领取新号:', newQueue);
          Taro.showToast({
            title: `取号成功！${getQueuePrefix(type)}${newNumber}`,
            icon: 'success',
            duration: 2000
          });
        }
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
          setMyQueues(
            myQueues.map((q) =>
              q.id === queueId ? { ...q, status: 'cancelled' as const } : q
            )
          );
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
                  {getStatusLabel(queue.status)}
                </Text>
              </View>

              <View className={styles.queueNumberDisplay}>
                <Text className={styles.queueNumberPrefix}>您的排队号</Text>
                <Text className={styles.queueNumberBig}>
                  {getQueuePrefix(queue.type)}{queue.number.toString().padStart(3, '0')}
                </Text>
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
                      : queue.status === 'calling'
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
