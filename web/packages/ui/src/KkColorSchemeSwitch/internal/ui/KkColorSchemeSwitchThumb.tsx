import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion, useReducedMotion } from 'motion/react';
import type { FC } from 'react';
import { KkSunMoonMorphIcon } from '../../../KkSunMoonMorphIcon';
import { kkMotion } from '../../../kk-motion';
import type { KkColorSchemeMode } from '../../../theme-color';
import { kkTokens } from '../../../tokens';

const INSET = 0.5;

const thumbPaint =
  (count: number) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    top: theme.spacing(INSET),
    bottom: theme.spacing(INSET),
    left: theme.spacing(INSET),
    width: `calc((100% - ${theme.spacing(INSET * 2)}) / ${count})`,
    alignItems: 'center',
    pt: 1,
    pointerEvents: 'none',
    borderRadius: `${kkTokens.radius.pill}px`,
    color: 'background.paper',
    backgroundColor: 'text.primary',
  });

interface KkColorSchemeSwitchThumbProps {
  scheme: KkColorSchemeMode;
  index: number;
  count: number;
}

export const KkColorSchemeSwitchThumb: FC<KkColorSchemeSwitchThumbProps> = ({
  scheme,
  index,
  count,
}) => {
  const reducedMotion = useReducedMotion();
  const glide = reducedMotion === true ? { duration: 0 } : kkMotion.layoutGlide;

  return (
    <Stack
      component={motion.div}
      aria-hidden
      initial={false}
      animate={{ x: `${index * 100}%` }}
      transition={glide}
      sx={thumbPaint(count)}
    >
      <KkSunMoonMorphIcon scheme={scheme} />
    </Stack>
  );
};
