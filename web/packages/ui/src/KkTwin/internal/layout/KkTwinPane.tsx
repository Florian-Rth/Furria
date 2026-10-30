import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import {
  TWIN_FRONT,
  TWIN_HEIGHT,
  TWIN_STAGE,
  TWIN_TIGHT,
  TWIN_VIDEO_ASPECT,
  TWIN_WIDE,
  TWIN_WIDTH,
} from '../twin-query';

export type KkTwinPaneKind = 'video' | 'stage';

const SIDE_VIDEO: CSSObject = {
  width: `calc(var(${TWIN_HEIGHT}) * ${TWIN_VIDEO_ASPECT})`,
  height: `var(${TWIN_HEIGHT})`,
};

const SIDE_STAGE: CSSObject = {
  width: `calc((var(${TWIN_HEIGHT}) - ${TWIN_FRONT}) * var(${TWIN_STAGE}))`,
  height: `var(${TWIN_HEIGHT})`,
};

const sizes: Record<KkTwinPaneKind, CSSObject> = {
  video: {
    width: `var(${TWIN_WIDTH})`,
    height: `calc(var(${TWIN_WIDTH}) / ${TWIN_VIDEO_ASPECT})`,
    borderRadius: `${kkTokens.radius.base}px`,
    backgroundColor: kkTokens.overlay.scrimInk,
    [TWIN_WIDE]: SIDE_VIDEO,
    [TWIN_TIGHT]: SIDE_VIDEO,
  },
  stage: {
    width: `var(${TWIN_WIDTH})`,
    height: `calc(var(${TWIN_WIDTH}) / var(${TWIN_STAGE}) + ${TWIN_FRONT})`,
    display: 'grid',
    placeItems: 'end center',
    containerType: 'size',
    [TWIN_WIDE]: SIDE_STAGE,
    [TWIN_TIGHT]: SIDE_STAGE,
  },
};

interface KkTwinPaneProps extends PropsWithChildren {
  kind: KkTwinPaneKind;
}

export const KkTwinPane: FC<KkTwinPaneProps> = ({ kind, children }) => (
  <Box
    data-kk-twin-pane={kind}
    sx={{
      gridArea: kind,
      justifySelf: 'center',
      position: 'relative',
      minWidth: 0,
      minHeight: 0,
      ...sizes[kind],
    }}
  >
    {children}
  </Box>
);
