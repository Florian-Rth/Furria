import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioHToolbarSelectionProps {
  text: string;
  label: string;
  empty: boolean;
  onPress: () => void;
}

export const KkStudioHToolbarSelection: FC<KkStudioHToolbarSelectionProps> = ({
  text,
  label,
  empty,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    disabled={empty}
    onClick={onPress}
    data-kk-studio-h-selection
    sx={(theme) => ({
      ml: 'auto',
      minWidth: 0,
      height: '2.25rem',
      pl: 1.25,
      pr: 0.5,
      gap: 0.25,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: palette(theme).text.primary,
      backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 88%, transparent)`,
      boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`,
      transition: 'box-shadow 180ms ease-out, color 180ms ease-out',
      '&.Mui-disabled': {
        color: palette(theme).text.secondary,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
        '& svg': { display: 'none' },
        pr: 1.25,
      },
      ...focusRing(theme),
    })}
  >
    <Typography
      component="span"
      variant="caption"
      sx={{
        fontWeight: 900,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: 'inherit',
      }}
    >
      {text}
    </Typography>
    <ChevronRightRoundedIcon fontSize="small" />
  </ButtonBase>
);
