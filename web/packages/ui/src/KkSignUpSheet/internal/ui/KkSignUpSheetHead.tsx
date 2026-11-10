import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkMeta } from '../../../KkMeta';
import type { KkSx } from '../../../kk-sx';

export type KkSignUpSheetHeading = 'h3' | 'h4' | 'h5';

interface KkSignUpSheetHeadProps {
  title: string;
  hint?: string;
  meta?: string;
  heading?: KkSignUpSheetHeading;
  sx?: KkSx;
}

export const KkSignUpSheetHead: FC<KkSignUpSheetHeadProps> = ({
  title,
  hint,
  meta,
  heading = 'h4',
  sx,
}) => {
  const hintLine =
    hint === undefined ? null : (
      <Typography
        component="p"
        variant="body2"
        sx={{ m: 0, color: 'text.secondary', overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}
      >
        {hint}
      </Typography>
    );
  const metaLine = meta === undefined ? null : <KkMeta component="span">{meta}</KkMeta>;

  return (
    <Stack
      data-kk-sign-up-sheet-head
      sx={[{ gap: 0.25, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Typography
        component={heading}
        variant="body1"
        sx={{ fontWeight: 800, lineHeight: 1.3, m: 0, overflowWrap: 'anywhere' }}
      >
        {title}
      </Typography>
      {hintLine}
      {metaLine}
    </Stack>
  );
};
