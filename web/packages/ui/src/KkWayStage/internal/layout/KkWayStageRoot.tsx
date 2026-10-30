import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { FRONT_ROOM } from '../logic/way-zoom';

interface KkWayStageRootProps extends PropsWithChildren {
  frontLabel: string;
  widthMetres: number;
  depthMetres: number;
  sx?: KkSx;
}

export const KkWayStageRoot: FC<KkWayStageRootProps> = ({
  frontLabel,
  widthMetres,
  depthMetres,
  sx,
  children,
}) => (
  <Box
    data-kk-way-stage
    sx={[
      {
        position: 'relative',
        width: `min(100cqw, calc((100cqh - ${FRONT_ROOM}) * ${widthMetres} / ${depthMetres}))`,
        aspectRatio: `${widthMetres} / ${depthMetres}`,
        mt: FRONT_ROOM,
        borderRadius: `${kkTokens.radius.base}px`,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography
      aria-hidden
      variant="overline"
      sx={(theme) => ({
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translate(-50%, -100%)',
        pb: 0.5,
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.eyebrow.letterSpacing,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        color: (theme.vars ?? theme).palette.text.secondary,
      })}
    >
      {frontLabel}
    </Typography>
    {children}
  </Box>
);
