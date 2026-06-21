import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Tag from '@/components/Tag';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store';
import { ItemLog, itemLogActionLabels, itemStatusLabels } from '@/types';
import { formatDate, formatTime } from '@/utils';
import styles from './index.module.scss';

const ItemLogPage: React.FC = () => {
  const router = useRouter();
  const itemId = router.params.itemId;
  const itemTitle = router.params.title || '物品操作记录';

  const itemLogs = useAppStore((s) => s.itemLogs);

  const logs = useMemo(() => {
    if (!itemId) return itemLogs;
    return itemLogs.filter((log) => log.itemId === itemId);
  }, [itemId, itemLogs]);

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      created: '✨',
      edited: '✏️',
      offline: '📴',
      online: '📶',
      reserved: '🔒',
      exchanged: '✅',
      deleted: '🗑️'
    };
    return icons[action] || '📋';
  };

  const getActionType = (action: string): 'success' | 'warning' | 'info' | 'default' => {
    const types: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
      created: 'success',
      edited: 'info',
      offline: 'warning',
      online: 'success',
      reserved: 'info',
      exchanged: 'success',
      deleted: 'warning'
    };
    return types[action] || 'default';
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>
          {itemId ? `${decodeURIComponent(itemTitle)} - 操作记录` : '全部操作记录'}
        </Text>
        <Text className={styles.pageSubtitle}>
          共 {logs.length} 条记录，按时间倒序展示
        </Text>
      </View>

      <ScrollView scrollY enhanced showScrollbar={false} className={styles.logList}>
        {logs.length === 0 ? (
          <EmptyState
            icon="📭"
            title="暂无操作记录"
            description="物品的发布、编辑、上下架等操作会在这里显示"
          />
        ) : (
          logs.map((log: ItemLog, index: number) => (
            <View key={log.id} className={styles.logItem}>
              <View className={styles.logTimeline}>
                <View className={styles.logDot} />
                {index < logs.length - 1 && <View className={styles.logLine} />}
              </View>

              <View className={styles.logContent}>
                <View className={styles.logHeader}>
                  <View className={styles.logIcon}>{getActionIcon(log.action)}</View>
                  <Tag
                    text={itemLogActionLabels[log.action]}
                    type={getActionType(log.action)}
                    size="sm"
                  />
                  <Text className={styles.logTime}>{formatTime(log.createdAt)}</Text>
                </View>

                <Text className={styles.logItemTitle}>{log.itemTitle}</Text>

                {log.oldStatus && log.newStatus && log.oldStatus !== log.newStatus && (
                  <View className={styles.statusChange}>
                    <View className={styles.statusOld}>
                      <Text className={styles.statusLabel}>状态：</Text>
                      <Tag text={itemStatusLabels[log.oldStatus as keyof typeof itemStatusLabels] || log.oldStatus} type="default" size="sm" />
                    </View>
                    <Text className={styles.statusArrow}>→</Text>
                    <View className={styles.statusNew}>
                      <Tag
                        text={itemStatusLabels[log.newStatus as keyof typeof itemStatusLabels] || log.newStatus}
                        type={getActionType(log.action)}
                        size="sm"
                      />
                    </View>
                  </View>
                )}

                {log.changes && (
                  <Text className={styles.logChanges}>
                    📝 {log.changes}
                  </Text>
                )}

                <View className={styles.logOperator}>
                  <Text className={styles.operatorLabel}>操作人：</Text>
                  <Text className={styles.operatorName}>{log.operatorName}</Text>
                  <Text className={styles.logDate}>{formatDate(log.createdAt)}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ItemLogPage;
