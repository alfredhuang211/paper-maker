import { useI18n } from '../../i18n';
import { TextField } from '../ui/TextField';

export function SeedSettings({
  seed,
  onChange,
  onRegenerate,
}: {
  seed: string;
  onChange: (seed: string) => void;
  onRegenerate: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="settings-group seed-settings">
      <TextField
        label={t('common.seed')}
        value={seed}
        mono
        onChange={onChange}
        onBlur={() => {
          if (!seed.trim()) onRegenerate();
        }}
      />
      <p className="action-note">{t('common.seedHint')}</p>
    </div>
  );
}
