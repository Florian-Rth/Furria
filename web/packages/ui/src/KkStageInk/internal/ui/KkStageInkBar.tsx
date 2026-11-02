import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStageInkBarProps extends PropsWithChildren {
  label: string;
}

export const KkStageInkBar: FC<KkStageInkBarProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    data-gesture-ignore
    sx={(theme) => ({
      p: 0.5,
      gap: 0.25,
      pointerEvents: 'auto',
      whiteSpace: 'nowrap',
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}, ${kkTokens.shadow.floating}`,
    })}
  >
    {children}
  </Stack>
);
