import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkPourStockBarLabel as KkPourStockBarLabelModel } from '../../../pour-stock-bars';

const labelPaint = (label: KkPourStockBarLabelModel): CSSObject => ({
  position: 'absolute',
  left: `${label.x}px`,
  bottom: `calc(100% - ${label.y}px)`,
  transform: 'translate(-50%, -3px)',
  fontWeight: 800,
  lineHeight: 1,
  color: 'text.primary',
  fontVariantNumeric: 'tabular-nums',
});

interface KkPourStockBarLabelProps {
  label: KkPourStockBarLabelModel;
}

export const KkPourStockBarLabel: FC<KkPourStockBarLabelProps> = ({ label }) => {
  const text = `+${label.crates}`;
  const paint = labelPaint(label);

  return (
    <Typography variant="caption" noWrap data-bar-label sx={paint}>
      {text}
    </Typography>
  );
};
