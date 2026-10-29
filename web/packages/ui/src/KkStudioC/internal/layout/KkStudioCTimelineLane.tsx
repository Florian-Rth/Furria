import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkStudioCLaneKind } from '../../studio-c-types';
import { LANE_HEIGHTS } from '../studio-c-lanes';

const lanePaint =
  (kind: KkStudioCLaneKind) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flexShrink: 0,
    height: theme.spacing(LANE_HEIGHTS[kind]),
    borderBottomWidth: kkTokens.line.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: (theme.vars ?? theme).palette.divider,
  });

interface KkStudioCTimelineLaneProps extends PropsWithChildren {
  kind: KkStudioCLaneKind;
}

export const KkStudioCTimelineLane: FC<KkStudioCTimelineLaneProps> = ({ kind, children }) => (
  <Box data-kk-studio-c-lane={kind} sx={lanePaint(kind)}>
    {children}
  </Box>
);
