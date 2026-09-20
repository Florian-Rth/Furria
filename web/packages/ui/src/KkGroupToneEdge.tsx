import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneEdgeScheme } from './internal/group-tone';
import { applyScheme } from './internal/scheme-paint';
import { kkTokens } from './tokens';

interface KkGroupToneEdgeProps {
  tone: KkGroupTone;
}

export const KkGroupToneEdge: FC<KkGroupToneEdgeProps> = ({ tone }) => (
  <Box
    aria-hidden
    data-kk-group-tone-edge
    sx={(theme) => ({
      width: '100%',
      flexShrink: 0,
      borderBottomWidth: kkTokens.line.page,
      borderBottomStyle: 'solid',
      ...applyScheme(theme, groupToneEdgeScheme(tone)),
    })}
  />
);
