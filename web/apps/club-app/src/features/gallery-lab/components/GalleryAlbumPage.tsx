import { KkExposureSweep, KkFilmEdge, KkFilterChips, KkScreen, KkTimeRail } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { AlbumSearch, LabView } from '../gallery-copy';
import { GALLERY_ORIGIN, RAIL_LABEL } from '../gallery-copy';
import { useGalleryAlbum } from '../hooks/use-gallery-album';
import type { LabAlbumSpec } from '../lab-gallery-data';
import { LAB_SESSIONS } from '../lab-gallery-data';
import { GalleryLoupe } from './GalleryLoupe';
import { GallerySceneBlock } from './GallerySceneBlock';
import { GallerySelectionShelf } from './GallerySelectionShelf';

interface GalleryAlbumPageProps {
  album: LabAlbumSpec;
  search: AlbumSearch;
  view: LabView;
}

const WEEKDAY = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const dateLineOf = (album: LabAlbumSpec): string =>
  album.entryDate === null ? 'Ohne Datum' : WEEKDAY.format(new Date(`${album.entryDate}T12:00:00`));

const sessionLineOf = (album: LabAlbumSpec): string => {
  const session = LAB_SESSIONS.find((entry) => entry.id === album.sessionId);
  const by = `Fotos: ${album.uploaders.join(', ')}`;
  return session === undefined ? by : `Session ${session.label} · ${by}`;
};

export const GalleryAlbumPage: FC<GalleryAlbumPageProps> = ({ album, search, view }) => {
  const gallery = useGalleryAlbum(album, search, view);
  const tools = (
    <KkFilterChips
      label="Art"
      options={gallery.kindOptions}
      value={gallery.kind}
      onChange={gallery.setKind}
    />
  );
  const shelf = gallery.manages ? (
    <GallerySelectionShelf album={album} selection={gallery.selection} onOpen={gallery.openPhoto} />
  ) : null;
  const scenes = gallery.scenes.map((scene, order) => (
    <GallerySceneBlock
      key={scene.index}
      scene={scene}
      order={order}
      glowNumber={gallery.glowNumber}
      onOpen={gallery.openPhoto}
    />
  ));
  const loupe =
    gallery.shown === null ? null : (
      <GalleryLoupe
        albumTitle={album.title}
        items={gallery.items}
        scenes={gallery.scenes}
        shown={gallery.shown}
      />
    );

  return (
    <KkScreen
      kind="list"
      title={album.title}
      origin={GALLERY_ORIGIN}
      actions={gallery.actions}
      tools={tools}
    >
      <KkExposureSweep scope="viewport">
        <Stack sx={{ rowGap: 2.5, pb: 4, pr: { xs: 3, desktop: 4 } }}>
          <KkFilmEdge
            lead={dateLineOf(album)}
            meta={sessionLineOf(album)}
            trail={`${gallery.scenes.length} Szenen`}
          />
          {shelf}
          {scenes}
        </Stack>
      </KkExposureSweep>
      <KkTimeRail
        label={RAIL_LABEL}
        scenes={gallery.railScenes}
        current={gallery.currentScene}
        onReach={gallery.reachScene}
      />
      {loupe}
    </KkScreen>
  );
};
