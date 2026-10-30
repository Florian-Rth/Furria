import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusOverviewRootProps extends PropsWithChildren {
  label: string;
  onAim: (share: number) => void;
}

export const KkFocusOverviewRoot: FC<KkFocusOverviewRootProps> = ({ label, onAim, children }) => {
  const aim = (share: KkStudioShare): void => {
    onAim(share.x);
  };
  const drag = useStudioDrag({ onPress: aim, onMove: aim });

  return (
    <Box
      role="group"
      aria-label={label}
      data-kk-studio-track
      data-kk-focus-overview
      {...drag}
      sx={(theme) => ({
        position: 'relative',
        height: '2.75rem',
        borderRadius: `${kkTokens.radius.base - 4}px`,
        backgroundColor: palette(theme).background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
        touchAction: 'none',
        cursor: 'pointer',
        overflow: 'clip',
      })}
    >
      {children}
    </Box>
  );
};
