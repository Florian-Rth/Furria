import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC, MouseEvent } from 'react';
import { focusRing } from '../internal/focus-ring';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkPourCount } from './KkPourCountPicker';
import type { KkPourCrateTone } from './KkPourCrate';
import { KkPourCrate } from './KkPourCrate';

const CRATE_WIDTH = '7.5rem';
const TILTS = [-1.5, 2, -2.5] as const;
const OVERLAP = '-0.5rem';

const SETTLE: Transition = {
  type: 'spring',
  stiffness: 460,
  damping: 16,
  scale: { duration: 0.36, ease: 'easeOut' },
};

const cratePaint = (theme: Theme): CSSObject => ({
  width: CRATE_WIDTH,
  borderRadius: `${kkTokens.radius.base}px`,
  p: 0.5,
  ...focusRing(theme),
  '&.Mui-disabled': { pointerEvents: 'none' },
});

const goneOf = (order: number): Transition => ({
  type: 'spring',
  stiffness: 140,
  damping: 18,
  delay: order * 0.09,
});

const toneOf = (disabled: boolean, filled: boolean): KkPourCrateTone => {
  if (disabled) {
    return 'faint';
  }

  return filled ? 'accent' : 'ink';
};

interface KkPourCrateStackProps {
  label: string;
  counts: readonly KkPourCount[];
  value: number;
  gone: boolean;
  onChange: (value: number) => void;
  sx?: KkSx;
}

export const KkPourCrateStack: FC<KkPourCrateStackProps> = ({
  label,
  counts,
  value,
  gone,
  onChange,
  sx,
}) => {
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    onChange(Number(event.currentTarget.dataset.value));
  };
  const crates = [...counts].reverse().map((count, order) => {
    const filled = count.value <= value && !count.disabled;
    const tone = toneOf(count.disabled, filled);
    const tilt = TILTS[(count.value - 1) % TILTS.length] ?? 0;
    const rest = { x: 0, y: 0, opacity: 1, rotate: tilt, scale: filled ? [1, 1.05, 1] : 1 };
    const away = { x: '140%', y: -24, opacity: 0, rotate: tilt + 18, scale: 1 };
    const faded = { ...rest, opacity: 0, scale: 0.9 };
    const leaving = filled ? away : faded;
    const animate = gone ? leaving : rest;
    const transition = gone ? goneOf(order) : SETTLE;
    const marginTop = order === 0 ? 0 : OVERLAP;

    return (
      <motion.div
        key={count.value}
        style={{ marginTop, zIndex: order }}
        initial={false}
        animate={animate}
        transition={transition}
      >
        <ButtonBase
          role="radio"
          aria-checked={count.value === value}
          aria-label={count.label}
          data-value={count.value}
          data-kk-pour-stack-crate={count.value}
          disabled={count.disabled || gone}
          onClick={choose}
          sx={cratePaint}
        >
          <KkPourCrate filled={filled} size="stage" tone={tone} />
        </ButtonBase>
      </motion.div>
    );
  });

  return (
    <Stack
      role="radiogroup"
      aria-label={label}
      data-kk-pour-crate-stack
      sx={[{ alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {crates}
    </Stack>
  );
};
