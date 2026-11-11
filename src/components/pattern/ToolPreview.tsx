import { useI18n } from '../../i18n';
import { generateColoring } from '../../tools/coloring/engine';
import { generateMathWorksheet, questionText } from '../../tools/math/engine';
import { generateSchulte } from '../../tools/schulte/engine';
import { generateMaze } from '../../tools/maze/engine';
import { generateSudoku } from '../../tools/sudoku/engine';

const coloringPreview = generateColoring({
  theme: 'mandala',
  complexity: 4,
  lineWeight: 'medium',
  seed: 'home-coloring',
});
const mathPreview = generateMathWorksheet({
  ops: ['add', 'sub'],
  range: 100,
  carry: true,
  borrow: true,
  fillModes: ['answer'],
  count: 8,
  columns: 2,
  fontSize: 'sm',
  showAnswers: false,
  title: '',
  showName: true,
  showDate: false,
  seed: 'home-math',
});
const schultePreview = generateSchulte({ size: 5, seed: 'home-schulte' });
const mazePreview = generateMaze({ size: 10, shape: 'square', lineWeight: 'medium', seed: 'home-maze' });
const sudokuPreview = generateSudoku({ size: 9, difficulty: 'medium', seed: 'home-sudoku' });

const MATH_ROWS = mathPreview.questions.slice(0, 8);

function PageFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="thumb-paper">
      <svg viewBox="0 0 210 297" role="img" aria-label={title}>
        <rect width="210" height="297" fill="#ffffff" />
        <text x="16" y="24" fill="#1f2328" fontFamily="inherit" fontSize="11" fontWeight="600">
          {title}
        </text>
        <line x1="16" y1="31" x2="194" y2="31" stroke="#d4d2cb" strokeWidth="0.8" />
        {children}
        <line x1="16" y1="280" x2="194" y2="280" stroke="#e6e4df" strokeWidth="0.6" />
        <text x="16" y="290" fill="#8a929c" fontFamily="inherit" fontSize="5">
          paper-maker
        </text>
      </svg>
    </div>
  );
}

export function ToolPreview({ slug }: { slug: string }) {
  const { t } = useI18n();

  if (slug === 'coloring') {
    return (
      <PageFrame title={t('home.coloring.name')}>
        <g transform="translate(15 40)" fill="none" stroke="#1f2328" strokeWidth={coloringPreview.strokeWidth}>
          {coloringPreview.elements.map((element, index) =>
            element.kind === 'circle' ? (
              <circle key={index} cx={element.cx} cy={element.cy} r={element.r} />
            ) : (
              <path key={index} d={element.d} />
            ),
          )}
        </g>
      </PageFrame>
    );
  }

  if (slug === 'math') {
    return (
      <PageFrame title={t('home.math.name')}>
        <g fill="#1f2328" fontFamily="inherit" fontSize="7.5">
          {MATH_ROWS.map((question, index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            const x = column === 0 ? 18 : 108;
            const y = 54 + row * 26;
            return (
              <g key={index}>
                <text x={x} y={y}>
                  {index + 1}. {questionText(question)} =
                </text>
                <line x1={x + 52} y1={y + 2} x2={x + 82} y2={y + 2} stroke="#1f2328" strokeWidth="0.7" />
              </g>
            );
          })}
        </g>
        <line x1="16" y1="262" x2="194" y2="262" stroke="#e6e4df" strokeWidth="0.6" />
      </PageFrame>
    );
  }

  if (slug === 'schulte') {
    const cell = 32;
    return (
      <PageFrame title={t('home.schulte.name')}>
        <g transform="translate(25 50)">
          {schultePreview.numbers.map((number, index) => {
            const row = Math.floor(index / 5);
            const column = index % 5;
            return (
              <g key={index}>
                <rect
                  x={column * cell}
                  y={row * cell}
                  width={cell}
                  height={cell}
                  fill="none"
                  stroke="#1f2328"
                  strokeWidth="0.45"
                />
                <text
                  x={column * cell + cell / 2}
                  y={row * cell + cell / 2 + 3}
                  textAnchor="middle"
                  fill="#1f2328"
                  fontFamily="inherit"
                  fontSize="10"
                >
                  {number}
                </text>
              </g>
            );
          })}
        </g>
      </PageFrame>
    );
  }

  if (slug === 'maze') {
    const cell = 18;
    const strokeWidth = mazePreview.lineWidthMm / cell;
    return (
      <PageFrame title={t('home.maze.name')}>
        <g transform="translate(15 48) scale(18)" fill="none" stroke="#1f2328" strokeWidth={strokeWidth}>
          {mazePreview.walls.map((wall, index) => (
            <line key={index} x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} />
          ))}
        </g>
        <polygon
          points={`${15 + (mazePreview.start.x + 0.5) * 18 - 5},${48 - 14} ${15 + (mazePreview.start.x + 0.5) * 18 + 5},${48 - 14} ${15 + (mazePreview.start.x + 0.5) * 18},${48 - 4}`}
          fill="#1f2328"
        />
        <polygon
          points={`${15 + (mazePreview.exit.x + 0.5) * 18 - 5},${48 + 10 * 18 + 14} ${15 + (mazePreview.exit.x + 0.5) * 18 + 5},${48 + 10 * 18 + 14} ${15 + (mazePreview.exit.x + 0.5) * 18},${48 + 10 * 18 + 24}`}
          fill="#1f2328"
        />
      </PageFrame>
    );
  }

  if (slug === 'sudoku') {
    const cell = 18;
    const puzzle = sudokuPreview.puzzle;
    const size = sudokuPreview.size;
    const box = sudokuPreview.boxCols;
    const boxRows = sudokuPreview.boxRows;
    return (
      <PageFrame title={t('home.sudoku.name')}>
        <g transform="translate(24 48)">
          {Array.from({ length: size + 1 }).map((_, index) => (
            <g key={`line-${index}`}>
              <line
                x1={index * cell}
                y1="0"
                x2={index * cell}
                y2={size * cell}
                stroke="#1f2328"
                strokeWidth={index % box === 0 || index === size ? 0.9 : 0.3}
              />
              <line
                x1="0"
                y1={index * cell}
                x2={size * cell}
                y2={index * cell}
                stroke="#1f2328"
                strokeWidth={index % boxRows === 0 || index === size ? 0.9 : 0.3}
              />
            </g>
          ))}
          {puzzle.map((value, index) => {
            if (!value) return null;
            const row = Math.floor(index / size);
            const col = index % size;
            return (
              <text
                key={index}
                x={col * cell + cell / 2}
                y={row * cell + cell / 2 + 2.5}
                textAnchor="middle"
                fill="#1f2328"
                fontFamily="inherit"
                fontSize="7.5"
              >
                {value}
              </text>
            );
          })}
        </g>
      </PageFrame>
    );
  }

  return null;
}
