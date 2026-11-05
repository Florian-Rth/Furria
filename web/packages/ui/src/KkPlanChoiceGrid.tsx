import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { planButtonPaint } from './internal/plan-surface';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkPlanChoice {
  id: string;
  label: string;
  icon: KkIconName;
  hint?: string;
}

interface KkPlanChoiceGridProps {
  label: string;
  choices: readonly KkPlanChoice[];
  value?: string | null;
  onSelect: (id: string) => void;
  sx?: KkSx;
}

export const KkPlanChoiceGrid: FC<KkPlanChoiceGridProps> = ({
  label,
  choices,
  value = null,
  onSelect,
  sx,
}) => {
  const tiles = choices.map((choice) => {
    const pressed = choice.id === value;
    const select = (): void => {
      onSelect(choice.id);
    };
    const hint =
      choice.hint === undefined ? null : (
        <Typography variant="caption" sx={{ color: pressed ? 'inherit' : 'text.secondary' }}>
          {choice.hint}
        </Typography>
      );

    return (
      <Grid key={choice.id} size={{ xs: 6, sm: 4 }}>
        <ButtonBase
          aria-pressed={pressed}
          onClick={select}
          data-kk-plan-choice={choice.id}
          sx={(theme) => ({
            ...planButtonPaint(theme, pressed),
            width: '100%',
            minHeight: '4.5rem',
            flexDirection: 'column',
            gap: 0.5,
            p: 1,
            borderWidth: kkTokens.line.hair,
            borderStyle: 'solid',
            borderColor: 'divider',
          })}
        >
          <KkIcon name={choice.icon} />
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {choice.label}
          </Typography>
          {hint}
        </ButtonBase>
      </Grid>
    );
  });

  return (
    <Grid container spacing={1} role="group" aria-label={label} data-kk-plan-choice-grid sx={sx}>
      {tiles}
    </Grid>
  );
};
