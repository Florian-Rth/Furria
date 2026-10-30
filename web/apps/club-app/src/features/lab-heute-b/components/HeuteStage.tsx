import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkRule } from '@furria/ui/KkRule';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  ACT_ELAPSED_LABEL,
  BEFORE_TITLE,
  ENDED_TITLE,
  NEXT_TITLE,
  NO_LINES,
  NOW_TITLE,
} from '../heute-b-copy';
import type { Heute } from '../hooks/use-heute';
import { HeuteActBlock } from './HeuteActBlock';
import { HeuteElapsed } from './HeuteElapsed';

interface HeuteStageProps {
  heute: Heute;
}

export const HeuteStage: FC<HeuteStageProps> = ({ heute }) => {
  const { flow, total } = heute;

  if (total === 0) {
    return <KkMeta>{NO_LINES}</KkMeta>;
  }
  if (flow.state === 'ended') {
    return (
      <KkHeading level={1} component="h2">
        {ENDED_TITLE}
      </KkHeading>
    );
  }

  const elapsed = <HeuteElapsed label={ACT_ELAPSED_LABEL} since={heute.actSince} large />;
  const now =
    flow.now === null ? (
      <KkHeading level={3} component="h2">
        {BEFORE_TITLE}
      </KkHeading>
    ) : (
      <HeuteActBlock
        title={NOW_TITLE}
        line={flow.now}
        number={heute.nowNumber}
        total={total}
        level={1}
        aside={elapsed}
      />
    );
  const nextLevel = flow.now === null ? 1 : 3;
  const next =
    flow.next === null ? null : (
      <HeuteActBlock
        title={NEXT_TITLE}
        line={flow.next}
        number={heute.nextNumber}
        total={total}
        level={nextLevel}
      />
    );
  const after = heute.afterLine === null ? null : <KkMeta>{heute.afterLine}</KkMeta>;
  const rule = next === null ? null : <KkRule weight="hair" />;

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      {now}
      {rule}
      {next}
      {after}
    </Stack>
  );
};
