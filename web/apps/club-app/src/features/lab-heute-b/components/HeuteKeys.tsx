import { KkAlert } from '@furria/ui/KkAlert';
import { KkHall } from '@furria/ui/KkHall';
import { KkMeta } from '@furria/ui/KkMeta';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { BACK_CAPTION, BACK_LABEL, FOLLOWING_NOTE, KEYS_LABEL } from '../heute-b-copy';
import { HEUTE_WIDE, KEY_ROW_HEIGHT } from '../heute-layout';
import type { Heute } from '../hooks/use-heute';

interface HeuteKeysProps {
  heute: Heute;
}

export const HeuteKeys: FC<HeuteKeysProps> = ({ heute }) => {
  const hint =
    heute.forwardHint === null ? null : (
      <Box sx={{ [HEUTE_WIDE]: { display: 'none' } }}>
        <KkMeta>{heute.forwardHint}</KkMeta>
      </Box>
    );
  const failure = heute.failure === null ? null : <KkAlert>{heute.failure}</KkAlert>;

  if (!heute.canDirect) {
    return <KkMeta>{FOLLOWING_NOTE}</KkMeta>;
  }

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      {failure}
      {hint}
      <Box
        role="group"
        aria-label={KEYS_LABEL}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 3fr)',
          gap: 1,
          height: KEY_ROW_HEIGHT,
          minWidth: 0,
        }}
      >
        <KkHall.Key
          glyph="back"
          caption={BACK_CAPTION}
          label={BACK_LABEL}
          disabled={!heute.canBack}
          onPress={heute.back}
        />
        <KkHall.Key
          glyph="next"
          caption={heute.forwardCaption}
          label={heute.forwardCaption}
          strong
          disabled={!heute.canForward}
          onPress={heute.forward}
        />
      </Box>
    </Stack>
  );
};
