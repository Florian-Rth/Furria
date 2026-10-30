import { KkStudioList } from '@furria/ui/KkStudioList';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { ActStudioFinal } from '../hooks/use-act-studio-final';
import { useActUploads } from '../hooks/use-act-uploads';
import type { StudioScreen } from '../hooks/use-studio-screen';
import {
  STUDIO_FINAL,
  STUDIO_FINAL_NONE,
  STUDIO_FINAL_UPLOAD,
  STUDIO_FINAL_UPLOAD_NEWER,
  STUDIO_SONG_ACCEPT,
  uploadLabelOf,
  uploadMetaOf,
} from '../studio-copy';

interface ActStudioFinalSectionProps {
  screen: StudioScreen;
  finalList: ActStudioFinal;
}

export const ActStudioFinalSection: FC<ActStudioFinalSectionProps> = ({ screen, finalList }) => {
  const uploads = useActUploads(screen.actId, screen.final.writes.add.mutateAsync);
  const { track, removal, adopt } = finalList;
  const row =
    track === null ? (
      <KkStudioList.Slot title={STUDIO_FINAL} text={STUDIO_FINAL_NONE} />
    ) : (
      <KkStudioList.Row
        lead={track.lead}
        title={track.title}
        meta={track.meta}
        badge={track.badge}
        badgeTone={track.badgeTone}
        selected={track.selected}
        label={track.label}
        onPress={track.press}
      />
    );
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
  const adoption =
    adopt === null ? null : (
      <KkStudioList.Action
        icon="check"
        text={adopt.text}
        disabled={adopt.disabled}
        onPress={adopt.press}
      />
    );
  const discard =
    removal === null ? null : (
      <KkStudioList.Action
        icon="delete"
        text={removal.text}
        disabled={false}
        onPress={removal.press}
      />
    );
  const uploadText = finalList.newer ? STUDIO_FINAL_UPLOAD_NEWER : STUDIO_FINAL_UPLOAD;
  const upload = finalList.canUpload ? (
    <KkStudioList.Action
      icon="upload"
      text={uploadText}
      disabled={uploads.rows.length > 0}
      onPress={uploads.choose}
    />
  ) : null;

  return (
    <>
      <KkStudioList.Head text={STUDIO_FINAL} aside={null} />
      {row}
      {uploading}
      {adoption}
      {discard}
      {upload}
      <Box
        component="input"
        type="file"
        accept={STUDIO_SONG_ACCEPT}
        ref={uploads.fileInput}
        onChange={uploads.onChosen}
        hidden
      />
    </>
  );
};
