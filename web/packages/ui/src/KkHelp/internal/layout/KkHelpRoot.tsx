import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KkSheet } from '../../../KkSheet/KkSheet';
import { HELP_SHEET_ID } from '../../help-sheet-id';
import { HELP_COUNTER } from '../logic/help-counter';

interface KkHelpRootProps extends PropsWithChildren {
  title: string;
  closeLabel: string;
}

export const KkHelpRoot: FC<KkHelpRootProps> = ({ title, closeLabel, children }) => (
  <KkSheet id={HELP_SHEET_ID} title={title} closeLabel={closeLabel}>
    <KkSheet.Body>
      <Stack
        component="ol"
        data-kk-help
        sx={{
          gap: 2.5,
          m: 0,
          p: 0,
          pb: 1,
          listStyle: 'none',
          minWidth: 0,
          counterReset: HELP_COUNTER,
          '& > li + li': { borderTop: 1, borderColor: 'divider', pt: 2.5 },
        }}
      >
        {children}
      </Stack>
    </KkSheet.Body>
  </KkSheet>
);
