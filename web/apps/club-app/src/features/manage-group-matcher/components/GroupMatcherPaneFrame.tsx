import type { KkIconName } from '@furria/ui/KkIcon';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkStepPane } from '@furria/ui/KkStepPane';
import type { KkStepState } from '@furria/ui/step-state';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import { CLOSE_LABEL } from '../group-matcher-hub-copy';

interface GroupMatcherPaneFrameProps extends PropsWithChildren {
  icon: KkIconName;
  title: string;
  context: string;
  state: KkStepState;
  stateLabel: string;
  foot: ReactNode;
}

export const GroupMatcherPaneFrame: FC<GroupMatcherPaneFrameProps> = ({
  icon,
  title,
  context,
  state,
  stateLabel,
  foot,
  children,
}) => {
  const { isWide, closePane } = useGroupMatcherHubContext();
  const close = isWide ? (
    <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={closePane} />
  ) : undefined;

  return (
    <KkStepPane label={title} framed={isWide}>
      <KkStepPane.Head
        icon={icon}
        title={title}
        context={context}
        state={state}
        stateLabel={stateLabel}
        actions={close}
      />
      <KkStepPane.Body>
        <Stack sx={{ gap: 2, minWidth: 0 }}>{children}</Stack>
      </KkStepPane.Body>
      <KkStepPane.Foot>{foot}</KkStepPane.Foot>
    </KkStepPane>
  );
};
