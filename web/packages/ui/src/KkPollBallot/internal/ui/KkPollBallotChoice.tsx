import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useId } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { BALLOT_INDENT, BALLOT_MARKER_GAP, toBallotBarWidth } from '../poll-ballot-geometry';
import type { KkPollBallotMode } from '../poll-ballot-mode';
import { KkPollBallotMarker } from './KkPollBallotMarker';

const BAR_HEIGHT = 0.5;

interface KkPollBallotChoiceProps {
  mode: KkPollBallotMode;
  label: string;
  count: string;
  percent: number;
  chosen: boolean;
  leading: boolean;
  voters?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onSelect: () => void;
  sx?: KkSx;
}

export const KkPollBallotChoice: FC<KkPollBallotChoiceProps> = ({
  mode,
  label,
  count,
  percent,
  chosen,
  leading,
  voters,
  disabled = false,
  readOnly = false,
  onSelect,
  sx,
}) => {
  const votersId = useId();
  const describedBy = voters === undefined ? undefined : votersId;
  const width = toBallotBarWidth(percent);
  const labelWeight = chosen ? 800 : 600;
  const countWeight = leading ? 800 : 600;
  const rowPaint = (theme: Theme): CSSObject => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(0.5),
    width: '100%',
    padding: theme.spacing(0.75, 1),
    textAlign: 'left',
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    color: (theme.vars ?? theme).palette.text.primary,
    backgroundColor: chosen ? inkWash(theme, '7%') : 'transparent',
    '&:hover': readOnly ? {} : { backgroundColor: inkWash(theme, '9%') },
    '&.Mui-disabled': { color: (theme.vars ?? theme).palette.text.primary },
    ...focusRing(theme),
  });
  const trackPaint = (theme: Theme): CSSObject => ({
    display: 'block',
    height: theme.spacing(BAR_HEIGHT),
    marginLeft: theme.spacing(BALLOT_INDENT),
    borderRadius: `${kkTokens.radius.bar}px`,
    backgroundColor: inkWash(theme, '10%'),
  });
  const fillPaint = (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;

    return {
      display: 'block',
      width,
      height: '100%',
      borderRadius: 'inherit',
      backgroundColor: chosen || leading ? palette.primary.main : palette.text.secondary,
      transition: theme.transitions.create('width'),
    };
  };
  const votersLine =
    voters === undefined ? null : (
      <Typography
        id={votersId}
        component="span"
        variant="caption"
        sx={{
          display: 'block',
          color: 'text.secondary',
          pl: BALLOT_INDENT,
          overflowWrap: 'anywhere',
        }}
      >
        {voters}
      </Typography>
    );

  const content = (
    <>
      <Stack
        component="span"
        direction="row"
        sx={{ alignItems: 'center', gap: BALLOT_MARKER_GAP, minWidth: 0 }}
      >
        <KkPollBallotMarker mode={mode} chosen={chosen} blank={readOnly} />
        <Typography
          component="span"
          variant="body2"
          sx={{ flexGrow: 1, minWidth: 0, fontWeight: labelWeight, overflowWrap: 'anywhere' }}
        >
          {label}
        </Typography>
        <Typography
          component="span"
          variant="body2"
          sx={{ fontWeight: countWeight, fontVariantNumeric: 'tabular-nums' }}
        >
          {count}
        </Typography>
      </Stack>
      <Box component="span" aria-hidden sx={trackPaint}>
        <Box component="span" sx={fillPaint} />
      </Box>
      {votersLine}
    </>
  );

  if (readOnly) {
    return (
      <Stack
        data-kk-poll-ballot-choice
        data-kk-poll-ballot-mode={mode}
        data-kk-poll-ballot-read-only
        aria-describedby={describedBy}
        sx={[rowPaint, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {content}
      </Stack>
    );
  }

  return (
    <ButtonBase
      aria-pressed={chosen}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={onSelect}
      data-kk-poll-ballot-choice
      data-kk-poll-ballot-mode={mode}
      sx={[rowPaint, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {content}
    </ButtonBase>
  );
};
