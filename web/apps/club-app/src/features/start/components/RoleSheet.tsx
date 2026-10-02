import { KkMeta, KkPanelSection, KkSheet, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useRoleSheet } from '../hooks/use-role-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import type { RoleSheetVariant } from '../role-sheet';

const CLOSE_LABEL = 'Schließen';
const PERMISSIONS_TITLE = 'Damit darfst du';
const NO_PERMISSIONS_LINE = 'Damit sind keine besonderen Rechte verbunden.';

interface RoleSheetProps {
  variant: RoleSheetVariant;
  board: StartBoard;
}

export const RoleSheet: FC<RoleSheetProps> = ({ variant, board }) => {
  const sheet = useRoleSheet(variant, board);

  if (sheet === null) {
    return null;
  }

  const permissions = sheet.permissions.map((permission) => (
    <Stack key={permission.title} sx={{ gap: 0.25, minWidth: 0 }}>
      <KkText variant="subtitle2">{permission.title}</KkText>
      <KkText variant="body2" tone="secondary">
        {permission.line}
      </KkText>
    </Stack>
  ));

  const body =
    permissions.length === 0 ? (
      <KkMeta italic>{NO_PERMISSIONS_LINE}</KkMeta>
    ) : (
      <KkPanelSection title={PERMISSIONS_TITLE}>
        <Stack sx={{ gap: 1.5, minWidth: 0 }}>{permissions}</Stack>
      </KkPanelSection>
    );

  return (
    <KkSheet id={sheet.sheetId} title={sheet.title} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>{body}</KkSheet.Body>
      <KkSheet.Actions primary={sheet.action} />
    </KkSheet>
  );
};
