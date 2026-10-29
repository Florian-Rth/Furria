import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC, Ref } from 'react';
import { kkTokens } from '../../../tokens';
import { HANDOVER } from '../studio-b-manual-motion';

const HEAD = {
  listStyle: 'none',
  display: 'grid',
  gridTemplateColumns: 'auto auto minmax(1rem, 1fr) auto',
  alignItems: 'center',
  columnGap: 1,
  minWidth: 0,
  pt: 2,
  pb: 0.5,
  px: 1,
} as const;

const squarePaint =
  (current: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '0.625rem',
    height: '0.625rem',
    backgroundColor: current
      ? (theme.vars ?? theme).palette.primary.main
      : (theme.vars ?? theme).palette.text.primary,
    transition: 'background-color 240ms ease-out',
  });

const NAME = {
  fontFamily: kkTokens.font.display,
  typography: 'subtitle1',
  lineHeight: 1,
  letterSpacing: kkTokens.type.tracking.label,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
} as const;

const RULE = { height: kkTokens.line.hair, bgcolor: 'divider' } as const;

const META = {
  typography: 'caption',
  lineHeight: 1,
  color: 'text.secondary',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
} as const;

interface KkStudioBManualPartProps {
  name: string;
  meta: string;
  current: boolean;
  ref?: Ref<HTMLElement>;
}

export const KkStudioBManualPart: FC<KkStudioBManualPartProps> = ({ name, meta, current, ref }) => (
  <Box
    component={motion.li}
    ref={ref}
    layout="position"
    transition={HANDOVER}
    data-kk-studio-b-part
    sx={HEAD}
  >
    <Box component="span" aria-hidden sx={squarePaint(current)} />
    <Box component="h3" sx={[NAME, { m: 0 }]}>
      {name}
    </Box>
    <Box component="span" aria-hidden sx={RULE} />
    <Box component="span" sx={META}>
      {meta}
    </Box>
  </Box>
);
