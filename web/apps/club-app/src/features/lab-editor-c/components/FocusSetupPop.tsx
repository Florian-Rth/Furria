import { KkFocusPop } from '@furria/ui/KkFocusPop';
import type { FC } from 'react';
import { FOCUS_SETUP_TITLE } from '../focus-copy';
import type { FocusSetup } from '../hooks/use-focus-setup';

interface FocusSetupPopProps {
  setup: FocusSetup;
}

export const FocusSetupPop: FC<FocusSetupPopProps> = ({ setup }) => {
  if (setup.progress.complete) {
    return null;
  }

  const rows = setup.actions.map((action) => (
    <KkFocusPop.Row
      key={action.task}
      lead={action.number}
      text={action.text}
      meta={action.hint}
      state={action.state}
      onPress={action.run}
    />
  ));
  const tone = setup.progress.done === 0 ? 'accent' : 'plain';

  return (
    <KkFocusPop
      glyph="checklist"
      text={setup.chip}
      label={setup.chipLabel}
      title={FOCUS_SETUP_TITLE}
      tone={tone}
      open={setup.open}
      onOpen={setup.show}
      onClose={setup.hide}
    >
      {rows}
    </KkFocusPop>
  );
};
