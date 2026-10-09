import type { KkFilterOption } from '@furria/ui';
import { KkFilterChips } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KIND_FILTER_LABEL, UPLOADER_FILTER_LABEL } from '../album-labels';

const UPLOADER_CHOICE_MIN = 3;

interface AlbumFiltersProps {
  kind: string;
  kindOptions: readonly KkFilterOption[];
  uploader: string;
  uploaderOptions: readonly KkFilterOption[];
  onKind: (kind: string) => void;
  onUploader: (uploader: string) => void;
}

export const AlbumFilters: FC<AlbumFiltersProps> = ({
  kind,
  kindOptions,
  uploader,
  uploaderOptions,
  onKind,
  onUploader,
}) => {
  const uploaders =
    uploaderOptions.length < UPLOADER_CHOICE_MIN ? null : (
      <KkFilterChips
        label={UPLOADER_FILTER_LABEL}
        options={uploaderOptions}
        value={uploader}
        onChange={onUploader}
        sx={{ flex: '1 1 auto', minWidth: 0 }}
      />
    );

  return (
    <Stack direction="row" sx={{ columnGap: 1, minWidth: 0, alignItems: 'center' }}>
      <KkFilterChips
        label={KIND_FILTER_LABEL}
        options={kindOptions}
        value={kind}
        onChange={onKind}
        sx={{ flex: '0 1 auto', minWidth: 0 }}
      />
      {uploaders}
    </Stack>
  );
};
