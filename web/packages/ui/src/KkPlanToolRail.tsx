import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { inkWashSurface } from './internal/ink-wash';
import { tapArea } from './internal/tap-area';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkPlanToolRailOrientation = 'vertical' | 'horizontal';

export interface KkPlanTool {
  id: string;
  label: string;
  icon: KkIconName;
}

export interface KkPlanToolAction {
  id: string;
  label: string;
  icon: KkIconName;
  disabled?: boolean;
  onClick: () => void;
}

interface KkPlanToolRailProps {
  label: string;
  orientation: KkPlanToolRailOrientation;
  tools: readonly KkPlanTool[];
  value: string;
  onChange: (id: string) => void;
  actions?: readonly KkPlanToolAction[];
  sx?: KkSx;
}

const BUTTON_REM = '2.5rem';

const buttonPaint =
  (active: boolean) =>
  (theme: Theme): CSSObject => ({
    width: BUTTON_REM,
    height: BUTTON_REM,
    flexShrink: 0,
    borderRadius: `${kkTokens.radius.base}px`,
    color: active ? (theme.vars ?? theme).palette.background.paper : 'text.primary',
    backgroundColor: active ? (theme.vars ?? theme).palette.text.primary : 'transparent',
    ...focusRing(theme),
    ...tapArea(),
    '&.Mui-disabled': { color: 'text.disabled' },
    '@media (hover: hover)': {
      '&:hover': active ? {} : inkWashSurface(theme, '8%', '14%'),
    },
  });

export const KkPlanToolRail: FC<KkPlanToolRailProps> = ({
  label,
  orientation,
  tools,
  value,
  onChange,
  actions = [],
  sx,
}) => {
  const isVertical = orientation === 'vertical';
  const toolButtons = tools.map((tool) => {
    const active = tool.id === value;
    const choose = (): void => {
      onChange(tool.id);
    };

    return (
      <ButtonBase
        key={tool.id}
        aria-label={tool.label}
        aria-pressed={active}
        title={tool.label}
        onClick={choose}
        data-kk-plan-tool={tool.id}
        sx={buttonPaint(active)}
      >
        <KkIcon name={tool.icon} size="small" />
      </ButtonBase>
    );
  });
  const actionButtons = actions.map((action) => (
    <ButtonBase
      key={action.id}
      aria-label={action.label}
      title={action.label}
      disabled={action.disabled}
      onClick={action.onClick}
      data-kk-plan-action={action.id}
      sx={buttonPaint(false)}
    >
      <KkIcon name={action.icon} size="small" />
    </ButtonBase>
  ));
  const divider =
    actions.length === 0 ? null : (
      <Box
        aria-hidden
        sx={(theme) => ({
          flexShrink: 0,
          alignSelf: 'stretch',
          ...(isVertical
            ? { height: kkTokens.line.hair, my: 0.5 }
            : { width: kkTokens.line.hair, mx: 0.5 }),
          backgroundColor: (theme.vars ?? theme).palette.divider,
        })}
      />
    );

  return (
    <Stack
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      direction={isVertical ? 'column' : 'row'}
      data-kk-plan-tool-rail
      sx={[
        (theme) => ({
          alignItems: 'center',
          gap: 0.5,
          p: 0.5,
          borderRadius: `${kkTokens.radius.base + 4}px`,
          backgroundColor: (theme.vars ?? theme).palette.background.paper,
          boxShadow: kkTokens.shadow.raised,
          ...(isVertical ? {} : { overflowX: 'auto', maxWidth: '100%' }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {toolButtons}
      {divider}
      {actionButtons}
    </Stack>
  );
};
