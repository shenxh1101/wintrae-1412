import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import {
  ItemCategory,
  ItemCondition,
  ExchangeType,
  categoryLabels,
  conditionLabels,
  exchangeTypeLabels
} from '@/types';
import styles from './index.module.scss';

const categoryOptions: ItemCategory[] = [
  'clothes', 'books', 'electronics', 'furniture',
  'toys', 'kitchen', 'sports', 'other'
];

const conditionOptions: ItemCondition[] = [
  'new', 'likeNew', 'good', 'fair', 'worn'
];

const exchangeTypeOptions: ExchangeType[] = ['swap', 'gift', 'both'];

const ItemEditPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id;
  const updateItem = useAppStore((s) => s.updateItem);
  const original = useAppStore((s) => s.items.find((it) => it.id === id));

  const [images, setImages] = useState<string[]>(original?.images || []);
  const [title, setTitle] = useState(original?.title || '');
  const [description, setDescription] = useState(original?.description || '');
  const [category, setCategory] = useState<ItemCategory | ''>(original?.category || '');
  const [condition, setCondition] = useState<ItemCondition | ''>(original?.condition || '');
  const [exchangeType, setExchangeType] = useState<ExchangeType | ''>(original?.exchangeType || '');
  const [expectSwapFor, setExpectSwapFor] = useState(original?.expectSwapFor || '');
  const [availableTime, setAvailableTime] = useState(original?.availableTime || '');
  const [canDeliver, setCanDeliver] = useState(original?.canDeliver || false);

  const dirty = useMemo(() => {
    if (!original) return false;
    return (
      JSON.stringify(images) !== JSON.stringify(original.images) ||
      title !== original.title ||
      description !== original.description ||
      category !== original.category ||
      condition !== original.condition ||
      exchangeType !== original.exchangeType ||
      (expectSwapFor || '') !== (original.expectSwapFor || '') ||
      availableTime !== original.availableTime ||
      canDeliver !== original.canDeliver
    );
  }, [original, images, title, description, category, condition, exchangeType, expectSwapFor, availableTime, canDeliver]);

  const handleChooseImage = () => {
    const remaining = 6 - images.length;
    if (remaining <= 0) {
      Taro.showToast({ title: '最多上传6张图片', icon: 'none' });
      return;
    }
    Taro.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImgs = res.tempFilePaths.slice(0, remaining);
        setImages([...images, ...newImgs].slice(0, 6));
      }
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePreviewImage = (index: number) => {
    Taro.previewImage({
      current: images[index],
      urls: images
    });
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

  const handleSave = () => {
    if (!validateForm()) return;
    if (!id) return;

    const patch = {
      images,
      title: title.trim(),
      description: description.trim(),
      category: category as ItemCategory,
      condition: condition as ItemCondition,
      exchangeType: exchangeType as ExchangeType,
      availableTime: availableTime.trim(),
      canDeliver,
      expectSwapFor: exchangeType === 'swap' ? expectSwapFor.trim() || undefined : undefined
    };

    updateItem(id, patch);
    console.log('[ItemEdit] Item updated:', id);

    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  const handleCancel = () => {
    if (dirty) {
      Taro.showModal({
        title: '有未保存的修改',
        content: '确定要放弃修改并返回吗？',
        confirmColor: '#F53F3F',
        success: (res) => {
          if (res.confirm) Taro.navigateBack();
        }
      });
    } else {
      Taro.navigateBack();
    }
  };

  if (!original) {
    return (
      <View className={styles.page} style={{ padding: 100, textAlign: 'center' }}>
        <Text>物品不存在或已被删除</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.container}>
        <View className={styles.tipCard}>
          <Text className={styles.tipTitle}>
            <Text className={styles.tipIcon}>✏️</Text>
            编辑物品信息
          </Text>
          <Text className={styles.tipContent}>
            修改发布信息后，浏览页、物品详情和个人中心都会立即同步更新
          </Text>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>物品照片</Text>
            <View className={styles.imageUploader}>
              {images.map((img, index) => (
                <View key={index} className={styles.imageItem}>
                  <Image
                    className={styles.uploadedImage}
                    src={img}
                    mode="aspectFill"
                    onClick={() => handlePreviewImage(index)}
                  />
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
          onClick={handleCancel}
        >
          取消
        </View>
        <View
          className={classnames(styles.btn, styles.btnPrimary)}
          onClick={handleSave}
        >
          保存修改
        </View>
      </View>
    </View>
  );
};

export default ItemEditPage;
