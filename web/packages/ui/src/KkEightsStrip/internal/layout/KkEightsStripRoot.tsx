import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsStripRootProps extends PropsWithChildren {
  label: string;
}

export const KkEightsStripRoot: FC<KkEightsStripRootProps> = ({ label, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-eights-strip
    sx={(theme) => ({
      flexShrink: 0,
      gap: 0.75,
      p: 1.25,
      minWidth: 0,
      containerType: 'inline-size',
      containerName: 'kk-eights-strip',
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    })}
  >
    {children}
  </Stack>
);
