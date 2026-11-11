import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { useId } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';
import type { KkSx } from '../../../kk-sx';

interface KkSignUpSheetLinesProps extends PropsWithChildren {
  heading: string;
  busy?: boolean;
  sx?: KkSx;
}

export const KkSignUpSheetLines: FC<KkSignUpSheetLinesProps> = ({
  heading,
  busy = false,
  sx,
  children,
}) => {
  const headingId = useId();

  return (
    <Stack
      data-kk-sign-up-sheet-lines
      sx={[{ gap: 0.25, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkEyebrow tone="muted" sx={{ lineHeight: 1.6 }}>
        <span id={headingId}>{heading}</span>
      </KkEyebrow>
      <Stack
        component="ol"
        aria-labelledby={headingId}
        aria-busy={busy}
        sx={{ minWidth: 0, m: 0, p: 0, listStyle: 'none' }}
      >
        {children}
      </Stack>
    </Stack>
  );
};
