import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { PERSONS_ORIGIN } from '@/features/manage-persons/manage-persons-labels';
import { AREA_HANDOVERS } from '@/features/session/app-sections';
import { INTAKES_TITLE } from '../intake-labels';
import { IntakesBody } from './IntakesBody';

export const IntakesPage: FC = () => (
  <KkScreen
    kind="list"
    title={INTAKES_TITLE}
    origin={PERSONS_ORIGIN}
    header={<KkTitleHeader title={INTAKES_TITLE} />}
    handover={AREA_HANDOVERS.manage}
  >
    <IntakesBody />
  </KkScreen>
);
