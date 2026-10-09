import { KkButton, KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { UPLOAD_TITLE } from '../gallery-copy';
import { HUB_EMPTY_DESCRIPTION, HUB_EMPTY_SORTER_DESCRIPTION, HUB_EMPTY_TITLE } from '../hub-copy';

interface GalleryHubEmptyProps {
  sorts: boolean;
  onUpload: () => void;
}

export const GalleryHubEmpty: FC<GalleryHubEmptyProps> = ({ sorts, onUpload }) => {
  const action = sorts ? <KkButton onClick={onUpload}>{UPLOAD_TITLE}</KkButton> : undefined;
  const description = sorts ? HUB_EMPTY_SORTER_DESCRIPTION : HUB_EMPTY_DESCRIPTION;

  return <KkEmptyState title={HUB_EMPTY_TITLE} description={description} action={action} />;
};
