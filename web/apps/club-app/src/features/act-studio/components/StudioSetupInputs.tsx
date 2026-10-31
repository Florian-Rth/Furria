import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { StudioSetup } from '../hooks/use-studio-setup';
import { STUDIO_SONG_ACCEPT, STUDIO_VIDEO_ACCEPT } from '../studio-copy';

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
