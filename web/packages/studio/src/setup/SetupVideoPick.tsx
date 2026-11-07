import { SETUP_VIDEO_LIST, SETUP_VIDEO_UPLOAD } from '@furria/studio/step-setup-copy';
import { STUDIO_VIDEO_ACCEPT } from '@furria/studio/studio-copy';
import type { SetupVideo } from '@furria/studio/use-setup-video';
import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkSelectRow } from '@furria/ui/KkSelectRow';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface SetupVideoPickProps {
  videos: SetupVideo;
}

const UPLOAD_ICON = <KkIcon name="upload" size="small" />;

export const SetupVideoPick: FC<SetupVideoPickProps> = ({ videos }) => {
  const rows = videos.rows.map((row) => (
    <KkSelectRow
      key={row.key}
      title={row.title}
      meta={row.meta}
      selected={row.selected}
      dimmed={row.dimmed}
      onClick={row.press}
    />
  ));

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkButton variant="outlined" startIcon={UPLOAD_ICON} onClick={videos.upload}>
        {SETUP_VIDEO_UPLOAD}
      </KkButton>
      <Box
        component="input"
        type="file"
        accept={STUDIO_VIDEO_ACCEPT}
        ref={videos.inputRef}
        onChange={videos.onChosen}
        hidden
      />
      <Stack component="nav" aria-label={SETUP_VIDEO_LIST} sx={{ gap: 0.5, minWidth: 0 }}>
        {rows}
      </Stack>
    </Stack>
  );
};
