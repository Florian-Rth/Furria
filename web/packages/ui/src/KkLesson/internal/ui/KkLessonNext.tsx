import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkEyebrow } from '../../../KkEyebrow';
import { kkTokens } from '../../../tokens';
import { KkLessonFade } from './KkLessonFade';

const nextPaint = (theme: Theme): CSSObject => ({
  flex: 1,
  minWidth: 0,
  height: kkTokens.tapTarget,
  gap: theme.spacing(1),
  justifyContent: 'flex-start',
  textAlign: 'left',
  borderRadius: `${kkTokens.radius.bar * 3}px`,
  color: (theme.vars ?? theme).palette.text.secondary,
  boxShadow: `inset 0 ${kkTokens.line.hair}px 0 ${(theme.vars ?? theme).palette.divider}`,
  '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
  '&:active': { transform: 'scale(0.98)' },
  ...focusRing(theme),
});

interface KkLessonNextProps {
  fadeKey: string;
  eyebrow: string;
  number: number | null;
  name: string;
  label: string;
  onPress: () => void;
}

export const KkLessonNext: FC<KkLessonNextProps> = ({
  fadeKey,
  eyebrow,
  number,
  name,
  label,
  onPress,
}) => {
  const ended = number === null;

  return (
    <ButtonBase
      aria-label={label}
      disabled={ended}
      onClick={onPress}
      data-kk-lesson-next
      sx={nextPaint}
    >
      <KkEyebrow tone="muted" sx={{ flexShrink: 0, lineHeight: 1 }}>
        {eyebrow}
      </KkEyebrow>
      <KkLessonFade fadeKey={fadeKey} sx={{ flex: 1, height: '1.5rem' }}>
        <Typography
          component="span"
          variant="subtitle2"
          noWrap
          sx={{ display: 'block', lineHeight: '1.5rem', color: 'text.primary' }}
        >
          <Typography component="span" variant="h4" sx={{ mr: 0.75, color: 'inherit' }}>
            {number}
          </Typography>
          {name}
        </Typography>
      </KkLessonFade>
      <ChevronRightRoundedIcon aria-hidden fontSize="small" />
    </ButtonBase>
  );
};
