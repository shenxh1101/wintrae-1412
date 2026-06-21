import React, { useState } from 'react';
import { View, Text, Input, Textarea, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import Tag from '@/components/Tag';
import {
  ItemCategory,
  ItemCondition,
  ExchangeType,
  categoryLabels,
  conditionLabels,
  exchangeTypeLabels
} from '@/types';
import { generateId } from '@/utils';
import styles from './index.module.scss';

const categoryOptions: ItemCategory[] = [
  'clothes', 'books', 'electronics', 'furniture',
  'toys', 'kitchen', 'sports', 'other'
];

const conditionOptions: ItemCondition[] = [
  'new', 'likeNew', 'good', 'fair', 'worn'
];

const exchangeTypeOptions: ExchangeType[] = ['swap', 'gift', 'both'];

const PublishPage: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory | ''>('');
  const [condition, setCondition] = useState<ItemCondition | ''>('');
  const [exchangeType, setExchangeType] = useState<ExchangeType | ''>('');
  const [expectSwapFor, setExpectSwapFor] = useState('');
  const [availableTime, setAvailableTime] = useState('');
  const [canDeliver, setCanDeliver] = useState(false);

  const handleChooseImage = () => {
    if (images.length >= 6) {
      Taro.showToast({ title: '最多上传6张图片', icon: 'none' });
      return;
    }
    console.log('[PublishPage] Choose image');
    const mockImages = [
      `https://picsum.photos/id/${Math.floor(Math.random() * 100 + 100)}/600/600`
    ];
    setImages([...images, ...mockImages].slice(0, 6));
  };

  const handleDeleteImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (images.length === 0) {
      Taro.showToast({ title: '请至少上传一张图片', icon: 'none' });
      return false;
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入物品标题', icon: 'none' });
      return false;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请输入物品描述', icon: 'none' });
      return false;
    }
    if (!category) {
      Taro.showToast({ title: '请选择物品品类', icon: 'none' });
      return false;
    }
    if (!condition) {
      Taro.showToast({ title: '请选择新旧程度', icon: 'none' });
      return false;
    }
    if (!exchangeType) {
      Taro.showToast({ title: '请选择交换方式', icon: 'none' });
      return false;
    }
    if (!availableTime.trim()) {
      Taro.showToast({ title: '请填写可取时间', icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    console.log('[PublishPage] Submit publish', {
      id: generateId(),
      images, title, description, category, condition,
      exchangeType, expectSwapFor, availableTime, canDeliver
    });

    Taro.showModal({
      title: '发布成功',
      content: '您的闲置物品已成功发布，等待其他居民查看交换吧！',
      showCancel: false,
      confirmText: '好的',
      confirmColor: '#52C41A',
      success: () => {
        setImages([]);
        setTitle('');
        setDescription('');
        setCategory('');
        setCondition('');
        setExchangeType('');
        setExpectSwapFor('');
        setAvailableTime('');
        setCanDeliver(false);
        Taro.switchTab({ url: '/pages/browse/index' });
      }
    });
  };

  const handleReset = () => {
    setImages([]);
    setTitle('');
    setDescription('');
    setCategory('');
    setCondition('');
    setExchangeType('');
    setExpectSwapFor('');
    setAvailableTime('');
    setCanDeliver(false);
    Taro.showToast({ title: '已重置', icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.tipCard}>
          <Text className={styles.tipTitle}>
            <Text className={styles.tipIcon}>💡</Text>
            发布小贴士
          </Text>
          <Text className={styles.tipContent}>
            上传清晰的实物照片、详细的描述和真实的新旧程度，能让您的闲置物品更快被交换哦～
          </Text>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>物品照片</Text>
            <View className={styles.imageUploader}>
              {images.map((img, index) => (
                <View key={index} className={styles.imageItem}>
                  <Image className={styles.uploadedImage} src={img} mode="aspectFill" />
                  <View className={styles.deleteBtn} onClick={() => handleDeleteImage(index)}>
                    ×
                  </View>
                </View>
              ))}
              {images.length < 6 && (
                <View className={styles.addBtn} onClick={handleChooseImage}>
                  <Text className={styles.addIcon}>＋</Text>
                  <Text className={styles.addText}>{images.length}/6</Text>
                </View>
              )}
            </View>
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>基本信息</Text>
            
            <View className={styles.formGroup}>
              <Text className={classnames(styles.label, styles.required)}>物品标题</Text>
              <Input
                className={styles.textInput}
                placeholder="简要描述物品，如：九成新儿童推车"
                maxlength={30}
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={classnames(styles.label, styles.required)}>物品描述</Text>
              <Textarea
                className={styles.textarea}
                placeholder="详细描述物品情况，包括使用时间、功能状态、配件情况等"
                maxlength={500}
                value={description}
                onInput={(e) => setDescription(e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>品类规格</Text>
            
            <View className={styles.formGroup}>
              <Text className={classnames(styles.label, styles.required)}>物品品类</Text>
              <View className={styles.optionsGrid}>
                {categoryOptions.map((opt) => (
                  <View
                    key={opt}
                    className={classnames(styles.optionItem, category === opt && styles.active)}
                    onClick={() => setCategory(opt)}
                  >
                    {categoryLabels[opt]}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formGroup}>
              <Text className={classnames(styles.label, styles.required)}>新旧程度</Text>
              <View className={styles.optionsGrid}>
                {conditionOptions.map((opt) => (
                  <View
                    key={opt}
                    className={classnames(styles.optionItem, condition === opt && styles.active)}
                    onClick={() => setCondition(opt)}
                  >
                    {conditionLabels[opt]}
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>交换信息</Text>
            
            <View className={styles.formGroup}>
              <Text className={classnames(styles.label, styles.required)}>期望交换方式</Text>
              <View className={styles.optionsGrid}>
                {exchangeTypeOptions.map((opt) => (
                  <View
                    key={opt}
                    className={classnames(styles.optionItem, exchangeType === opt && styles.active)}
                    onClick={() => setExchangeType(opt)}
                  >
                    {exchangeTypeLabels[opt]}
                  </View>
                ))}
              </View>
            </View>

            {exchangeType === 'swap' && (
              <View className={styles.formGroup}>
                <Text className={styles.label}>期望换取</Text>
                <Input
                  className={styles.textInput}
                  placeholder="如：儿童书架、微波炉等（选填）"
                  value={expectSwapFor}
                  onInput={(e) => setExpectSwapFor(e.detail.value)}
                />
              </View>
            )}

            <View className={styles.formGroup}>
              <Text className={classnames(styles.label, styles.required)}>可取时间</Text>
              <Input
                className={styles.textInput}
                placeholder="如：工作日晚上/周末全天"
                value={availableTime}
                onInput={(e) => setAvailableTime(e.detail.value)}
              />
            </View>

            <View className={styles.formGroup}>
              <View className={styles.switchRow}>
                <View>
                  <Text className={styles.switchLabel}>是否支持送达</Text>
                  <Text className={styles.switchHint}>开启后将显示"可送达"标签</Text>
                </View>
                <View
                  className={classnames(styles.switchControl, canDeliver && styles.active)}
                  onClick={() => setCanDeliver(!canDeliver)}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <View
          className={classnames(styles.btn, styles.btnOutline)}
          onClick={handleReset}
        >
          重置
        </View>
        <View
          className={classnames(styles.btn, styles.btnPrimary)}
          onClick={handleSubmit}
        >
          发布闲置
        </View>
      </View>
    </View>
  );
};

export default PublishPage;
