import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';
import { SCORE_FIGURES } from '../../../internal/score-paint';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import type { KkScoreReadinessState } from './KkScoreReadinessMark';
import { KkScoreReadinessMark } from './KkScoreReadinessMark';

interface KkScoreReadinessBadgeProps {
  icon: KkIconName;
  label: string;
  value: string;
  hint: string;
  state: KkScoreReadinessState;
  onOpen: (() => void) | null;
}

export const KkScoreReadinessBadge: FC<KkScoreReadinessBadgeProps> = ({
  icon,
  label,
  value,
  hint,
  state,
  onOpen,
}) => {
  const face = (
    <>
      <KkIcon name={icon} size="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
      <Stack sx={{ minWidth: 0, gap: 0.125, flex: 1 }}>
        <Box
          component="span"
          sx={{
            typography: 'caption',
            fontWeight: 800,
            letterSpacing: kkTokens.type.tracking.label,
            textTransform: 'uppercase',
            color: 'text.secondary',
            lineHeight: 1.2,
            overflowWrap: 'anywhere',
          }}
        >
          {label}
        </Box>
        <Stack direction="row" component="span" sx={{ alignItems: 'center', gap: 0.5 }}>
          <KkScoreReadinessMark state={state} />
          <Box
            component="span"
            sx={{ typography: 'body2', fontWeight: 800, lineHeight: 1.2, ...SCORE_FIGURES }}
          >
            {value}
          </Box>
        </Stack>
      </Stack>
    </>
  );
  const paint = {
    width: '100%',
    height: '100%',
    minHeight: kkTokens.tapTarget,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    px: 1.25,
    py: 0.75,
    textAlign: 'left',
  } as const;
  const body =
    onOpen === null ? (
      <Stack direction="row" sx={paint}>
        {face}
      </Stack>
    ) : (
      <ButtonBase
        aria-label={hint}
        onClick={onOpen}
        sx={(theme) => ({
          ...paint,
          color: 'text.primary',
          ...focusRing(theme),
          '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '6%') } },
        })}
      >
        {face}
      </ButtonBase>
    );

  return (
    <Box component="li" data-kk-score-badge={state}>
      {body}
    </Box>
  );
};
