import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

const actionPaint = (theme: Theme): CSSObject => ({
  flexShrink: 0,
  gap: 0.75,
  minWidth: kkTokens.tapTarget,
  minHeight: kkTokens.tapTarget,
  px: { xs: 0, md: 1.5 },
  borderRadius: `${kkTokens.radius.pill}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  typography: 'button',
  color: 'text.primary',
  whiteSpace: 'nowrap',
  transition: 'background-color 160ms ease-out, border-color 160ms ease-out',
  ...focusRing(theme),
  '@media (hover: hover)': {
    '&:hover': { backgroundColor: 'action.hover', borderColor: 'text.primary' },
  },
});

interface KkWorkQueueActionProps {
  icon: KkIconName;
  label: string;
  onSelect: () => void;
}

export const KkWorkQueueAction: FC<KkWorkQueueActionProps> = ({ icon, label, onSelect }) => (
  <ButtonBase aria-label={label} onClick={onSelect} data-kk-work-queue-action sx={actionPaint}>
    <KkIcon name={icon} size="small" />
    <Box component="span" aria-hidden sx={{ display: { xs: 'none', md: 'inline' } }}>
      {label}
    </Box>
  </ButtonBase>
);
