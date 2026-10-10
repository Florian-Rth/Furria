import Stack from '@mui/material/Stack';
import type { FC, MouseEvent } from 'react';
import type { KkIconName } from './KkIcon';
import { KkIconButton } from './KkIconButton';
import type { KkSx } from './kk-sx';

export interface KkFormatRailItem {
  id: string;
  icon: KkIconName;
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

const PRESSED_STYLE = {
  color: 'primary.main',
  bgcolor: 'action.selected',
  '&:hover': { bgcolor: 'action.selected' },
} as const;

const keepEditorFocus = (event: MouseEvent<HTMLDivElement>): void => {
  event.preventDefault();
};

interface KkFormatRailProps {
  label: string;
  items: readonly KkFormatRailItem[];
  orientation?: 'vertical' | 'horizontal';
  sx?: KkSx;
}

export const KkFormatRail: FC<KkFormatRailProps> = ({
  label,
  items,
  orientation = 'vertical',
  sx,
}) => {
  const buttons = items.map((item) => (
    <KkIconButton
      key={item.id}
      label={item.label}
      icon={item.icon}
      size="small"
      pressed={item.pressed}
      disabled={item.disabled}
      onClick={item.onSelect}
      sx={item.pressed === true ? PRESSED_STYLE : undefined}
    />
  ));

  return (
    <Stack
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      data-kk-format-rail={orientation}
      onMouseDown={keepEditorFocus}
      direction={orientation === 'vertical' ? 'column' : 'row'}
      sx={[
        (theme) => ({
          gap: 0.25,
          p: 0.5,
          alignItems: 'center',
          justifyContent: orientation === 'vertical' ? 'flex-start' : 'space-around',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: theme.shadows[1],
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {buttons}
    </Stack>
  );
};
