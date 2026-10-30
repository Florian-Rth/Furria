import { KkStatusLine } from '@furria/ui/KkStatusLine';
import { KkText } from '@furria/ui/KkText';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  FOLLOWING,
  LOAD_FAILED_TEXT,
  LOAD_FAILED_TITLE,
  LOADING,
  NEXT,
  NO_ORDER,
  ON_STAGE,
  OVERRUN,
} from '../heute-c-copy';
import type { HeuteCState } from '../hooks/use-heute-c';
import { HeuteCActBlock } from './HeuteCActBlock';
import { HeuteCStateBlock } from './HeuteCStateBlock';

const BLOCK = {
  minHeight: 0,
  display: 'grid',
  alignContent: 'start',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
};

interface HeuteCCentreProps {
  heute: HeuteCState;
}

export const HeuteCCentre: FC<HeuteCCentreProps> = ({ heute }) => {
  if (heute.isLoading) {
    return <KkText tone="secondary">{LOADING}</KkText>;
  }
  if (heute.isFailed) {
    return <HeuteCStateBlock title={LOAD_FAILED_TITLE} text={LOAD_FAILED_TEXT} />;
  }
  if (heute.isEmpty) {
    return <HeuteCStateBlock title={heute.heading} text={NO_ORDER} />;
  }

  const now =
    heute.now === null ? (
      <HeuteCStateBlock title={heute.stateTitle ?? ''} text={heute.stateText} />
    ) : (
      <HeuteCActBlock
        eyebrow={ON_STAGE}
        act={heute.now}
        elapsed={heute.nowElapsed}
        after={null}
        strong
      />
    );
  const next =
    heute.next === null ? null : (
      <HeuteCActBlock
        eyebrow={NEXT}
        act={heute.next}
        elapsed={null}
        after={heute.afterName}
        strong={false}
      />
    );
  const failure = heute.isOverrun ? OVERRUN : heute.moveError;
  const quiet = heute.canDirect ? null : <KkStatusLine tone="quiet" text={FOLLOWING} />;
  const note = failure === null ? quiet : <KkStatusLine tone="conflict" text={failure} />;

  return (
    <Stack
      component="section"
      aria-label={ON_STAGE}
      sx={{ height: '100%', minHeight: 0, gap: 1.5, minWidth: 0 }}
    >
      <Box sx={{ ...BLOCK, flex: 3 }}>{now}</Box>
      <Box sx={{ ...BLOCK, flex: 2 }}>{next}</Box>
      {note}
    </Stack>
  );
};
