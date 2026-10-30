import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsSetupListProps extends PropsWithChildren {
  label: string;
}

export const KkEightsSetupList: FC<KkEightsSetupListProps> = ({ label, children }) => (
  <Stack
    component="ul"
    aria-label={label}
    sx={(theme) => ({
      m: 0,
      p: 0,
      listStyle: 'none',
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    })}
  >
    {children}
  </Stack>
);
