import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { stretchedSvgSourceOf } from '../../../internal/stretched-svg-source';
import { KkPhoto } from '../../../KkPhoto';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const FRONT_ROOM = '1rem';
const VEIL = '16%';

interface KkStudioEStageRootProps extends PropsWithChildren {
  label: string;
  frontLabel: string;
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
  sx?: KkSx;
}

export const KkStudioEStageRoot: FC<KkStudioEStageRootProps> = ({
  label,
  frontLabel,
  widthMetres,
  depthMetres,
  artworkSvg,
  sx,
  children,
}) => {
  const source = stretchedSvgSourceOf(artworkSvg);
  const artwork =
    source === null ? null : (
      <KkPhoto
        alt=""
        image={{ src: source }}
        fit="fill"
        fill
        priority
        sx={{ position: 'absolute', inset: 0, transform: 'rotate(180deg)', pointerEvents: 'none' }}
      />
    );

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-studio-e-stage
      sx={[
        (theme) => ({
          position: 'relative',
          width: `min(100cqw, calc((100cqh - ${FRONT_ROOM}) * ${widthMetres} / ${depthMetres}))`,
          aspectRatio: `${widthMetres} / ${depthMetres}`,
          mt: FRONT_ROOM,
          borderRadius: { xs: 0, desktop: `${kkTokens.radius.base}px` },
          backgroundColor: (theme.vars ?? theme).palette.background.paper,
          boxShadow: kkTokens.shadow.raised,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          overflow: 'clip',
          '& > *': { borderRadius: 0 },
        }}
      >
        {artwork}
        <Box
          sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.default} ${VEIL}, transparent)`,
          })}
        />
        <Box
          sx={(theme) => ({
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: kkTokens.line.page,
            backgroundColor: (theme.vars ?? theme).palette.text.primary,
          })}
        />
      </Box>
      <Typography
        aria-hidden
        variant="overline"
        sx={(theme) => ({
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translate(-50%, -100%)',
          pb: 0.25,
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.eyebrow.letterSpacing,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          color: (theme.vars ?? theme).palette.text.secondary,
        })}
      >
        {frontLabel}
      </Typography>
      <Box
        data-kk-studio-e-field
        sx={{ position: 'absolute', inset: 0, containerType: 'size', pointerEvents: 'none' }}
      >
        {children}
      </Box>
    </Box>
  );
};
