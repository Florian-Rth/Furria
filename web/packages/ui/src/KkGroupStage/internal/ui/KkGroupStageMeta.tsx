import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { KkMeta } from '../../../KkMeta';
import type { KkSx } from '../../../kk-sx';
import { groupStageRevealAt } from '../group-stage-motion';
import { GROUP_STAGE_STEPS } from '../group-stage-reveal';

const SEPARATOR = ' · ';

interface KkGroupStageMetaProps {
  facts: readonly string[];
  chip?: ReactNode;
  sx?: KkSx;
}

export const KkGroupStageMeta: FC<KkGroupStageMetaProps> = ({ facts, chip, sx }) => {
  const line = facts.join(SEPARATOR);
  const factLine = line === '' ? null : <KkMeta component="span">{line}</KkMeta>;

  if (factLine === null && chip === undefined) {
    return null;
  }

  return (
    <Stack
      direction="row"
      data-kk-group-stage-meta
      sx={[
        {
          minWidth: 0,
          gap: 1.25,
          alignItems: 'center',
          flexWrap: 'wrap',
          ...groupStageRevealAt(GROUP_STAGE_STEPS.meta),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {factLine}
      {chip}
    </Stack>
  );
};
