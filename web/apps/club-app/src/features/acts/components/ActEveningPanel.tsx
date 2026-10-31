import type { FC } from 'react';
import { ChoreographyVersionsSection } from '@/features/act-studio/components/ChoreographyVersionsSection';
import { useEveningMutations } from '@/features/act-studio/evening-api';
import { EVENING_VERSIONS_TITLE } from '@/features/act-studio/undo-copy';
import { useActEveningPane } from '../hooks/use-act-evening-pane';
import type { ActPageState } from '../hooks/use-act-page';
import type { ActStudioResponse, Studio, StudioEvening } from '../schemas';
import { ActEveningSide } from './ActEveningSide';

interface ActEveningPanelProps {
  page: ActPageState;
  data: ActStudioResponse;
  studio: Studio;
  evening: StudioEvening;
}

export const ActEveningPanel: FC<ActEveningPanelProps> = ({ page, data, studio, evening }) => {
  const mutations = useEveningMutations(data.act.actId);
  const pane = useActEveningPane(page, data, studio, evening, mutations);

  const versions =
    data.viewer.canEditStudio && pane.hasCopy ? (
      <ChoreographyVersionsSection
        actId={data.act.actId}
        eventId={evening.eventId}
        studio={studio}
        title={EVENING_VERSIONS_TITLE}
      />
    ) : null;

  return (
    <ActEveningSide page={page} pane={pane}>
      {versions}
    </ActEveningSide>
  );
};
