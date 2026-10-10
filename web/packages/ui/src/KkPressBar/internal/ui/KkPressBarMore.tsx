import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { FC, MouseEvent } from 'react';
import { useState } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkIcon } from '../../../KkIcon';

export interface KkPressMoreItem {
  id: string;
  label: string;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  onSelect: () => void;
}

interface KkPressBarMoreProps {
  label: string;
  items: readonly KkPressMoreItem[];
}

export const KkPressBarMore: FC<KkPressBarMoreProps> = ({ label, items }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const isOpen = anchor !== null;

  const open = (event: MouseEvent<HTMLElement>): void => {
    setAnchor(event.currentTarget);
  };
  const close = (): void => {
    setAnchor(null);
  };
  const entries = items.map((item) => {
    const choose = (): void => {
      setAnchor(null);
      item.onSelect();
    };
    const color = item.tone === 'danger' ? 'error.main' : 'text.primary';
    return (
      <MenuItem
        key={item.id}
        disabled={item.disabled}
        onClick={choose}
        sx={{ typography: 'body2', fontWeight: 700, color }}
      >
        {item.label}
      </MenuItem>
    );
  });

  return (
    <>
      <IconButton
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={open}
        sx={(theme) => ({ color: 'text.secondary', ...focusRing(theme) })}
      >
        <KkIcon name="actions" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={isOpen}
        onClose={close}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {entries}
      </Menu>
    </>
  );
};
