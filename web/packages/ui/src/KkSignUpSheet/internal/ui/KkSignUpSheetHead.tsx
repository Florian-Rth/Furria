import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkMeta } from '../../../KkMeta';
import type { KkSx } from '../../../kk-sx';

export type KkSignUpSheetHeading = 'h3' | 'h4' | 'h5';

interface KkSignUpSheetHeadProps {
  title: string;
  count?: string;
  note?: string;
  heading?: KkSignUpSheetHeading;
  sx?: KkSx;
}

export const KkSignUpSheetHead: FC<KkSignUpSheetHeadProps> = ({
  title,
  count,
  note,
  heading = 'h4',
  sx,
}) => {
  const countMeta =
    count === undefined ? null : (
      <KkMeta component="span" sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
        {count}
      </KkMeta>
    );
  const noteLine =
    note === undefined ? null : (
      <Typography
        component="p"
        variant="body2"
        sx={{ m: 0, color: 'text.secondary', overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}
      >
        {note}
      </Typography>
    );

  return (
    <Stack
      data-kk-sign-up-sheet-head
      sx={[{ gap: 0.25, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, minWidth: 0 }}>
        <Typography
          component={heading}
          variant="body1"
          sx={{ flexGrow: 1, fontWeight: 800, lineHeight: 1.3, m: 0, overflowWrap: 'anywhere' }}
        >
          {title}
        </Typography>
        {countMeta}
      </Stack>
      {noteLine}
    </Stack>
  );
};
