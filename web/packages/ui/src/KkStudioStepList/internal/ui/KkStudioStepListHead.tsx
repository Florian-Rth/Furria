import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { inkFocusRing } from '../../../internal/ink-focus-ring';
import { kkTokens } from '../../../tokens';

interface KkStudioStepListHeadProps {
  eyebrow: string;
  title: string;
  meta: string;
  selected: boolean;
  label: string;
  onPress: () => void;
}

export const KkStudioStepListHead: FC<KkStudioStepListHeadProps> = ({
  eyebrow,
  title,
  meta,
  selected,
  label,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={selected}
    onClick={onPress}
    sx={(theme) => ({
      justifyContent: 'flex-start',
      minHeight: kkTokens.tapTarget,
      textAlign: 'left',
      borderRadius: `${kkTokens.radius.bar * 2}px`,
      ...inkFocusRing(theme),
    })}
  >
    <Stack sx={{ minWidth: 0 }}>
      <Typography
        component="span"
        variant="overline"
        sx={{
          fontWeight: 900,
          letterSpacing: kkTokens.type.tracking.section,
          textTransform: 'uppercase',
          color: 'text.secondary',
          lineHeight: 1.2,
        }}
      >
        {eyebrow}
      </Typography>
      <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.75, minWidth: 0 }}>
        <Typography component="h3" variant="h4" noWrap sx={{ minWidth: 0 }}>
          {title}
        </Typography>
        <Typography
          component="span"
          variant="caption"
          noWrap
          sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
        >
          {meta}
        </Typography>
      </Stack>
    </Stack>
  </ButtonBase>
);
