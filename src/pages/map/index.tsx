import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import EmptyState from '@/components/EmptyState';
import { mockMapMarkers } from '@/data/map-markers';
import { useAppStore, currentUser } from '@/store';
import { MapMarker, MarkerType, markerTypeLabels, exchangeStatusLabels, Item } from '@/types';
import { formatTime, formatDate } from '@/utils';
import styles from './index.module.scss';

type FilterType = 'all' | MarkerType;

type GroupKey = 'queueing' | 'pending' | 'arriving' | 'completed' | 'all';

const MapPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [showBoard, setShowBoard] = useState(false);
  const [boardGroup, setBoardGroup] = useState<GroupKey>('all');

  const exchanges = useAppStore((s) => s.exchanges);
  const items = useAppStore((s) => s.items);

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

  const groupFilters: { key: GroupKey; label: string; icon: string; statuses: string[] }[] = [
    { key: 'all', label: '全部', icon: '📋', statuses: [] },
    { key: 'queueing', label: '排队中', icon: '⏳', statuses: ['pending'] },
    { key: 'arriving', label: '待到场', icon: '🚶', statuses: ['reserved', 'confirmed'] },
    { key: 'completed', label: '已完成', icon: '✅', statuses: ['completed'] }
  ];

  const activeExchangesByMarker = useMemo(() => {
    const map: Record<string, any> = {};
    exchanges.forEach((ex) => {
      if (ex.status !== 'cancelled' && ex.meetMarkerId) {
        if (!map[ex.meetMarkerId]) {
          map[ex.meetMarkerId] = {
            queueing: 0,
            arriving: 0,
            completed: 0,
            total: 0,
            arrivals: { one: 0, both: 0 },
            items: []
          };
        }
        const rec = map[ex.meetMarkerId];
        rec.total++;
        if (ex.status === 'pending') rec.queueing++;
        else if (ex.status === 'completed') rec.completed++;
        else rec.arriving++;
        if (ex.arrivalPublisher?.confirmed && ex.arrivalRequester?.confirmed) rec.arrivals.both++;
        else if (ex.arrivalPublisher?.confirmed || ex.arrivalRequester?.confirmed) rec.arrivals.one++;
        rec.items.push(ex);
      }
    });
    return map;
  }, [exchanges]);

  const totalActiveAgreements = useMemo(
    () => Object.values(activeExchangesByMarker).reduce((s: number, v: any) => s + v.total, 0),
    [activeExchangesByMarker]
  );

  const busiestMarkerId = useMemo(() => {
    let max = 0;
    let id: string | null = null;
    Object.entries(activeExchangesByMarker).forEach(([markerId, data]: [string, any]) => {
      if (data.total > max) {
        max = data.total;
        id = markerId;
      }
    });
    return id;
  }, [activeExchangesByMarker]);

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
    if (activeMarker === markerId && showBoard) {
      setShowBoard(false);
      setActiveMarker(null);
      return;
    }
    setActiveMarker(markerId);
    setShowBoard(true);
    setBoardGroup('all');
    console.log('[MapPage] Open board for marker:', markerId);
  };

  const currentMarker = activeMarker ? mockMapMarkers.find((m) => m.id === activeMarker) : null;
  const markerStats = activeMarker ? activeExchangesByMarker[activeMarker] : null;

  const getMarkerExchanges = useMemo(() => {
    if (!activeMarker) return [];
    const list = exchanges.filter(
      (ex) => ex.meetMarkerId === activeMarker && ex.status !== 'cancelled'
    );
    if (boardGroup === 'all') return list;
    const gf = groupFilters.find((g) => g.key === boardGroup);
    if (gf) return list.filter((ex) => gf.statuses.includes(ex.status));
    return list;
  }, [activeMarker, boardGroup, exchanges]);

  const handleExchangeClick = (exchangeId: string) => {
    Taro.navigateTo({ url: `/pages/exchange-detail/index?id=${exchangeId}` });
  };

  const handleCloseBoard = () => {
    setShowBoard(false);
    setActiveMarker(null);
  };

  const getItemTitle = (itemId: string) => items.find((i: Item) => i.id === itemId)?.title || '';

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
        {currentUser.isVolunteer && (
          <View className={styles.activeHint}>
            🎖️ 志愿者模式：点击任意点位查看详细运营看板
          </View>
        )}
        {totalActiveAgreements > 0 && (
          <View className={styles.activeHint}>
            📌 已有 <Text style={{ color: '#52C41A', fontWeight: 600 }}>{totalActiveAgreements}</Text> 个交换约定在活动点位
            {busiestMarkerId && (
              <Text style={{ marginLeft: 12, fontSize: 22, color: '#FA8C16' }}>
                🔥 最忙：{mockMapMarkers.find((m) => m.id === busiestMarkerId)?.name} ({activeExchangesByMarker[busiestMarkerId].total}单)
              </Text>
            )}
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
              const isBusiest = marker.id === busiestMarkerId;
              return (
                <View
                  key={marker.id}
                  className={classnames(
                    styles.mapMarker,
                    activeMarker === marker.id && styles.active,
                    hasAgreement && styles.hasAgreement,
                    isBusiest && styles.busiest
                  )}
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => handleMarkerClick(marker.id)}
                >
                  {activeMarker === marker.id && (
                    <View className={styles.markerBubble}>
                      {marker.name}
                      {hasAgreement && ` · ${agreementInfo.total}单`}
                      {isBusiest && ' 🔥'}
                    </View>
                  )}
                  <View className={styles.markerPinWrap}>
                    {hasAgreement && (
                      <View className={styles.agreementBadge}>
                        {agreementInfo.total}
                      </View>
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

      {showBoard && currentMarker && (
        <View className={styles.boardOverlay} onClick={handleCloseBoard}>
          <View className={styles.boardPanel} onClick={(e) => e.stopPropagation()}>
            <View className={styles.boardHeader}>
              <View>
                <Text className={styles.boardTitle}>
                  {markerIcons[currentMarker.type]} {currentMarker.name}
                </Text>
                <Text className={styles.boardSubtitle}>
                  {markerTypeLabels[currentMarker.type]} · {currentMarker.volunteer ? `志愿者：${currentMarker.volunteer}` : ''}
                </Text>
              </View>
              <View className={styles.boardClose} onClick={handleCloseBoard}>×</View>
            </View>

            {markerStats && (
              <View className={styles.boardStats}>
                <View className={styles.boardStat}>
                  <Text className={styles.boardStatNum}>{markerStats.queueing}</Text>
                  <Text className={styles.boardStatLabel}>排队中</Text>
                </View>
                <View className={styles.boardStat}>
                  <Text className={styles.boardStatNum}>{markerStats.arriving}</Text>
                  <Text className={styles.boardStatLabel}>待到场</Text>
                </View>
                <View className={styles.boardStat}>
                  <Text className={styles.boardStatNum}>{markerStats.arrivals.both}</Text>
                  <Text className={styles.boardStatLabel}>双方已到</Text>
                </View>
                <View className={styles.boardStat}>
                  <Text className={styles.boardStatNum}>{markerStats.completed}</Text>
                  <Text className={styles.boardStatLabel}>已完成</Text>
                </View>
              </View>
            )}

            <ScrollView scrollX enhanced showScrollbar={false} className={styles.boardTabs}>
              {groupFilters.map((gf) => (
                <View
                  key={gf.key}
                  className={classnames(
                    styles.boardTab,
                    boardGroup === gf.key && styles.boardTabActive
                  )}
                  onClick={() => setBoardGroup(gf.key)}
                >
                  <Text>{gf.icon} {gf.label}</Text>
                </View>
              ))}
            </ScrollView>

            <ScrollView scrollY enhanced className={styles.boardList}>
              {getMarkerExchanges.length === 0 ? (
                <EmptyState
                  icon="📭"
                  title="暂无相关记录"
                  description="该点位当前没有相关交换记录"
                />
              ) : (
                getMarkerExchanges.map((ex) => {
                  const arrivalPub = ex.arrivalPublisher?.confirmed;
                  const arrivalReq = ex.arrivalRequester?.confirmed;
                  const arrivalStatus = arrivalPub && arrivalReq
                    ? '双方已到场'
                    : arrivalPub || arrivalReq
                    ? '一方已到场'
                    : '未到场';
                  return (
                    <View
                      key={ex.id}
                      className={styles.boardItem}
                      onClick={() => handleExchangeClick(ex.id)}
                    >
                      <Image
                        className={styles.boardItemImg}
                        src={ex.itemImage}
                        mode="aspectFill"
                      />
                      <View className={styles.boardItemContent}>
                        <View className={styles.boardItemTitleRow}>
                          <Text className={styles.boardItemName}>
                            {getItemTitle(ex.itemId)}
                          </Text>
                          <Tag
                            text={exchangeStatusLabels[ex.status]}
                            type={
                              ex.status === 'completed'
                                ? 'success'
                                : ex.status === 'pending'
                                ? 'warning'
                                : 'info'
                            }
                            size="sm"
                          />
                        </View>
                        <Text className={styles.boardItemUsers}>
                          👤 {ex.publisherName} ↔️ {ex.requesterName}
                        </Text>
                        <View className={styles.boardItemMeta}>
                          <Tag
                            text={arrivalStatus}
                            type={
                              arrivalPub && arrivalReq ? 'success' : arrivalPub || arrivalReq ? 'warning' : 'default'
                            }
                            size="sm"
                          />
                          <Text className={styles.boardItemTime}>
                            {formatTime(ex.updatedAt)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      )}

      <ScrollView scrollY enhanced showScrollbar={false} className={styles.markerList}>
        <Text className={styles.listTitle}>
          活动地点（{filteredMarkers.length}个）
        </Text>

        {filteredMarkers.map((marker) => {
          const info = activeExchangesByMarker[marker.id];
          const hasAgreement = !!info;
          const isBusiest = marker.id === busiestMarkerId;
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
                <Text className={styles.markerName}>
                  {marker.name}
                  {isBusiest && <Tag text="🔥 最忙" type="warning" size="sm" />}
                </Text>
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
                    <Tag text={`🔥 ${info.total} 单`} type="warning" size="sm" />
                    <Text className={styles.agreementItems}>
                      排队：{info.queueing} · 待到场：{info.arriving} · 已完成：{info.completed}
                    </Text>
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
