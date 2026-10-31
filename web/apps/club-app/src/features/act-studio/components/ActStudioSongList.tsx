import { KkStudioList } from '@furria/ui/KkStudioList';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { ActStudioFinal } from '../hooks/use-act-studio-final';
import type { ActStudioSongs } from '../hooks/use-act-studio-songs';
import { useActUploads } from '../hooks/use-act-uploads';
import type { StudioScreen } from '../hooks/use-studio-screen';
import {
  STUDIO_OUTSIDE_MUSIC,
  STUDIO_SONG_ACCEPT,
  STUDIO_SONG_ADD,
  STUDIO_SONGS,
  uploadLabelOf,
  uploadMetaOf,
} from '../studio-copy';
import { ActStudioFinalSection } from './ActStudioFinalSection';

interface ActStudioSongListProps {
  screen: StudioScreen;
  songs: ActStudioSongs;
  finalList: ActStudioFinal;
}

export const ActStudioSongList: FC<ActStudioSongListProps> = ({ screen, songs, finalList }) => {
  const uploads = useActUploads(screen.actId, screen.music.add.mutateAsync);
  const shown = screen.final.previewing ? finalList.sources : songs.rows;
  const rows = shown.map((song) => (
    <KkStudioList.Row
      key={song.key}
      lead={song.lead}
      title={song.title}
      meta={song.meta}
      badge={song.badge}
      badgeTone={song.badgeTone}
      selected={song.selected}
      label={song.label}
      onPress={song.press}
    />
  ));
  const uploading = uploads.rows.map((upload) => {
    const dismiss = (): void => {
      uploads.dismiss(upload.key);
    };

    return (
      <KkStudioList.Upload
        key={upload.key}
        title={upload.name}
        meta={uploadMetaOf(upload.share, upload.failure, 'song')}
        share={upload.share}
        failed={upload.failure !== null}
        label={uploadLabelOf(upload.name, upload.failure, 'song')}
        onPress={dismiss}
      />
    );
  });
  const outside =
    songs.outside === null ? null : (
      <KkStudioList.Slot title={STUDIO_OUTSIDE_MUSIC} text={songs.outside} />
    );

  return (
    <KkStudioList label={STUDIO_SONGS}>
      <KkStudioList.Head text={STUDIO_SONGS} aside={songs.count} />
      {rows}
      {uploading}
      <KkStudioList.Action
        icon="upload"
        text={STUDIO_SONG_ADD}
        disabled={songs.locked}
        onPress={uploads.choose}
      />
      {outside}
      <ActStudioFinalSection screen={screen} finalList={finalList} />
      <Box
        component="input"
        type="file"
        accept={STUDIO_SONG_ACCEPT}
        multiple
        ref={uploads.fileInput}
        onChange={uploads.onChosen}
        hidden
      />
    </KkStudioList>
  );
};
