import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

const MM_TO_PX = 96 / 25.4;
const PAPER_WIDTH_MM = 210;
const PAPER_HEIGHT_MM = 297;

export function PaperFrame({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const element = frameRef.current;
    if (!element) return undefined;

    const update = () => {
      const width = element.clientWidth;
      if (width > 0) setScale(width / (PAPER_WIDTH_MM * MM_TO_PX));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="paper-frame" ref={frameRef}>
      <div
        className="paper-scaler"
        style={{
          transform: `scale(${scale})`,
          width: `${PAPER_WIDTH_MM}mm`,
          height: `${PAPER_HEIGHT_MM}mm`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PaperList({ sheets }: { sheets: ReactNode[] }) {
  return (
    <div className="paper-list">
      {sheets.map((sheet, index) => (
        <PaperFrame key={index}>{sheet}</PaperFrame>
      ))}
    </div>
  );
}
