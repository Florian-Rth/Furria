import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioIOverviewRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioIOverviewRoot: FC<KkStudioIOverviewRootProps> = ({ label, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-studio-i-overview
    sx={(theme) => ({
      minWidth: 0,
      minHeight: 0,
      height: '100%',
      gap: 2,
      p: 1.5,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: (theme.vars ?? theme).palette.background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
    })}
  >
    {children}
  </Stack>
);
