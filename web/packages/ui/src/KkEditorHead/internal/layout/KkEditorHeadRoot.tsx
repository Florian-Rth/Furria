import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { FOLDED_BAR_HEIGHT, foldedBarRoomOf } from '../../../KkShell/internal/folded-bar';
import { useKkBarFold } from '../../../KkShell/use-bar-fold';

interface KkEditorHeadRootProps extends PropsWithChildren {
  label: string;
}

export const KkEditorHeadRoot: FC<KkEditorHeadRootProps> = ({ label, children }) => {
  useKkBarFold();

  return (
    <Stack
      direction="row"
      role="toolbar"
      aria-label={label}
      data-kk-editor-head
      sx={(theme) => ({
        alignItems: 'center',
        gap: 0.25,
        minWidth: 0,
        height: FOLDED_BAR_HEIGHT,
        paddingInlineStart: foldedBarRoomOf(theme),
      })}
    >
      {children}
    </Stack>
  );
};
