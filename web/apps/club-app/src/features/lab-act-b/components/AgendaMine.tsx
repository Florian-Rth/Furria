import { KkAgenda } from '@furria/ui/KkAgenda';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { castTitleOf, NOTES_LINE, OWN_SUFFIX } from '../agenda-copy';
import type { AgendaActPage } from '../hooks/use-agenda-act-page';
import { AgendaList } from './AgendaList';

interface AgendaMineProps {
  page: AgendaActPage;
}

export const AgendaMine: FC<AgendaMineProps> = ({ page }) => {
  const role = {
    actId: page.actId,
    answers: page.answers,
    showsTally: page.showsTally,
    marksAttendance: page.marksAttendance,
  };
  const castTitle = castTitleOf(page.template);
  const castCount = <KkMeta>{page.cast.length}</KkMeta>;
  const notes = page.template === 'stage' ? <KkNote icon="paragraph">{NOTES_LINE}</KkNote> : null;
  const cast =
    page.template === 'point' || page.cast.length === 0 ? null : (
      <KkPanelSection title={castTitle} meta={castCount}>
        <KkAgenda.Cast label={castTitle} names={page.cast} ownSuffix={OWN_SUFFIX} />
      </KkPanelSection>
    );

  return (
    <Grid container columnSpacing={5} rowSpacing={2.5}>
      <Grid size={{ xs: 12, md: 7 }} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <AgendaList
            weeks={page.weeks}
            hidden={page.hidden}
            now={page.now}
            role={role}
            onExpand={page.expand}
          />
          {notes}
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: 0 }}>
        {cast}
      </Grid>
    </Grid>
  );
};
