import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkIconName } from '../../../KkIcon';
import { KkStateBadge } from '../../../KkStateBadge/KkStateBadge';
import type { KkStepState } from '../../../KkStatePill/step-state';
import { kkTokens } from '../../../tokens';

const tabPaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flex: 1,
    minWidth: kkTokens.tapTarget,
    minHeight: '3.25rem',
    pb: 0.75,
    pt: 0.5,
    borderRadius: `${kkTokens.radius.bar * 2}px ${kkTokens.radius.bar * 2}px 0 0`,
    ...focusRing(theme),
    '@media (hover: hover)': { '&:hover': { backgroundColor: 'action.hover' } },
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '22%',
      right: '22%',
      bottom: -kkTokens.line.hair,
      height: kkTokens.line.page,
      borderRadius: `${kkTokens.radius.bar}px`,
      backgroundColor: selected ? (theme.vars ?? theme).palette.text.primary : 'transparent',
      transition: 'background-color 160ms ease-out',
    },
  });

interface KkStepPaneTabProps {
  icon: KkIconName;
  state: KkStepState;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export const KkStepPaneTab: FC<KkStepPaneTabProps> = ({
  icon,
  state,
  label,
  selected,
  onSelect,
}) => (
  <ButtonBase
    role="tab"
    aria-selected={selected}
    aria-label={label}
    onClick={onSelect}
    data-kk-step-pane-tab={state}
    sx={tabPaint(selected)}
  >
    <KkStateBadge icon={icon} state={state} size="small" />
  </ButtonBase>
);
