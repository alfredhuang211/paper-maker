import { useI18n } from '../i18n';
import { Button } from '../components/ui/Button';
import { IconPrint } from '../components/icons';

export function PrintGuidePage() {
  const { t } = useI18n();

  return (
    <div className="guide-page">
      <div className="container">
        <div className="guide-layout">
          <div className="guide-content">
            <a className="breadcrumb" href="#/">
              ← {t('common.backHome')}
            </a>
            <h1>{t('printGuide.title')}</h1>
            <p>{t('printGuide.intro')}</p>

            <div className="guide-card">
              <h2>{t('printGuide.checklistTitle')}</h2>
              <ul className="checklist">
                <li>{t('printGuide.check1')}</li>
                <li>{t('printGuide.check2')}</li>
                <li>{t('printGuide.check3')}</li>
                <li>{t('printGuide.check4')}</li>
              </ul>
            </div>

            <div className="guide-card" style={{ marginTop: 'var(--space-4)' }}>
              <h2>{t('printGuide.stepsTitle')}</h2>
              <p>{t('printGuide.step1')}</p>
              <p>{t('printGuide.step2')}</p>
              <p>{t('printGuide.step3')}</p>
            </div>
          </div>

          <aside className="guide-card calibration-card">
            <h2>{t('printGuide.calibrationTitle')}</h2>
            <p>{t('printGuide.calibrationDesc')}</p>
            <div className="ruler" aria-hidden="true" />
            <span className="ruler-label">{t('printGuide.ruler')}</span>
            <Button variant="primary" block onClick={() => window.print()}>
              <IconPrint />
              {t('printGuide.printCalibration')}
            </Button>
            <p className="action-note">{t('printGuide.note')}</p>
          </aside>
        </div>
      </div>

      <div className="calibration-print-only">
        <div className="sheet calibration-sheet">
          <div className="sheet-inner">
            <div className="sheet-header">
              <h1 className="sheet-title">{t('printGuide.calibrationTitle')}</h1>
              <p style={{ fontSize: '10.5pt', margin: '0' }}>{t('printGuide.calibrationDesc')}</p>
            </div>
            <div style={{ marginTop: '20mm' }}>
              <div className="ruler" aria-hidden="true" />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100mm',
                  marginTop: '2mm',
                  fontSize: '9pt',
                }}
              >
                <span>0 mm</span>
                <span>50 mm</span>
                <span>100 mm</span>
              </div>
            </div>
            <div style={{ marginTop: '12mm', fontSize: '10pt' }}>{t('printGuide.note')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
