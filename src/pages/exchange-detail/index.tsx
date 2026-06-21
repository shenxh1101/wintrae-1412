import React, { useState } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import { useAppStore, currentUser } from '@/store';
import { mockMapMarkers } from '@/data/map-markers';
import {
  ExchangeOrder,
  exchangeStatusLabels,
  markerTypeLabels,
  MarkerType
} from '@/types';
import { formatDate, formatTime, generateId } from '@/utils';
import styles from './index.module.scss';

const markerIcons: Record<MarkerType, string> = {
  stall: '🏪',
  service: '🛎️',
  donation: '❤️'
};

const ExchangeDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;

  const exchanges = useAppStore((s) => s.exchanges);
  const updateExchange = useAppStore((s) => s.updateExchange);
  const addMessage = useAppStore((s) => s.addMessage);
  const updateItem = useAppStore((s) => s.updateItem);
  const confirmArrival = useAppStore((s) => s.confirmArrival);

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
      id: generateId(),
      exchangeId: exchange.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: messageText.trim(),
      createdAt: new Date().toLocaleString()
    };

    addMessage(exchange.id, newMsg);
    setMessageText('');
    console.log('[ExchangeDetail] Message sent (persisted):', newMsg.id);
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
          addMessage(exchange.id, {
            id: generateId(),
            exchangeId: exchange.id,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            content: '【系统】发布者已为您预留该物品，请约定地点时间。',
            createdAt: new Date().toLocaleString()
          });
          console.log('[ExchangeDetail] Reserved:', exchange.id);
          Taro.showToast({ title: '已预留', icon: 'success' });
        }
      }
    });
  };

  const handleConfirmMeet = () => {
    const markerItems = mockMapMarkers.map((m) => ({
      label: `${markerIcons[m.type]} ${markerTypeLabels[m.type]} · ${m.name}`,
      value: m
    }));

    Taro.showActionSheet({
      itemList: markerItems.map((m) => m.label),
      success: (res) => {
        const selected = markerItems[res.tapIndex].value;
        const now = new Date();
        const defaultTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate() + 1).padStart(2, '0')} 14:00`;
        Taro.showModal({
          title: '约定时间',
          editable: true,
          placeholderText: `如：${defaultTime}`,
          content: defaultTime,
          confirmColor: '#52C41A',
          success: (modalRes) => {
            if (modalRes.confirm) {
              const meetTime = modalRes.content?.trim() || defaultTime;
              updateExchange(exchange.id, {
                status: 'confirmed',
                meetLocation: selected.name,
                meetMarkerId: selected.id,
                meetMarkerType: selected.type,
                meetTime
              });
              addMessage(exchange.id, {
                id: generateId(),
                exchangeId: exchange.id,
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderAvatar: currentUser.avatar,
                content: `【系统】已约定：${markerTypeLabels[selected.type]} ${selected.name}，时间 ${meetTime}`,
                createdAt: new Date().toLocaleString()
              });
              console.log('[ExchangeDetail] Confirmed meet at marker:', selected.id);
              Taro.showToast({ title: '已约定地点时间', icon: 'success' });
            }
          }
        });
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
          addMessage(exchange.id, {
            id: generateId(),
            exchangeId: exchange.id,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            content: '【系统】双方已确认完成物品交换。',
            createdAt: new Date().toLocaleString()
          });
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
              const comment = modalRes.content?.trim() || '';
              updateExchange(exchange.id, {
                rating,
                ratingComment: comment
              });
              addMessage(exchange.id, {
                id: generateId(),
                exchangeId: exchange.id,
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderAvatar: currentUser.avatar,
                content: `【系统】${'⭐'.repeat(rating)} 完成评价${comment ? `：${comment}` : ''}`,
                createdAt: new Date().toLocaleString()
              });
              console.log('[ExchangeDetail] Rated:', rating, comment);
              Taro.showToast({ title: '评价成功', icon: 'success' });
            }
          }
        });
      }
    });
  };

  const handleConfirmArrival = () => {
    const role = isPublisher ? 'publisher' : 'requester';
    const alreadyConfirmed = isPublisher
      ? exchange.arrivalPublisher?.confirmed
      : exchange.arrivalRequester?.confirmed;
    
    if (alreadyConfirmed) {
      Taro.showToast({ title: '您已确认到场', icon: 'none' });
      return;
    }
    
    Taro.showModal({
      title: '确认到场',
      content: `请确认您已到达「${exchange.meetLocation}」，确认后将通知对方。`,
      confirmText: '确认到场',
      confirmColor: '#52C41A',
      success: (res) => {
        if (res.confirm) {
          confirmArrival(exchange.id, role);
          console.log('[ExchangeDetail] Arrival confirmed:', role);
          Taro.showToast({ title: '已确认到场', icon: 'success' });
        }
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
              if (exchange.status !== 'pending') {
                updateItem(exchange.itemId, { status: 'available' });
              }
              addMessage(exchange.id, {
                id: generateId(),
                exchangeId: exchange.id,
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderAvatar: currentUser.avatar,
                content: `【系统】交换已取消，原因：${cancelReason}`,
                createdAt: new Date().toLocaleString()
              });
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
      const myArrivalConfirmed = isPublisher
        ? exchange.arrivalPublisher?.confirmed
        : exchange.arrivalRequester?.confirmed;
      const bothArrived = exchange.arrivalPublisher?.confirmed && exchange.arrivalRequester?.confirmed;
      
      btns.push(
        <View
          key="cancel"
          className={classnames(styles.footerBtn, styles.btnWarn)}
          onClick={handleCancel}
        >
          取消交换
        </View>
      );
      
      if (!myArrivalConfirmed) {
        btns.push(
          <View
            key="arrival"
            className={classnames(styles.footerBtn, styles.btnSecondary)}
            onClick={handleConfirmArrival}
          >
            📍 确认到场
          </View>
        );
      }
      
      if (bothArrived) {
        btns.push(
          <View
            key="complete"
            className={classnames(styles.footerBtn, styles.btnPrimary)}
            onClick={handleComplete}
          >
            确认完成交换
          </View>
        );
      } else if (myArrivalConfirmed) {
        btns.push(
          <View
            key="waiting"
            className={classnames(styles.footerBtn, styles.btnDisabled)}
          >
            ⏳ 等待对方到场
          </View>
        );
      }
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
          {exchange.meetMarkerType && (
            <View className={styles.meetInfoRow}>
              <Text className={styles.meetIcon}>{markerIcons[exchange.meetMarkerType]}</Text>
              <View className={styles.meetContent}>
                <Text className={styles.meetLabel}>地点类型</Text>
                <Text className={styles.meetValue}>
                  <Tag
                    text={markerTypeLabels[exchange.meetMarkerType]}
                    type={exchange.meetMarkerType === 'donation' ? 'warning' : 'primary'}
                    size="sm"
                    style={{ marginRight: 12 }}
                  />
                  {exchange.meetLocation}
                </Text>
              </View>
            </View>
          )}
          {!exchange.meetMarkerType && (
            <View className={styles.meetInfoRow}>
              <Text className={styles.meetIcon}>📍</Text>
              <View className={styles.meetContent}>
                <Text className={styles.meetLabel}>约定地点</Text>
                <Text className={styles.meetValue}>{exchange.meetLocation}</Text>
              </View>
            </View>
          )}
          {exchange.meetTime && (
            <View className={styles.meetInfoRow}>
              <Text className={styles.meetIcon}>⏰</Text>
              <View className={styles.meetContent}>
                <Text className={styles.meetLabel}>约定时间</Text>
                <Text className={styles.meetValue}>{exchange.meetTime}</Text>
              </View>
            </View>
          )}
          
          {exchange.status === 'confirmed' && (
            <View className={styles.arrivalStatusRow}>
              <Text className={styles.meetIcon}>👥</Text>
              <View className={styles.meetContent}>
                <Text className={styles.meetLabel}>到场确认</Text>
                <View className={styles.arrivalStatus}>
                  <View className={classnames(
                    styles.arrivalItem,
                    exchange.arrivalPublisher?.confirmed && styles.arrivalConfirmed
                  )}>
                    <Text className={styles.arrivalIcon}>
                      {exchange.arrivalPublisher?.confirmed ? '✅' : '⭕'}
                    </Text>
                    <Text className={styles.arrivalName}>
                      {exchange.publisherName}（发布者）
                    </Text>
                    {exchange.arrivalPublisher?.confirmed && (
                      <Text className={styles.arrivalTime}>
                        {formatTime(exchange.arrivalPublisher.confirmedAt)}
                      </Text>
                    )}
                  </View>
                  <View className={classnames(
                    styles.arrivalItem,
                    exchange.arrivalRequester?.confirmed && styles.arrivalConfirmed
                  )}>
                    <Text className={styles.arrivalIcon}>
                      {exchange.arrivalRequester?.confirmed ? '✅' : '⭕'}
                    </Text>
                    <Text className={styles.arrivalName}>
                      {exchange.requesterName}（申请者）
                    </Text>
                    {exchange.arrivalRequester?.confirmed && (
                      <Text className={styles.arrivalTime}>
                        {formatTime(exchange.arrivalRequester.confirmedAt)}
                      </Text>
                    )}
                  </View>
                </View>
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
        <Text className={styles.sectionTitle}>双方留言 ({exchange.messages.length})</Text>
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
