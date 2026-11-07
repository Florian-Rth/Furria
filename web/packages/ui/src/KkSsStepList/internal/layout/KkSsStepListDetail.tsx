import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkSsStepListDetailProps extends PropsWithChildren {
  label: string;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkSsStepListDetail: FC<KkSsStepListDetailProps> = ({ label, children }) => (
  <Stack
    role="group"
    aria-label={label}
    sx={(theme) => ({
      minWidth: 0,
      gap: 1,
      px: 1,
      pt: 1,
      pb: 1.25,
      borderTop: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
    })}
  >
    {children}
  </Stack>
);
