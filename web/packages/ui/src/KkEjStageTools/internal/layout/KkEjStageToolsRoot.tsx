import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEjStageToolsRootProps extends PropsWithChildren {
  label: string;
}

export const KkEjStageToolsRoot: FC<KkEjStageToolsRootProps> = ({ label, children }) => (
  <Stack
    role="group"
    aria-label={label}
    data-gesture-ignore
    data-kk-ej-stage-tools
    sx={(theme) => ({
      gap: 0.5,
      p: 0.5,
      width: 'max-content',
      maxWidth: '100cqw',
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}, ${kkTokens.shadow.floating}`,
    })}
  >
    {children}
  </Stack>
);
