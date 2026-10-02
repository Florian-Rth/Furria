import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneEdgeScheme } from '../../../internal/group-tone';
import { applyScheme } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';
import { DENSE_TICK_HEIGHT } from '../dense-panel-paint';

const tickPaintOf =
  (tone: KkGroupTone) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 0,
    height: DENSE_TICK_HEIGHT,
    transform: 'translateY(-50%)',
    borderLeftWidth: kkTokens.line.page,
    borderLeftStyle: 'solid',
    borderRadius: `${kkTokens.radius.bar}px`,
    pointerEvents: 'none',
    ...applyScheme(theme, groupToneEdgeScheme(tone)),
  });

interface KkDensePanelLineTickProps {
  tone: KkGroupTone;
}

export const KkDensePanelLineTick: FC<KkDensePanelLineTickProps> = ({ tone }) => (
  <Box component="span" aria-hidden data-kk-dense-tick sx={tickPaintOf(tone)} />
);
