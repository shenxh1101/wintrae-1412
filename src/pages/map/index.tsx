import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import { mockMapMarkers } from '@/data/map-markers';
import { MapMarker, MarkerType, markerTypeLabels } from '@/types';
import styles from './index.module.scss';

type FilterType = 'all' | MarkerType;

const MapPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

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
    setActiveMarker(markerId === activeMarker ? null : markerId);
    console.log('[MapPage] Marker clicked:', markerId);
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
      </View>

      <View className={styles.mapContainer}>
        <View className={styles.mapPlaceholder}>
          <View className={styles.mapGrid} />
          <Text className={styles.mapCenterLabel}>社区活动中心广场</Text>

          <View className={styles.markersLayer}>
            {filteredMarkers.map((marker, index) => {
              const pos = markerPositions[index % markerPositions.length];
              return (
                <View
                  key={marker.id}
                  className={classnames(
                    styles.mapMarker,
                    activeMarker === marker.id && styles.active
                  )}
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => handleMarkerClick(marker.id)}
                >
                  {activeMarker === marker.id && (
                    <View className={styles.markerBubble}>{marker.name}</View>
                  )}
                  <Text className={styles.markerPin}>
                    {markerIcons[marker.type]}
                  </Text>
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

        {filteredMarkers.map((marker) => (
          <View
            key={marker.id}
            className={classnames(
              styles.markerCard,
              activeMarker === marker.id && styles.active
            )}
            onClick={() => handleMarkerClick(marker.id)}
          >
            <View className={styles.markerCardHeader}>
              <View className={classnames(styles.markerTypeBadge, marker.type)}>
                {markerTypeLabels[marker.type]}
              </View>
              <Text className={styles.markerName}>{marker.name}</Text>
              <View className={classnames(styles.markerStatus, marker.status)}>
                {statusLabels[marker.status]}
              </View>
            </View>

            <Text className={styles.markerDescription}>
              {marker.description}
            </Text>

            {marker.volunteer && (
              <View className={styles.markerInfo}>
                <View className={styles.markerInfoItem}>
                  <Text className={styles.markerInfoIcon}>👤</Text>
                  <Text>负责志愿者：{marker.volunteer}</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default MapPage;
