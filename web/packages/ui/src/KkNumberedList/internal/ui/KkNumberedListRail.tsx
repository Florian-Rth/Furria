import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { redInk } from '../../../internal/red-ink';
import type { KkSeverity } from '../../../KkSeverityGlyph';
import { KkSeverityGlyph } from '../../../KkSeverityGlyph';
import { kkMotion } from '../../../kk-motion';
import {
  GUTTER_WIDTH,
  goldWashSurface,
  NUMBER_WIDTH,
  ROW_PADDING_X,
  redWashSurface,
} from './numbered-list-paint';

const washOf = (theme: Theme, severity: KkSeverity): CSSObject =>
  severity === 'conflict'
    ? redWashSurface(theme, '8%', '16%')
    : goldWashSurface(theme, '9%', '13%');

const inkOf = (theme: Theme, severity: KkSeverity): CSSObject =>
  severity === 'conflict' ? redInk(theme) : goldInkOf(theme);

const ARRIVE = { opacity: 0 };
const SHOWN = { opacity: 1 };

interface KkNumberedListRailProps {
  railKey: string;
  severity: KkSeverity;
  text: ReactNode;
  action?: ReactNode;
}

export const KkNumberedListRail: FC<KkNumberedListRailProps> = ({
  railKey,
  severity,
  text,
  action,
}) => {
  const actionSlot =
    action === undefined || action === null ? null : (
      <Box component="span" sx={{ flexShrink: 0, maxWidth: '100%', ml: 'auto' }}>
        {action}
      </Box>
    );

  return (
    <Box
      component={motion.li}
      layout="position"
      initial={ARRIVE}
      animate={SHOWN}
      transition={kkMotion.layoutGlide}
      data-kk-numbered-rail={severity}
      data-kk-numbered-rail-key={railKey}
      sx={(theme) => ({
        position: 'relative',
        minWidth: 0,
        ...washOf(theme, severity),
      })}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: 1,
          rowGap: 0.5,
          minWidth: 0,
          minHeight: '1.75rem',
          py: 0.375,
          pr: ROW_PADDING_X,
        }}
      >
        <Box component="span" sx={{ width: GUTTER_WIDTH, flexShrink: 0 }} />
        <Stack component="span" sx={{ width: NUMBER_WIDTH, flexShrink: 0, alignItems: 'flex-end' }}>
          <KkSeverityGlyph state={severity} size="medium" />
        </Stack>
        <Box
          component="span"
          sx={(theme) => ({
            flex: '1 1 9rem',
            minWidth: 0,
            typography: 'caption',
            fontWeight: 800,
            lineHeight: 1.3,
            ...inkOf(theme, severity),
          })}
        >
          {text}
        </Box>
        {actionSlot}
      </Stack>
    </Box>
  );
};
