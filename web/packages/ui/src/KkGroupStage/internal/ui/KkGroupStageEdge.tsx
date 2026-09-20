import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneEdgeScheme } from '../../../internal/group-tone';
import { applyScheme } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';

interface KkGroupStageEdgeProps {
  tone: KkGroupTone;
}

export const KkGroupStageEdge: FC<KkGroupStageEdgeProps> = ({ tone }) => (
  <Box
    aria-hidden
    data-kk-group-stage-edge
    sx={(theme) => ({
      width: '100%',
      borderBottomWidth: kkTokens.line.page,
      borderBottomStyle: 'solid',
      ...applyScheme(theme, groupToneEdgeScheme(tone)),
    })}
  />
);
