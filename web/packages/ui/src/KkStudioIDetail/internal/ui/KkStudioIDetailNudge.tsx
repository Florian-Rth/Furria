import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const stepPaint = (theme: Theme) => ({
  width: kkTokens.tapTarget,
  height: kkTokens.tapTarget,
  borderRadius: `${kkTokens.radius.pill}px`,
  color: (theme.vars ?? theme).palette.text.primary,
  '&:hover': { backgroundColor: (theme.vars ?? theme).palette.action.hover },
  ...focusRing(theme),
});

interface KkStudioIDetailNudgeProps {
  label: string;
  value: string;
  earlierLabel: string;
  laterLabel: string;
  onEarlier: () => void;
  onLater: () => void;
}

export const KkStudioIDetailNudge: FC<KkStudioIDetailNudgeProps> = ({
  label,
  value,
  earlierLabel,
  laterLabel,
  onEarlier,
  onLater,
}) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    data-kk-studio-i-nudge
    sx={(theme) => ({
      alignItems: 'center',
      gap: 0.5,
      p: 0.25,
      borderRadius: `${kkTokens.radius.pill}px`,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
    })}
  >
    <ButtonBase aria-label={earlierLabel} onClick={onEarlier} sx={stepPaint}>
      <RemoveRoundedIcon />
    </ButtonBase>
    <Stack sx={{ flex: 1, alignItems: 'center', minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}
      >
        {value}
      </Typography>
    </Stack>
    <ButtonBase aria-label={laterLabel} onClick={onLater} sx={stepPaint}>
      <AddRoundedIcon />
    </ButtonBase>
  </Stack>
);
