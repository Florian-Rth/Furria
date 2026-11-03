import { STUDIO_SONG_ACCEPT, STUDIO_VIDEO_ACCEPT } from '@furria/studio/studio-copy';
import type { StudioSetup } from '@furria/studio/studio-setup-view';
import Box from '@mui/material/Box';
import type { FC } from 'react';

interface StudioSetupInputsProps {
  setup: StudioSetup;
}

export const StudioSetupInputs: FC<StudioSetupInputsProps> = ({ setup }) => (
  <>
    <Box
      component="input"
      type="file"
      accept={STUDIO_SONG_ACCEPT}
      multiple
      ref={setup.songs.fileInput}
      onChange={setup.songs.onChosen}
      hidden
    />
    <Box
      component="input"
      type="file"
      accept={STUDIO_VIDEO_ACCEPT}
      multiple
      ref={setup.videos.fileInput}
      onChange={setup.videos.onChosen}
      hidden
    />
  </>
);
