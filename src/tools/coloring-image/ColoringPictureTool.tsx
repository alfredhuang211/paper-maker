import { useEffect, useMemo, useRef, useState } from 'react';
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

interface CustomPicture {
  kind: 'local' | 'url';
  title: string;
  src: string;
  sourceUrl?: string;
  fileName?: string;
}

export function ColoringPictureTool() {
  const { t, lang } = useI18n();
  const [assetId, setAssetId] = useState(PICTURE_ASSETS[0].id);
  const [custom, setCustom] = useState<CustomPicture | null>(null);
  const [lineWeight, setLineWeight] = useState<PictureLineWeight>('medium');
  const [title, setTitle] = useState('');
  const [showName, setShowName] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [processed, setProcessed] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const builtIn = useMemo(
    () => PICTURE_ASSETS.find((item) => item.id === assetId) ?? PICTURE_ASSETS[0],
    [assetId],
  );
  const src = custom?.src ?? assetUrl(builtIn);
  const assetTitle = custom?.title ?? builtIn.title[lang];

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => () => revokeObjectUrl(), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setProcessed('');
    imageToLineArt(src, lineWeight)
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
  }, [src, lineWeight]);

  const selectBuiltIn = (id: string) => {
    revokeObjectUrl();
    setCustom(null);
    setAssetId(id);
    setUrlError(false);
  };

  const loadLocalFile = (file: File | undefined) => {
    if (!file) return;
    try {
      const objectUrl = URL.createObjectURL(file);
      revokeObjectUrl();
      objectUrlRef.current = objectUrl;
      const fileName = file.name.replace(/\.[^.]+$/, '') || t('picture.userTitle');
      setCustom({
        kind: 'local',
        title: fileName,
        src: objectUrl,
        fileName: file.name,
      });
      setAssetId('custom');
      setUrlError(false);
    } catch {
      setUrlError(true);
    }
  };

  const loadUrl = async () => {
    const raw = urlInput.trim();
    if (!raw) return;
    let parsed: URL;
    try {
      parsed = new URL(raw);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('bad protocol');
    } catch {
      setUrlError(true);
      return;
    }

    setUrlLoading(true);
    setUrlError(false);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(parsed.toString(), {
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('bad response');
      const blob = await response.blob();
      if (blob.type && !blob.type.startsWith('image/')) throw new Error('not an image');
      const objectUrl = URL.createObjectURL(blob);
      revokeObjectUrl();
      objectUrlRef.current = objectUrl;
      const pathName = decodeURIComponent(parsed.pathname.split('/').pop() ?? '');
      const fileName = pathName.replace(/\.[^.]+$/, '') || t('picture.userTitle');
      setCustom({
        kind: 'url',
        title: fileName,
        src: objectUrl,
        sourceUrl: parsed.toString(),
      });
      setAssetId('custom');
      setUrlInput('');
    } catch {
      setUrlError(true);
    } finally {
      window.clearTimeout(timeout);
      setUrlLoading(false);
    }
  };

  const titleText = title.trim() || assetTitle;
  const credit = custom
    ? `${t('picture.source')}: ${assetTitle} · ${t('picture.userLicense')}`
    : `${t('picture.source')}: ${assetTitle} · ${t('picture.builtInSource')}`;

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

        <div className="picture-credit">{credit}</div>
        <div className="sheet-footer">
          <span>{t('common.footer')}</span>
          <span>{custom ? t('picture.userLicense') : 'Public Domain'}</span>
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
                    aria-pressed={!custom && item.id === assetId}
                    onClick={() => selectBuiltIn(item.id)}
                  >
                    <img src={assetUrl(item)} alt={item.title[lang]} loading="lazy" />
                    <span>{item.title[lang]}</span>
                  </button>
                ))}
              </div>
              <p className="action-note">{t('picture.galleryHint')}</p>
            </div>

            <div className="settings-group">
              <span className="field-label">{t('picture.custom')}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  loadLocalFile(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
              <Button variant="secondary" block onClick={() => fileInputRef.current?.click()}>
                {t('picture.upload')}
              </Button>
              <TextField
                label={t('picture.urlLabel')}
                value={urlInput}
                placeholder="https://…"
                onChange={setUrlInput}
              />
              <Button variant="secondary" block disabled={urlLoading} onClick={() => void loadUrl()}>
                {t('picture.loadUrl')}
              </Button>
              {urlError ? <p className="warning">{t('picture.urlError')}</p> : null}
              <p className="action-note">{t('picture.customHint')}</p>
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
                {custom?.kind === 'url' && custom.sourceUrl ? (
                  <a href={custom.sourceUrl} target="_blank" rel="noreferrer">
                    {t('picture.sourceLabel')}: {new URL(custom.sourceUrl).hostname}
                  </a>
                ) : custom?.kind === 'local' ? (
                  `${t('picture.sourceLabel')}: ${t('picture.localSource')}${custom.fileName ? ` · ${custom.fileName}` : ''}`
                ) : (
                  <a href={builtIn.source} target="_blank" rel="noreferrer">
                    {t('picture.sourceLabel')}: Openclipart
                  </a>
                )}
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
                <Button
                  variant="primary"
                  block
                  disabled={loading || error || urlLoading}
                  onClick={() => window.print()}
                >
                  <IconPrint />
                  {t('common.print')}
                </Button>
                <Button
                  variant="primary"
                  block
                  disabled={loading || error || urlLoading}
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
