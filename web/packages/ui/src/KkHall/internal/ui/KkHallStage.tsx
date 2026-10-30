import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { stretchedSvgSourceOf } from '../../../internal/stretched-svg-source';
import { KkPhoto } from '../../../KkPhoto';
import { kkTokens } from '../../../tokens';

export type KkHallStageFront = 'top' | 'bottom';

const FRONT_ROOM = '1.25rem';

interface KkHallStageProps extends PropsWithChildren {
  label: string;
  frontLabel: string;
  front: KkHallStageFront;
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
}

export const KkHallStage: FC<KkHallStageProps> = ({
  label,
  frontLabel,
  front,
  widthMetres,
  depthMetres,
  artworkSvg,
  children,
}) => {
  const atTop = front === 'top';
  const source = stretchedSvgSourceOf(artworkSvg);
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
          transform: atTop ? 'rotate(180deg)' : 'none',
          pointerEvents: 'none',
        }}
      />
    );

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-hall-stage={front}
      sx={(theme) => ({
        position: 'relative',
        width: `min(100cqw, calc((100cqh - ${FRONT_ROOM}) * ${widthMetres} / ${depthMetres}))`,
        aspectRatio: `${widthMetres} / ${depthMetres}`,
        mt: atTop ? FRONT_ROOM : 0,
        mb: atTop ? 0 : FRONT_ROOM,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
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
            backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.default} 35%, transparent)`,
          })}
        />
        <Box
          sx={(theme) => ({
            position: 'absolute',
            left: 0,
            right: 0,
            top: atTop ? 0 : 'auto',
            bottom: atTop ? 'auto' : 0,
            height: kkTokens.line.page,
            backgroundColor: (theme.vars ?? theme).palette.text.primary,
          })}
        />
      </Box>
      <Typography
        aria-hidden
        variant="overline"
        sx={{
          position: 'absolute',
          left: '50%',
          top: atTop ? 0 : '100%',
          transform: atTop ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.eyebrow.letterSpacing,
          lineHeight: 1.6,
          whiteSpace: 'nowrap',
          color: 'text.secondary',
        }}
      >
        {frontLabel}
      </Typography>
      <Box sx={{ position: 'absolute', inset: 0, containerType: 'size', pointerEvents: 'none' }}>
        {children}
      </Box>
    </Box>
  );
};
