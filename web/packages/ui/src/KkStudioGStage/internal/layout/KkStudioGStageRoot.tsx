import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { stretchedSvgSourceOf } from '../../../internal/stretched-svg-source';
import { KkPhoto } from '../../../KkPhoto';
import { kkTokens } from '../../../tokens';
import type { KkStudioGStageGestures } from '../logic/use-stage-pointer';
import { useStagePointer } from '../logic/use-stage-pointer';

export type KkStudioGStageViewpoint = 'audience' | 'dancers';

const FRONT_ROOM = '1.125rem';
const VEIL = '16%';

interface KkStudioGStageRootProps extends PropsWithChildren {
  label: string;
  frontLabel: string;
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
  viewpoint: KkStudioGStageViewpoint;
  gestures: KkStudioGStageGestures | null;
}

export const KkStudioGStageRoot: FC<KkStudioGStageRootProps> = ({
  label,
  frontLabel,
  widthMetres,
  depthMetres,
  artworkSvg,
  viewpoint,
  gestures,
  children,
}) => {
  const pointer = useStagePointer(gestures);
  const source = stretchedSvgSourceOf(artworkSvg);
  const facing = viewpoint === 'audience';
  const artwork =
    source === null ? null : (
      <KkPhoto
        alt=""
        image={{ src: source }}
        fit="fill"
        fill
        priority
        sx={{
          position: 'absolute',
          inset: 0,
          transform: facing ? 'none' : 'rotate(180deg)',
          pointerEvents: 'none',
        }}
      />
    );
  const edge = facing ? { bottom: 0 } : { top: 0 };
  const front = facing
    ? { bottom: 0, transform: 'translate(-50%, 100%)', pt: 0.25 }
    : { top: 0, transform: 'translate(-50%, -100%)', pb: 0.25 };

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-studio-g-stage={viewpoint}
      sx={(theme) => ({
        position: 'relative',
        width: `min(100cqw, calc((100cqh - ${FRONT_ROOM}) * ${widthMetres} / ${depthMetres}))`,
        aspectRatio: `${widthMetres} / ${depthMetres}`,
        mt: facing ? 0 : FRONT_ROOM,
        mb: facing ? FRONT_ROOM : 0,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        boxShadow: kkTokens.shadow.raised,
      })}
    >
      <Box
        aria-hidden
        sx={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'clip' }}
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
            ...edge,
            height: kkTokens.line.page,
            backgroundColor: (theme.vars ?? theme).palette.text.primary,
          })}
        />
      </Box>
      <Typography
        aria-hidden
        data-kk-studio-g-front
        variant="overline"
        sx={{
          position: 'absolute',
          left: '50%',
          ...front,
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.eyebrow.letterSpacing,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          color: 'text.secondary',
        }}
      >
        {frontLabel}
      </Typography>
      <Box
        data-kk-studio-g-field
        {...pointer}
        sx={{
          position: 'absolute',
          inset: 0,
          containerType: 'size',
          touchAction: 'none',
          cursor: gestures === null ? 'default' : 'crosshair',
          pointerEvents: gestures === null ? 'none' : 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
