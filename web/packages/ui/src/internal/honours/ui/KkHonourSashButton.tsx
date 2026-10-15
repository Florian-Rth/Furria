import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../focus-ring';
import { flagRevealOf } from '../honour-flag';
import { KkHonourFlag } from './KkHonourFlag';

const sashButtonFace = (theme: Theme): CSSObject => ({
  position: 'relative',
  display: 'block',
  width: '100%',
  height: '100%',
  padding: 0,
  margin: 0,
  border: 0,
  borderRadius: '50%',
  appearance: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  ...focusRing(theme),
  ...flagRevealOf('sash'),
});

interface KkHonourSashButtonProps {
  label: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const KkHonourSashButton: FC<KkHonourSashButtonProps> = ({
  label,
  open,
  onToggle,
  onClose,
}) => (
  <Box
    component="button"
    type="button"
    aria-label={label}
    aria-expanded={open}
    onClick={onToggle}
    onBlur={onClose}
    data-kk-honour-sash-button
    sx={sashButtonFace}
  >
    <KkHonourFlag label={label} tone="sash" />
  </Box>
);
