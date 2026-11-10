import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkMeta } from '../../../KkMeta';
import type { KkSx } from '../../../kk-sx';

export type KkPollBallotHeading = 'h3' | 'h4' | 'h5';

interface KkPollBallotHeadProps {
  question: string;
  meta?: string;
  heading?: KkPollBallotHeading;
  sx?: KkSx;
}

export const KkPollBallotHead: FC<KkPollBallotHeadProps> = ({
  question,
  meta,
  heading = 'h4',
  sx,
}) => {
  const metaLine = meta === undefined ? null : <KkMeta component="span">{meta}</KkMeta>;

  return (
    <Stack
      data-kk-poll-ballot-head
      sx={[{ gap: 0.25, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Typography
        component={heading}
        variant="body1"
        sx={{ fontWeight: 800, lineHeight: 1.3, m: 0, overflowWrap: 'anywhere' }}
      >
        {question}
      </Typography>
      {metaLine}
    </Stack>
  );
};
