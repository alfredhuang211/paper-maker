import { useI18n } from '../../i18n';
import { useClipboard } from '../../hooks/useSeed';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { IconCheck, IconCopy, IconDownload, IconPrint, IconRefresh } from '../icons';

interface ToolActionsProps {
  seed: string;
  onSeedChange: (seed: string) => void;
  onRegenerate: () => void;
}

export function ToolActions({ seed, onSeedChange, onRegenerate }: ToolActionsProps) {
  const { t } = useI18n();
  const { copied, copy } = useClipboard();

  const copySeed = () => {
    void copy(seed);
  };

  const copyLink = () => {
    void copy(window.location.href);
  };

  return (
    <div className="panel">
      <Button variant="primary" block onClick={() => window.print()}>
        <IconPrint />
        {t('common.print')}
      </Button>
      <Button
        variant="secondary"
        block
        className="pdf-button"
        title={t('common.pdfHint')}
        aria-label={t('common.downloadPdf')}
        onClick={() => window.print()}
      >
        <IconDownload />
        <span className="pdf-label">{t('common.downloadPdf')}</span>
      </Button>
      <Button variant="secondary" block onClick={onRegenerate}>
        <IconRefresh />
        {t('common.regenerate')}
      </Button>

      <div className="seed-field">
        <TextField
          label={t('common.seed')}
          value={seed}
          mono
          onChange={onSeedChange}
          onBlur={() => {
            if (!seed.trim()) onRegenerate();
          }}
        />
        <div className="seed-row">
          <Button variant="ghost" size="sm" block onClick={copySeed}>
            {copied ? <IconCheck /> : <IconCopy />}
            {copied ? t('common.copied') : t('common.copy')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            block
            className="share-button"
            onClick={copyLink}
          >
            {copied ? <IconCheck /> : <IconCopy />}
            {copied ? t('common.copied') : t('common.share')}
          </Button>
        </div>
        <span className="action-note">{t('common.seedHint')}</span>
      </div>

      <p className="action-note">{t('common.printTip')}</p>
      <p className="action-note">{t('common.pdfHint')}</p>
    </div>
  );
}
