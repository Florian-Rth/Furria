import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkFilmEdgeTone } from './KkFilmEdge';
import { KkFilmEdge } from './KkFilmEdge';
import type { KkFrameMark } from './KkFrame';
import { KkFrame } from './KkFrame';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const { gallery } = kkTokens;
const PHONE_SAMPLES = 3;
const COVER_SPAN = 2;

export interface KkContactStripFrame {
  id: string;
  label: string;
  source?: string;
  edge?: string;
  mark?: KkFrameMark;
  onSelect?: () => void;
}

interface KkContactStripProps {
  title: string;
  titleLabel: string;
  meta?: ReactNode;
  trail?: ReactNode;
  tone?: KkFilmEdgeTone;
  frames: readonly KkContactStripFrame[];
  onOpen: () => void;
  sx?: KkSx;
}

const columnsOf = (frames: number): { xs: string; desktop: string } => {
  const desktopCells = Math.max(frames, 1) + COVER_SPAN - 1;
  return {
    xs: `repeat(${PHONE_SAMPLES + COVER_SPAN}, minmax(0, 1fr))`,
    desktop: `repeat(${desktopCells}, minmax(0, 1fr))`,
  };
};

export const KkContactStrip: FC<KkContactStripProps> = ({
  title,
  titleLabel,
  meta,
  trail,
  tone = 'ink',
  frames,
  onOpen,
  sx,
}) => {
  const columns = columnsOf(frames.length);
  const cells = frames.map((frame, position) => (
    <KkFrame
      key={frame.id}
      label={frame.label}
      source={frame.source}
      number={frame.edge ?? ''}
      mark={frame.mark}
      onSelect={frame.onSelect ?? onOpen}
      fill
      sx={{
        gridColumn: position === 0 ? `span ${COVER_SPAN}` : 'auto',
        display: { xs: position > PHONE_SAMPLES ? 'none' : 'flex', desktop: 'flex' },
      }}
    />
  ));

  return (
    <Stack
      component="article"
      data-kk-contact-strip
      sx={[{ minWidth: 0, rowGap: 0.75 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <ButtonBase
        onClick={onOpen}
        aria-label={titleLabel}
        sx={(theme: Theme) => ({
          display: 'block',
          textAlign: 'left',
          minWidth: 0,
          borderRadius: `${kkTokens.radius.bar}px`,
          ...focusRing(theme),
        })}
      >
        <KkFilmEdge lead={title} meta={meta} trail={trail} tone={tone} size="title" level="h3" />
      </ButtonBase>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: columns,
          gridAutoRows: {
            xs: gallery.stripHeight.xs + gallery.edgeHeight,
            desktop: gallery.stripHeight.desktop + gallery.edgeHeight,
          },
          columnGap: `${gallery.gutter}px`,
          backgroundColor: gallery.darkroomEdge,
          borderRadius: `${kkTokens.radius.bar}px`,
          clipPath: 'inset(0 round 3px)',
        }}
      >
        {cells}
      </Box>
    </Stack>
  );
};
