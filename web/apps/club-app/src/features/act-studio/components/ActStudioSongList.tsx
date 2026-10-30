import { KkStudioList } from '@furria/ui/KkStudioList';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { ActStudioSongs } from '../hooks/use-act-studio-songs';
import { useSongUploads } from '../hooks/use-song-uploads';
import type { StudioScreen } from '../hooks/use-studio-screen';
import {
  STUDIO_FINAL,
  STUDIO_FINAL_NONE,
  STUDIO_OUTSIDE_MUSIC,
  STUDIO_SONG_ACCEPT,
  STUDIO_SONG_ADD,
  STUDIO_SONGS,
  uploadLabelOf,
  uploadMetaOf,
} from '../studio-copy';

interface ActStudioSongListProps {
  screen: StudioScreen;
  songs: ActStudioSongs;
}

export const ActStudioSongList: FC<ActStudioSongListProps> = ({ screen, songs }) => {
  const uploads = useSongUploads(screen.actId, screen.music);
  const rows = songs.rows.map((song) => (
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
        meta={uploadMetaOf(upload.share, upload.failure)}
        share={upload.share}
        failed={upload.failure !== null}
        label={uploadLabelOf(upload.name, upload.failure)}
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
      <KkStudioList.Slot title={STUDIO_FINAL} text={STUDIO_FINAL_NONE} />
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
