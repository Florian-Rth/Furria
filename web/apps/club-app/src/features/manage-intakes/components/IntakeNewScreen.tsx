import { useSearch } from '@tanstack/react-router';
import type { FC } from 'react';
import { useIntakeRights } from '../hooks/use-intake-rights';
import { NEW_INTAKE_LABEL } from '../intake-labels';
import { runsIntakes, toPresetGroupId } from '../intake-rules';
import { IntakeEditor } from './IntakeEditor';
import { IntakeScreenHold } from './IntakeScreenHold';

const ROUTE_ID = '/_app/manage/intakes_/new';

export const IntakeNewScreen: FC = () => {
  const { group } = useSearch({ from: ROUTE_ID });
  const access = useIntakeRights();

  if (access.isUndecided || access.hasFailed || !runsIntakes(access.rights)) {
    return (
      <IntakeScreenHold
        title={NEW_INTAKE_LABEL}
        isPending={access.isUndecided}
        hasFailed={access.hasFailed}
        onRetry={access.retry}
      />
    );
  }

  return (
    <IntakeEditor
      intake={null}
      presetGroupId={toPresetGroupId(group ?? null, access.rights)}
      rights={access.rights}
      groups={access.groups}
    />
  );
};
