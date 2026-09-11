import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC } from 'react';
import { useId } from 'react';
import { inkWash, inkWashSurface } from './internal/ink-wash';
import { rowDividerBottom } from './internal/row-divider';
import type { KkChipTone } from './KkChip';
import { KkChip } from './KkChip';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const TRACK_WIDTH = 46;
const TRACK_HEIGHT = 27;
const KNOB_SIZE = 21;
const KNOB_INSET = 3;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;
const SWITCH_BASE_SIZE = KNOB_SIZE + KNOB_INSET * 2;
const HIT_OFFSET = `calc((${kkTokens.tapTarget} - ${SWITCH_BASE_SIZE}px) / -2)`;
const TRACK_TRANSITION = 'background-color 0.2s';
const TRACK_WASH_LIGHT = '16%';
const TRACK_WASH_DARK = '18%';
const KNOB_RING = '42%';
const BUSY_OPACITY = 0.6;
const DISABLED_OPACITY = 0.45;

interface KkSwitchRowStateLabel {
  on: string;
  off: string;
}

interface KkSwitchRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  stateLabel?: KkSwitchRowStateLabel;
  error?: string;
  disabled?: boolean;
  busy?: boolean;
  sx?: KkSx;
}

export const KkSwitchRow: FC<KkSwitchRowProps> = ({
  label,
  checked,
  onChange,
  description,
  stateLabel,
  error,
  disabled = false,
  busy = false,
  sx,
}) => {
  const rowId = useId();
  const titleId = `${rowId}-title`;
  const descriptionId = `${rowId}-description`;
  const errorId = `${rowId}-error`;
  const describedIds = [
    description === undefined ? null : descriptionId,
    error === undefined ? null : errorId,
  ].filter((id): id is string => id !== null);
  const describedBy = describedIds.length === 0 ? undefined : describedIds.join(' ');
  const stateKey: keyof KkSwitchRowStateLabel = checked ? 'on' : 'off';
  const stateTone: KkChipTone = checked ? 'green' : 'neutral';
  const switchOpacity = busy ? BUSY_OPACITY : 1;

  const change = (_event: ChangeEvent<HTMLInputElement>, nextChecked: boolean): void => {
    onChange(nextChecked);
  };

  const stateChip =
    stateLabel === undefined ? null : (
      <KkChip tone={stateTone} size="small">
        {stateLabel[stateKey]}
      </KkChip>
    );

  const descriptionLine =
    description === undefined ? null : (
      <Typography
        id={descriptionId}
        variant="body2"
        sx={{ color: 'text.secondary', textWrap: 'pretty' }}
      >
        {description}
      </Typography>
    );

  const errorLine =
    error === undefined ? null : (
      <Typography
        id={errorId}
        role="alert"
        variant="caption"
        sx={{ color: 'error.main', fontWeight: 700 }}
      >
        {error}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      data-kk-switch-row
      aria-busy={busy}
      sx={[
        {
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          minWidth: 0,
          py: 1.375,
          ...rowDividerBottom,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 0.625 }}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, minWidth: 0 }}>
          <Typography
            id={titleId}
            sx={{
              color: 'text.primary',
              fontSize: kkTokens.type.rowTitle,
              fontWeight: 800,
              minWidth: 0,
            }}
          >
            {label}
          </Typography>
          {stateChip}
        </Stack>
        {descriptionLine}
        {errorLine}
      </Stack>
      <Switch
        checked={checked}
        onChange={change}
        disabled={disabled}
        disableRipple
        data-kk-switch-row-control
        slotProps={{ input: { 'aria-labelledby': titleId, 'aria-describedby': describedBy } }}
        sx={(theme) => ({
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          flexShrink: 0,
          padding: 0,
          opacity: switchOpacity,
          '& .MuiSwitch-switchBase': {
            padding: `${KNOB_INSET}px`,
            '&.Mui-checked': { transform: `translateX(${KNOB_TRAVEL}px)` },
            '&.Mui-checked + .MuiSwitch-track': {
              backgroundColor: (theme.vars ?? theme).palette.success.main,
              opacity: 1,
            },
            '&.Mui-disabled + .MuiSwitch-track': { opacity: DISABLED_OPACITY },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              outline: `${kkTokens.line.section}px solid`,
              outlineColor: (theme.vars ?? theme).palette.primary.main,
              outlineOffset: KNOB_INSET,
            },
          },
          '& .MuiSwitch-input': {
            width: kkTokens.tapTarget,
            height: kkTokens.tapTarget,
            top: HIT_OFFSET,
            left: HIT_OFFSET,
          },
          '& .MuiSwitch-thumb': {
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            backgroundColor: (theme.vars ?? theme).palette.common.white,
            boxShadow: `0 0 0 ${kkTokens.line.hair}px ${inkWash(theme, KNOB_RING)}, ${kkTokens.shadow.rest}`,
          },
          '& .MuiSwitch-track': {
            borderRadius: `${kkTokens.radius.pill}px`,
            opacity: 1,
            transition: TRACK_TRANSITION,
            ...inkWashSurface(theme, TRACK_WASH_LIGHT, TRACK_WASH_DARK),
          },
          ...theme.applyStyles('dark', {
            '& .MuiSwitch-thumb': {
              backgroundColor: kkTokens.color.dark.ink,
              boxShadow: 'none',
            },
          }),
        })}
      />
    </Stack>
  );
};
