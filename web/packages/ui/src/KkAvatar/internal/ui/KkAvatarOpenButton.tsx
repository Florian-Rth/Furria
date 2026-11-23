import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';

const openPaint = (theme: Theme): CSSObject => ({
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  cursor: 'zoom-in',
  pointerEvents: 'auto',
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '8%') } },
});

interface KkAvatarOpenButtonProps {
  label: string;
  onOpen: () => void;
}

export const KkAvatarOpenButton: FC<KkAvatarOpenButtonProps> = ({ label, onOpen }) => (
  <ButtonBase aria-label={label} onClick={onOpen} data-kk-avatar-open sx={openPaint} />
);
