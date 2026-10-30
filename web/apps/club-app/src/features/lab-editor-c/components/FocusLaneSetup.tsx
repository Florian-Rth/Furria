import type { KkFocusLane } from '@furria/ui/KkFocusLanes';
import { KkFocusLanes } from '@furria/ui/KkFocusLanes';
import { KkFocusSetup } from '@furria/ui/KkFocusSetup';
import type { FC } from 'react';
import type { FocusSetupAction } from '../hooks/use-focus-setup';

interface FocusLaneSetupProps {
  lane: KkFocusLane;
  action: FocusSetupAction | null;
}

export const FocusLaneSetup: FC<FocusLaneSetupProps> = ({ lane, action }) => {
  const state = action?.state === 'next' ? 'next' : 'later';
  const setup =
    action === null ? null : (
      <KkFocusSetup
        number={action.number}
        text={action.text}
        hint={action.hint}
        state={state}
        onPress={action.run}
      />
    );

  return <KkFocusLanes.Center lane={lane}>{setup}</KkFocusLanes.Center>;
};
