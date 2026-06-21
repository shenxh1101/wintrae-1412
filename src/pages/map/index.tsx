import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import { mockMapMarkers } from '@/data/map-markers';
import { useAppStore } from '@/store';
import { MapMarker, MarkerType, markerTypeLabels } from '@/types';
import styles from './index.module.scss';

type FilterType = 'all' | MarkerType;

const MapPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const exchanges = useAppStore((s) => s.exchanges);

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: '全部', icon: '🗺️' },
    { key: 'stall', label: '临时摊位', icon: '🏪' },
    { key: 'service', label: '服务台', icon: '🛎️' },
    { key: 'donation', label: '捐赠点', icon: '❤️' }
  ];

  const markerIcons: Record<MarkerType, string> = {
    stall: '🏪',
    service: '🛎️',
    donation: '❤️'
  };

  const activeExchangesByMarker = useMemo(() => {
    const map: Record<string, { count: number; items: string[] }> = {};
    exchanges.forEach((ex) => {
      if (
        (ex.status === 'reserved' || ex.status === 'confirmed' || ex.status === 'completed') &&
        ex.meetMarkerId
      ) {
        if (!map[ex.meetMarkerId]) {
          map[ex.meetMarkerId] = { count: 0, items: [] };
        }
        map[ex.meetMarkerId].count++;
        if (ex.itemTitle && map[ex.meetMarkerId].items.length < 3) {
          map[ex.meetMarkerId].items.push(ex.itemTitle);
        }
      }
    });
    return map;
  }, [exchanges]);

  const totalActiveAgreements = useMemo(
    () => Object.values(activeExchangesByMarker).reduce((s, v) => s + v.count, 0),
    [activeExchangesByMarker]
  );

  const filteredMarkers = useMemo(() => {
    if (activeFilter === 'all') return mockMapMarkers;
    return mockMapMarkers.filter((m) => m.type === activeFilter);
  }, [activeFilter]);

  const statusLabels = {
    open: '营业中',
    busy: '繁忙',
    closed: '已关闭'
  };

  const markerPositions = [
    { top: '45%', left: '50%' },
    { top: '30%', left: '65%' },
    { top: '55%', left: '65%' },
    { top: '45%', left: '25%' },
    { top: '65%', left: '35%' },
    { top: '20%', left: '50%' },
    { top: '75%', left: '55%' },
    { top: '45%', left: '80%' }
  ];

  const handleMarkerClick = (markerId: string) => {
    const newActive = markerId === activeMarker ? null : markerId;
    setActiveMarker(newActive);
    console.log('[MapPage] Marker clicked:', markerId, '约定数:', activeExchangesByMarker[markerId]?.count ?? 0);
  };

  const handleViewDetail = (marker: MapMarker) => {
    const info = activeExchangesByMarker[marker.id];
    const content = info
      ? `当前有 ${info.count} 个活跃交换约定${info.items.length > 0 ? '\n涉及物品：' + info.items.join('、') : ''}`
      : '暂无交换约定，可在约定地点时选择此处。';
    Taro.showModal({
      title: marker.name,
      content,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#52C41A'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <ScrollView scrollX enhanced showScrollbar={false}>
          <View className={styles.filterRow}>
            {filters.map((f) => (
              <View
                key={f.key}
                className={classnames(styles.filterChip, activeFilter === f.key && styles.active)}
                onClick={() => setActiveFilter(f.key)}
              >
                <Text className={styles.filterIcon}>{f.icon}</Text>
                <Text className={styles.filterLabel}>{f.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        {totalActiveAgreements > 0 && (
          <View className={styles.activeHint}>
            📌 已有 <Text style={{ color: '#52C41A', fontWeight: 600 }}>{totalActiveAgreements}</Text> 个交换约定在活动点位等待完成
          </View>
        )}
      </View>

      <View className={styles.mapContainer}>
        <View className={styles.mapPlaceholder}>
          <View className={styles.mapGrid} />
          <Text className={styles.mapCenterLabel}>社区活动中心广场</Text>

          <View className={styles.markersLayer}>
            {filteredMarkers.map((marker, index) => {
              const pos = markerPositions[index % markerPositions.length];
              const agreementInfo = activeExchangesByMarker[marker.id];
              const hasAgreement = !!agreementInfo;
              return (
                <View
                  key={marker.id}
                  className={classnames(
                    styles.mapMarker,
                    activeMarker === marker.id && styles.active,
                    hasAgreement && styles.hasAgreement
                  )}
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => handleMarkerClick(marker.id)}
                >
                  {activeMarker === marker.id && (
                    <View className={styles.markerBubble}>
                      {marker.name}
                      {hasAgreement && ` · ${agreementInfo.count}约`}
                    </View>
                  )}
                  <View className={styles.markerPinWrap}>
                    {hasAgreement && (
                      <View className={styles.agreementBadge}>{agreementInfo.count}</View>
                    )}
                    <Text
                      className={classnames(
                        styles.markerPin,
                        hasAgreement && styles.pinHot
                      )}
                    >
                      {markerIcons[marker.type]}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <ScrollView scrollY enhanced showScrollbar={false} className={styles.markerList}>
        <Text className={styles.listTitle}>
          活动地点（{filteredMarkers.length}个）
        </Text>

        {filteredMarkers.map((marker) => {
          const info = activeExchangesByMarker[marker.id];
          const hasAgreement = !!info;
          return (
            <View
              key={marker.id}
              className={classnames(
                styles.markerCard,
                activeMarker === marker.id && styles.active,
                hasAgreement && styles.cardHot
              )}
              onClick={() => handleMarkerClick(marker.id)}
            >
              <View className={styles.markerCardHeader}>
                <View className={classnames(styles.markerTypeBadge, marker.type)}>
                  {markerIcons[marker.type]} {markerTypeLabels[marker.type]}
                </View>
                <Text className={styles.markerName}>{marker.name}</Text>
                <View className={classnames(styles.markerStatus, marker.status)}>
                  {statusLabels[marker.status]}
                </View>
              </View>

              <Text className={styles.markerDescription}>
                {marker.description}
              </Text>

              {hasAgreement && (
                <View className={styles.agreementRow}>
                  <View className={styles.agreementInfo}>
                    <Tag text={`🔥 ${info.count} 个活跃约定`} type="warning" size="sm" />
                    {info.items.length > 0 && (
                      <Text className={styles.agreementItems}>
                        涉及：{info.items.join('、')}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {marker.volunteer && (
                <View className={styles.markerInfo}>
                  <View className={styles.markerInfoItem}>
                    <Text className={styles.markerInfoIcon}>👤</Text>
                    <Text>负责志愿者：{marker.volunteer}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default MapPage;
