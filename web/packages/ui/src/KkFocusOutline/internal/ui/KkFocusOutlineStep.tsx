import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import type { KkFocusOutlineRename } from './KkFocusOutlineField';
import { KkFocusOutlineField } from './KkFocusOutlineField';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusOutlineStepProps {
  number: number;
  name: string;
  meta: string;
  label: string;
  current: boolean;
  rename: KkFocusOutlineRename | null;
  onPress: () => void;
}

const ROW_SX = (theme: Theme) => ({
  position: 'relative' as const,
  alignItems: 'center',
  gap: 1,
  minHeight: kkTokens.tapTarget,
  px: 1.5,
  color: palette(theme).text.primary,
  '&[data-current="true"]': {
    backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 7%, transparent)`,
  },
  '&[data-current="true"]::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '0.375rem',
    bottom: '0.375rem',
    width: kkTokens.line.page,
    borderRadius: `${kkTokens.radius.bar}px`,
    backgroundColor: palette(theme).primary.main,
  },
});

export const KkFocusOutlineStep: FC<KkFocusOutlineStepProps> = ({
  number,
  name,
  meta,
  label,
  current,
  rename,
  onPress,
}) => {
  const lead = (
    <Typography
      component="span"
      variant="caption"
      sx={{
        flex: 'none',
        width: '1.25rem',
        textAlign: 'right',
        fontWeight: 900,
        fontVariantNumeric: 'tabular-nums',
        color: current ? 'primary.main' : 'text.secondary',
      }}
    >
      {number}
    </Typography>
  );
  const metaText = (
    <Typography
      component="span"
      variant="caption"
      sx={{ flex: 'none', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
    >
      {meta}
    </Typography>
  );

  if (rename !== null) {
    return (
      <Stack direction="row" data-current aria-current="step" sx={ROW_SX}>
        {lead}
        <KkFocusOutlineField rename={rename} strong />
        {metaText}
      </Stack>
    );
  }

  return (
    <ButtonBase
      aria-label={label}
      aria-current={current ? 'step' : undefined}
      data-current={current}
      onClick={onPress}
      sx={(theme) => ({ ...ROW_SX(theme), justifyContent: 'flex-start', ...focusRing(theme) })}
    >
      {lead}
      <Typography
        component="span"
        variant="body2"
        sx={{
          flex: 1,
          minWidth: 0,
          textAlign: 'left',
          fontWeight: current ? 800 : 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </Typography>
      {metaText}
    </ButtonBase>
  );
};
