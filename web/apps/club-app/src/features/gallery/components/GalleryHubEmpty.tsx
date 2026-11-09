import { KkButton } from '@furria/ui/KkButton';
import { KkEmptyState } from '@furria/ui/KkEmptyState';
import type { FC } from 'react';
import { UPLOAD_TITLE } from '../gallery-copy';
import { HUB_EMPTY_DESCRIPTION, HUB_EMPTY_TITLE } from '../hub-copy';

interface GalleryHubEmptyProps {
  sorts: boolean;
  onUpload: () => void;
}

export const GalleryHubEmpty: FC<GalleryHubEmptyProps> = ({ sorts, onUpload }) => {
  const action = sorts ? <KkButton onClick={onUpload}>{UPLOAD_TITLE}</KkButton> : undefined;

  return (
    <KkEmptyState title={HUB_EMPTY_TITLE} description={HUB_EMPTY_DESCRIPTION} action={action} />
  );
};
