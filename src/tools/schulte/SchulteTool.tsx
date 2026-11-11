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

type GridsPerPage = 1 | 2 | 4;

const GRIDS_PER_PAGE: GridsPerPage[] = [1, 2, 4];

const CONTENT_WIDTH_MM = 180;
const CONTENT_HEIGHT_MM = 267;
const GAP_MM = 6;

export function SchulteTool() {
  const { t } = useI18n();
  const { seed, setSeed, regenerate } = useSeed();
  const [size, setSize] = useState<SchulteSize>(5);
  const [gridsPerPage, setGridsPerPage] = useState<GridsPerPage>(1);
  const [showRecord, setShowRecord] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [centerMark, setCenterMark] = useState(false);
  const [title, setTitle] = useState('');
  const [sheets, setSheets] = useState(1);
  const [batchMode, setBatchMode] = useState<BatchMode>('different');

  const pages = useMemo(
    () =>
      Array.from({ length: sheets }, (_, sheetIndex) => {
        const pageSeed = sheetSeed(seed, sheetIndex, batchMode);
        return Array.from({ length: gridsPerPage }, (_, gridIndex) =>
          generateSchulte({
            size,
            seed: gridIndex === 0 ? pageSeed : `${pageSeed}-g${gridIndex + 1}`,
          }),
        );
      }),
    [size, seed, sheets, batchMode, gridsPerPage],
  );

  const columns = gridsPerPage === 4 ? 2 : 1;
  const rows = gridsPerPage === 4 ? 2 : gridsPerPage;

  // Approximate the vertical budget in millimetres so each grid stays inside its block.
  const headerMm = gridsPerPage === 1 ? (showRecord ? 16 : 12) : 12;
  const instructionsMm = showInstructions ? 12 : 0;
  const footerMm = 9;
  const captionMm = gridsPerPage > 1 ? 7 : 0;
  const availableHeightMm = CONTENT_HEIGHT_MM - headerMm - instructionsMm - footerMm;
  const blockHeightMm = (availableHeightMm - GAP_MM * (rows - 1)) / rows;
  const blockWidthMm = (CONTENT_WIDTH_MM - GAP_MM * (columns - 1)) / columns;
  const cellMm = Math.max(
    8,
    Math.min(blockWidthMm / size, (blockHeightMm - captionMm) / size, 52),
  );
  const tooSmall = cellMm < 18;
  const centerIndex = size % 2 === 1 ? Math.floor((size * size) / 2) : -1;

  const renderGrid = (model: SchulteModel, gridIndex: number) => {
    const gridStyle = {
      '--n': model.size,
      '--cell': `${cellMm.toFixed(2)}mm`,
      '--cell-font': `${(cellMm * 0.42).toFixed(2)}mm`,
    } as CSSProperties;

    return (
      <div className="schulte-block" key={gridIndex}>
        {gridsPerPage > 1 ? (
          <div className="schulte-caption">
            <span className="schulte-caption-label">
              {t('schulte.gridLabel', { n: gridIndex + 1 })}
            </span>
            {showRecord ? (
              <>
                <span className="record-item">
                  <span>{t('schulte.record.time')}</span>
                  <span className="meta-line" />
                </span>
                <span className="record-item">
                  <span>{t('schulte.record.errors')}</span>
                  <span className="meta-line" />
                </span>
              </>
            ) : null}
          </div>
        ) : null}
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
    );
  };

  const renderSheet = (models: SchulteModel[], sheetIndex: number) => (
    <div className="sheet">
      <div className="sheet-inner">
        <div className="sheet-header">
          <h1 className="sheet-title">{title.trim() || t('schulte.titleDefault')}</h1>
          {showRecord ? (
            <div className={`schulte-record${gridsPerPage > 1 ? ' is-compact' : ''}`}>
              <div className="record-item">
                <span>{t('schulte.record.name')}</span>
                <span className="meta-line" />
              </div>
              <div className="record-item">
                <span>{t('schulte.record.date')}</span>
                <span className="meta-line" />
              </div>
              {gridsPerPage === 1 ? (
                <>
                  <div className="record-item">
                    <span>{t('schulte.record.time')}</span>
                    <span className="meta-line" />
                  </div>
                  <div className="record-item">
                    <span>{t('schulte.record.errors')}</span>
                    <span className="meta-line" />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          className={`schulte-grids cols-${columns}`}
          style={{ '--gap': `${GAP_MM}mm` } as CSSProperties}
        >
          {models.map((model, gridIndex) => renderGrid(model, gridIndex))}
        </div>

        {showInstructions ? (
          <div className="schulte-instructions">{t('schulte.instructions')}</div>
        ) : null}
        <SheetFooter seed={sheetSeed(seed, sheetIndex, batchMode)} />
      </div>
    </div>
  );

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
              <Field label={t('schulte.perPage')} help={t('schulte.perPageHint')}>
                <SegmentedControl
                  label={t('schulte.perPage')}
                  value={String(gridsPerPage)}
                  options={GRIDS_PER_PAGE.map((value) => ({
                    value: String(value),
                    label: t(`schulte.perPage.${value}`),
                  }))}
                  onChange={(value) => setGridsPerPage(Number(value) as GridsPerPage)}
                />
              </Field>
              {tooSmall ? (
                <p className="warning">
                  {t('schulte.tooSmall', { mm: cellMm.toFixed(1) })}
                </p>
              ) : null}
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
            <PaperList sheets={pages.map((models, index) => renderSheet(models, index))} />
          </section>

          <aside className="actions-panel">
            <ToolActions seed={seed} onSeedChange={setSeed} onRegenerate={regenerate} />
          </aside>
        </div>
      </div>
    </div>
  );
}
