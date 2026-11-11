import { useMemo, useState } from 'react';
import { useI18n } from '../../i18n';
import { useSeed } from '../../hooks/useSeed';
import { Field, SegmentedControl } from '../../components/ui/SegmentedControl';
import { SwitchField } from '../../components/ui/SwitchField';
import { TextField } from '../../components/ui/TextField';
import { SelectField } from '../../components/ui/SelectField';
import { ToolIntro } from '../../components/pattern/AppChrome';
import { SeedSettings } from '../../components/pattern/SeedSettings';
import { BatchSettings } from '../../components/pattern/BatchSettings';
import { sheetSeed, type BatchMode } from '../../core/batch';
import { PaperList } from '../../components/pattern/PaperFrame';
import { SheetFooter } from '../../components/pattern/SheetParts';
import { ToolActions } from '../../components/pattern/ToolActions';
import {
  generateMaze,
  MAZE_SHAPES,
  MAZE_SIZES,
  mazeRowsFor,
  type MazeLineWeight,
  type MazeModel,
  type MazeShape,
  type MazeSize,
} from './engine';

const CONTENT_MM = 180;
const ART_HEIGHT_MM = 230;

export function MazeTool() {
  const { t } = useI18n();
  const { seed, setSeed, regenerate } = useSeed();
  const [size, setSize] = useState<MazeSize>(15);
  const [shape, setShape] = useState<MazeShape>('square');
  const [lineWeight, setLineWeight] = useState<MazeLineWeight>('medium');
  const [title, setTitle] = useState('');
  const [showName, setShowName] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [sheets, setSheets] = useState(1);
  const [batchMode, setBatchMode] = useState<BatchMode>('different');

  const models = useMemo(
    () =>
      Array.from({ length: sheets }, (_, index) =>
        generateMaze({
          size,
          shape,
          lineWeight,
          seed: sheetSeed(seed, index, batchMode),
        }),
      ),
    [size, shape, lineWeight, seed, sheets, batchMode],
  );

  const rows = mazeRowsFor(size, shape);
  const cellMm = Math.min(CONTENT_MM / size, ART_HEIGHT_MM / rows);
  const sizeLabel = (value: MazeSize) =>
    shape === 'rectangle'
      ? `${value}×${mazeRowsFor(value, shape)}`
      : `${value}×${value}`;
  const titleText = title.trim() || t('maze.titleDefault');

  const renderSheet = (model: MazeModel, index: number) => {
    const strokeWidth = model.lineWidthMm / cellMm;
    return (
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

          <div className="maze-art">
            <svg
              viewBox={`-0.9 -1.2 ${model.cols + 1.8} ${model.rows + 2.4}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={titleText}
            >
              <g
                fill="none"
                stroke="#000000"
                strokeWidth={strokeWidth}
                strokeLinecap="square"
                strokeLinejoin="miter"
              >
                {model.walls.map((wall, wallIndex) => (
                  <line
                    key={wallIndex}
                    x1={wall.x1}
                    y1={wall.y1}
                    x2={wall.x2}
                    y2={wall.y2}
                  />
                ))}
              </g>
              <g fill="#000000" stroke="#000000" strokeWidth={strokeWidth} strokeLinecap="round">
                <line
                  x1={model.start.x + 0.5}
                  y1={-1.0}
                  x2={model.start.x + 0.5}
                  y2={-0.45}
                />
                <polygon
                  points={`${model.start.x + 0.5 - 0.28},${-0.48} ${model.start.x + 0.5 + 0.28},${-0.48} ${model.start.x + 0.5},${-0.08}`}
                  stroke="none"
                />
                <line
                  x1={model.exit.x + 0.5}
                  y1={model.rows + 0.45}
                  x2={model.exit.x + 0.5}
                  y2={model.rows + 1.0}
                />
                <polygon
                  points={`${model.exit.x + 0.5 - 0.28},${model.rows + 0.48} ${model.exit.x + 0.5 + 0.28},${model.rows + 0.48} ${model.exit.x + 0.5},${model.rows + 1.08}`}
                  stroke="none"
                />
              </g>
            </svg>
          </div>

          <div className="maze-note">{t('maze.hint')}</div>
          <SheetFooter seed={sheetSeed(seed, index, batchMode)} />
        </div>
      </div>
    );
  };

  return (
    <div className="tool-page">
      <div className="container">
        <ToolIntro
          title={t('tool.maze.name')}
          description={t('tool.maze.desc')}
          backLabel={t('common.allTools')}
        />

        <div className="tool-layout">
          <aside className="panel settings-panel">
            <div className="settings-group">
              <SelectField
                label={t('maze.shape')}
                value={shape}
                options={MAZE_SHAPES.map((value) => ({
                  value,
                  label: t(`maze.shape.${value}`),
                }))}
                onChange={(value) => setShape(value as MazeShape)}
              />
              <Field label={t('maze.size')} help={t('maze.sizeHint')}>
                <SegmentedControl
                  label={t('maze.size')}
                  value={String(size)}
                  options={MAZE_SIZES.map((value) => ({
                    value: String(value),
                    label: sizeLabel(value),
                  }))}
                  onChange={(value) => setSize(Number(value) as MazeSize)}
                />
              </Field>
              <Field label={t('maze.lineWidth')}>
                <SegmentedControl
                  label={t('maze.lineWidth')}
                  value={lineWeight}
                  options={[
                    { value: 'thin', label: t('maze.line.thin') },
                    { value: 'medium', label: t('maze.line.medium') },
                    { value: 'thick', label: t('maze.line.thick') },
                  ]}
                  onChange={(value) => setLineWeight(value as MazeLineWeight)}
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
                placeholder={t('maze.titleDefault')}
                onChange={setTitle}
              />
              <p className="action-note">{t('maze.hint')}</p>
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
