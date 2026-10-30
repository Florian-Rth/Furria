import { KkHall } from '@furria/ui/KkHall';
import { KkStatusLine } from '@furria/ui/KkStatusLine';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { BACK, BACK_LABEL, FOLLOWING, KEYS_LABEL } from '../heute-a-copy';
import type { HeuteA } from '../hooks/use-heute-a';

interface HeuteKeysProps {
  heute: HeuteA;
}

const KEY_COLUMNS = 'minmax(0, 1fr) minmax(0, 4fr)';
const KEY_HEIGHT = { xs: '5rem', md: '5.5rem' } as const;

export const HeuteKeys: FC<HeuteKeysProps> = ({ heute }) => {
  if (!heute.canDirect) {
    return <KkStatusLine tone="quiet" text={FOLLOWING} />;
  }

  const failure =
    heute.failure === null ? null : <KkStatusLine tone="conflict" text={heute.failure} />;
  const backLocked = !heute.canBack;
  const forwardLocked = !heute.canForward;

  return (
    <Stack sx={{ gap: 0.75, minWidth: 0 }}>
      {failure}
      <Box
        role="group"
        aria-label={KEYS_LABEL}
        sx={{
          display: 'grid',
          gridTemplateColumns: KEY_COLUMNS,
          gap: { xs: 1, md: 1.5 },
          height: KEY_HEIGHT,
        }}
      >
        <KkHall.Key
          glyph="back"
          caption={BACK}
          label={BACK_LABEL}
          disabled={backLocked}
          onPress={heute.back}
        />
        <KkHall.Key
          glyph={heute.forwardGlyph}
          caption={heute.forwardCaption}
          strong
          disabled={forwardLocked}
          onPress={heute.forward}
        />
      </Box>
    </Stack>
  );
};
