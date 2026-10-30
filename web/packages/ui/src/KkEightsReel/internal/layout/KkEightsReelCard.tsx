import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsReelCardProps extends PropsWithChildren {
  label: string;
  current: boolean;
}

export const KkEightsReelCard: FC<KkEightsReelCardProps> = ({ label, current, children }) => (
  <Stack
    component="article"
    aria-label={label}
    aria-current={current ? 'step' : undefined}
    data-kk-eights-card
    sx={{
      height: '100%',
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always',
      boxSizing: 'border-box',
      py: 0.5,
    }}
  >
    <Stack
      sx={(theme) => ({
        flex: 1,
        minHeight: 0,
        gap: 0.75,
        containerType: 'inline-size',
        containerName: 'kk-eights-strip',
        p: 1,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: palette(theme).background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      })}
    >
      {children}
    </Stack>
  </Stack>
);
