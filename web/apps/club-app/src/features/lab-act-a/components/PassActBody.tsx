import { KkButton } from '@furria/ui/KkButton';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MyAct } from '@/features/acts/schemas';
import type { PassActPage } from '../hooks/use-pass-act-page';
import { laterEveningsOf, laterTrainingsOf, ownSpotOf } from '../pass-act';
import { DETAILS_LABEL } from '../pass-copy';
import { PassActCard } from './PassActCard';
import { PassDetails } from './PassDetails';
import { PassDetailsSide } from './PassDetailsSide';
import { PassLaterEvenings } from './PassLaterEvenings';
import { PassLaterTrainings } from './PassLaterTrainings';

const MEMBER_SPANS = { card: 5, rows: 7 } as const;
const EDITOR_SPANS = { card: 4, rows: 4, details: 4 } as const;

interface PassActBodyProps {
  page: PassActPage;
  act: MyAct;
}

export const PassActBody: FC<PassActBodyProps> = ({ page, act }) => {
  const studio = page.studio?.studio ?? null;
  const evenings =
    studio === null ? [] : laterEveningsOf(studio.evenings, act.nextEvening?.eventId ?? null);
  const trainings =
    studio === null
      ? []
      : laterTrainingsOf(
          studio.trainings,
          act.nextTraining?.calendarEntryId ?? null,
          page.viewerId,
        );
  const ownSpot = studio === null ? null : ownSpotOf(studio.spots, page.viewerId);
  const showsSide = page.canDetails && page.isWide && page.studio !== undefined;
  const spans = showsSide ? EDITOR_SPANS : MEMBER_SPANS;
  const detailsKey =
    page.canDetails && !page.isWide ? (
      <KkButton variant="outlined" size="small" onClick={page.openDetails}>
        {DETAILS_LABEL}
      </KkButton>
    ) : undefined;
  const side =
    showsSide && page.studio !== undefined ? (
      <Grid size={{ xs: 12, lg: EDITOR_SPANS.details }}>
        <PassDetails data={page.studio} viewerId={page.viewerId} framed />
      </Grid>
    ) : null;
  const drawer = page.isWide ? null : <PassDetailsSide page={page} />;

  return (
    <Grid container columnSpacing={3} rowSpacing={2} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
      <Grid size={{ xs: 12, lg: spans.card }}>
        <PassActCard
          act={act}
          viewerId={page.viewerId}
          level={1}
          titleHidden
          ownSpot={ownSpot}
          action={detailsKey}
        />
      </Grid>
      <Grid size={{ xs: 12, lg: spans.rows }}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <PassLaterEvenings evenings={evenings} />
          <PassLaterTrainings trainings={trainings} answers={act.viewerInCast} />
        </Stack>
      </Grid>
      {side}
      {drawer}
    </Grid>
  );
};
