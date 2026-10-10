import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import type { FC, MouseEvent, ReactNode } from 'react';
import { useState } from 'react';
import { KkIcon } from './KkIcon';

export interface KkKickerOption {
  id: string;
  text: string;
  face: ReactNode;
}

interface KkKickerMenuProps {
  id: string;
  label: string;
  emptyLabel: string;
  selected: string | null;
  face: ReactNode;
  options: readonly KkKickerOption[];
  disabled?: boolean;
  onChoose: (id: string) => void;
}

export const KkKickerMenu: FC<KkKickerMenuProps> = ({
  id,
  label,
  emptyLabel,
  selected,
  face,
  options,
  disabled = false,
  onChoose,
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const menuId = `${id}-menu`;
  const isOpen = anchor !== null;

  const handleOpen = (event: MouseEvent<HTMLElement>): void => {
    setAnchor(event.currentTarget);
  };
  const handleClose = (): void => {
    setAnchor(null);
  };

  const empty = (
    <Typography
      component="span"
      variant="caption"
      sx={{
        px: 1.25,
        py: 0.5,
        border: 1,
        borderStyle: 'dashed',
        borderColor: 'text.disabled',
        borderRadius: 4,
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'text.secondary',
      }}
    >
      {emptyLabel}
    </Typography>
  );
  const shownFace = selected === null ? empty : face;
  const selectedText = options.find((option) => option.id === selected)?.text ?? null;
  const accessibleName = selectedText === null ? label : `${label}: ${selectedText}`;
  const opener = disabled ? null : (
    <KkIcon
      name="chevron"
      size="small"
      sx={{ color: 'text.secondary', transform: isOpen ? 'rotate(-90deg)' : 'rotate(90deg)' }}
    />
  );
  const items = options.map((option) => {
    const handleChoose = (): void => {
      setAnchor(null);
      onChoose(option.id);
    };
    return (
      <MenuItem key={option.id} selected={option.id === selected} onClick={handleChoose}>
        {option.face}
      </MenuItem>
    );
  });

  return (
    <>
      <ButtonBase
        id={id}
        aria-label={accessibleName}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={handleOpen}
        sx={{ gap: 0.25, borderRadius: 4, alignSelf: 'flex-start' }}
      >
        {shownFace}
        {opener}
      </ButtonBase>
      <Menu id={menuId} anchorEl={anchor} open={isOpen} onClose={handleClose}>
        {items}
      </Menu>
    </>
  );
};
