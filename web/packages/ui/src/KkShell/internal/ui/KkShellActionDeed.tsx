import type { FC } from 'react';
import { KkButton } from '../../../KkButton';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';
import type { KkScreenDeed } from '../../screen-declaration';

type KkShellDeedWeight = 'contained' | 'outlined';

interface KkShellActionDeedProps {
  deed: KkScreenDeed;
  weight: KkShellDeedWeight;
  sx?: KkSx;
}

export const KkShellActionDeed: FC<KkShellActionDeedProps> = ({ deed, weight, sx }) => {
  const icon = deed.icon === undefined ? undefined : <KkIcon name={deed.icon} size="small" />;

  return (
    <KkButton
      variant={weight}
      startIcon={icon}
      disabled={deed.disabled}
      loading={deed.loading}
      onClick={deed.onSelect}
      sx={sx}
    >
      {deed.label}
    </KkButton>
  );
};
