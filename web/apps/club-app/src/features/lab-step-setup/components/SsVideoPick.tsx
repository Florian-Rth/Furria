import { STUDIO_VIDEO_ACCEPT } from '@furria/studio/studio-copy';
import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkSelectRow } from '@furria/ui/KkSelectRow';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SetupVideo } from '../hooks/use-setup-video';
import { SS_VIDEO_LIST, SS_VIDEO_UPLOAD } from '../setup-copy';

interface SsVideoPickProps {
  videos: SetupVideo;
}

const UPLOAD_ICON = <KkIcon name="upload" size="small" />;

export const SsVideoPick: FC<SsVideoPickProps> = ({ videos }) => {
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
        {SS_VIDEO_UPLOAD}
      </KkButton>
      <Box
        component="input"
        type="file"
        accept={STUDIO_VIDEO_ACCEPT}
        ref={videos.inputRef}
        onChange={videos.onChosen}
        hidden
      />
      <Stack component="nav" aria-label={SS_VIDEO_LIST} sx={{ gap: 0.5, minWidth: 0 }}>
        {rows}
      </Stack>
    </Stack>
  );
};
