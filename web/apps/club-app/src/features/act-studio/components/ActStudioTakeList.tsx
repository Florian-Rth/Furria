import { KkStudioList } from '@furria/ui/KkStudioList';
import Box from '@mui/material/Box';
import type { FC, ReactNode } from 'react';
import type { ActStudioTakeRow, ActStudioTakes } from '../hooks/use-act-studio-takes';
import { useActUploads } from '../hooks/use-act-uploads';
import type { StudioScreen } from '../hooks/use-studio-screen';
import {
  STUDIO_TAKES,
  STUDIO_VIDEO_ACCEPT,
  STUDIO_VIDEO_ADD,
  STUDIO_VIDEOS_UNPLACED,
  uploadLabelOf,
  uploadMetaOf,
} from '../studio-copy';

interface ActStudioTakeListProps {
  screen: StudioScreen;
  takes: ActStudioTakes;
}

const rowOf = (row: ActStudioTakeRow): ReactNode => (
  <KkStudioList.Row
    key={row.key}
    lead={row.lead}
    title={row.title}
    meta={row.meta}
    badge={row.badge}
    badgeTone={row.badgeTone}
    selected={row.selected}
    label={row.title}
    onPress={row.press}
  />
);

export const ActStudioTakeList: FC<ActStudioTakeListProps> = ({ screen, takes }) => {
  const uploads = useActUploads(screen.actId, screen.videos.add.mutateAsync);
  const groups = takes.groups.flatMap((group) => [
    <KkStudioList.Head key={`head-${group.key}`} text={group.name} aside={group.aside} />,
    ...group.rows.map(rowOf),
  ]);
  const shelfHead =
    takes.shelf.length === 0 && uploads.rows.length === 0 ? null : (
      <KkStudioList.Head text={STUDIO_VIDEOS_UNPLACED} aside={null} />
    );
  const shelf = takes.shelf.map(rowOf);
  const uploading = uploads.rows.map((upload) => {
    const dismiss = (): void => {
      uploads.dismiss(upload.key);
    };
    const meta = uploadMetaOf(upload.share, upload.failure, 'video');
    const label = uploadLabelOf(upload.name, upload.failure, 'video');

    return (
      <KkStudioList.Upload
        key={upload.key}
        title={upload.name}
        meta={meta}
        share={upload.share}
        failed={upload.failure !== null}
        label={label}
        onPress={dismiss}
      />
    );
  });

  return (
    <KkStudioList label={STUDIO_TAKES}>
      {groups}
      {shelfHead}
      {shelf}
      {uploading}
      <KkStudioList.Action
        icon="upload"
        text={STUDIO_VIDEO_ADD}
        disabled={false}
        onPress={uploads.choose}
      />
      <Box
        component="input"
        type="file"
        accept={STUDIO_VIDEO_ACCEPT}
        multiple
        ref={uploads.fileInput}
        onChange={uploads.onChosen}
        hidden
      />
    </KkStudioList>
  );
};
