import { useMemo, useState, type CSSProperties } from 'react';
import { useI18n } from '../../i18n';
import { useSeed } from '../../hooks/useSeed';
import { Field, SegmentedControl } from '../../components/ui/SegmentedControl';
import { SwitchField } from '../../components/ui/SwitchField';
import { TextField } from '../../components/ui/TextField';
import { ToolIntro } from '../../components/pattern/AppChrome';
import { SeedSettings } from '../../components/pattern/SeedSettings';
import { BatchSettings } from '../../components/pattern/BatchSettings';
import { sheetSeed, type BatchMode } from '../../core/batch';
import { PaperList } from '../../components/pattern/PaperFrame';
import { SheetFooter } from '../../components/pattern/SheetParts';
import { ToolActions } from '../../components/pattern/ToolActions';
import { generateSchulte, SCHULTE_SIZES, type SchulteModel, type SchulteSize } from './engine';

export function SchulteTool() {
  const { t } = useI18n();
  const { seed, setSeed, regenerate } = useSeed();
  const [size, setSize] = useState<SchulteSize>(5);
  const [showRecord, setShowRecord] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [centerMark, setCenterMark] = useState(false);
  const [title, setTitle] = useState('');
  const [sheets, setSheets] = useState(1);
  const [batchMode, setBatchMode] = useState<BatchMode>('different');

  const models = useMemo(
    () =>
      Array.from({ length: sheets }, (_, index) =>
        generateSchulte({ size, seed: sheetSeed(seed, index, batchMode) }),
      ),
    [size, seed, sheets, batchMode],
  );
  const cellMm = Math.min(180 / size, 52);
  const centerIndex = size % 2 === 1 ? Math.floor((size * size) / 2) : -1;

  const renderSheet = (model: SchulteModel, index: number) => {
    const gridStyle = {
      '--n': model.size,
      '--cell': `${cellMm.toFixed(2)}mm`,
      '--cell-font': `${(cellMm * 0.42).toFixed(2)}mm`,
    } as CSSProperties;

    return (
    <div className="sheet">
      <div className="sheet-inner">
        <div className="sheet-header">
          <h1 className="sheet-title">{title.trim() || t('schulte.titleDefault')}</h1>
          {showRecord ? (
            <div className="schulte-record">
              <div className="record-item">
                <span>{t('schulte.record.name')}</span>
                <span className="meta-line" />
              </div>
              <div className="record-item">
                <span>{t('schulte.record.date')}</span>
                <span className="meta-line" />
              </div>
              <div className="record-item">
                <span>{t('schulte.record.time')}</span>
                <span className="meta-line" />
              </div>
              <div className="record-item">
                <span>{t('schulte.record.errors')}</span>
                <span className="meta-line" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="schulte-grid-wrap">
          <div className="schulte-grid" style={gridStyle}>
            {model.numbers.map((number, index) => (
              <div
                key={`${number}-${index}`}
                className={`schulte-cell${centerMark && index === centerIndex ? ' center' : ''}`}
              >
                {number}
              </div>
            ))}
          </div>
        </div>

        {showInstructions ? (
          <div className="schulte-instructions">{t('schulte.instructions')}</div>
        ) : null}
        <SheetFooter seed={sheetSeed(seed, index, batchMode)} />
      </div>
    </div>
    );
  };

  return (
    <div className="tool-page">
      <div className="container">
        <ToolIntro
          title={t('tool.schulte.name')}
          description={t('tool.schulte.desc')}
          backLabel={t('common.allTools')}
        />

        <div className="tool-layout">
          <aside className="panel settings-panel">
            <div className="settings-group">
              <Field label={t('schulte.size')} help={t('schulte.sizeHint')}>
                <SegmentedControl
                  label={t('schulte.size')}
                  value={String(size)}
                  options={SCHULTE_SIZES.map((value) => ({
                    value: String(value),
                    label: `${value}×${value}`,
                  }))}
                  onChange={(value) => setSize(Number(value) as SchulteSize)}
                />
              </Field>
            </div>

            <div className="settings-group">
              <SwitchField
                label={t('schulte.showRecord')}
                checked={showRecord}
                onChange={setShowRecord}
              />
              <SwitchField
                label={t('schulte.showInstructions')}
                checked={showInstructions}
                onChange={setShowInstructions}
              />
              <SwitchField
                label={t('schulte.centerMark')}
                checked={centerMark}
                onChange={setCenterMark}
              />
            </div>

            <div className="settings-group">
              <TextField
                label={t('common.title')}
                value={title}
                maxLength={30}
                placeholder={t('schulte.titleDefault')}
                onChange={setTitle}
              />
              <p className="action-note">{t('schulte.hint')}</p>
            </div>

            <BatchSettings
              sheets={sheets}
              onSheetsChange={setSheets}
              mode={batchMode}
              onModeChange={setBatchMode}
            />
            <SeedSettings seed={seed} onChange={setSeed} onRegenerate={regenerate} />
          </aside>

          <section className="preview-panel">
            <div className="preview-toolbar">
              <span>
                <strong>{t('common.preview')}</strong> · {t('common.a4')}
              </span>
              <span>{t('common.previewNote')}</span>
            </div>
            <PaperList sheets={models.map((model, index) => renderSheet(model, index))} />
          </section>

          <aside className="actions-panel">
            <ToolActions seed={seed} onSeedChange={setSeed} onRegenerate={regenerate} />
          </aside>
        </div>
      </div>
    </div>
  );
}
