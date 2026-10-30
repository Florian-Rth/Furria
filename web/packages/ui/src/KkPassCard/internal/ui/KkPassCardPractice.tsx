import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { KkButton } from '../../../KkButton';
import { KkIcon } from '../../../KkIcon';
import type { KkLinkSearch } from '../../../kk-link-search';

const HINT_PAINT: CSSObject = { m: 0, color: 'text.secondary', fontWeight: 600 };

interface KkPassCardPracticeProps {
  label: string;
  hint?: string;
  disabled?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
}

export const KkPassCardPractice: FC<KkPassCardPracticeProps> = ({
  label,
  hint,
  disabled = false,
  component,
  to,
  params,
  search,
}) => {
  const hintLine =
    hint === undefined ? null : (
      <Typography component="p" variant="caption" sx={HINT_PAINT}>
        {hint}
      </Typography>
    );
  const linkProps = disabled ? {} : { component, to, params, search };

  return (
    <Stack data-kk-pass-part data-kk-pass-practice sx={{ gap: 0.75, minWidth: 0 }}>
      <KkButton
        variant="contained"
        size="large"
        fullWidth
        disabled={disabled}
        startIcon={<KkIcon name="play" size="small" />}
        {...linkProps}
      >
        {label}
      </KkButton>
      {hintLine}
    </Stack>
  );
};
