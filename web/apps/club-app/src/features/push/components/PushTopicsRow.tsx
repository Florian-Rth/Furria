import { KkButton } from '@furria/ui/KkButton';
import { KkHubRow } from '@furria/ui/KkHubRow';
import type { FC } from 'react';
import { PUSH_TOPICS_ACTION, PUSH_TOPICS_LABEL } from '../push-copy';

interface PushTopicsRowProps {
  tallyLabel: string;
  onChoose: () => void;
}

export const PushTopicsRow: FC<PushTopicsRowProps> = ({ tallyLabel, onChoose }) => {
  const choose = (
    <KkButton size="small" variant="outlined" onClick={onChoose}>
      {PUSH_TOPICS_ACTION}
    </KkButton>
  );

  return (
    <KkHubRow
      label={PUSH_TOPICS_LABEL}
      icon="list"
      meta={tallyLabel}
      dimWhenInert={false}
      action={choose}
    />
  );
};
