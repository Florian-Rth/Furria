import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkPourDeliveryLabel } from '../../../pour-stock-trend';

const labelPaint = (label: KkPourDeliveryLabel): CSSObject => ({
  position: 'absolute',
  left: `${label.x}px`,
  bottom: `calc(100% - ${label.y}px)`,
  transform: 'translateX(-50%)',
  fontWeight: 800,
  lineHeight: 1,
  color: 'var(--kk-curve-ink)',
  fontVariantNumeric: 'tabular-nums',
});

interface KkPourStockCurveLabelProps {
  label: KkPourDeliveryLabel;
}

export const KkPourStockCurveLabel: FC<KkPourStockCurveLabelProps> = ({ label }) => {
  const text = `+${label.crates}`;
  const paint = labelPaint(label);

  return (
    <Typography variant="caption" noWrap data-curve-label sx={paint}>
      {text}
    </Typography>
  );
};
