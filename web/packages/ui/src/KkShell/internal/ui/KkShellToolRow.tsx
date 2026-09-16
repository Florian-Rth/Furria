import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { kkTokens } from '../../../tokens';
import { useKkShell } from '../logic/shell-context';

const { toolRowHeight } = kkTokens.shell;
const TOOL_ROW_PADDING_X = 1;

export const KkShellToolRow: FC<PropsWithChildren> = ({ children }) => {
  const { density } = useKkShell();

  return (
    <KkChrome
      density={density}
      sx={{ height: `${toolRowHeight}px`, justifyContent: 'center', px: TOOL_ROW_PADDING_X }}
    >
      <Stack
        direction="row"
        data-kk-shell-tool-row
        sx={{ alignItems: 'center', gap: 1, minWidth: 0, flexWrap: 'nowrap' }}
      >
        {children}
      </Stack>
    </KkChrome>
  );
};
