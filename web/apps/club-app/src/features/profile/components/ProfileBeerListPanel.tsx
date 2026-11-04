import { KkChip } from '@furria/ui/KkChip';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import type { FC } from 'react';
import { useBeerListEnrollment } from '../hooks/use-beer-list-enrollment';
import {
  BEER_LIST_DIALOGS,
  BEER_LIST_ENROLLED,
  BEER_LIST_ENROLLED_HINT,
  BEER_LIST_NOT_ENROLLED,
  BEER_LIST_NOT_ENROLLED_HINT,
  BEER_LIST_STATUS_LABEL,
  BEER_LIST_TITLE,
} from '../profile-beer-list-labels';
import { ProfileBeerListDialog } from './ProfileBeerListDialog';

export const ProfileBeerListPanel: FC = () => {
  const enrollment = useBeerListEnrollment();
  const status = enrollment.isEnrolled ? BEER_LIST_ENROLLED : BEER_LIST_NOT_ENROLLED;
  const hint = enrollment.isEnrolled ? BEER_LIST_ENROLLED_HINT : BEER_LIST_NOT_ENROLLED_HINT;
  const tone = enrollment.isEnrolled ? 'green' : 'neutral';

  const action: KkPanelAction = {
    label: BEER_LIST_DIALOGS[enrollment.action].actionLabel,
    emphasis: enrollment.isEnrolled ? 'quiet' : 'strong',
    icon: enrollment.isEnrolled ? 'close' : 'add',
    onClick: enrollment.ask,
  };

  return (
    <KkPanelSection title={BEER_LIST_TITLE} action={action}>
      <KkPanel>
        <KkFieldRow
          label={BEER_LIST_STATUS_LABEL}
          value={
            <KkChip tone={tone} dot>
              {status}
            </KkChip>
          }
          hint={hint}
        />
      </KkPanel>
      <ProfileBeerListDialog control={enrollment} />
    </KkPanelSection>
  );
};
