import { useIsMobile } from '@furria/ui/use-is-mobile';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useRef } from 'react';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { ActStudioResponse, Studio } from '@/features/acts/schemas';
import { useFollowCurrent } from '../hooks/use-follow-current';
import { useStudioBPractice } from '../hooks/use-studio-b-practice';
import { StudioBContext } from '../studio-b-context';
import { mastheadOf } from '../studio-b-masthead';
import { StudioBCard } from './StudioBCard';
import { StudioBManualList } from './StudioBManualList';
import { StudioBMasthead } from './StudioBMasthead';
import { StudioBTransportBar } from './StudioBTransportBar';

const LIST_SPAN = { xs: 12, md: 5, lg: 4 } as const;
const CARD_SPAN = { xs: 12, md: 7, lg: 8 } as const;

interface StudioBPracticeProps {
  act: ActStudioResponse['act'];
  studio: Studio;
  viewerId: number | null;
}

export const StudioBPractice: FC<StudioBPracticeProps> = ({ act, studio, viewerId }) => {
  const playback = useStudioPlayback(studio, viewerId);
  const practice = useStudioBPractice(playback, studio);
  const phone = useIsMobile();
  const listRef = useRef<HTMLDivElement | null>(null);
  const masthead = mastheadOf(act, studio, practice.manual, playback.ownSpotId);
  const value = { studio, playback, practice };

  useFollowCurrent(
    listRef,
    practice.current?.stepId ?? null,
    playback.state.playing,
    phone ? 'card' : 'row',
  );

  const body = phone ? (
    <Stack ref={listRef} sx={{ minWidth: 0 }}>
      <StudioBManualList cardInList />
    </Stack>
  ) : (
    <Grid container spacing={3}>
      <Grid size={LIST_SPAN} ref={listRef}>
        <StudioBManualList cardInList={false} />
      </Grid>
      <Grid size={CARD_SPAN}>
        <StudioBCard placement="aside" />
      </Grid>
    </Grid>
  );

  return (
    <StudioBContext.Provider value={value}>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <StudioBMasthead facts={masthead.facts} own={masthead.own} />
        {body}
        <StudioBTransportBar />
      </Stack>
    </StudioBContext.Provider>
  );
};
