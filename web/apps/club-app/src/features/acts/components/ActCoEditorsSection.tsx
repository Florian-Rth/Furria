import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CO_EDITOR_GRANT_LABEL, CO_EDITORS_EMPTY, CO_EDITORS_TITLE } from '../act-page-copy';
import { useActCoEditors } from '../hooks/use-act-co-editors';
import type { ActStudioResponse } from '../schemas';
import { ActCoEditorRow } from './ActCoEditorRow';

interface ActCoEditorsSectionProps {
  page: ActStudioResponse;
}

export const ActCoEditorsSection: FC<ActCoEditorsSectionProps> = ({ page }) => {
  const coEditors = useActCoEditors(page);
  const rows = coEditors.coEditors.map((coEditor) => (
    <ActCoEditorRow
      key={coEditor.personId}
      coEditor={coEditor}
      canRevoke={coEditors.canChange}
      isBusy={coEditors.isBusy}
      onRevoke={coEditors.revoke}
    />
  ));
  const list = rows.length === 0 ? <KkNote>{CO_EDITORS_EMPTY}</KkNote> : <KkPanel>{rows}</KkPanel>;
  const grant =
    coEditors.candidates.length === 0 ? null : (
      <KkChoiceChips
        label={CO_EDITOR_GRANT_LABEL}
        choices={coEditors.candidates}
        value={null}
        onChange={coEditors.grant}
      />
    );

  return (
    <KkPanelSection title={CO_EDITORS_TITLE}>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        {list}
        {grant}
      </Stack>
    </KkPanelSection>
  );
};
