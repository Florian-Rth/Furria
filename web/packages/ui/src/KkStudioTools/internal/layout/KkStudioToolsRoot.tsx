import Stack from '@mui/material/Stack';
import { LayoutGroup } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const WIDE = '@container kk-studio-h (min-aspect-ratio: 5/4)';

interface KkStudioToolsRootProps extends PropsWithChildren {
  label: string;
}

export const KkStudioToolsRoot: FC<KkStudioToolsRootProps> = ({ label, children }) => (
  <LayoutGroup id={label}>
    <Stack
      direction="row"
      role="tablist"
      aria-label={label}
      data-kk-studio-tools
      sx={(theme) => ({
        minWidth: 0,
        alignItems: 'stretch',
        px: 0.5,
        pt: 0.375,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        boxShadow: `inset 0 ${kkTokens.line.hair}px 0 ${(theme.vars ?? theme).palette.divider}`,
        [WIDE]: {
          p: 0.25,
          borderRadius: `${kkTokens.radius.base}px`,
          boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
          flexDirection: 'column',
          alignSelf: 'center',
          gap: 0.25,
          py: 0.5,
        },
      })}
    >
      {children}
    </Stack>
  </LayoutGroup>
);
