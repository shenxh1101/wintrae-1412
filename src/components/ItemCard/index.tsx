import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import { Item, categoryLabels, conditionLabels, exchangeTypeLabels, itemStatusLabels } from '@/types';
import { formatDistance, formatTime, truncateText } from '@/utils';
import styles from './index.module.scss';

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
  className?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick, className = '' }) => {
  const statusTagType = {
    available: 'success' as const,
    reserved: 'warning' as const,
    exchanged: 'info' as const,
    offline: 'error' as const
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/item-detail/index?id=${item.id}`
      });
    }
  };

  return (
    <View
      className={classnames(styles.card, className)}
      onClick={handleClick}
    >
      <View className={styles.imageWrap}>
        <Image
          className={styles.image}
          src={item.images[0]}
          mode="aspectFill"
          onError={(e) => console.error('[ItemCard] Image load error', e)}
        />
        <View className={styles.statusTag}>
          <Tag
            text={itemStatusLabels[item.status]}
            type={statusTagType[item.status]}
          />
        </View>
        {item.canDeliver && (
          <View className={styles.deliverTag}>
            <Tag text="可送达" type="info" />
          </View>
        )}
      </View>

      <View className={styles.content}>
        <Text className={styles.title}>{item.title}</Text>
        <Text className={styles.description}>
          {truncateText(item.description, 50)}
        </Text>

        <View className={styles.tagsRow}>
          <Tag text={categoryLabels[item.category]} type="default" size="sm" />
          <Tag text={conditionLabels[item.condition]} type="default" size="sm" plain />
          <Tag text={exchangeTypeLabels[item.exchangeType]} type="warning" size="sm" />
        </View>

        <View className={styles.footer}>
          <View className={styles.publisher}>
            <Image
              className={styles.avatar}
              src={item.publisherAvatar}
              mode="aspectFill"
            />
            <Text className={styles.publisherName}>{item.publisherName}</Text>
          </View>
          <View className={styles.meta}>
            <Text className={styles.distance}>📍 {formatDistance(item.distance)}</Text>
            <Text className={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ItemCard;
