import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkSsStepListGroupProps extends PropsWithChildren {
  label: string;
  framed: boolean;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkSsStepListGroup: FC<KkSsStepListGroupProps> = ({ label, framed, children }) => (
  <Stack
    role="group"
    aria-label={label}
    sx={(theme) => ({
      minWidth: 0,
      gap: 0.25,
      ...(framed
        ? {
            pl: 1,
            borderLeft: `${kkTokens.line.page}px solid ${palette(theme).text.primary}`,
          }
        : {}),
    })}
  >
    {children}
  </Stack>
);
