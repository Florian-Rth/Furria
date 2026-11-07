import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkEditorDeskAreaName = 'band' | 'bar' | 'stage' | 'pane' | 'overview' | 'lanes';

interface KkEditorDeskAreaProps extends PropsWithChildren {
  area: KkEditorDeskAreaName;
}

export const KkEditorDeskArea: FC<KkEditorDeskAreaProps> = ({ area, children }) => (
  <Box
    data-kk-editor-desk-area={area}
    sx={{
      gridArea: area,
      minWidth: 0,
      minHeight: 0,
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr)',
    }}
  >
    {children}
  </Box>
);
