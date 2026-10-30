import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkIconButton } from '@furria/ui/KkIconButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { BACK_LABEL, KEYS_LABEL } from '../heute-c-copy';
import { KEY_HEIGHT } from '../heute-c-layout';
import type { HeuteCState } from '../hooks/use-heute-c';

interface HeuteCKeysProps {
  heute: HeuteCState;
}

const forwardIcon = <KkIcon name="play" />;

export const HeuteCKeys: FC<HeuteCKeysProps> = ({ heute }) => {
  if (!heute.canDirect) {
    return null;
  }
  const backDisabled = !heute.canBack;
  const forwardDisabled = !heute.canForward;

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={KEYS_LABEL}
      sx={{ gap: 1.5, minWidth: 0, alignItems: 'center' }}
    >
      <KkIconButton
        label={BACK_LABEL}
        icon="back"
        disabled={backDisabled}
        onClick={heute.back}
        sx={{ flexShrink: 0 }}
      />
      <KkButton
        size="large"
        fullWidth
        disabled={forwardDisabled}
        loading={heute.isMoving}
        startIcon={forwardIcon}
        onClick={heute.forward}
        sx={{ minHeight: KEY_HEIGHT, minWidth: 0 }}
      >
        {heute.weiterCaption}
      </KkButton>
    </Stack>
  );
};
