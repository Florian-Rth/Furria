import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkStudioDSheetStepProps {
  name: string;
  clock: string;
  description: string | null;
  current: boolean;
  onSelect: () => void;
}

export const KkStudioDSheetStep: FC<KkStudioDSheetStepProps> = ({
  name,
  clock,
  description,
  current,
  onSelect,
}) => {
  const about =
    description === null ? null : (
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'left' }}>
        {description}
      </Typography>
    );

  return (
    <ButtonBase
      aria-current={current ? 'step' : undefined}
      onClick={onSelect}
      data-kk-studio-d-sheet-step={current ? 'current' : 'other'}
      sx={(theme) => {
        const palette = (theme.vars ?? theme).palette;
        return {
          minHeight: kkTokens.tapTarget,
          flexShrink: 0,
          px: 1.5,
          py: 1.25,
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          borderRadius: `${kkTokens.radius.base * 0.75}px`,
          gap: 1.5,
          backgroundColor: current
            ? `color-mix(in srgb, ${palette.primary.main} 14%, transparent)`
            : 'transparent',
          boxShadow: current ? `inset 3px 0 0 ${palette.primary.main}` : 'none',
          ...focusRing(theme),
        };
      }}
    >
      <Typography
        variant="caption"
        sx={{
          pt: 0.25,
          minWidth: '2.5rem',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: 'text.secondary',
          textAlign: 'left',
        }}
      >
        {clock}
      </Typography>
      <Stack sx={{ minWidth: 0, gap: 0.25 }}>
        <Typography variant="subtitle2" sx={{ textAlign: 'left' }}>
          {name}
        </Typography>
        {about}
      </Stack>
    </ButtonBase>
  );
};
