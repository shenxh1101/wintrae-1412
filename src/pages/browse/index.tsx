import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import FilterBar from '@/components/FilterBar';
import ItemCard from '@/components/ItemCard';
import EmptyState from '@/components/EmptyState';
import { getAllCategories } from '@/data/items';
import { Item } from '@/types';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

type SortKey = 'time' | 'distance';
type ViewMode = 'list' | 'grid';

const BrowsePage: React.FC = () => {
  const items = useAppStore((s) => s.items);
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState<SortKey>('time');
  const [deliverOnly, setDeliverOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useDidShow(() => {
    console.log('[BrowsePage] Page showed, items count:', items.length);
  });

  const categories = getAllCategories();
  const sortOptions = [
    { key: 'time', label: '最新发布' },
    { key: 'distance', label: '距离最近' }
  ];

  const filteredItems = useMemo(() => {
    let result: Item[] = [...items];

    if (activeCategory !== 'all') {
      result = result.filter((item) => item.category === activeCategory);
    }

    if (deliverOnly) {
      result = result.filter((item) => item.canDeliver);
    }

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(kw) ||
          item.description.toLowerCase().includes(kw)
      );
    }

    result = result.filter((item) => item.status !== 'offline');

    if (activeSort === 'time') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (activeSort === 'distance') {
      result.sort((a, b) => a.distance - b.distance);
    }

    return result;
  }, [items, activeCategory, deliverOnly, keyword, activeSort]);

  const handleSearch = (e: any) => {
    setKeyword(e.detail.value);
  };

  const handleRefresh = () => {
    Taro.showToast({ title: '刷新成功', icon: 'success' });
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  };

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.header}>
          <View className={styles.searchBox}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              placeholder="搜索闲置物品..."
              placeholderClass={styles.searchPlaceholder}
              value={keyword}
              onInput={handleSearch}
              confirmType="search"
            />
          </View>

          <View className={styles.statsBar}>
            <Text className={styles.statsText}>
              共找到 <strong>{filteredItems.length}</strong> 件闲置物品
            </Text>
            <View className={styles.viewToggle}>
              <View
                className={classnames(styles.toggleBtn, viewMode === 'list' && styles.active)}
                onClick={() => setViewMode('list')}
              >
                📋 列表
              </View>
              <View
                className={classnames(styles.toggleBtn, viewMode === 'grid' && styles.active)}
                onClick={() => setViewMode('grid')}
              >
                🔲 网格
              </View>
            </View>
          </View>
        </View>

        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          sortOptions={sortOptions}
          activeSort={activeSort}
          onSortChange={(k) => setActiveSort(k as SortKey)}
          showDeliverFilter
          deliverOnly={deliverOnly}
          onDeliverChange={setDeliverOnly}
        />

        {filteredItems.length > 0 ? (
          <ScrollView scrollY enhanced showScrollbar={false}>
            <View className={viewMode === 'list' ? styles.list : styles.grid}>
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </View>
          </ScrollView>
        ) : (
          <EmptyState
            icon="🔍"
            title="暂无匹配的闲置物品"
            description="试试调整筛选条件或搜索关键词吧"
          />
        )}
      </View>
    </View>
  );
};

export default BrowsePage;
