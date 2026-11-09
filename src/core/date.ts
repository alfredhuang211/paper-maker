import type { Lang } from '../i18n';

export function formatDate(lang: Lang, date: Date = new Date()): string {
  if (lang === 'zh') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
