import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { LANE_HEAD } from '../../../KkLaneTrack/internal/lane-geometry';
import type { KkStudioShare } from '../../../KkStudioDrag/use-studio-drag';
import { useStudioDrag } from '../../../KkStudioDrag/use-studio-drag';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneOverviewRootProps extends PropsWithChildren {
  title: string;
  label: string;
  onAim: (share: number) => void;
}

export const KkLaneOverviewRoot: FC<KkLaneOverviewRootProps> = ({
  title,
  label,
  onAim,
  children,
}) => {
  const aim = (share: KkStudioShare): void => {
    onAim(share.x);
  };
  const drag = useStudioDrag({ onPress: aim, onMove: aim });

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      data-kk-lane-overview
      sx={(theme) => ({
        minWidth: 0,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: palette(theme).background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      })}
    >
      <Stack
        sx={(theme) => ({
          flexShrink: 0,
          width: LANE_HEAD,
          justifyContent: 'center',
          px: 1.25,
          borderRight: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
        })}
      >
        <Typography
          component="span"
          variant="caption"
          sx={{
            fontWeight: 900,
            letterSpacing: kkTokens.type.tracking.label,
            textTransform: 'uppercase',
            lineHeight: 1.1,
          }}
        >
          {title}
        </Typography>
      </Stack>
      <Box
        data-kk-studio-track
        {...drag}
        sx={{
          position: 'relative',
          flexGrow: 1,
          minWidth: 0,
          height: kkTokens.tapTarget,
          mx: 1.5,
          my: 0.5,
          touchAction: 'none',
          cursor: 'pointer',
        }}
      >
        {children}
      </Box>
    </Stack>
  );
};
