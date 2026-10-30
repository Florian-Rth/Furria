import type { FC } from 'react';
import { useEveningMutations } from '@/features/act-studio/evening-api';
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

  return <ActEveningSide page={page} pane={pane} />;
};
