import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';
import type { BeerListDialogControl } from '../hooks/use-beer-list-enrollment';
import { BEER_LIST_CANCEL, BEER_LIST_CLOSE, BEER_LIST_DIALOGS } from '../profile-beer-list-labels';

interface ProfileBeerListDialogProps {
  control: BeerListDialogControl;
}

export const ProfileBeerListDialog: FC<ProfileBeerListDialogProps> = ({ control }) => {
  const copy = BEER_LIST_DIALOGS[control.askedAbout];

  return (
    <KkConfirmDialog
      open={control.isAsking}
      onClose={control.cancel}
      onConfirm={control.confirm}
      eyebrow={copy.eyebrow}
      question={copy.question}
      explanation={copy.explanation}
      facts={copy.facts}
      consequence={copy.consequence}
      error={control.error}
      confirmLabel={copy.confirmLabel}
      cancelLabel={BEER_LIST_CANCEL}
      closeLabel={BEER_LIST_CLOSE}
      busy={control.isSaving}
    />
  );
};
