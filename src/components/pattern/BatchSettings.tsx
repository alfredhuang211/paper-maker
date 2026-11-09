import { useI18n } from '../../i18n';
import { Field, SegmentedControl } from '../ui/SegmentedControl';
import { SelectField } from '../ui/SelectField';
import type { BatchMode } from '../../core/batch';

const SHEET_OPTIONS = [1, 2, 3, 5, 10];

export function BatchSettings({
  sheets,
  onSheetsChange,
  mode,
  onModeChange,
}: {
  sheets: number;
  onSheetsChange: (value: number) => void;
  mode: BatchMode;
  onModeChange: (value: BatchMode) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="settings-group">
      <SelectField
        label={t('batch.sheets')}
        value={String(sheets)}
        options={SHEET_OPTIONS.map((value) => ({ value: String(value), label: String(value) }))}
        onChange={(value) => onSheetsChange(Number(value))}
      />
      <Field label={t('batch.mode')} help={t('batch.hint')}>
        <SegmentedControl
          label={t('batch.mode')}
          value={mode}
          options={[
            { value: 'different', label: t('batch.mode.different') },
            { value: 'same', label: t('batch.mode.same') },
          ]}
          onChange={(value) => onModeChange(value as BatchMode)}
        />
      </Field>
    </div>
  );
}
