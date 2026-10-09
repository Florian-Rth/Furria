import { KkExposureSweep, KkTimeRail } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { RAIL_LABEL } from '../album-labels';
import type { AlbumScreen } from '../hooks/use-album';
import { useAlbumBulk } from '../hooks/use-album-bulk';
import type { AlbumDetails } from '../schemas';
import { AlbumBulkBar } from './AlbumBulkBar';
import { AlbumEmpty } from './AlbumEmpty';
import { AlbumHeadline } from './AlbumHeadline';
import { AlbumLoupe } from './AlbumLoupe';
import { AlbumMoveSheet } from './AlbumMoveSheet';
import { AlbumScene } from './AlbumScene';
import { AlbumSelectionShelf } from './AlbumSelectionShelf';

const RAIL_MIN_SCENES = 2;
const BULK_ROOM = 14;
const RESTING_ROOM = 4;
const RAIL_ROOM = { xs: 3, desktop: 4 };

interface AlbumViewProps {
  albumId: number;
  album: AlbumDetails;
  screen: AlbumScreen;
}

export const AlbumView: FC<AlbumViewProps> = ({ albumId, album, screen }) => {
  const { selecting, rights } = screen;
  const bulk = useAlbumBulk({
    albumId,
    selectedIds: selecting.selectedIds,
    rights,
    onDone: selecting.stop,
  });
  const showsSelection = rights.curates || rights.managesItems;
  const hasRail = screen.scenes.length >= RAIL_MIN_SCENES;
  const bottomRoom = selecting.active ? BULK_ROOM : RESTING_ROOM;
  const railRoom = hasRail ? RAIL_ROOM : 0;

  const onFrame = (id: number): void => {
    selecting.onFrame(id, () => screen.openFrame(id));
  };

  const shelf = rights.curates ? (
    <AlbumSelectionShelf albumId={albumId} album={album} onOpen={screen.openFrame} />
  ) : null;
  const scenes = screen.scenes.map((scene, order) => (
    <AlbumScene
      key={scene.index}
      scene={scene}
      order={order}
      glowId={screen.glowId}
      showsSelection={showsSelection}
      selecting={selecting.active}
      selected={selecting.selected}
      onFrame={onFrame}
    />
  ));
  const content =
    screen.frames.length === 0 ? (
      <AlbumEmpty albumId={albumId} filtered={screen.filtered} uploads={rights.uploads} />
    ) : (
      <Stack
        onPointerDown={selecting.stroke.onPointerDown}
        onPointerMove={selecting.stroke.onPointerMove}
        onPointerUp={selecting.stroke.onPointerUp}
        onPointerCancel={selecting.stroke.onPointerCancel}
        onContextMenu={selecting.stroke.onContextMenu}
        sx={{
          rowGap: 2.5,
          touchAction: 'pan-y',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      >
        {scenes}
      </Stack>
    );
  const rail = hasRail ? (
    <KkTimeRail
      label={RAIL_LABEL}
      scenes={screen.railScenes}
      current={screen.currentScene}
      onReach={screen.reachScene}
    />
  ) : null;
  const loupe =
    screen.shown === null ? null : (
      <AlbumLoupe
        albumTitle={album.title}
        frames={screen.frames}
        scenes={screen.scenes}
        shown={screen.shown}
        onShow={screen.showFrame}
        onClose={screen.closeFrame}
      />
    );
  const bulkBar = selecting.active ? <AlbumBulkBar bulk={bulk} /> : null;
  const moveSheet = rights.managesItems ? (
    <AlbumMoveSheet albumId={albumId} onMove={bulk.moveTo} />
  ) : null;

  return (
    <>
      <KkExposureSweep scope="viewport">
        <Stack sx={{ rowGap: 2.5, pb: bottomRoom, pr: railRoom }}>
          <AlbumHeadline
            albumId={albumId}
            album={album}
            scenes={screen.scenes.length}
            rights={rights}
          />
          {shelf}
          {content}
        </Stack>
      </KkExposureSweep>
      {rail}
      {loupe}
      {bulkBar}
      {moveSheet}
    </>
  );
};
