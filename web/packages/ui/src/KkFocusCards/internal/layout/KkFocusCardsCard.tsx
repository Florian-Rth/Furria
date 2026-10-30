import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusCardsCardProps extends PropsWithChildren {
  label: string;
  current: boolean;
}

export const KkFocusCardsCard: FC<KkFocusCardsCardProps> = ({ label, current, children }) => (
  <Stack
    role="group"
    aria-roledescription="Karte"
    aria-label={label}
    aria-current={current ? 'step' : undefined}
    data-current={current}
    sx={(theme) => ({
      flex: 'none',
      width: 'calc(100% - 1.5rem)',
      minWidth: 0,
      gap: 0.75,
      p: 1.25,
      scrollSnapAlign: 'center',
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    })}
  >
    {children}
  </Stack>
);
