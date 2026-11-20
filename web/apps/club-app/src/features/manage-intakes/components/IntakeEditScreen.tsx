import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { useIntakeRights } from '../hooks/use-intake-rights';
import { useIntakeSubScreen } from '../hooks/use-intake-sub-screen';
import { EDIT_INTAKE_TITLE } from '../intake-labels';
import { IntakeEditor } from './IntakeEditor';
import { IntakeScreenHold } from './IntakeScreenHold';
import { IntakeSubScreenHold } from './IntakeSubScreenHold';

const ROUTE_ID = '/_app/manage/persons_/intakes_/$intakeId_/edit';

export const IntakeEditScreen: FC = () => {
  const { intakeId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(intakeId);
  const screen = useIntakeSubScreen(id, 'edit');
  const access = useIntakeRights();

  if (access.isUndecided || access.hasFailed) {
    return (
      <IntakeScreenHold
        title={EDIT_INTAKE_TITLE}
        isPending={access.isUndecided}
        hasFailed={access.hasFailed}
        onRetry={access.retry}
      />
    );
  }
  if (screen.details === null) {
    return <IntakeSubScreenHold title={EDIT_INTAKE_TITLE} intakeId={id} gate={screen.gate} />;
  }

  return (
    <IntakeEditor
      intake={screen.details.intake}
      presetGroupId={null}
      rights={access.rights}
      groups={access.groups}
    />
  );
};
