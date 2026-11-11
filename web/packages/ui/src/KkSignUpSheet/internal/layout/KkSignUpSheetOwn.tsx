import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { useId } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { KkEyebrow } from '../../../KkEyebrow';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkSignUpSheetOwnProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

const ownPaint = (theme: Theme): CSSObject => ({
  gap: theme.spacing(0.5),
  minWidth: 0,
  padding: theme.spacing(1, 1.5, 1.5),
  borderRadius: `${kkTokens.radius.bar * 3}px`,
  backgroundColor: inkWash(theme, '7%'),
});

export const KkSignUpSheetOwn: FC<KkSignUpSheetOwnProps> = ({ label, sx, children }) => {
  const labelId = useId();

  return (
    <Stack
      component="section"
      aria-labelledby={labelId}
      data-kk-sign-up-sheet-own
      sx={[ownPaint, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkEyebrow tone="muted" sx={{ lineHeight: 1.6 }}>
        <span id={labelId}>{label}</span>
      </KkEyebrow>
      {children}
    </Stack>
  );
};
