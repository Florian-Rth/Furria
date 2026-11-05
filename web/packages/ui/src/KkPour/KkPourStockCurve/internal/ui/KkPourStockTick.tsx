import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkPourStockTick as KkPourStockTickModel } from '../../../pour-stock-trend';

const SHIFT: Record<KkPourStockTickModel['align'], string> = {
  start: '0',
  center: '-50%',
  end: '-100%',
};

const tickPaint = (tick: KkPourStockTickModel): CSSObject =>
  tick.kind === 'from'
    ? { display: 'block' }
    : {
        position: 'absolute',
        top: 0,
        left: `${tick.share * 100}%`,
        transform: `translateX(${SHIFT[tick.align]})`,
      };

interface KkPourStockTickProps {
  tick: KkPourStockTickModel;
  label: string;
}

export const KkPourStockTick: FC<KkPourStockTickProps> = ({ tick, label }) => (
  <Typography
    variant="caption"
    noWrap
    data-stock-tick={tick.kind}
    sx={[
      {
        fontWeight: 700,
        color: 'text.secondary',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.2,
      },
      tickPaint(tick),
    ]}
  >
    {label}
  </Typography>
);
