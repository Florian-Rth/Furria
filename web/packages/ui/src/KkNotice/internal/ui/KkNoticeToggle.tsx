import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

const COLLAPSED_TURN = '90deg';
const EXPANDED_TURN = '-90deg';
const TOGGLE_GAP = 1;

interface KkNoticeToggleProps extends PropsWithChildren {
  expanded: boolean;
  label: string;
  onSelect: () => void;
}

export const KkNoticeToggle: FC<KkNoticeToggleProps> = ({
  expanded,
  label,
  onSelect,
  children,
}) => {
  const turn = expanded ? EXPANDED_TURN : COLLAPSED_TURN;

  return (
    <Stack
      component="button"
      type="button"
      direction="row"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onSelect}
      data-kk-notice-toggle
      sx={(theme) => ({
        flexGrow: 1,
        minWidth: 0,
        minHeight: kkTokens.tapTarget,
        alignItems: 'center',
        gap: TOGGLE_GAP,
        p: 0,
        border: 'none',
        background: 'none',
        textAlign: 'start',
        cursor: 'pointer',
        ...focusRing(theme),
      })}
    >
      {children}
      <KkIcon
        name="chevron"
        size="small"
        sx={{ flexShrink: 0, color: 'text.secondary', transform: `rotate(${turn})` }}
      />
    </Stack>
  );
};
