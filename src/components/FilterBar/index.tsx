import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface FilterOption {
  key: string;
  label: string;
}

export interface SortOption {
  key: string;
  label: string;
}

interface FilterBarProps {
  categories: FilterOption[];
  activeCategory: string;
  onCategoryChange: (key: string) => void;
  sortOptions?: SortOption[];
  activeSort?: string;
  onSortChange?: (key: string) => void;
  showDeliverFilter?: boolean;
  deliverOnly?: boolean;
  onDeliverChange?: (value: boolean) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  sortOptions,
  activeSort,
  onSortChange,
  showDeliverFilter = false,
  deliverOnly = false,
  onDeliverChange
}) => {
  return (
    <View className={styles.container}>
      <View className={styles.categorySection}>
        <ScrollView
          scrollX
          enhanced
          showScrollbar={false}
          className={styles.categoryScroll}
        >
          <View className={styles.categoryInner}>
            {categories.map((cat) => (
              <View
                key={cat.key}
                className={classnames(
                  styles.categoryItem,
                  activeCategory === cat.key && styles.active
                )}
                onClick={() => onCategoryChange(cat.key)}
              >
                <Text className={styles.categoryText}>{cat.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.actionSection}>
        {sortOptions && sortOptions.length > 0 && (
          <View className={styles.sortGroup}>
            {sortOptions.map((opt) => (
              <View
                key={opt.key}
                className={classnames(
                  styles.sortItem,
                  activeSort === opt.key && styles.sortActive
                )}
                onClick={() => onSortChange?.(opt.key)}
              >
                <Text className={styles.sortText}>{opt.label}</Text>
              </View>
            ))}
          </View>
        )}

        {showDeliverFilter && (
          <View
            className={classnames(
              styles.deliverFilter,
              deliverOnly && styles.deliverActive
            )}
            onClick={() => onDeliverChange?.(!deliverOnly)}
          >
            <Text className={styles.deliverIcon}>🚚</Text>
            <Text className={styles.deliverText}>仅看可送达</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FilterBar;
