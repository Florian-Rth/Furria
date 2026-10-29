import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';

export interface KkStudioBTransportNoteAction {
  label: string;
  onSelect: () => void;
}

const actionPaint = (theme: Theme): CSSObject => ({
  ...redInk(theme),
  typography: 'caption',
  fontWeight: 800,
  ...focusRing(theme),
});

interface KkStudioBTransportNoteProps {
  text: string;
  action: KkStudioBTransportNoteAction | null;
}

export const KkStudioBTransportNote: FC<KkStudioBTransportNoteProps> = ({ text, action }) => {
  const button =
    action === null ? null : (
      <ButtonBase onClick={action.onSelect} sx={actionPaint}>
        {action.label}
      </ButtonBase>
    );

  return (
    <Stack direction="row" role="status" sx={{ gap: 1, alignItems: 'baseline', minWidth: 0 }}>
      <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
        {text}
      </Box>
      {button}
    </Stack>
  );
};
