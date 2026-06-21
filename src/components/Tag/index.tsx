import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface TagProps {
  text: string;
  type?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
  plain?: boolean;
  className?: string;
}

const Tag: React.FC<TagProps> = ({
  text,
  type = 'default',
  size = 'sm',
  plain = false,
  className = ''
}) => {
  return (
    <View
      className={classnames(
        styles.tag,
        styles[type],
        styles[size],
        { [styles.plain]: plain },
        className
      )}
    >
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default Tag;
