import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';
import type { KkSx } from '../../../kk-sx';

const SESSION_WORD = 'SESSION';

interface KkMottoStageMetaProps {
  sessionLabel: string;
  numberLabel: string | null;
  sx?: KkSx;
}

export const KkMottoStageMeta: FC<KkMottoStageMetaProps> = ({ sessionLabel, numberLabel, sx }) => {
  const session = `${SESSION_WORD} ${sessionLabel}`;
  const number =
    numberLabel === null ? null : (
      <KkEyebrow tone="muted" size="small">
        {numberLabel}
      </KkEyebrow>
    );

  return (
    <Stack
      direction="row"
      data-kk-motto-stage-meta
      sx={[
        {
          width: '100%',
          gap: 2,
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          minWidth: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkEyebrow tone="accent" size="small">
        {session}
      </KkEyebrow>
      {number}
    </Stack>
  );
};
