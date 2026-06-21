import dayjs from 'dayjs';

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

export const formatTime = (dateStr: string): string => {
  const date = dayjs(dateStr);
  const now = dayjs();
  const diffMinutes = now.diff(date, 'minute');
  
  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}小时前`;
  if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}天前`;
  
  return date.format('MM-DD');
};

export const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getRatingStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return '★'.repeat(fullStars) + (hasHalf ? '☆' : '') + '☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0));
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
