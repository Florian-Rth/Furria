import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC, Ref } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';
import { HANDOVER } from '../studio-b-manual-motion';

const loosePaint = (theme: Theme): CSSObject => ({
  listStyle: 'none',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  columnGap: theme.spacing(1),
  minHeight: kkTokens.tapTarget,
  px: 1,
  borderLeftWidth: kkTokens.line.page,
  borderLeftStyle: 'solid',
  borderLeftColor: (theme.vars ?? theme).palette.warning.main,
});

const NAME = {
  typography: 'body2',
  fontWeight: 700,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const noteInk = (theme: Theme): CSSObject => ({
  ...goldInkOf(theme),
  typography: 'caption',
  fontWeight: 800,
  whiteSpace: 'nowrap',
});

interface KkStudioBManualLooseProps {
  name: string;
  note: string;
  ref?: Ref<HTMLElement>;
}

export const KkStudioBManualLoose: FC<KkStudioBManualLooseProps> = ({ name, note, ref }) => (
  <Box
    component={motion.li}
    ref={ref}
    layout="position"
    transition={HANDOVER}
    data-kk-studio-b-loose
    sx={loosePaint}
  >
    <Box component="span" sx={NAME}>
      {name}
    </Box>
    <Box component="span" sx={noteInk}>
      {note}
    </Box>
  </Box>
);
