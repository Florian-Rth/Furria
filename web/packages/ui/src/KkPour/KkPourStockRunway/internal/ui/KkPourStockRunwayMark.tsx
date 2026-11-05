import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkPourRunwayMark, KkPourRunwayMarkAlign } from '../../../pour-stock-runway';

const SHIFT: Record<KkPourRunwayMarkAlign, string> = {
  start: '0',
  center: '-50%',
  end: '-100%',
};

const markPaint = (mark: KkPourRunwayMark): CSSObject => ({
  position: 'absolute',
  top: 0,
  left: `${mark.share * 100}%`,
  transform: `translateX(${SHIFT[mark.align]})`,
  fontWeight: 700,
  lineHeight: 1.2,
  fontVariantNumeric: 'tabular-nums',
  color: mark.kind === 'empty' ? 'var(--kk-runway-mark)' : 'text.secondary',
});

interface KkPourStockRunwayMarkProps {
  mark: KkPourRunwayMark;
  label: string;
}

export const KkPourStockRunwayMark: FC<KkPourStockRunwayMarkProps> = ({ mark, label }) => {
  const paint = markPaint(mark);

  return (
    <Typography variant="caption" noWrap data-runway-mark={mark.kind} sx={paint}>
      {label}
    </Typography>
  );
};
