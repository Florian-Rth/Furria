import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkEjPanelDanger: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-ej-danger
    sx={(theme) => ({
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: 1,
      rowGap: 0.5,
      pt: 1.25,
      borderTop: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
    })}
  >
    {children}
  </Stack>
);
