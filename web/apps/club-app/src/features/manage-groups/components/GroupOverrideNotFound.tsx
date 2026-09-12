import { KkButton, KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';

const TITLE = 'DIESE GRUPPE GIBT ES NICHT';
const DESCRIPTION =
  'Vielleicht wurde sie umbenannt oder nie angelegt. Wähl eine Gruppe aus der Liste.';
const CLEAR_LABEL = 'Auswahl aufheben';

interface GroupOverrideNotFoundProps {
  onClear: () => void;
}

export const GroupOverrideNotFound: FC<GroupOverrideNotFoundProps> = ({ onClear }) => {
  const clearAction = (
    <KkButton variant="outlined" onClick={onClear}>
      {CLEAR_LABEL}
    </KkButton>
  );

  return (
    <KkPanel variant="block" tone="reserved">
      <KkEmptyState icon="group" title={TITLE} description={DESCRIPTION} action={clearAction} />
    </KkPanel>
  );
};
