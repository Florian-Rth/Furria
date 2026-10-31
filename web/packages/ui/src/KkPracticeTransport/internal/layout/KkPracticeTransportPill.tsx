import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export const KkPracticeTransportPill: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-practice-pill
    sx={(theme) => ({
      alignSelf: 'center',
      alignItems: 'center',
      gap: 0.25,
      p: 0.5,
      borderRadius: `${kkTokens.radius.pill}px`,
      backgroundColor: (theme.vars ?? theme).palette.background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}, ${kkTokens.shadow.rest}`,
    })}
  >
    {children}
  </Stack>
);
