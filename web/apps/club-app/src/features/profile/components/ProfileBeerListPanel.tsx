import { KkChip } from '@furria/ui/KkChip';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { useBeerListEnrollment } from '../hooks/use-beer-list-enrollment';
import { BEER_LIST_STATUS_LABEL, BEER_LIST_TITLE } from '../profile-beer-list-labels';
import { ProfileBeerListDialog } from './ProfileBeerListDialog';

export const ProfileBeerListPanel: FC = () => {
  const { state, panelAction, dialog } = useBeerListEnrollment();

  return (
    <KkPanelSection title={BEER_LIST_TITLE} action={panelAction}>
      <KkPanel>
        <KkFieldRow
          label={BEER_LIST_STATUS_LABEL}
          value={
            <KkChip tone={state.tone} dot>
              {state.status}
            </KkChip>
          }
        />
      </KkPanel>
      <ProfileBeerListDialog control={dialog} />
    </KkPanelSection>
  );
};
