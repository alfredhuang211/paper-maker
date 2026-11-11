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
import {
  generateSudoku,
  SUDOKU_DIFFICULTIES,
  SUDOKU_SIZES,
  type SudokuDifficulty,
  type SudokuPuzzle,
  type SudokuSize,
} from './engine';

type PuzzlesPerPage = 1 | 2 | 4;

const PUZZLES_PER_PAGE: PuzzlesPerPage[] = [1, 2, 4];
const CONTENT_WIDTH_MM = 180;
const ART_HEIGHT_MM = 225;
const GAP_MM = 6;

export function SudokuTool() {
  const { t } = useI18n();
  const { seed, setSeed, regenerate } = useSeed();
  const [size, setSize] = useState<SudokuSize>(9);
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('medium');
  const [perPage, setPerPage] = useState<PuzzlesPerPage>(1);
  const [title, setTitle] = useState('');
  const [showName, setShowName] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [sheets, setSheets] = useState(1);
  const [batchMode, setBatchMode] = useState<BatchMode>('different');

  const pages = useMemo(
    () =>
      Array.from({ length: sheets }, (_, sheetIndex) => {
        const pageSeed = sheetSeed(seed, sheetIndex, batchMode);
        return Array.from({ length: perPage }, (_, puzzleIndex) =>
          generateSudoku({
            size,
            difficulty,
            seed: puzzleIndex === 0 ? pageSeed : `${pageSeed}-s${puzzleIndex + 1}`,
          }),
        );
      }),
    [size, difficulty, seed, sheets, batchMode, perPage],
  );

  const columns = perPage === 4 ? 2 : 1;
  const rows = perPage === 4 ? 2 : perPage;
  const blockWidthMm = (CONTENT_WIDTH_MM - GAP_MM * (columns - 1)) / columns;
  const blockHeightMm = (ART_HEIGHT_MM - GAP_MM * (rows - 1)) / rows;
  const captionMm = perPage > 1 ? 7 : 0;
  const cellMm = Math.min(blockWidthMm / size, (blockHeightMm - captionMm) / size);
  const titleText = title.trim() || t('sudoku.titleDefault');

  const renderPuzzle = (puzzle: SudokuPuzzle, puzzleIndex: number) => {
    const gridStyle = {
      '--n': puzzle.size,
      '--cell': `${cellMm.toFixed(2)}mm`,
      '--cell-font': `${(cellMm * 0.55).toFixed(2)}mm`,
    } as CSSProperties;

    return (
      <div className="sudoku-block" key={puzzleIndex}>
        {perPage > 1 ? (
          <div className="sudoku-caption">{t('sudoku.gridLabel', { n: puzzleIndex + 1 })}</div>
        ) : null}
        <div className="sudoku-grid" style={gridStyle}>
          {puzzle.puzzle.map((value, cellIndex) => {
            const row = Math.floor(cellIndex / puzzle.size);
            const col = cellIndex % puzzle.size;
            const classes = [
              'sudoku-cell',
              (col + 1) % puzzle.boxCols === 0 || col === puzzle.size - 1 ? 'box-right' : '',
              (row + 1) % puzzle.boxRows === 0 || row === puzzle.size - 1 ? 'box-bottom' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div className={classes} key={cellIndex}>
                {value || ''}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSheet = (puzzles: SudokuPuzzle[], sheetIndex: number) => (
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
            <span>
              {size}×{size} · {t(`sudoku.difficulty.${difficulty}`)}
            </span>
          </div>
        </div>

        <div className={`sudoku-grids cols-${columns}`} style={{ '--gap': `${GAP_MM}mm` } as CSSProperties}>
          {puzzles.map((puzzle, index) => renderPuzzle(puzzle, index))}
        </div>

        <div className="sudoku-note">{t('sudoku.hint')}</div>
        <SheetFooter seed={sheetSeed(seed, sheetIndex, batchMode)} />
      </div>
    </div>
  );

  return (
    <div className="tool-page">
      <div className="container">
        <ToolIntro
          title={t('tool.sudoku.name')}
          description={t('tool.sudoku.desc')}
          backLabel={t('common.allTools')}
        />

        <div className="tool-layout">
          <aside className="panel settings-panel">
            <div className="settings-group">
              <Field label={t('sudoku.size')} help={t('sudoku.sizeHint')}>
                <SegmentedControl
                  label={t('sudoku.size')}
                  value={String(size)}
                  options={SUDOKU_SIZES.map((value) => ({
                    value: String(value),
                    label: t(`sudoku.size.${value}`),
                  }))}
                  onChange={(value) => setSize(Number(value) as SudokuSize)}
                />
              </Field>
              <Field label={t('sudoku.difficulty')}>
                <SegmentedControl
                  label={t('sudoku.difficulty')}
                  value={difficulty}
                  options={SUDOKU_DIFFICULTIES.map((value) => ({
                    value,
                    label: t(`sudoku.difficulty.${value}`),
                  }))}
                  onChange={(value) => setDifficulty(value as SudokuDifficulty)}
                />
              </Field>
              <Field label={t('sudoku.perPage')} help={t('sudoku.perPageHint')}>
                <SegmentedControl
                  label={t('sudoku.perPage')}
                  value={String(perPage)}
                  options={PUZZLES_PER_PAGE.map((value) => ({
                    value: String(value),
                    label: t(`sudoku.perPage.${value}`),
                  }))}
                  onChange={(value) => setPerPage(Number(value) as PuzzlesPerPage)}
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
                placeholder={t('sudoku.titleDefault')}
                onChange={setTitle}
              />
              <p className="action-note">{t('sudoku.hint')}</p>
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
            <PaperList sheets={pages.map((puzzles, index) => renderSheet(puzzles, index))} />
          </section>

          <aside className="actions-panel">
            <ToolActions seed={seed} onSeedChange={setSeed} onRegenerate={regenerate} />
          </aside>
        </div>
      </div>
    </div>
  );
}
