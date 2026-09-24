import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../tokens';
import type { KkGroupTone } from './group-tone';
import { groupToneEdgeScheme } from './group-tone';
import { applyScheme } from './scheme-paint';

interface KkGroupToneRailProps {
  tone: KkGroupTone;
}

export const KkGroupToneRail: FC<KkGroupToneRailProps> = ({ tone }) => (
  <Box
    aria-hidden
    data-kk-group-tone-rail
    sx={(theme) => ({
      width: 0,
      alignSelf: 'stretch',
      flexShrink: 0,
      borderLeftWidth: kkTokens.line.page,
      borderLeftStyle: 'solid',
      ...applyScheme(theme, groupToneEdgeScheme(tone)),
    })}
  />
);
