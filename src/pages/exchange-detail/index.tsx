import React, { useState } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import { useAppStore, currentUser } from '@/store';
import {
  ExchangeOrder,
  exchangeStatusLabels
} from '@/types';
import { formatDate, formatTime } from '@/utils';
import styles from './index.module.scss';

const ExchangeDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;

  const exchanges = useAppStore((s) => s.exchanges);
  const updateExchange = useAppStore((s) => s.updateExchange);
  const updateItem = useAppStore((s) => s.updateItem);

  const exchange: ExchangeOrder | undefined =
    exchanges.find((e) => e.id === id);

  const isPublisher = exchange?.publisherId === currentUser.id;

  const [messageText, setMessageText] = useState('');

  if (!exchange) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100 }}>
          <Text>交换单不存在</Text>
        </View>
      </View>
    );
  }

  const statusClass = exchange.status;

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      exchangeId: exchange.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: messageText.trim(),
      createdAt: new Date().toLocaleString()
    };
    
    updateExchange(exchange.id, {
      messages: [...exchange.messages, newMsg]
    });
    setMessageText('');
    console.log('[ExchangeDetail] Message sent:', newMsg);
  };

  const handleReserve = () => {
    Taro.showModal({
      title: '确认预留',
      content: '确定要为对方预留此物品吗？预留后其他用户将无法申请交换。',
      confirmText: '确定预留',
      cancelText: '再想想',
      confirmColor: '#52C41A',
      success: (res) => {
        if (res.confirm) {
          updateExchange(exchange.id, { status: 'reserved' });
          updateItem(exchange.itemId, { status: 'reserved' });
          console.log('[ExchangeDetail] Reserved:', exchange.id);
          Taro.showToast({ title: '已预留', icon: 'success' });
        }
      }
    });
  };

  const handleConfirmMeet = () => {
    const locations = ['社区活动中心', '小区东门', '社区广场', '活动中心服务台'];
    Taro.showActionSheet({
      itemList: [...locations, '自定义地点'],
      success: (res) => {
        if (res.tapIndex === locations.length) {
          Taro.showModal({
            title: '输入约定地点',
            editable: true,
            placeholderText: '请输入约定地点',
            confirmColor: '#52C41A',
            success: (modalRes) => {
              if (modalRes.confirm && modalRes.content?.trim()) {
                confirmMeetLocation(modalRes.content.trim());
              }
            }
          });
        } else {
          confirmMeetLocation(locations[res.tapIndex]);
        }
      }
    });
  };

  const confirmMeetLocation = (location: string) => {
    const now = new Date();
    const defaultTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate() + 1).padStart(2, '0')} 14:00`;
    Taro.showModal({
      title: '约定时间',
      editable: true,
      placeholderText: `如：${defaultTime}`,
      content: defaultTime,
      confirmColor: '#52C41A',
      success: (res) => {
        if (res.confirm) {
          const meetTime = res.content?.trim() || defaultTime;
          updateExchange(exchange.id, {
            status: 'confirmed',
            meetLocation: location,
            meetTime
          });
          console.log('[ExchangeDetail] Confirmed meet:', location, meetTime);
          Taro.showToast({ title: '已约定地点时间', icon: 'success' });
        }
      }
    });
  };

  const handleComplete = () => {
    Taro.showModal({
      title: '完成交换',
      content: '请确认双方已完成物品交换，完成后可进行评价。',
      confirmText: '确认完成',
      confirmColor: '#52C41A',
      success: (res) => {
        if (res.confirm) {
          updateExchange(exchange.id, { status: 'completed' });
          updateItem(exchange.itemId, { status: 'exchanged' });
          console.log('[ExchangeDetail] Completed:', exchange.id);
          Taro.showToast({ title: '交换完成', icon: 'success' });
        }
      }
    });
  };

  const handleRate = () => {
    const ratingOptions = [
      { label: '⭐⭐⭐⭐⭐ 非常满意', value: 5 },
      { label: '⭐⭐⭐⭐ 比较满意', value: 4 },
      { label: '⭐⭐⭐ 一般', value: 3 },
      { label: '⭐⭐ 不满意', value: 2 },
      { label: '⭐ 非常不满意', value: 1 }
    ];
    Taro.showActionSheet({
      itemList: ratingOptions.map((r) => r.label),
      success: (res) => {
        const rating = ratingOptions[res.tapIndex].value;
        Taro.showModal({
          title: '评价内容',
          editable: true,
          placeholderText: '请输入评价（选填）',
          confirmColor: '#52C41A',
          success: (modalRes) => {
            if (modalRes.confirm) {
              updateExchange(exchange.id, {
                rating,
                ratingComment: modalRes.content?.trim() || ''
              });
              console.log('[ExchangeDetail] Rated:', rating, modalRes.content);
              Taro.showToast({ title: '评价成功', icon: 'success' });
            }
          }
        });
      }
    });
  };

  const handleCancel = () => {
    const reasons = [
      '物品已被交换',
      '临时有事无法赴约',
      '协商后决定取消',
      '其他原因'
    ];
    Taro.showActionSheet({
      itemList: reasons,
      success: (res) => {
        const selectedReason = reasons[res.tapIndex];
        Taro.showModal({
          title: '补充说明',
          editable: true,
          placeholderText: `取消原因：${selectedReason}\n可补充说明（选填）`,
          confirmText: '提交取消',
          confirmColor: '#F53F3F',
          success: (modalRes) => {
            if (modalRes.confirm) {
              const extraDetail = modalRes.content?.trim();
              const cancelReason = extraDetail
                ? `${selectedReason} - ${extraDetail}`
                : selectedReason;
              updateExchange(exchange.id, {
                status: 'cancelled',
                cancelReason
              });
              updateItem(exchange.itemId, { status: 'available' });
              console.log('[ExchangeDetail] Cancelled:', cancelReason);
              Taro.showToast({ title: '已取消', icon: 'none' });
            }
          }
        });
      }
    });
  };

  const renderActionButtons = () => {
    const btns: React.ReactNode[] = [];

    if (exchange.status === 'pending') {
      if (isPublisher) {
        btns.push(
          <View
            key="reject"
            className={classnames(styles.footerBtn, styles.btnWarn)}
            onClick={handleCancel}
          >
            拒绝申请
          </View>
        );
        btns.push(
          <View
            key="reserve"
            className={classnames(styles.footerBtn, styles.btnPrimary)}
            onClick={handleReserve}
          >
            同意并预留
          </View>
        );
      } else {
        btns.push(
          <View
            key="cancel"
            className={classnames(styles.footerBtn, styles.btnWarn)}
            onClick={handleCancel}
          >
            撤销申请
          </View>
        );
      }
    } else if (exchange.status === 'reserved') {
      btns.push(
        <View
          key="cancel"
          className={classnames(styles.footerBtn, styles.btnWarn)}
          onClick={handleCancel}
        >
          取消交换
        </View>
      );
      btns.push(
        <View
          key="confirm"
          className={classnames(styles.footerBtn, styles.btnPrimary)}
          onClick={handleConfirmMeet}
        >
          约定地点时间
        </View>
      );
    } else if (exchange.status === 'confirmed') {
      btns.push(
        <View
          key="cancel"
          className={classnames(styles.footerBtn, styles.btnWarn)}
          onClick={handleCancel}
        >
          取消交换
        </View>
      );
      btns.push(
        <View
          key="complete"
          className={classnames(styles.footerBtn, styles.btnPrimary)}
          onClick={handleComplete}
        >
          确认完成交换
        </View>
      );
    } else if (exchange.status === 'completed') {
      if (!exchange.rating) {
        btns.push(
          <View
            key="rate"
            className={classnames(styles.footerBtn, styles.btnPrimary)}
            onClick={handleRate}
          >
            去评价
          </View>
        );
      }
    }

    return btns;
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.statusHeader}>
          <View className={classnames(styles.statusBadge, styles[statusClass])}>
            {exchangeStatusLabels[exchange.status]}
          </View>
          <Text className={styles.exchangeTime}>
            创建于 {formatDate(exchange.createdAt)}
          </Text>
        </View>

        <View className={styles.itemRow}>
          <Image className={styles.itemImage} src={exchange.itemImage} mode="aspectFill" />
          <View className={styles.itemInfo}>
            <Text className={styles.itemTitle}>{exchange.itemTitle}</Text>
            <Tag
              text={isPublisher ? '我发布的物品' : '我申请的物品'}
              type="default"
              size="sm"
            />
          </View>
        </View>

        <View className={styles.usersRow}>
          <View className={styles.userBlock}>
            <Image
              className={styles.userAvatar}
              src={isPublisher ? exchange.publisherAvatar : exchange.requesterAvatar}
              mode="aspectFill"
            />
            <Text className={styles.userName}>
              {isPublisher ? exchange.publisherName : exchange.requesterName}
            </Text>
            <Text className={styles.userRole}>我（{isPublisher ? '发布者' : '申请者'}）</Text>
          </View>
          <Text className={styles.exchangeArrow}>🤝</Text>
          <View className={styles.userBlock}>
            <Image
              className={styles.userAvatar}
              src={isPublisher ? exchange.requesterAvatar : exchange.publisherAvatar}
              mode="aspectFill"
            />
            <Text className={styles.userName}>
              {isPublisher ? exchange.requesterName : exchange.publisherName}
            </Text>
            <Text className={styles.userRole}>{isPublisher ? '申请者' : '发布者'}</Text>
          </View>
        </View>
      </View>

      {exchange.cancelReason && (
        <View className={styles.cancelReason}>
          <Text className={styles.cancelLabel}>取消原因：</Text>
          <Text className={styles.cancelText}>{exchange.cancelReason}</Text>
        </View>
      )}

      {(exchange.status === 'reserved' || exchange.status === 'confirmed' || exchange.status === 'completed') && exchange.meetLocation && (
        <View className={styles.meetCard}>
          <Text className={styles.sectionTitle}>交换约定</Text>
          <View className={styles.meetInfoRow}>
            <Text className={styles.meetIcon}>📍</Text>
            <View className={styles.meetContent}>
              <Text className={styles.meetLabel}>约定地点</Text>
              <Text className={styles.meetValue}>{exchange.meetLocation}</Text>
            </View>
          </View>
          {exchange.meetTime && (
            <View className={styles.meetInfoRow}>
              <Text className={styles.meetIcon}>⏰</Text>
              <View className={styles.meetContent}>
                <Text className={styles.meetLabel}>约定时间</Text>
                <Text className={styles.meetValue}>{exchange.meetTime}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {exchange.rating && (
        <View className={styles.ratingCard}>
          <Text className={styles.sectionTitle}>我的评价</Text>
          <View className={styles.ratingStars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Text key={i} className={styles.starIcon}>
                {i < exchange.rating! ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
          {exchange.ratingComment && (
            <Text className={styles.ratingComment}>{exchange.ratingComment}</Text>
          )}
        </View>
      )}

      <View className={styles.messagesCard}>
        <Text className={styles.sectionTitle}>双方留言</Text>
        <View className={styles.messagesList}>
          {exchange.messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <View
                key={msg.id}
                className={classnames(styles.messageItem, isMe && styles.isMe)}
              >
                <Image
                  className={styles.messageAvatar}
                  src={msg.senderAvatar}
                  mode="aspectFill"
                />
                <View className={styles.messageBubble}>
                  {!isMe && (
                    <Text className={styles.messageSender}>{msg.senderName}</Text>
                  )}
                  <Text className={styles.messageText}>{msg.content}</Text>
                  <Text className={styles.messageTime}>{formatTime(msg.createdAt)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {exchange.status !== 'cancelled' && exchange.status !== 'completed' && (
          <View className={styles.inputRow}>
            <Input
              className={styles.messageInput}
              placeholder="输入留言..."
              value={messageText}
              onInput={(e) => setMessageText(e.detail.value)}
              confirmType="send"
              onConfirm={handleSendMessage}
            />
            <View className={styles.sendBtn} onClick={handleSendMessage}>
              发送
            </View>
          </View>
        )}
      </View>

      {renderActionButtons().length > 0 && (
        <View className={styles.footer}>{renderActionButtons()}</View>
      )}
    </View>
  );
};

export default ExchangeDetailPage;
