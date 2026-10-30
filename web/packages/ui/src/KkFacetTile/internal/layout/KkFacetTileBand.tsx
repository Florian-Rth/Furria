import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const bandPaint = (theme: Theme): CSSObject => ({
  minWidth: 0,
  gap: 1.25,
  '& > *': { flex: '1 1 0', minWidth: 0 },
  '& > * + *': {
    pl: 1.25,
    borderLeftWidth: kkTokens.line.hair,
    borderLeftStyle: 'solid',
    borderLeftColor: (theme.vars ?? theme).palette.divider,
  },
});

interface KkFacetTileBandProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkFacetTileBand: FC<KkFacetTileBandProps> = ({ sx, children }) => (
  <Stack direction="row" data-kk-facet-band sx={[bandPaint, ...(Array.isArray(sx) ? sx : [sx])]}>
    {children}
  </Stack>
);
