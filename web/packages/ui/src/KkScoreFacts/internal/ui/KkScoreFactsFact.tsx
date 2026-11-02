import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';
import { SCORE_FIGURES } from '../../../internal/score-paint';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

interface KkScoreFactsFactProps {
  icon: KkIconName;
  label: string;
  value: string;
  wide?: boolean;
  trail?: ReactNode;
  openLabel?: string;
  onOpen?: () => void;
}

export const KkScoreFactsFact: FC<KkScoreFactsFactProps> = ({
  icon,
  label,
  value,
  wide = false,
  trail,
  openLabel,
  onOpen,
}) => {
  const trailed = trail !== undefined && trail !== null;
  const face = (
    <>
      <KkIcon name={icon} size="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
      <Stack sx={{ minWidth: 0, flex: '1 1 auto', gap: 0.125, textAlign: 'left' }}>
        <Box
          component="span"
          sx={{
            typography: 'caption',
            fontWeight: 800,
            letterSpacing: kkTokens.type.tracking.label,
            textTransform: 'uppercase',
            color: 'text.secondary',
            lineHeight: 1.2,
          }}
        >
          {label}
        </Box>
        <Box
          component="span"
          data-kk-fact-value
          sx={{
            typography: 'body2',
            fontWeight: 800,
            lineHeight: 1.25,
            overflowWrap: 'anywhere',
            ...SCORE_FIGURES,
          }}
        >
          {value}
        </Box>
      </Stack>
    </>
  );
  const main =
    onOpen === undefined ? (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0, flex: '1 1 9rem' }}>
        {face}
      </Stack>
    ) : (
      <ButtonBase
        aria-label={openLabel}
        onClick={onOpen}
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 1,
          minWidth: 0,
          flex: '1 1 9rem',
          minHeight: kkTokens.tapTarget,
          mx: -0.5,
          px: 0.5,
          borderRadius: `${kkTokens.radius.bar}px`,
          color: 'text.primary',
          ...focusRing(theme),
          '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '5%') } },
        })}
      >
        {face}
        <KkIcon name="chevron" size="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
      </ButtonBase>
    );

  return (
    <Stack
      component="li"
      direction="row"
      data-wide={wide}
      data-trailed={trailed}
      data-kk-score-fact
      sx={{
        '&[data-trailed="true"] [data-kk-fact-value]': { whiteSpace: 'nowrap' },
        alignItems: 'center',
        gap: 1,
        px: 1.25,
        py: 0.5,
        flexWrap: 'wrap',
        minHeight: kkTokens.tapTarget,
      }}
    >
      {main}
      {trail}
    </Stack>
  );
};
