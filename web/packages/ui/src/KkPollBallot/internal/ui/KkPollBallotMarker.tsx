import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { BALLOT_MARKER_SIZE } from '../poll-ballot-geometry';
import type { KkPollBallotMode } from '../poll-ballot-mode';

interface MarkerInks {
  primary: { main: string };
  text: { secondary: string };
}

const toMarkerBorder = (palette: MarkerInks, chosen: boolean, blank: boolean): string => {
  if (blank) {
    return 'transparent';
  }

  return chosen ? palette.primary.main : palette.text.secondary;
};

const MARKER_RADII: Record<KkPollBallotMode, string> = {
  single: '50%',
  multiple: `${kkTokens.radius.bar}px`,
};

interface KkPollBallotMarkerProps {
  mode: KkPollBallotMode;
  chosen: boolean;
  blank?: boolean;
}

export const KkPollBallotMarker: FC<KkPollBallotMarkerProps> = ({
  mode,
  chosen,
  blank = false,
}) => {
  const radius = MARKER_RADII[mode];
  const paint = (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;

    return {
      display: 'block',
      width: theme.spacing(BALLOT_MARKER_SIZE),
      height: theme.spacing(BALLOT_MARKER_SIZE),
      flexShrink: 0,
      borderRadius: radius,
      borderWidth: kkTokens.line.section,
      borderStyle: 'solid',
      borderColor: toMarkerBorder(palette, chosen, blank),
      backgroundColor: chosen ? palette.primary.main : 'transparent',
      boxShadow: chosen
        ? `inset 0 0 0 ${kkTokens.line.section}px ${palette.background.paper}`
        : 'none',
    };
  };

  return <Box component="span" aria-hidden data-kk-poll-ballot-marker sx={paint} />;
};
