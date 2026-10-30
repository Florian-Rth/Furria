import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusTopGroupProps extends PropsWithChildren {
  label: string;
  divided?: boolean;
}

export const KkFocusTopGroup: FC<KkFocusTopGroupProps> = ({ label, divided = false, children }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    sx={(theme) => ({
      alignItems: 'center',
      gap: 0.25,
      flex: 'none',
      pl: divided ? 0.75 : 0,
      ml: divided ? 0.25 : 0,
      borderLeft: divided ? `${kkTokens.line.hair}px solid ${palette(theme).divider}` : 'none',
    })}
  >
    {children}
  </Stack>
);
