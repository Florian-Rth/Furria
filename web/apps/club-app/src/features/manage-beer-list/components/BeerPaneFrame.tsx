import type { KkIconName } from '@furria/ui/KkIcon';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkStepPane } from '@furria/ui/KkStepPane';
import type { KkStepState } from '@furria/ui/step-state';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import { CLOSE_LABEL } from '../beer-hub-copy';

interface BeerPaneFrameProps extends PropsWithChildren {
  icon: KkIconName;
  title: string;
  context?: string;
  state?: KkStepState;
  stateLabel?: string;
  switcher?: ReactNode;
}

export const BeerPaneFrame: FC<BeerPaneFrameProps> = ({
  icon,
  title,
  context = '',
  state = 'open',
  stateLabel = '',
  switcher,
  children,
}) => {
  const hub = useBeerHubContext();
  const close = hub.isWide ? (
    <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={hub.closePane} />
  ) : undefined;

  return (
    <KkStepPane label={title} framed={hub.isWide}>
      <KkStepPane.Head
        icon={icon}
        title={title}
        context={context}
        state={state}
        stateLabel={stateLabel}
        actions={close}
      />
      {switcher}
      <KkStepPane.Body>
        <Stack sx={{ gap: 2, minWidth: 0 }}>{children}</Stack>
      </KkStepPane.Body>
    </KkStepPane>
  );
};
