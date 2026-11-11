import Box from '@mui/material/Box';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { ORBIT_TILT } from '../orbit-scene-motion';
import { KkOrbitSceneSky } from '../ui/KkOrbitSceneSky';
import { KkOrbitSceneSpotlight } from '../ui/KkOrbitSceneSpotlight';

const SYSTEM_CENTRE_X = { xs: '78%', desktop: '82%' };
const SYSTEM_HEIGHT = { xs: '240%', desktop: '220%' };

interface KkOrbitSceneRootProps extends PropsWithChildren {
  centre: ReactNode;
}

export const KkOrbitSceneRoot: FC<KkOrbitSceneRootProps> = ({ centre, children }) => (
  <Box
    aria-hidden
    data-kk-orbit-scene
    sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
  >
    <KkOrbitSceneSky />
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: SYSTEM_CENTRE_X,
        height: SYSTEM_HEIGHT,
        aspectRatio: '1 / 1',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, transform: `scaleY(${ORBIT_TILT})` }}>
        {children}
      </Box>
      <KkOrbitSceneSpotlight />
      {centre}
    </Box>
  </Box>
);
