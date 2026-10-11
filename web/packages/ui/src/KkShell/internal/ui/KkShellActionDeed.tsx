import type { FC } from 'react';
import type { KkButtonTone } from '../../../KkButton';
import { KkButton } from '../../../KkButton';
import { KkHoldButton } from '../../../KkHoldButton/KkHoldButton';
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
  const tone = deed.tone ?? DEFAULT_TONE;

  if (deed.hold !== undefined) {
    return (
      <KkHoldButton
        label={deed.label}
        hint={deed.hold.hint}
        confirm={deed.hold.confirm}
        tone={tone}
        disabled={deed.disabled === true || deed.loading === true}
        onCommit={deed.onSelect}
        sx={sx}
      />
    );
  }

  const icon = deed.icon === undefined ? undefined : <KkIcon name={deed.icon} size="small" />;

  return (
    <KkButton
      variant={weight}
      tone={tone}
      startIcon={icon}
      loading={deed.loading}
      disabled={deed.disabled}
      onClick={deed.onSelect}
      sx={sx}
    >
      {deed.label}
    </KkButton>
  );
};
