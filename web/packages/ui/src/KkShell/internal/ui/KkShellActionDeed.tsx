import type { FC } from 'react';
import type { KkButtonTone } from '../../../KkButton';
import { KkButton } from '../../../KkButton';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';
import type { KkScreenDeed } from '../../screen-declaration';

type KkShellDeedWeight = 'contained' | 'outlined';

const DEFAULT_TONE: KkButtonTone = 'default';

interface KkShellActionDeedProps {
  deed: KkScreenDeed;
  weight: KkShellDeedWeight;
  sx?: KkSx;
}

export const KkShellActionDeed: FC<KkShellActionDeedProps> = ({ deed, weight, sx }) => {
  const icon = deed.icon === undefined ? undefined : <KkIcon name={deed.icon} size="small" />;
  const tone = deed.tone ?? DEFAULT_TONE;

  return (
    <KkButton
      variant={weight}
      tone={tone}
      startIcon={icon}
      loading={deed.loading}
      onClick={deed.onSelect}
      sx={sx}
    >
      {deed.label}
    </KkButton>
  );
};
