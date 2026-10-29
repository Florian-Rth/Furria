import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { stretchedSvgSourceOf } from './internal/stretched-svg-source';
import { KkPhoto } from './KkPhoto';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const ARTWORK_LAYER = { position: 'absolute', inset: 0, pointerEvents: 'none' } as const;

interface KkStageAreaProps extends PropsWithChildren {
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
  label: string;
  sx?: KkSx;
}

export const KkStageArea: FC<KkStageAreaProps> = ({
  widthMetres,
  depthMetres,
  artworkSvg,
  label,
  sx,
  children,
}) => {
  const source = stretchedSvgSourceOf(artworkSvg);
  const artworkImage = source === null ? null : { src: source };
  const aspectRatio = `${widthMetres} / ${depthMetres}`;

  const artwork =
    artworkImage === null ? null : (
      <KkPhoto alt="" image={artworkImage} fit="fill" fill priority sx={ARTWORK_LAYER} />
    );

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-stage-area
      sx={[
        {
          position: 'relative',
          width: '100%',
          minWidth: 0,
          aspectRatio,
          bgcolor: 'background.paper',
          borderStyle: 'solid',
          borderColor: 'divider',
          borderWidth: kkTokens.line.hair,
          borderBottomColor: 'text.primary',
          borderBottomWidth: kkTokens.line.page,
          userSelect: 'none',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {artwork}
      <Box
        aria-hidden
        data-kk-stage-centre-front
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          width: kkTokens.line.section,
          height: (theme) => theme.spacing(1),
          bgcolor: 'text.primary',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </Box>
  );
};
