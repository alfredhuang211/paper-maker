import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../i18n';
import { Field, SegmentedControl } from '../../components/ui/SegmentedControl';
import { SwitchField } from '../../components/ui/SwitchField';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { IconDownload, IconPrint } from '../../components/icons';
import { ToolIntro } from '../../components/pattern/AppChrome';
import { PaperList } from '../../components/pattern/PaperFrame';
import { PICTURE_ASSETS, assetUrl } from './assets';
import { imageToLineArt, type PictureLineWeight } from './process';

export function ColoringPictureTool() {
  const { t, lang } = useI18n();
  const [assetId, setAssetId] = useState(PICTURE_ASSETS[0].id);
  const [lineWeight, setLineWeight] = useState<PictureLineWeight>('medium');
  const [title, setTitle] = useState('');
  const [showName, setShowName] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [processed, setProcessed] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const asset = useMemo(
    () => PICTURE_ASSETS.find((item) => item.id === assetId) ?? PICTURE_ASSETS[0],
    [assetId],
  );
  const assetTitle = asset.title[lang];

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setProcessed('');
    imageToLineArt(assetUrl(asset), lineWeight)
      .then((url) => {
        if (!active) return;
        setProcessed(url);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [asset, lineWeight]);

  const titleText = title.trim() || assetTitle;

  const sheet = (
    <div className="sheet">
      <div className="sheet-inner">
        <div className="sheet-header">
          <h1 className="sheet-title">{titleText}</h1>
          <div className="sheet-meta">
            {showName ? (
              <span>
                {t('common.name')}: <span className="meta-line" />
              </span>
            ) : null}
            {showDate ? (
              <span>
                {t('common.date')}: <span className="meta-line" />
              </span>
            ) : null}
          </div>
        </div>

        <div className="picture-art">
          {loading ? (
            <div className="picture-processing">{t('picture.processing')}</div>
          ) : error ? (
            <div className="picture-processing">{t('picture.error')}</div>
          ) : (
            <img src={processed} alt={assetTitle} />
          )}
        </div>

        <div className="picture-credit">
          {t('picture.source')}: {assetTitle} · {t('picture.license')}
        </div>
        <div className="sheet-footer">
          <span>{t('common.footer')}</span>
          <span>Openclipart · Public Domain</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="tool-page">
      <div className="container">
        <ToolIntro
          title={t('tool.picture.name')}
          description={t('tool.picture.desc')}
          backLabel={t('common.allTools')}
        />

        <div className="tool-layout">
          <aside className="panel settings-panel">
            <div className="settings-group">
              <span className="field-label">{t('picture.gallery')}</span>
              <div className="picture-gallery" role="group" aria-label={t('picture.gallery')}>
                {PICTURE_ASSETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="picture-option"
                    aria-pressed={item.id === assetId}
                    onClick={() => setAssetId(item.id)}
                  >
                    <img src={assetUrl(item)} alt={item.title[lang]} loading="lazy" />
                    <span>{item.title[lang]}</span>
                  </button>
                ))}
              </div>
              <p className="action-note">{t('picture.galleryHint')}</p>
            </div>

            <div className="settings-group">
              <Field label={t('picture.lineWeight')}>
                <SegmentedControl
                  label={t('picture.lineWeight')}
                  value={lineWeight}
                  options={[
                    { value: 'thin', label: t('picture.line.thin') },
                    { value: 'medium', label: t('picture.line.medium') },
                    { value: 'thick', label: t('picture.line.thick') },
                  ]}
                  onChange={(value) => setLineWeight(value as PictureLineWeight)}
                />
              </Field>
            </div>

            <div className="settings-group">
              <SwitchField label={t('common.showName')} checked={showName} onChange={setShowName} />
              <SwitchField label={t('common.showDate')} checked={showDate} onChange={setShowDate} />
            </div>

            <div className="settings-group">
              <TextField
                label={t('common.title')}
                value={title}
                maxLength={30}
                placeholder={assetTitle}
                onChange={setTitle}
              />
              <p className="action-note">{t('picture.hint')}</p>
              <p className="action-note">
                <a href={asset.source} target="_blank" rel="noreferrer">
                  {assetTitle} · Openclipart
                </a>
              </p>
            </div>
          </aside>

          <section className="preview-panel">
            <div className="preview-toolbar">
              <span>
                <strong>{t('common.preview')}</strong> · {t('common.a4')}
              </span>
              <span>{t('common.previewNote')}</span>
            </div>
            <PaperList sheets={[sheet]} />
          </section>

          <aside className="actions-panel">
            <div className="panel">
              <div className="action-pair">
                <Button variant="primary" block disabled={loading || error} onClick={() => window.print()}>
                  <IconPrint />
                  {t('common.print')}
                </Button>
                <Button
                  variant="primary"
                  block
                  disabled={loading || error}
                  title={t('common.pdfHint')}
                  aria-label={t('common.downloadPdf')}
                  onClick={() => window.print()}
                >
                  <IconDownload />
                  {t('common.downloadPdf')}
                </Button>
              </div>
              <p className="action-note">{t('common.printTip')}</p>
              <p className="action-note">{t('common.pdfHint')}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
