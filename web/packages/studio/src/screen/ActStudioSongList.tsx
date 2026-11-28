import { ActStudioSortedSongs } from '@furria/studio/ActStudioSortedSongs';
import {
  STUDIO_OUTSIDE_MUSIC,
  STUDIO_SONG_ACCEPT,
  STUDIO_SONG_ADD,
  STUDIO_SONGS,
  uploadLabelOf,
  uploadMetaOf,
} from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioSongs } from '@furria/studio/use-act-studio-songs';
import { useStudioUploads } from '@furria/studio/use-studio-uploads';
import { KkStudioList } from '@furria/ui/KkStudioList';
import Box from '@mui/material/Box';
import type { FC } from 'react';

interface ActStudioSongListProps {
  screen: StudioScreen;
  songs: ActStudioSongs;
}

export const ActStudioSongList: FC<ActStudioSongListProps> = ({ screen, songs }) => {
  const uploads = useStudioUploads(screen.uploads.songs);
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
      <ActStudioSortedSongs songs={songs} />
      {uploading}
      <KkStudioList.Action
        icon="upload"
        text={STUDIO_SONG_ADD}
        disabled={false}
        onPress={uploads.choose}
      />
      {outside}
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
