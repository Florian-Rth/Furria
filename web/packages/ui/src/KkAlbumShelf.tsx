import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkFilmEdge } from './KkFilmEdge';
import { KkFrame } from './KkFrame';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const { gallery } = kkTokens;
const PHONE_COLUMNS = 3;

export interface KkAlbumShelfAlbum {
  id: string;
  title: string;
  label: string;
  edge: string;
  source?: string;
  fresh?: boolean;
  onSelect: () => void;
}

interface KkAlbumShelfProps {
  albums: readonly KkAlbumShelfAlbum[];
  sx?: KkSx;
}

const columnsOf = (count: number): { xs: string; desktop: string } => ({
  xs: `repeat(${PHONE_COLUMNS}, minmax(0, 1fr))`,
  desktop: `repeat(${Math.max(count, PHONE_COLUMNS)}, minmax(0, 1fr))`,
});

export const KkAlbumShelf: FC<KkAlbumShelfProps> = ({ albums, sx }) => {
  const cells = albums.map((album) => {
    const tone = album.fresh === true ? 'gold' : 'ink';
    return (
      <Stack key={album.id} sx={{ minWidth: 0, rowGap: 0.5 }}>
        <Stack
          sx={{
            height: {
              xs: gallery.stripHeight.xs + gallery.edgeHeight,
              desktop: gallery.stripHeight.desktop + gallery.edgeHeight,
            },
            backgroundColor: gallery.darkroomEdge,
            borderRadius: `${kkTokens.radius.bar}px`,
            clipPath: 'inset(0 round 3px)',
          }}
        >
          <KkFrame
            label={album.label}
            source={album.source}
            number={album.edge}
            onSelect={album.onSelect}
            fill
            sx={{ flex: 1 }}
          />
        </Stack>
        <KkFilmEdge lead={album.title} tone={tone} />
      </Stack>
    );
  });

  return (
    <Box
      data-kk-album-shelf
      sx={[
        {
          display: 'grid',
          gridTemplateColumns: columnsOf(albums.length),
          columnGap: 1,
          minWidth: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {cells}
    </Box>
  );
};
