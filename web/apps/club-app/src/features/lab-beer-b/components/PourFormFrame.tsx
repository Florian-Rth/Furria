import type { KkIconName } from '@furria/ui/KkIcon';
import { KkNote } from '@furria/ui/KkNote';
import { KkStepPane } from '@furria/ui/KkStepPane';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { PourFormKind } from '../hooks/use-pour-hub';
import { FORM_CONTEXTS, FORM_TITLES } from '../pour-hub-copy';

const ICONS: Record<PourFormKind, KkIconName> = {
  payment: 'fees',
  crate: 'add',
  delivery: 'download',
  correction: 'edit',
};

interface PourFormFrameProps extends PropsWithChildren {
  form: PourFormKind;
  framed: boolean;
  actions: ReactNode;
  refusal: string | null;
}

export const PourFormFrame: FC<PourFormFrameProps> = ({
  form,
  framed,
  actions,
  refusal,
  children,
}) => {
  const title = FORM_TITLES[form];
  const refusalLine =
    refusal === null ? null : (
      <KkNote tone="warning" icon="alert">
        {refusal}
      </KkNote>
    );

  return (
    <KkStepPane label={title} framed={framed}>
      <KkStepPane.Head
        icon={ICONS[form]}
        title={title}
        context={FORM_CONTEXTS[form]}
        state="open"
        stateLabel=""
        actions={actions}
      />
      <KkStepPane.Body>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          {children}
          {refusalLine}
        </Stack>
      </KkStepPane.Body>
    </KkStepPane>
  );
};
