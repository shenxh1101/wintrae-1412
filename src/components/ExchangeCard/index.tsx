import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import { ExchangeOrder, exchangeStatusLabels } from '@/types';
import { formatTime } from '@/utils';
import styles from './index.module.scss';

interface ExchangeCardProps {
  exchange: ExchangeOrder;
  currentUserId: string;
  onClick?: () => void;
  className?: string;
}

const ExchangeCard: React.FC<ExchangeCardProps> = ({
  exchange,
  currentUserId,
  onClick,
  className = ''
}) => {
  const isPublisher = exchange.publisherId === currentUserId;
  const otherUserName = isPublisher ? exchange.requesterName : exchange.publisherName;
  const otherUserAvatar = isPublisher ? exchange.requesterAvatar : exchange.publisherAvatar;
  const roleText = isPublisher ? '我发布的' : '我申请的';

  const statusTagType = {
    pending: 'warning' as const,
    reserved: 'primary' as const,
    confirmed: 'info' as const,
    completed: 'success' as const,
    cancelled: 'error' as const
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/exchange-detail/index?id=${exchange.id}`
      });
    }
  };

  return (
    <View
      className={classnames(styles.card, className)}
      onClick={handleClick}
    >
      <View className={styles.header}>
        <View className={styles.roleBadge}>
          <Tag text={roleText} type="default" size="sm" />
        </View>
        <Tag
          text={exchangeStatusLabels[exchange.status]}
          type={statusTagType[exchange.status]}
          size="sm"
        />
      </View>

      <View className={styles.body}>
        <View className={styles.itemInfo}>
          <Image
            className={styles.itemImage}
            src={exchange.itemImage}
            mode="aspectFill"
          />
          <View className={styles.itemDetail}>
            <Text className={styles.itemTitle}>{exchange.itemTitle}</Text>
            {exchange.meetLocation && (
              <Text className={styles.meetInfo}>
                📍 {exchange.meetLocation}
              </Text>
            )}
            {exchange.meetTime && (
              <Text className={styles.meetInfo}>
                ⏰ {exchange.meetTime}
              </Text>
            )}
          </View>
        </View>

        <View className={styles.userInfo}>
          <Image
            className={styles.userAvatar}
            src={otherUserAvatar}
            mode="aspectFill"
          />
          <View className={styles.userMeta}>
            <Text className={styles.userName}>{otherUserName}</Text>
            <Text className={styles.timeText}>
              {formatTime(exchange.createdAt)}
            </Text>
          </View>
          <View className={styles.arrow}>›</View>
        </View>
      </View>

      {exchange.messages && exchange.messages.length > 0 && (
        <View className={styles.latestMsg}>
          <Text className={styles.msgPreview}>
            💬 {exchange.messages[exchange.messages.length - 1].content}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ExchangeCard;
