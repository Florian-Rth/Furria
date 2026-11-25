import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { PERSONS_ORIGIN } from '@/features/manage-persons/manage-persons-labels';
import { AREA_HANDOVERS } from '@/features/session/app-sections';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { INTAKES_TITLE } from '../intake-labels';
import { IntakesBody } from './IntakesBody';
import { IntakesHelp } from './IntakesHelp';

export const IntakesPage: FC = () => {
  const { has, isUndecided } = usePermissions();
  const managesPersons = has(PERMISSION_KEYS.personsManage);
  const help = isUndecided
    ? undefined
    : toScreenHelp(<IntakesHelp managesPersons={managesPersons} />);

  return (
    <KkScreen
      kind="list"
      title={INTAKES_TITLE}
      origin={PERSONS_ORIGIN}
      header={<KkTitleHeader title={INTAKES_TITLE} />}
      handover={AREA_HANDOVERS.manage}
      help={help}
    >
      <IntakesBody />
    </KkScreen>
  );
};
