import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { PROMO_FOOT_HEIGHT, PROMO_GUTTER } from '../promo-paint';

const INDEX_LIFT = 30;

interface KkPromoStageIndexProps {
  items: readonly string[];
  active: number;
}

export const KkPromoStageIndex: FC<KkPromoStageIndexProps> = ({ items, active }) => (
  <Stack
    direction="row"
    data-kk-promo-index
    sx={{
      position: 'absolute',
      left: PROMO_GUTTER,
      bottom: PROMO_FOOT_HEIGHT + INDEX_LIFT,
      gap: 2,
      zIndex: 4,
      opacity: active < 0 ? 0 : 1,
      transition: 'opacity 500ms ease',
    }}
  >
    {items.map((item, index) => (
      <Stack
        key={item}
        direction="row"
        sx={{
          alignItems: 'baseline',
          gap: 0.75,
          opacity: index === active ? 1 : 0.38,
          color: index === active ? 'primary.main' : 'text.primary',
          transition: 'opacity 450ms ease, color 450ms ease',
        }}
      >
        <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
          {index + 1}
        </Typography>
        {index === active && (
          <Typography variant="overline" sx={{ ...kkTokens.eyebrow, color: 'text.primary' }}>
            {item}
          </Typography>
        )}
      </Stack>
    ))}
  </Stack>
);
