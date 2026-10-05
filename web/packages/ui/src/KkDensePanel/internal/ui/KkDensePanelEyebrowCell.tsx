import type { MotionValue } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { FlapGlyphTone } from '../../../internal/flap/FlapGlyph';
import { FlapGlyph } from '../../../internal/flap/FlapGlyph';
import type { EyebrowCell } from '../logic/eyebrow-cells';
import { KkDensePanelEyebrowFlap } from './KkDensePanelEyebrowFlap';

const CELL_STYLE: CSSProperties = { position: 'relative', display: 'inline-grid' };
const INK_STYLE: CSSProperties = { gridArea: '1 / 1' };
const TURNING_INK_STYLE: CSSProperties = { gridArea: '1 / 1', opacity: 0 };
const SIZER_STYLE: CSSProperties = { gridArea: '1 / 1', visibility: 'hidden' };

interface KkDensePanelEyebrowCellProps {
  cell: EyebrowCell;
  tone: FlapGlyphTone;
  progress: MotionValue<number>;
}

export const KkDensePanelEyebrowCell: FC<KkDensePanelEyebrowCellProps> = ({
  cell,
  tone,
  progress,
}) => {
  const inkStyle = cell.turns ? TURNING_INK_STYLE : INK_STYLE;
  const sizer = cell.turns ? (
    <span style={SIZER_STYLE}>
      <FlapGlyph variant="caption" tone={tone}>
        {cell.from}
      </FlapGlyph>
    </span>
  ) : null;
  const flap = cell.turns ? (
    <KkDensePanelEyebrowFlap from={cell.from} to={cell.to} tone={tone} progress={progress} />
  ) : null;

  return (
    <span style={CELL_STYLE}>
      <span style={inkStyle}>
        <FlapGlyph variant="caption" tone={tone}>
          {cell.to}
        </FlapGlyph>
      </span>
      {sizer}
      {flap}
    </span>
  );
};
