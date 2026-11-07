import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEjPanelBlockProps extends PropsWithChildren {
  label: string;
}

export const KkEjPanelBlock: FC<KkEjPanelBlockProps> = ({ label, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-ej-block
    sx={(theme) => ({
      flexShrink: 0,
      minWidth: 0,
      gap: 1.25,
      p: 1.25,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    })}
  >
    {children}
  </Stack>
);
