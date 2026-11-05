import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { inkWashSurface } from '../../../internal/ink-wash';
import { stepFigures } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';

export type KkTabLedgerHeadTone = 'quiet' | 'attention';

const shown = { opacity: 1, height: 'auto' };
const hidden = { opacity: 0, height: 0 };
const fold = { duration: 0.22, ease: 'easeOut' } as const;

const titlePaint =
  (tone: KkTabLedgerHeadTone) =>
  (theme: Theme): CSSObject => ({
    typography: 'overline',
    fontWeight: 800,
    letterSpacing: kkTokens.type.tracking.label,
    textTransform: 'uppercase',
    lineHeight: 1.3,
    ...(tone === 'attention' ? goldInkOf(theme) : { color: 'text.secondary' }),
  });

interface KkTabLedgerHeadProps {
  title: string;
  meta?: string;
  amount?: string;
  tone?: KkTabLedgerHeadTone;
}

export const KkTabLedgerHead: FC<KkTabLedgerHeadProps> = ({
  title,
  meta,
  amount,
  tone = 'quiet',
}) => {
  const metaSlot =
    meta === undefined ? null : (
      <Box
        component="span"
        sx={{ typography: 'caption', fontWeight: 700, lineHeight: 1.3, color: 'text.secondary' }}
      >
        {meta}
      </Box>
    );
  const amountSlot =
    amount === undefined ? null : (
      <Box
        component="span"
        sx={{
          ...stepFigures,
          flexShrink: 0,
          typography: 'caption',
          fontWeight: 800,
          lineHeight: 1.3,
          color: 'text.secondary',
        }}
      >
        {amount}
      </Box>
    );

  return (
    <Box
      component={motion.li}
      initial={hidden}
      animate={shown}
      exit={hidden}
      transition={fold}
      data-kk-tab-ledger-head
      sx={(theme) => ({
        minWidth: 0,
        borderTopWidth: kkTokens.line.hair,
        borderTopStyle: 'solid',
        borderTopColor: 'divider',
        '&:first-of-type': {
          borderTopWidth: 0,
          borderTopLeftRadius: `${kkTokens.radius.base}px`,
          borderTopRightRadius: `${kkTokens.radius.base}px`,
        },
        ...inkWashSurface(theme, '3%', '5%'),
      })}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'baseline', gap: 1, px: 1.5, pt: 1, pb: 0.5, minWidth: 0 }}
      >
        <Stack
          direction="row"
          sx={{ flex: 1, minWidth: 0, alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap' }}
        >
          <Box component="span" sx={titlePaint(tone)}>
            {title}
          </Box>
          {metaSlot}
        </Stack>
        {amountSlot}
      </Stack>
    </Box>
  );
};
