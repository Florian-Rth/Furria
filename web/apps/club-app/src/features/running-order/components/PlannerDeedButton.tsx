import { KkButton } from '@furria/ui/KkButton';
import { KkHoldButton } from '@furria/ui/KkHoldButton';
import { KkIcon } from '@furria/ui/KkIcon';
import type { KkScreenDeed } from '@furria/ui/screen-declaration';
import type { FC } from 'react';

interface PlannerDeedButtonProps {
  deed: KkScreenDeed;
  weight: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium';
}

export const PlannerDeedButton: FC<PlannerDeedButtonProps> = ({ deed, weight, size = 'small' }) => {
  if (deed.hold !== undefined) {
    return (
      <KkHoldButton
        label={deed.label}
        hint={deed.hold.hint}
        confirm={deed.hold.confirm}
        disabled={deed.disabled === true || deed.loading === true}
        onCommit={deed.onSelect}
      />
    );
  }

  const icon = deed.icon === undefined ? undefined : <KkIcon name={deed.icon} size="small" />;

  return (
    <KkButton
      size={size}
      variant={weight}
      startIcon={icon}
      loading={deed.loading}
      disabled={deed.disabled}
      onClick={deed.onSelect}
    >
      {deed.label}
    </KkButton>
  );
};
