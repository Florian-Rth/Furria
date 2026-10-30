import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const FRAMED: CSSObject = {
  px: 2,
  py: 1.5,
  bgcolor: 'background.paper',
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  borderRadius: `${kkTokens.radius.base}px`,
};

interface KkPassDetailsRootProps extends PropsWithChildren {
  label: string;
  framed: boolean;
  sx?: KkSx;
}

export const KkPassDetailsRoot: FC<KkPassDetailsRootProps> = ({ label, framed, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-pass-details
    sx={[
      { minWidth: 0, gap: 1.75, pb: framed ? 1.5 : 1, px: framed ? 0 : 2 },
      framed && FRAMED,
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
