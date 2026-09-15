import Box from '@mui/material/Box';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { MAIN_ELEMENT_ID } from '../main-element-id';

const LABEL = 'Zum Inhalt springen';
const OFFSCREEN = 'translateY(-200%)';
const PINNED = 'translateY(0)';
const SKIP_Z_INDEX = 1400;

export const KkShellSkipLink: FC = () => (
  <Box
    component="a"
    href={`#${MAIN_ELEMENT_ID}`}
    data-kk-shell-skip-link
    sx={[
      {
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: SKIP_Z_INDEX,
        m: 1,
        px: 2,
        py: 1.25,
        borderRadius: `${kkTokens.radius.base}px`,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: kkTokens.shadow.floating,
        fontFamily: kkTokens.font.body,
        fontSize: kkTokens.type.rowTitle,
        fontWeight: 800,
        textDecoration: 'none',
        transform: OFFSCREEN,
        '&:focus-visible': { transform: PINNED },
      },
      focusRing,
    ]}
  >
    {LABEL}
  </Box>
);
