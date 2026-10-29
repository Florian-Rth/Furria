import { KkStudioBTransport } from '@furria/ui/KkStudioBTransport';
import type { FC } from 'react';
import { useStudioB } from '../studio-b-context';
import { MUSIC_FAILED_LINE, MUSIC_LOADING_LINE, MUSIC_RETRY_LABEL } from '../studio-b-copy';

export const StudioBMusicNote: FC = () => {
  const { playback, practice } = useStudioB();
  const { load } = playback.state;

  if (load === 'ready') {
    return null;
  }

  if (load === 'failed') {
    const retry = { label: MUSIC_RETRY_LABEL, onSelect: practice.actions.reload };

    return <KkStudioBTransport.Note text={MUSIC_FAILED_LINE} action={retry} />;
  }

  return <KkStudioBTransport.Note text={MUSIC_LOADING_LINE} action={null} />;
};
