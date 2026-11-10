import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkBroomMark } from '../../../KkBroomMark';
import { kkTokens } from '../../../tokens';
import { PROMO_GUTTER, PROMO_MASTHEAD_TOP } from '../promo-paint';

const MARK_SIZE = 30;
const STAR = '✶';

interface KkPromoStageMastheadProps {
  wordmark: string;
  meta: readonly string[];
}

export const KkPromoStageMasthead: FC<KkPromoStageMastheadProps> = ({ wordmark, meta }) => (
  <Stack
    direction="row"
    data-kk-promo-masthead
    sx={{
      position: 'absolute',
      left: PROMO_GUTTER,
      right: PROMO_GUTTER,
      top: PROMO_MASTHEAD_TOP,
      alignItems: 'center',
      gap: 2,
      zIndex: 4,
    }}
  >
    <Box sx={{ color: 'primary.main' }}>
      <KkBroomMark size={MARK_SIZE} />
    </Box>
    <Typography variant="h3" component="p" sx={{ letterSpacing: kkTokens.type.tracking.display }}>
      {wordmark}
    </Typography>
    <Box
      aria-hidden
      sx={{ flexGrow: 1, borderBottom: kkTokens.line.section, borderColor: 'text.primary' }}
    />
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
      {meta.map((item, index) => (
        <Stack key={item} direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          {index > 0 && (
            <Box component="span" aria-hidden sx={{ color: 'warning.main' }}>
              {STAR}
            </Box>
          )}
          <Typography variant="overline" sx={{ ...kkTokens.eyebrow, color: 'text.secondary' }}>
            {item}
          </Typography>
        </Stack>
      ))}
    </Stack>
  </Stack>
);
