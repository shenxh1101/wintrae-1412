import React, { useState } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import { mockItems } from '@/data/items';
import {
  categoryLabels,
  conditionLabels,
  exchangeTypeLabels,
  itemStatusLabels,
  Item
} from '@/types';
import { formatDistance, formatTime } from '@/utils';
import styles from './index.module.scss';

const ItemDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;

  const item: Item | undefined =
    mockItems.find((i) => i.id === id) || mockItems[0];

  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!item) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100 }}>
          <Text>物品不存在</Text>
        </View>
      </View>
    );
  }

  const statusTagType = {
    available: 'success' as const,
    reserved: 'warning' as const,
    exchanged: 'info' as const,
    offline: 'error' as const
  };

  const handleExchange = () => {
    console.log('[ItemDetail] Request exchange for item:', item.id);
    Taro.showModal({
      title: '发起交换申请',
      content: `确定向${item.publisherName}发起"${item.title}"的交换申请吗？`,
      confirmText: '确定申请',
      confirmColor: '#52C41A',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '申请已发送', icon: 'success' });
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/exchange/index' });
          }, 1000);
        }
      }
    });
  };

  const handleContact = () => {
    Taro.showToast({ title: '已发送私信通知', icon: 'none' });
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Taro.showToast({
      title: isFavorite ? '已取消收藏' : '已加入收藏',
      icon: 'none'
    });
  };

  return (
    <View className={styles.page}>
      <Swiper
        className={styles.imageSwiper}
        current={currentImage}
        onChange={(e) => setCurrentImage(e.detail.current)}
        indicatorDots={false}
      >
        {item.images.map((img, idx) => (
          <SwiperItem key={idx}>
            <Image
              className={styles.swiperImage}
              src={img}
              mode="aspectFill"
              onError={(e) => console.error('[ItemDetail] Image error', e)}
            />
          </SwiperItem>
        ))}
      </Swiper>
      {item.images.length > 1 && (
        <View
          className={styles.imageIndicator}
          style={{ top: '450rpx', bottom: 'auto' }}
        >
          {currentImage + 1} / {item.images.length}
        </View>
      )}

      <View className={styles.content}>
        <View className={styles.titleRow}>
          <Text className={styles.itemTitle}>{item.title}</Text>
          <View className={styles.statusTag}>
            <Tag
              text={itemStatusLabels[item.status]}
              type={statusTagType[item.status]}
              size="md"
            />
          </View>
        </View>

        <View className={styles.infoTags}>
          <Tag text={categoryLabels[item.category]} type="primary" size="md" />
          <Tag text={conditionLabels[item.condition]} type="default" size="md" />
          <Tag text={exchangeTypeLabels[item.exchangeType]} type="warning" size="md" />
          {item.canDeliver && <Tag text="🚚 可送达" type="info" size="md" />}
        </View>

        <View className={styles.publisherCard}>
          <Image
            className={styles.publisherAvatar}
            src={item.publisherAvatar}
            mode="aspectFill"
          />
          <View className={styles.publisherInfo}>
            <Text className={styles.publisherName}>{item.publisherName}</Text>
            <Text className={styles.publisherCommunity}>
              🏘️ {item.community} · 📍 {formatDistance(item.distance)} · {formatTime(item.createdAt)}发布
            </Text>
          </View>
        </View>

        <View className={styles.detailCard}>
          <View className={styles.detailSection}>
            <Text className={styles.detailLabel}>物品描述</Text>
            <Text className={styles.detailValue}>{item.description}</Text>
          </View>

          {item.expectSwapFor && (
            <View className={styles.detailSection}>
              <Text className={styles.detailLabel}>期望换取</Text>
              <Text className={classnames(styles.detailValue, styles.highlight)}>
                {item.expectSwapFor}
              </Text>
            </View>
          )}

          <View className={styles.detailSection}>
            <Text className={styles.detailLabel}>可取时间</Text>
            <Text className={styles.detailValue}>{item.availableTime}</Text>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={classnames(styles.footerBtn, styles.btnGhost)} onClick={handleFavorite}>
          <Text className={styles.btnIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          <Text className={styles.btnText}>{isFavorite ? '已收藏' : '收藏'}</Text>
        </View>
        <View
          className={classnames(styles.footerBtn, styles.btnOutline)}
          onClick={handleContact}
        >
          私信联系
        </View>
        <View
          className={classnames(styles.footerBtn, styles.btnPrimary)}
          onClick={handleExchange}
        >
          发起交换
        </View>
      </View>
    </View>
  );
};

export default ItemDetailPage;
