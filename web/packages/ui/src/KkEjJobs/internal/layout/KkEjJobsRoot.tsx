import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEjJobsRootProps extends PropsWithChildren {
  label: string;
}

export const KkEjJobsRoot: FC<KkEjJobsRootProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="radiogroup"
    aria-label={label}
    data-kk-ej-jobs
    sx={(theme) => ({
      minWidth: 0,
      gap: 0.5,
      p: 0.5,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    })}
  >
    {children}
  </Stack>
);
