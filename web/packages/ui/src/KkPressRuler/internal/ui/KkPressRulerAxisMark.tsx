import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkPressRulerAxisKind } from '../../press-ruler-data';
import type { PlacedAxisLabel } from '../logic/ruler-axis';
import { rulerGoldInk, rulerStampMotion } from './ruler-paint';

const STAMP_STEP_MS = 60;

const ANCHORS: Record<KkPressRulerAxisKind, string> = {
  opening: 'none',
  month: 'translateX(-50%)',
  fest: 'translateX(-50%)',
  summer: 'translateX(-100%)',
};

const KIND_PAINT: Record<KkPressRulerAxisKind, (theme: Theme) => CSSObject> = {
  opening: () => ({
    fontFamily: kkTokens.font.display,
    fontWeight: kkTokens.font.displayWeight,
    color: 'primary.main',
  }),
  month: () => ({ fontWeight: 600, color: 'text.secondary' }),
  fest: (theme) => ({ fontWeight: 800, ...rulerGoldInk(theme) }),
  summer: () => ({ fontWeight: 600, color: 'text.secondary' }),
};

interface KkPressRulerAxisMarkProps {
  label: PlacedAxisLabel;
  order: number;
}

export const KkPressRulerAxisMark: FC<KkPressRulerAxisMarkProps> = ({ label, order }) => {
  const anchored = ANCHORS[label.kind];
  const left = `${label.x}px`;
  const stampDelay = { animationDelay: `${order * STAMP_STEP_MS}ms` };

  return (
    <Typography
      variant="caption"
      component="span"
      sx={[
        {
          position: 'absolute',
          bottom: 0,
          left,
          transform: anchored,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        },
        KIND_PAINT[label.kind],
        rulerStampMotion,
      ]}
    >
      <Box component="span" data-press="stamp" style={stampDelay} sx={{ display: 'inline-block' }}>
        {label.text}
      </Box>
    </Typography>
  );
};
