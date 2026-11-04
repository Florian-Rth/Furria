import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { tapArea } from '../../../internal/tap-area';
import type { KkTone } from '../../../internal/tone';
import { tonePaint } from '../../../internal/tone';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

export type KkPlanStatusChipTone = 'conflict' | 'hint' | 'neutral' | 'done';

interface KkPlanStatusStripChipProps {
  label: string;
  tone?: KkPlanStatusChipTone;
  icon?: KkIconName;
  pressed?: boolean;
  onClick?: () => void;
}

const tones: Record<KkPlanStatusChipTone, KkTone> = {
  conflict: 'accent',
  hint: 'gold',
  neutral: 'neutral',
  done: 'green',
};

export const KkPlanStatusStripChip: FC<KkPlanStatusStripChipProps> = ({
  label,
  tone = 'neutral',
  icon,
  pressed,
  onClick,
}) => {
  const glyph = icon === undefined ? null : <KkIcon name={icon} size="small" />;

  return (
    <ButtonBase
      disabled={onClick === undefined}
      aria-pressed={pressed}
      onClick={onClick}
      data-kk-plan-status-chip={tone}
      sx={(theme) => ({
        gap: 0.5,
        px: 1.25,
        py: 0.5,
        borderRadius: `${kkTokens.radius.chip}px`,
        ...tonePaint(theme, tones[tone]),
        ...(pressed === true ? { outline: `${kkTokens.line.section}px solid currentColor` } : {}),
        ...focusRing(theme),
        ...tapArea(),
      })}
    >
      {glyph}
      <Typography variant="caption" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </ButtonBase>
  );
};
