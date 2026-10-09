import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { KkVisuallyHidden } from '../KkVisuallyHidden';
import type { KkSx } from '../kk-sx';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../theme';
import { kkTokens } from '../tokens';
import { KkShowcaseAddTile } from './internal/KkShowcaseAddTile';
import type { KkShowcasePieceData } from './internal/KkShowcasePiece';
import { KkShowcasePiece } from './internal/KkShowcasePiece';
import { useShowcaseDrag } from './internal/use-showcase-drag';

const { gallery } = kkTokens;
const { showcase } = gallery;
const darkScheme = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

const columnsOf = (count: number): string => `repeat(${count}, minmax(0, 1fr))`;

export interface KkShowcaseLabels {
  list: string;
  add: string;
}

interface KkShowcaseProps {
  pieces: readonly KkShowcasePieceData[];
  labels: KkShowcaseLabels;
  announcement: string;
  captionMaxLength: number;
  addDisabled: boolean;
  onMove: (from: number, to: number) => void;
  onCaption: (id: string, caption: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  sx?: KkSx;
}

export const KkShowcase: FC<KkShowcaseProps> = ({
  pieces,
  labels,
  announcement,
  captionMaxLength,
  addDisabled,
  onMove,
  onCaption,
  onRemove,
  onAdd,
  sx,
}) => {
  const drag = useShowcaseDrag(pieces.length, onMove);
  const shown = pieces.map((piece, index) => (
    <KkShowcasePiece
      key={piece.id}
      piece={piece}
      position={index + 1}
      slotAttribute={drag.slotAttribute}
      isDragging={drag.dragging === index}
      handle={drag.handleOf(index)}
      captionMaxLength={captionMaxLength}
      onCaption={onCaption}
      onRemove={onRemove}
    />
  ));

  return (
    <Box
      data-kk-showcase
      {...darkScheme}
      sx={[
        (theme: Theme) => ({
          position: 'relative',
          p: { xs: 1.5, desktop: 2.5 },
          color: 'text.primary',
          bgcolor: gallery.darkroom,
          borderRadius: `${kkTokens.radius.base}px`,
          boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${(theme.vars ?? theme).palette.warning.main}`,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            backgroundImage: `linear-gradient(118deg, transparent 0%, ${showcase.sheen} 18%, transparent 34%, transparent 62%, ${showcase.sheen} 74%, transparent 86%)`,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        role="list"
        aria-label={labels.list}
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: columnsOf(showcase.columns.xs),
            sm: columnsOf(showcase.columns.sm),
            desktop: columnsOf(showcase.columns.desktop),
          },
          gap: 1.5,
        }}
      >
        {shown}
        <KkShowcaseAddTile label={labels.add} disabled={addDisabled} onAdd={onAdd} />
      </Box>
      <Box role="status" aria-live="polite">
        <KkVisuallyHidden>{announcement}</KkVisuallyHidden>
      </Box>
    </Box>
  );
};
