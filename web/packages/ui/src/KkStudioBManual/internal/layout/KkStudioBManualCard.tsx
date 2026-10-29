import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren, Ref } from 'react';
import { redInk } from '../../../internal/red-ink';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { HANDOVER } from '../studio-b-manual-motion';

const BAR_CLEARANCE = `${kkTokens.shell.gutter * 3 + kkTokens.shell.barHeight}px`;

const cardPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  minWidth: 0,
  p: 1.5,
  pl: 2,
  listStyle: 'none',
  borderRadius: `${kkTokens.radius.base}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  backgroundColor: (theme.vars ?? theme).palette.background.paper,
  boxShadow: kkTokens.shadow.raised,
  scrollMarginTop: BAR_CLEARANCE,
  '&::before': {
    ...redInk(theme),
    content: '""',
    position: 'absolute',
    left: 0,
    top: theme.spacing(1.5),
    bottom: theme.spacing(1.5),
    width: kkTokens.line.page,
    borderRadius: `${kkTokens.radius.bar}px`,
    backgroundColor: 'currentColor',
  },
});

export type KkStudioBManualCardPlacement = 'inList' | 'aside';

const CARD_ELEMENT = { inList: motion.li, aside: motion.section } as const;

const ASIDE_PAINT = { position: 'sticky', top: BAR_CLEARANCE, zIndex: 1 } as const;

const PLACEMENT_PAINT = { inList: {}, aside: ASIDE_PAINT } as const;

interface KkStudioBManualCardProps extends PropsWithChildren {
  label: string;
  placement: KkStudioBManualCardPlacement;
  ref?: Ref<HTMLElement>;
  sx?: KkSx;
}

export const KkStudioBManualCard: FC<KkStudioBManualCardProps> = ({
  label,
  placement,
  ref,
  sx,
  children,
}) => (
  <Box
    component={CARD_ELEMENT[placement]}
    ref={ref}
    layout="position"
    transition={HANDOVER}
    aria-label={label}
    aria-current="step"
    data-kk-studio-b-card
    sx={[cardPaint, PLACEMENT_PAINT[placement], ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Box>
);
