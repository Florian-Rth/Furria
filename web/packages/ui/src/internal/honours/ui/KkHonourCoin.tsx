import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { KkClubIconGlyph } from '../../../KkClubIconGlyph';
import { kkTokens } from '../../../tokens';
import { focusRing } from '../../focus-ring';
import { flagRevealOf } from '../honour-flag';
import type { HonourCoin } from '../honour-functions';
import type { MotionStaging } from '../honour-motion';
import { coinTransition, settledAt } from '../honour-motion';
import { coinPaint, coinRimPaint, overflowCoinPaint } from '../honour-paint';
import { KkHonourFlag } from './KkHonourFlag';

const ICON_INSET = '17%';
const POP_FROM = { opacity: 0, scale: 0.2, rotate: -60 } as const;
const POP_TO = { opacity: 1, scale: 1, rotate: 0 } as const;
const STILL = settledAt(POP_TO);
const MORE_FACE = {
  typography: 'caption',
  fontFamily: kkTokens.font.display,
  fontWeight: kkTokens.font.displayWeight,
  lineHeight: 1,
} as const;

const coinFace =
  (rim: number, inset: string) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    borderWidth: rim,
    borderStyle: 'solid',
    padding: inset,
    margin: 0,
    appearance: 'none',
    ...coinRimPaint(theme),
  });

const interactiveFace = (theme: Theme): CSSObject => ({
  cursor: 'pointer',
  ...focusRing(theme),
  ...flagRevealOf('coin'),
});

interface KkHonourCoinProps {
  coin: HonourCoin;
  interactive: boolean;
  showIcon: boolean;
  order: number;
  arrive: boolean;
  open: boolean;
  onToggle: (key: string) => void;
  onClose: () => void;
}

export const KkHonourCoin: FC<KkHonourCoinProps> = ({
  coin,
  interactive,
  showIcon,
  order,
  arrive,
  open,
  onToggle,
  onClose,
}) => {
  const label = coin.kind === 'more' ? coin.label : coin.function.label;
  const paint = coin.kind === 'more' ? overflowCoinPaint : coinPaint(coin.function);
  const rim = showIcon ? kkTokens.line.section : kkTokens.line.hair;
  const inset = showIcon && coin.kind === 'function' ? ICON_INSET : '0';
  const face = coinFace(rim, inset);
  const pop: MotionStaging = arrive
    ? { initial: POP_FROM, animate: POP_TO, transition: coinTransition(order) }
    : STILL;
  const more = coin.kind === 'more' ? `+${coin.count}` : null;
  const glyph =
    coin.kind === 'function' ? (
      <KkClubIconGlyph icon={coin.function.icon} />
    ) : (
      <Box component="span" sx={MORE_FACE}>
        {more}
      </Box>
    );
  const content = showIcon ? glyph : null;

  const toggle = (): void => {
    onToggle(coin.key);
  };

  if (!interactive) {
    return (
      <Stack
        component={motion.span}
        aria-hidden
        data-kk-honour-coin={coin.kind}
        initial={pop.initial}
        animate={pop.animate}
        transition={pop.transition}
        sx={[face, paint]}
      >
        {content}
      </Stack>
    );
  }

  return (
    <Stack
      component={motion.button}
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={toggle}
      onBlur={onClose}
      data-kk-honour-coin={coin.kind}
      initial={pop.initial}
      animate={pop.animate}
      transition={pop.transition}
      sx={[face, paint, interactiveFace]}
    >
      {content}
      <KkHonourFlag label={label} tone="coin" />
    </Stack>
  );
};
