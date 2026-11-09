import type { ReactNode } from 'react';
import { useI18n } from '../../i18n';

export function SheetFooter({ seed }: { seed: string }) {
  const { t } = useI18n();
  return (
    <div className="sheet-footer">
      <span>{t('common.footer')}</span>
      <span>{seed}</span>
    </div>
  );
}

export function MetaLine({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  return (
    <span>
      {label}
      {value ?? <span className="meta-line" />}
    </span>
  );
}
